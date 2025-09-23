import { Box, Flex } from "@chakra-ui/react";
import SlideBar from "../Components/SlideBar";
import { useState } from "react";
import CodingArea from "../Components/CodingArea";

const Collaborate = () => {
  const [data, setData] = useState([]);

  return (
    <Flex minH={"100vh"}>
      <SlideBar data={data} />
      <CodingArea setUsers={setData} />
    </Flex>
  );
};

export default Collaborate;