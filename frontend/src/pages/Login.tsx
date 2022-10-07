import {
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  Stack,
  Text
} from "@chakra-ui/react";
import { useDispatch } from "react-redux";
import React from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { login } from "../feature/user/userSlice";
import axios from "../axios";
import Link from "../components/ui/Link";
import {
  LoginRequest,
  LoginResponse,
  UserCredentials
} from "../proto/user-service";
import useFixedToast from "../utils/hooks/useFixedToast";

function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();
  const toast = useFixedToast();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const validFormHandler = (data: any) => {
    const { email, password } = data;
    const credentials: UserCredentials = { username: email, password };
    const loginReq: LoginRequest = { credentials };

    axios
      .post<LoginResponse>("/api/user/login", loginReq, {
        withCredentials: true
      })
      .then((res) => {
        const { errorCode, errorMessage } = res.data;
        if (errorCode) {
          throw new Error(errorMessage);
        }

        const { user } = res.data;

        if (!user) {
          throw new Error("Something went wrong.");
        }

        // Store user information on redux
        dispatch(login({ user }));

        // Redirect user on successful login
        navigate("/", { replace: true });
      })
      .catch((err) => {
        toast.sendErrorMessage(err.message);
      });
  };

  const invalidFormHandler = () => {
    toast.sendErrorMessage(
      "Please check if you have filled everything in correctly before submitting",
      {
        title: "Oops!"
      }
    );
  };

  return (
    <Flex minH="100vh" align="center" justify="center" bg="gray.50">
      <Stack spacing={8} mx="auto" py={12} px={6} minW="45vw" maxW="65vw">
        <Stack align="center">
          <Heading fontSize="4xl">PeerPrep</Heading>
        </Stack>

        <Box rounded="lg" bg="white" boxShadow="lg" p={8}>
          <form onSubmit={handleSubmit(validFormHandler, invalidFormHandler)}>
            <Stack spacing={6}>
              <FormControl id="email" isInvalid={!!errors.email}>
                <FormLabel>Email address</FormLabel>
                <Input
                  type="text"
                  {...register("email", {
                    required: "Please enter your email."
                  })}
                />
                <FormErrorMessage>
                  {errors.email?.message as string}
                </FormErrorMessage>
              </FormControl>

              <FormControl id="password" isInvalid={!!errors.password}>
                <FormLabel>Password</FormLabel>
                <Input
                  type="password"
                  {...register("password", {
                    required: "Please enter your password."
                  })}
                />
                <FormErrorMessage>
                  {errors.password?.message as string}
                </FormErrorMessage>
              </FormControl>

              <Button
                loadingText="Submitting"
                size="lg"
                bg="blue.400"
                color="white"
                _hover={{
                  bg: "blue.500"
                }}
                type="submit"
              >
                Sign in
              </Button>
              <Text align="center">
                Not a user? <Link to="/register">Register</Link>
              </Text>
            </Stack>
          </form>
        </Box>
      </Stack>
    </Flex>
  );
}

export default Login;
