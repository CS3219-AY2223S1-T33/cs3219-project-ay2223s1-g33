import React from "react";
import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  VStack,
} from "@chakra-ui/react";
import {
  FieldValues,
  SubmitErrorHandler,
  SubmitHandler,
  useForm,
} from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { yupResolver } from "@hookform/resolvers/yup";
import axios from "../../axios";
import useFixedToast from "../../utils/hooks/useFixedToast";
import {
  ChangeNicknameRequest,
  ChangeNicknameResponse,
} from "../../proto/user-service";
import { changeNickname, selectUser } from "../../feature/user/userSlice";
import { User } from "../../proto/types";
import { CHANGE_NICKNAME_VALIDTOR } from "../../constants/validators";

function ChangeNicknameForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(CHANGE_NICKNAME_VALIDTOR) });

  const toast = useFixedToast();
  const dispatch = useDispatch();

  const user = useSelector(selectUser);
  if (!user) {
    return null;
  }

  const validFormHandler: SubmitHandler<FieldValues> = (data) => {
    const { nickname: newNickname } = data;

    const changeNicknameRequest: ChangeNicknameRequest = {
      newNickname,
    };

    axios
      .post<ChangeNicknameResponse>(
        "/api/user/nickname",
        changeNicknameRequest,
        {
          withCredentials: true,
        }
      )
      .then((res) => {
        const { errorCode, errorMessage } = res.data;

        if (errorCode) {
          throw new Error(errorMessage);
        }

        const newUser: User = { ...user };
        newUser.nickname = newNickname;
        dispatch(changeNickname({ user: newUser }));

        toast.sendSuccessMessage("Your nickname is changed!");
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
        Change Nickname
      </Heading>
      <form onSubmit={handleSubmit(validFormHandler, invalidFormHandler)}>
        <FormControl id="nickname" isInvalid={!!errors.nickname}>
          <FormLabel>New Nickname</FormLabel>

          <Input type="text" {...register("nickname")} />
          <FormErrorMessage>
            {errors.nickname?.message as string}
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

export default ChangeNicknameForm;