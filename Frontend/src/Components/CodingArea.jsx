import { Box, useToast } from "@chakra-ui/react";
import { Editor } from "@monaco-editor/react";
import { useRef, useState, useEffect } from "react";
import { useParams, useLocation } from "react-router";
import socket from "../services/socket";

const CodingArea = ({ setUsers }) => {
  const [codeValue, setCodeValue] = useState("");
  const EditorRef = useRef();
  const { id: roomId } = useParams();
  const location = useLocation();
  const username = location.state?.username || "Anonymous";
  const toast = useToast();
  const typingTimeoutRef = useRef(null);
  const [typingToastId, setTypingToastId] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [currentlyTypingUser, setCurrentlyTypingUser] = useState(null);

  useEffect(() => {
    socket.emit("joinRoom", { roomId, username });

    socket.on("codeUpdate", (code) => {
      setCodeValue(code);
    });

    socket.on("userListUpdate", (users) => {
      setUsers(users);
    });

    socket.on("userJoined", (joinedUsername) => {
      toast({
        title: `${joinedUsername} joined the room`,
        status: "info",
        duration: 3000,
      });
    });

    socket.on("userLeft", (leftUsername) => {
      toast({
        title: `${leftUsername} left the room`,
        status: "warning",
        duration: 3000,
      });
    });

    socket.on("userTyping", (typingUsername) => {
      // Only show toast if no one is currently typing or it's a different user
      if (!currentlyTypingUser || currentlyTypingUser !== typingUsername) {
        // Close any existing typing toast
        if (typingToastId) {
          toast.close(typingToastId);
        }
        
        // Show new typing toast
        const toastId = toast({
          title: `${typingUsername} typing...`,
          status: "info",
          duration: null, // Don't auto-close, we'll close it manually
          isClosable: false,
        });
        setTypingToastId(toastId);
        setCurrentlyTypingUser(typingUsername);
      }
    });

    socket.on("userStoppedTyping", (typingUsername) => {
      // Close the typing toast when user stops typing
      if (typingToastId && currentlyTypingUser === typingUsername) {
        toast.close(typingToastId);
        setTypingToastId(null);
        setCurrentlyTypingUser(null);
      }
    });

    return () => {
      socket.off("codeUpdate");
      socket.off("userListUpdate");
      socket.off("userJoined");
      socket.off("userLeft");
      socket.off("userTyping");
      socket.off("userStoppedTyping");
      
      // Clear any existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [roomId, username, setUsers, toast, typingToastId, currentlyTypingUser]);

  const handleCodeChange = (code) => {
    setCodeValue(code);
    socket.emit("codeChange", { roomId, code });
    
    // Only emit typing event if not already typing
    if (!isTyping) {
      socket.emit("userTyping", { roomId, username });
      setIsTyping(true);
    }
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set timeout to emit stop typing after 500ms of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("userStoppedTyping", { roomId, username });
      setIsTyping(false);
    }, 500);
  };

  const OnMount = (editor) => {
    EditorRef.current = editor;
    editor.focus();
  };

  return (
    <Box minH={"full"} w={"full"} p={"6"}>
      <Editor
        height="90vh"
        theme="vs-dark"
        value={codeValue}
        onChange={handleCodeChange}
        defaultLanguage="javascript"
        onMount={OnMount}
      />
    </Box>
  );
};

export default CodingArea;