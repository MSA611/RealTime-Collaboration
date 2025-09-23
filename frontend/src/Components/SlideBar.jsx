import {
  Avatar,
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Text,
  useColorMode,
  useColorModeValue,
  VStack,
} from "@chakra-ui/react";
import { useNavigate } from "react-router";

const SlideBar = ({ data }) => {
  const { colorMode, toggleColorMode } = useColorMode();
  const nav = useNavigate();
  return (
    <Box p={"6"} minH={"100vh"} bg={"cyan"}>
      <Flex direction={"column"} h="95vh">
        <HStack mb={"4"} justifyContent={"space-between"}>
          <Heading
            as="h3"
            color={useColorModeValue("green.600", "black")}
            size="lg"
          >
            Connected
          </Heading>
          <Button colorScheme="blue" onClick={toggleColorMode}>
            {colorMode === "light" ? "D" : "L"}
          </Button>
        </HStack>
        <VStack w={"full"} flex={"1"} overflowY={"auto"} align={"stretch"}>
          {data.map((data) => (
            <HStack spacing={"3.5"}>
              <Avatar name={data.username} key={data.socketId} />
              <Text
                color={useColorModeValue("green.600", "black")}
                fontSize="sm"
              >
                {data.username}
              </Text>
            </HStack>
          ))}
        </VStack>
        <VStack w={"full"} spacing={"3"} mt={"4"}>
          <Button w={"full"} colorScheme="yellow">
            Copy Room Id
          </Button>
          <Button onClick={() => nav("/")} w={"full"} colorScheme="orange">
            Leave Room
          </Button>
        </VStack>
      </Flex>
    </Box>
  );
};

export default SlideBar;
