import { Box, Flex, Stack, Heading } from "@chakra-ui/react";
import React from "react";
import RegisterForm from "../components/form/RegisterForm";

function Register() {
  return (
    <Flex minH="100vh" align="center" justify="center" bg="gray.50">
      <Stack spacing={8} mx="auto" py={12} px={6} minW="45vw" maxW="65vw">
        <Stack align="center">
          <Heading fontSize="4xl">Sign up</Heading>
        </Stack>
        <Box rounded="lg" bg="white" boxShadow="lg" p={8}>
          <RegisterForm />
        </Box>
      </Stack>
    </Flex>
  );
}

export default Register;
