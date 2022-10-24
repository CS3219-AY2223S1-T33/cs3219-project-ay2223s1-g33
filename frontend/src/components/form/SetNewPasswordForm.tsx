import {
  Stack,
  FormControl,
  FormLabel,
  Button,
  FormErrorMessage,
  Text,
} from "@chakra-ui/react";
import axios from "axios";
import React from "react";
import {
  useForm,
  SubmitHandler,
  FieldValues,
  SubmitErrorHandler,
} from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import Link from "../ui/Link";
import {
  ConsumeResetTokenRequest,
  ConsumeResetTokenResponse,
} from "../../proto/user-service";
import useFixedToast from "../../utils/hooks/useFixedToast";
import PasswordInput from "../ui/form/PasswordInput";
import { SET_PW_VALIDATOR } from "../../constants/validators";

type Props = {
  token: string;
};

function SetNewPasswordForm({ token }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(SET_PW_VALIDATOR) });

  const toast = useFixedToast();

  const validFormHandler: SubmitHandler<FieldValues> = (data) => {
    const { password: newPassword } = data;

    const consumeResetTokenRequest: ConsumeResetTokenRequest = {
      token,
      newPassword,
    };

    axios
      .post<ConsumeResetTokenResponse>(
        "/api/reset/confirm",
        consumeResetTokenRequest
      )
      .then((res) => {
        const { errorCode, errorMessage } = res.data;

        if (errorCode) {
          throw new Error(errorMessage);
        }

        toast.sendSuccessMessage(
          "Your password is reset! Click on the link below to login."
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
    <form onSubmit={handleSubmit(validFormHandler, invalidFormHandler)}>
      <Stack spacing={4}>
        <FormControl id="password" isInvalid={!!errors.password}>
          <FormLabel>New Password</FormLabel>
          <PasswordInput register={register} formKey="password" />
          <FormErrorMessage>
            {errors.password?.message as string}
          </FormErrorMessage>
        </FormControl>

        <FormControl id="confirmPassword" isInvalid={!!errors.confirmPassword}>
          <FormLabel>Confirm New Password</FormLabel>
          <PasswordInput register={register} formKey="confirmPassword" />
          <FormErrorMessage>
            {errors.confirmPassword?.message as string}
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
  );
}

export default SetNewPasswordForm;
