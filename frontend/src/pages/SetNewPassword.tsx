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
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import React, { useEffect } from "react";
import {
  FieldValues,
  SubmitErrorHandler,
  SubmitHandler,
  useForm,
} from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "../axios";
import Link from "../components/ui/Link";
import {
  ConsumeResetTokenRequest,
  ConsumeResetTokenResponse,
} from "../proto/user-service";
import useFixedToast from "../utils/hooks/useFixedToast";

function SetNewPassword() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const toast = useFixedToast();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useBoolean();
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token")!;

  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
    }
  }, []);

  const validFormHandler: SubmitHandler<FieldValues> = (data) => {
    const { newPassword } = data;

    const consumeResetTokenRequest: ConsumeResetTokenRequest = {
      token,
      newPassword,
    };

    // Send registration request to the server
    axios
      .post<ConsumeResetTokenResponse>(
        "/api/reset/confirm",
        consumeResetTokenRequest
      )
      .then((res) => {
        const { data: resData } = res;

        // Since proto-buffers treat 0 and empty string as undefined, a successful registration
        // will return an empty object
        if (resData.errorCode) {
          throw new Error(resData.errorMessage);
        }

        toast.sendSuccessMessage("Your password is reset! Click on the link below to login.");
      })
      .catch((err) => {
        toast.sendErrorMessage(err.message);
      });
  };

  const invalidFormHandler: SubmitErrorHandler<FieldValues> = () => {
    toast.sendErrorMessage(
      "Please check if you have filled everything in correctly before submitting",
      {
        title: "Oops!",
      }
    );
  };

  return (
    <Flex minH="100vh" align="center" justify="center" bg="gray.50">
      <Stack spacing={8} mx="auto" py={12} px={6} minW="45vw" maxW="65vw">
        <Stack align="center">
          <Heading fontSize="4xl">Reset Password</Heading>
        </Stack>
        <Box rounded="lg" bg="white" boxShadow="lg" p={8}>
          <form onSubmit={handleSubmit(validFormHandler, invalidFormHandler)}>
            <Stack spacing={4}>
              <FormControl id="password" isInvalid={!!errors.password}>
                <FormLabel>New Password</FormLabel>
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
                  Reset
                </Button>
              </Stack>
              <Stack pt={6}>
                <Text align="center">
                  Proceed to <Link to="/login">Login</Link>
                </Text>
              </Stack>
            </Stack>
          </form>
        </Box>
      </Stack>
    </Flex>
  );
}

export default SetNewPassword;
