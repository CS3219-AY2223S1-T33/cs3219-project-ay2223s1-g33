import React from "react";
import {
  Button,
  FormControl,
  FormLabel,
  Heading,
  useBoolean,
  VStack,
} from "@chakra-ui/react";
import {
  FieldValues,
  SubmitErrorHandler,
  SubmitHandler,
  useForm,
} from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import AuthAPI from "../../api/auth";
import useFixedToast from "../../utils/hooks/useFixedToast";
import { ChangePasswordRequest } from "../../proto/user-service";
import PasswordInput from "../ui/form/PasswordInput";
import { SET_PW_VALIDATOR } from "../../constants/validators";

function ChangePasswordForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({ resolver: yupResolver(SET_PW_VALIDATOR) });
  const toast = useFixedToast();
  const [isLoading, setIsLoading] = useBoolean(false);

  const validFormHandler: SubmitHandler<FieldValues> = (data) => {
    setIsLoading.on();
    const { password: newPassword } = data;

    const changePasswordRequest: ChangePasswordRequest = {
      newPassword,
    };

    AuthAPI.changePassword(changePasswordRequest)
      .then(() => {
        toast.sendSuccessMessage(
          "Your password is changed! You will need to login again!"
        );
        reset();
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
    <VStack alignItems="flex-start">
      <Heading as="h5" size="sm">
        Change Password
      </Heading>
      <form onSubmit={handleSubmit(validFormHandler, invalidFormHandler)}>
        <FormControl id="password" isInvalid={!!errors.password} pb={4}>
          <FormLabel>New Password</FormLabel>
          <PasswordInput register={register} formKey="password" />
        </FormControl>

        <FormControl id="confirmPassword" isInvalid={!!errors.confirmPassword}>
          <FormLabel>Confirm New Password</FormLabel>
          <PasswordInput register={register} formKey="confirmPassword" />
        </FormControl>
        <Button
          loadingText="Submitting"
          isLoading={isLoading}
          size="lg"
          colorScheme="blue"
          type="submit"
          mt={4}
        >
          Update
        </Button>
      </form>
    </VStack>
  );
}

export default ChangePasswordForm;
