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
      if (!currentlyTypingUser || currentlyTypingUser !== typingUsername) {
        if (typingToastId) {
          toast.close(typingToastId);
        }

        const toastId = toast({
          title: `${typingUsername} typing...`,
          status: "info",
          duration: null,
          isClosable: false,
        });
        setTypingToastId(toastId);
        setCurrentlyTypingUser(typingUsername);
      }
    });

    socket.on("userStoppedTyping", (typingUsername) => {
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

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [roomId, username, setUsers, toast, typingToastId, currentlyTypingUser]);

  const handleCodeChange = (code) => {
    setCodeValue(code);
    socket.emit("codeChange", { roomId, code });

    if (!isTyping) {
      socket.emit("userTyping", { roomId, username });
      setIsTyping(true);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

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

