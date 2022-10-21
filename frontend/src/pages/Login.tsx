import React from "react";
import { Box, Flex, Heading, Stack } from "@chakra-ui/react";
import LoginForm from "../components/form/LoginForm";

function Login() {
  return (
    <Flex minH="100vh" align="center" justify="center" bg="gray.50">
      <Stack spacing={8} mx="auto" py={12} px={6} minW="45vw" maxW="65vw">
        <Stack align="center">
          <Heading fontSize="4xl">PeerPrep</Heading>
        </Stack>

        <Box rounded="lg" bg="white" boxShadow="lg" p={8}>
          <LoginForm />
        </Box>
      </Stack>
    </Flex>
  );
}

export default Login;
