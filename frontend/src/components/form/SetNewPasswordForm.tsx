import {
  Stack,
  FormControl,
  FormLabel,
  Button,
  FormErrorMessage,
  Text,
  useBoolean,
} from "@chakra-ui/react";
import React from "react";
import {
  useForm,
  SubmitHandler,
  FieldValues,
  SubmitErrorHandler,
} from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate } from "react-router-dom";
import Link from "../ui/Link";
import { ConsumeResetTokenRequest } from "../../proto/user-service";
import useFixedToast from "../../utils/hooks/useFixedToast";
import PasswordInput from "../ui/form/PasswordInput";
import { SET_PW_VALIDATOR } from "../../constants/validators";
import AuthAPI from "../../api/auth";

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
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useBoolean(false);

  const validFormHandler: SubmitHandler<FieldValues> = (data) => {
    setIsLoading.on();
    const { password: newPassword } = data;

    const consumeResetTokenRequest: ConsumeResetTokenRequest = {
      token,
      newPassword,
    };

    AuthAPI.setNewPassword(consumeResetTokenRequest)
      .then(() => {
        toast.sendSuccessMessage(
          "Your password has been reset! You can login to Peerprep."
        );
        navigate("/login");
      })
      .catch((err) => {
        toast.sendErrorMessage(err.message);
      })
      .finally(() => setIsLoading.off());
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
            isLoading={isLoading}
            size="lg"
            colorScheme="blue"
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
