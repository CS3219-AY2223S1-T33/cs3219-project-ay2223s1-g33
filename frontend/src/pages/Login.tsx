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
  Text,
  useToast,
} from "@chakra-ui/react";
import { useDispatch } from "react-redux";
import React from "react";
import { useForm } from "react-hook-form";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import { login } from "../feature/user/userSlice";
import axios from "../axios";
import Link from "../components/ui/Link";
import {
  LoginRequest,
  LoginResponse,
  UserCredentials,
} from "../proto/user-bff-service";

function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const toast = useToast();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // eslint-disable-next-line
  const [cookie, setCookies] = useCookies(["session_token"]);

  const validFormHandler = (data: any) => {
    const { email, password } = data;
    const credentials: UserCredentials = { username: email, password };
    const loginReq: LoginRequest = { credentials };

    axios
      .post<LoginResponse>("/user/login", loginReq)
      .then((res) => {
        const { errorCode, errorMessage } = res.data;
        if (errorCode) {
          throw new Error(errorMessage);
        }

        const { user, sessionToken } = res.data;

        if (!user) {
          throw new Error("Something went wrong.");
        }

        // Set cookie to axios instance
        const now = new Date();
        setCookies("session_token", sessionToken, {
          path: "/",
          expires: new Date(now.setDate(now.getTime() + 1000 * 86400)),
          domain: "127.0.0.1",
          secure: false,
        });

        // Store user information on redux
        dispatch(login({ sessionToken, user }));

        // Redirect user on successful login
        navigate("/", { replace: true });
      })
      .catch((err) => {
        toast({
          title: "Error",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "top",
          description: err.message,
        });
      });
  };

  const invalidFormHandler = () => {
    toast({
      title: "Oops!",
      description:
        "Please check if you have filled everything in correctly before submitting",
      status: "error",
      duration: 5000,
      isClosable: true,
      position: "top",
    });
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
                    required: "Please enter your email.",
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
                    required: "Please enter your password.",
                    minLength: {
                      value: 8,
                      message:
                        "Please make sure your password is at least 8 characters long.",
                    },
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
                  bg: "blue.500",
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
