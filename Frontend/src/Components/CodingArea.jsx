import { Box } from "@chakra-ui/react";
import { Editor } from "@monaco-editor/react";
import { useRef, useState } from "react";

const CodingArea = () => {
  const [codeValue, setCodeValue] = useState("");
  const EditorRef = useRef();
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
        onChange={(e) => setCodeValue(e)}
        defaultLanguage="javascript"
        onMount={OnMount}
      />
    </Box>
  );
};

export default CodingArea;
