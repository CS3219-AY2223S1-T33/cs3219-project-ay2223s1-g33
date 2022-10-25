import React from "react";
import {
  Button,
  FormControl,
  FormLabel,
  Heading,
  VStack,
} from "@chakra-ui/react";
import {
  FieldValues,
  SubmitErrorHandler,
  SubmitHandler,
  useForm,
} from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import axios from "../../axios";
import useFixedToast from "../../utils/hooks/useFixedToast";
import {
  ChangePasswordRequest,
  ChangePasswordResponse,
} from "../../proto/user-service";
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

  const validFormHandler: SubmitHandler<FieldValues> = (data) => {
    const { password: newPassword } = data;

    const changePasswordRequest: ChangePasswordRequest = {
      newPassword,
    };

    axios
      .post<ChangePasswordResponse>(
        "/api/user/password",
        changePasswordRequest,
        {
          withCredentials: true,
        }
      )
      .then((res) => {
        const { errorCode, errorMessage } = res.data;

        if (errorCode) {
          throw new Error(errorMessage);
        }

        toast.sendSuccessMessage("Your password is changed!");
        reset();
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
          mt={4}
          bg="blue.400"
          color="white"
          _hover={{
            bg: "blue.500",
          }}
          type="submit"
        >
          Update
        </Button>
      </form>
    </VStack>
  );
}

export default ChangePasswordForm;
