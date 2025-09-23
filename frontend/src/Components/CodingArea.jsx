import { Box } from "@chakra-ui/react";
import { Editor } from "@monaco-editor/react";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router";
import { io } from "socket.io-client";

const socket = io("http://localhost:3001");

const CodingArea = () => {
  const [codeValue, setCodeValue] = useState("");
  const editorRef = useRef(null);
  const { id: documentId } = useParams();

  const onMount = (editor) => {
    editorRef.current = editor;
    editor.focus();
  };

  useEffect(() => {
    if (socket == null || documentId == null) return;

    socket.emit("join-document", documentId);

    socket.on("load-document", (content) => {
      setCodeValue(content);
    });

    socket.on("code-updated", (newContent) => {
      if (editorRef.current && editorRef.current.getValue() !== newContent) {
        setCodeValue(newContent);
      }
    });
    return () => {
      socket.disconnect();
    };
  }, [socket, documentId]);

  const handleEditorChange = (value) => {
    setCodeValue(value);
    socket.emit("code-change", value);
  };

  return (
    <Box minH={"full"} w={"full"} p={"6"}>
      <Editor
        height="90vh"
        theme="vs-dark"
        value={codeValue}
        onChange={handleEditorChange}
        defaultLanguage="javascript"
        onMount={onMount}
      />
    </Box>
  );
};

export default CodingArea;
