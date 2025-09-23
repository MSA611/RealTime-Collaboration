import { Box, Button, Flex, Text } from "@chakra-ui/react";
import { Editor } from "@monaco-editor/react";
import { useEffect, useRef, useState } from "react";

const CodingArea = () => {
  const [codeValue, setCodeValue] = useState(
    `// Welcome to LiveCode Sync!\n// Share the URL to invite another user.\n// Waiting for connection...`,
  );
  const [status, setStatus] = useState("Connecting...");
  const editorRef = useRef(null);
  const socketRef = useRef(null);
  const isApplyingRemoteChange = useRef(false);

  const handleEditorMount = (editor) => {
    editorRef.current = editor;
    editor.focus();
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    let roomId = urlParams.get("room");

    if (!roomId) {
      roomId = `room-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      window.location.search = `?room=${roomId}`;
      return;
    }

    const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${wsProtocol}//${window.location.hostname}:3000/?room=${roomId}`;
    const socket = new WebSocket(wsUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      setStatus("Connected ✅");
      if (codeValue.includes("// Waiting for connection...")) {
        setCodeValue("// Start coding!");
      }
    };

    socket.onmessage = (event) => {
      const newCode = event.data;
      isApplyingRemoteChange.current = true;
      setCodeValue(newCode);
      isApplyingRemoteChange.current = false;
    };

    socket.onclose = (event) => {
      setStatus("Disconnected ❌");
      console.error(
        `WebSocket disconnected: ${event.reason} (Code: ${event.code})`,
      );
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
      setStatus("Error ⚠️");
    };

    return () => {
      socket.close();
    };
  }, []);

  const handleChange = (value) => {
    setCodeValue(value);
    if (
      !isApplyingRemoteChange.current &&
      socketRef.current?.readyState === WebSocket.OPEN
    ) {
      socketRef.current.send(value);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      alert("Invite link copied!");
    });
  };

  return (
    <Box minH="100vh" w="full" p={6}>
      <Flex
        justify="space-between"
        align="center"
        bg="#252526"
        p={3}
        borderRadius="md"
        mb={4}
      >
        <Text fontSize="lg" fontWeight="bold">
          LiveCode Sync
        </Text>
        <Flex gap={3} align="center">
          <Text>{status}</Text>
          <Button size="sm" colorScheme="blue" onClick={copyLink}>
            Copy Invite Link
          </Button>
        </Flex>
      </Flex>
      <Editor
        height="85vh"
        theme="vs-dark"
        value={codeValue}
        defaultLanguage="javascript"
        onMount={handleEditorMount}
        onChange={handleChange}
      />
    </Box>
  );
};

export default CodingArea;
