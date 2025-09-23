import { Box } from "@chakra-ui/react";
import { Routes, Route } from "react-router";
import HomePage from "./Pages/HomePage.jsx";
import Collaborate from "./Pages/Collaborate.jsx";

const App = () => {
  return (
    <Box minH={"100dvh"}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/editor/:id" element={<Collaborate />} />
      </Routes>
    </Box>
  );
};

export default App;
