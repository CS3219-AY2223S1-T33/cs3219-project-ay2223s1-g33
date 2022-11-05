import {
  Stack,
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  Button,
  Text,
  useBoolean,
} from "@chakra-ui/react";
import React from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { yupResolver } from "@hookform/resolvers/yup";
import AuthAPI from "../../api/auth";
import Link from "../ui/Link";
import { setUser } from "../../feature/user/userSlice";
import { UserCredentials, LoginRequest } from "../../proto/user-service";
import useFixedToast from "../../utils/hooks/useFixedToast";
import { LOGIN_VALIDATOR } from "../../constants/validators";
import PasswordInput from "../ui/form/PasswordInput";

function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(LOGIN_VALIDATOR) });
  const toast = useFixedToast();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useBoolean(false);

  const validFormHandler = (data: any) => {
    setIsLoading.on();
    const { email, password } = data;
    const credentials: UserCredentials = { username: email, password };
    const loginReq: LoginRequest = { credentials };

    AuthAPI.login(loginReq)
      .then((res) => {
        const { user } = res;

        if (!user) {
          throw new Error("Something went wrong.");
        }

        dispatch(setUser({ user }));
        navigate("/", { replace: true });
      })
      .catch((err) => {
        toast.sendErrorMessage(err.message);
      })
      .finally(() => setIsLoading.off());
  };

  const invalidFormHandler = () => {
    toast.sendErrorMessage(
      "Please check if you have filled everything in correctly before submitting",
      {
        title: "Oops!",
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
          <PasswordInput register={register} formKey="password" />
          <FormErrorMessage>
            {errors.password?.message as string}
          </FormErrorMessage>
        </FormControl>

        <Button
          isLoading={isLoading}
          loadingText="Submitting"
          size="lg"
          colorScheme="blue"
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
