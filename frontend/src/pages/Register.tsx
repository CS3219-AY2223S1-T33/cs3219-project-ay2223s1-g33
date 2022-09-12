import {
  Box,
  Flex,
  Stack,
  Heading,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  Button,
  useBoolean,
  Text,
  FormErrorMessage,
  useToast,
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import React from "react";
import {
  FieldValues,
  SubmitErrorHandler,
  SubmitHandler,
  useForm,
} from "react-hook-form";
import axios from "../axios";
import Link from "../components/ui/Link";
import {
  RegisterRequest,
  RegisterResponse,
  UserCredentials,
} from "../proto/user-bff-service";

function Register() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const toast = useToast();
  const [showPassword, setShowPassword] = useBoolean();

  const validFormHandler: SubmitHandler<FieldValues> = (data) => {
    const { email, password, nickname } = data;

    const credentials: UserCredentials = { username: email, password };
    const registerRequest: RegisterRequest = { credentials, nickname };

    // Send registration request to the server
    axios
      .post<RegisterResponse>("/user/register", registerRequest)
      .then((res) => {
        const { data: resData } = res;

        // Since proto-buffers treat 0 and empty string as undefined, a successful registration
        // will return an empty object
        if (resData.errorCode) {
          throw new Error(resData.errorMessage);
        }

        toast({
          title: "Success!",
          description: "Yay! Click on the link below to login.",
          status: "success",
          position: "top",
          isClosable: true,
          duration: 5000,
        });
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

  const invalidFormHandler: SubmitErrorHandler<FieldValues> = () => {
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
          <Heading fontSize="4xl">Sign up</Heading>
        </Stack>
        <Box rounded="lg" bg="white" boxShadow="lg" p={8}>
          <form onSubmit={handleSubmit(validFormHandler, invalidFormHandler)}>
            <Stack spacing={4}>
              <FormControl id="nickname" isInvalid={!!errors.nickname}>
                <FormLabel>Nickname</FormLabel>
                <Input
                  type="text"
                  {...register("nickname", {
                    required: "Please enter your nickname.",
                  })}
                />
                <FormErrorMessage>
                  {errors.nickname?.message as string}
                </FormErrorMessage>
              </FormControl>

              <FormControl id="email" isInvalid={!!errors.email}>
                <FormLabel>Email address</FormLabel>
                <Input
                  type="email"
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
                <InputGroup>
                  <Input
                    type={showPassword ? "text" : "password"}
                    {...register("password", {
                      required: "Please enter your password",
                      minLength: {
                        value: 8,
                        message:
                          "Please make sure your password is at least 8 characters long.",
                      },
                    })}
                  />
                  <InputRightElement h="full">
                    <Button variant="ghost" onClick={setShowPassword.toggle}>
                      {showPassword ? <ViewIcon /> : <ViewOffIcon />}
                    </Button>
                  </InputRightElement>
                </InputGroup>
                <FormErrorMessage>
                  {errors.password?.message as string}
                </FormErrorMessage>
              </FormControl>

              <Stack spacing={10} pt={2}>
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
                  Sign up
                </Button>
              </Stack>
              <Stack pt={6}>
                <Text align="center">
                  Already a user? <Link to="/login">Login</Link>
                </Text>
              </Stack>
            </Stack>
          </form>
        </Box>
      </Stack>
    </Flex>
  );
}

export default Register;
