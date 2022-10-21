import {
  Stack,
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  Button,
  Text
} from "@chakra-ui/react";
import axios from "axios";
import React from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { yupResolver } from "@hookform/resolvers/yup";
import Link from "../ui/Link";
import { login } from "../../feature/user/userSlice";
import {
  UserCredentials,
  LoginRequest,
  LoginResponse
} from "../../proto/user-service";
import useFixedToast from "../../utils/hooks/useFixedToast";
import { LOGIN_VALIDATOR } from "../../constants/validators";

function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({ resolver: yupResolver(LOGIN_VALIDATOR) });
  const toast = useFixedToast();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const validFormHandler = (data: any) => {
    const { email, password } = data;
    const credentials: UserCredentials = { username: email, password };
    const loginReq: LoginRequest = { credentials };

    axios
      .post<LoginResponse>("/api/user/login", loginReq, {
        withCredentials: true
      })
      .then((res) => {
        const { errorCode, errorMessage } = res.data;
        if (errorCode) {
          throw new Error(errorMessage);
        }

        const { user } = res.data;

        if (!user) {
          throw new Error("Something went wrong.");
        }

        // Store user information on redux
        dispatch(login({ user }));

        // Redirect user on successful login
        navigate("/", { replace: true });
      })
      .catch((err) => {
        toast.sendErrorMessage(err.message);
      });
  };

  const invalidFormHandler = () => {
    toast.sendErrorMessage(
      "Please check if you have filled everything in correctly before submitting",
      {
        title: "Oops!"
      }
    );
  };

  return (
    <form onSubmit={handleSubmit(validFormHandler, invalidFormHandler)}>
      <Stack spacing={6}>
        <FormControl id="email" isInvalid={!!errors.email}>
          <FormLabel>Email address</FormLabel>
          <Input type="text" {...register("email")} />
          <FormErrorMessage>{errors.email?.message as string}</FormErrorMessage>
        </FormControl>

        <FormControl id="password" isInvalid={!!errors.password}>
          <FormLabel>Password</FormLabel>
          <Input type="password" {...register("password")} />
          <FormErrorMessage>
            {errors.password?.message as string}
          </FormErrorMessage>
        </FormControl>

        <Button
          loadingText="Submitting"
          size="lg"
          bg="blue.400"
          color="white"
          _hover={{
            bg: "blue.500"
          }}
          type="submit"
        >
          Sign in
        </Button>
        <Text align="center">
          Not a user? <Link to="/register">Register</Link>
          <br />
          Forget password? <Link to="/reset">Reset</Link>
        </Text>
      </Stack>
    </form>
  );
}

export default LoginForm;
