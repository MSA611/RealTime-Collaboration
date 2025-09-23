import { Box, Flex } from "@chakra-ui/react";
import SlideBar from "../Components/SlideBar";
import { useState } from "react";
import CodingArea from "../Components/CodingArea";

const Collaborate = () => {
  // const [data, setData] = useState([
  //   { socketId: 1, username: "person" },
  //   { socketId: 2, username: "man" },
  // ]);
  const [data, setData] = useState([
    { socketId: 1, username: "person1" },
    { socketId: 2, username: "person2" },
  ]);

  return (
    <Flex minH={"100vh"}>
      <SlideBar data={data} />
      <CodingArea />
    </Flex>
  );
};

export default Collaborate;
