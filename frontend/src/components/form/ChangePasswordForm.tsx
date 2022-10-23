import React from "react";
import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  InputGroup,
  InputRightElement,
  useBoolean,
  VStack,
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import {
  FieldValues,
  SubmitErrorHandler,
  SubmitHandler,
  useForm,
} from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import axios from "../../axios";
import useFixedToast from "../../utils/hooks/useFixedToast";
import {
  ChangePasswordRequest,
  ChangePasswordResponse,
} from "../../proto/user-service";
import { reset } from "../../feature/matching/matchingSlice";
import { logout } from "../../feature/user/userSlice";

function ChangePasswordForm() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const toast = useFixedToast();
  const [showPassword, setShowPassword] = useBoolean();

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

        toast.sendSuccessMessage(
          "Your password is changed! You will need to login again!"
        );

        dispatch(reset());
        dispatch(logout());
        navigate("/login", { replace: true });
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
