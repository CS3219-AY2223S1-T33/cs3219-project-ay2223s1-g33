import {
  Stack,
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  Button,
  Text,
} from "@chakra-ui/react";
import React from "react";
import {
  useForm,
  SubmitHandler,
  FieldValues,
  SubmitErrorHandler,
} from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import Link from "../ui/Link";
import { ResetPasswordRequest } from "../../proto/user-service";
import useFixedToast from "../../utils/hooks/useFixedToast";
import { RESET_PW_VALIDATIOR } from "../../constants/validators";
import AuthAPI from "../../api/auth";

function ResetPasswordForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(RESET_PW_VALIDATIOR) });

  const toast = useFixedToast();

  const validFormHandler: SubmitHandler<FieldValues> = (data) => {
    const { email } = data;

    const resetPasswordRequest: ResetPasswordRequest = { username: email };

    AuthAPI.resetPassword(resetPasswordRequest)
      .then(() => {
        toast.sendSuccessMessage("An email will be sent if the user exists");
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
    <form onSubmit={handleSubmit(validFormHandler, invalidFormHandler)}>
      <Stack spacing={4}>
        <FormControl id="email" isInvalid={!!errors.email}>
          <FormLabel>Email address</FormLabel>
          <Input type="email" {...register("email")} />
          <FormErrorMessage>{errors.email?.message as string}</FormErrorMessage>
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
  );
}

export default ResetPasswordForm;
