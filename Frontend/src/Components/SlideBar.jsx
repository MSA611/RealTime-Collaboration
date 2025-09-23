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
  useToast,
} from "@chakra-ui/react";
import { useNavigate, useParams, useLocation } from "react-router";
import socket from "../services/socket";

const SlideBar = ({ data }) => {
  const { colorMode, toggleColorMode } = useColorMode();
  const nav = useNavigate();
  const { id: roomId } = useParams();
  const location = useLocation();
  const username = location.state?.username || "Anonymous";
  const toast = useToast();

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    toast({
      title: "Room ID copied!",
      status: "success",
      duration: 2000,
    });
  };

  const leaveRoom = () => {
    socket.emit("leaveRoom", { roomId, username });
    nav("/");
  };

  return (
    <Box p={"6"} minH={"100vh"} bg={"cyan"}>
      <Flex direction={"column"} h="95vh">
        <HStack mb={"4"} justifyContent={"space-between"}>
          <Heading
            as="h3"
            color={useColorModeValue("green.600", "black")}
            size="lg"
          >
            Connected ({data.length})
          </Heading>
          <Button colorScheme="blue" onClick={toggleColorMode}>
            {colorMode === "light" ? "D" : "L"}
          </Button>
        </HStack>
        <VStack w={"full"} flex={"1"} overflowY={"auto"} align={"stretch"}>
          {data.map((user) => (
            <HStack key={user.socketId} spacing={"3.5"}>
              <Avatar name={user.username} />
              <Text
                color={useColorModeValue("green.600", "black")}
                fontSize="sm"
              >
                {user.username}
              </Text>
            </HStack>
          ))}
        </VStack>
        <VStack w={"full"} spacing={"3"} mt={"4"}>
          <Button onClick={copyRoomId} w={"full"} colorScheme="yellow">
            Copy Room Id
          </Button>
          <Button onClick={leaveRoom} w={"full"} colorScheme="orange">
            Leave Room
          </Button>
        </VStack>
      </Flex>
    </Box>
  );
};

export default SlideBar;