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

    return () => {
      socket.off("codeUpdate");
      socket.off("userListUpdate");
      socket.off("userJoined");
      socket.off("userLeft");
    };
  }, [roomId, username, setUsers, toast]);

  const handleCodeChange = (code) => {
    setCodeValue(code);
    socket.emit("codeChange", { roomId, code });
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