import {
  Box,
  Flex,
  Stack,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Button,
  Text,
  FormErrorMessage,
} from "@chakra-ui/react";
import React from "react";
import {
  FieldValues,
  SubmitErrorHandler,
  SubmitHandler,
  useForm,
} from "react-hook-form";
import Link from "../components/ui/Link";
import axios from "../axios";
import useFixedToast from "../utils/hooks/useFixedToast";
import {
  ResetPasswordRequest,
  ResetPasswordResponse,
} from "../proto/user-service";

function ResetPassword() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const toast = useFixedToast();

  const validFormHandler: SubmitHandler<FieldValues> = (data) => {
    const { email } = data;

    const resetPasswordRequest: ResetPasswordRequest = { username: email };

    // Send registration request to the server
    axios
      .post<ResetPasswordResponse>(
        "/api/reset",
        resetPasswordRequest
      )
      .then((res) => {
        const { data: resData } = res;

        // Since proto-buffers treat 0 and empty string as undefined, a successful registration
        // will return an empty object
        if (resData.errorCode) {
          throw new Error(resData.errorMessage);
        }

        toast.sendSuccessMessage(
          "If an account exist, a reset password email will be sent."
        );
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

export default ResetPassword;
