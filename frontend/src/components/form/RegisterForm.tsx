import { Stack, FormControl, FormLabel, Input, FormErrorMessage, Button, Text } from "@chakra-ui/react";
import React from "react";
import { useForm, SubmitHandler, FieldValues, SubmitErrorHandler } from "react-hook-form";
import AuthAPI from "../../api/auth";
import { yupResolver } from "@hookform/resolvers/yup";
import Link from "../ui/Link";
import PasswordInput from "../ui/form/PasswordInput";
import { UserCredentials, RegisterRequest } from "../../proto/user-service";
import useFixedToast from "../../utils/hooks/useFixedToast";
import { REGISTER_VALIDATOR } from "../../constants/validators";

function RegisterForm() {
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm({ resolver: yupResolver(REGISTER_VALIDATOR) });

	const toast = useFixedToast();

	const validFormHandler: SubmitHandler<FieldValues> = (data) => {
		const { email, password, nickname } = data;

		const credentials: UserCredentials = { username: email, password };
		const registerRequest: RegisterRequest = { credentials, nickname };

		AuthAPI.register(registerRequest)
			.then(() => {
				toast.sendSuccessMessage("Yay! Click on the link below to login.");
			})
			.catch((err) => {
				toast.sendErrorMessage(err.message);
			});
	};

	const invalidFormHandler: SubmitErrorHandler<FieldValues> = () => {
		toast.sendErrorMessage("Please check if you have filled everything in correctly before submitting", {
			title: "Oops!",
		});
	};

	return (
		<form onSubmit={handleSubmit(validFormHandler, invalidFormHandler)}>
			<Stack spacing={4}>
				<FormControl id="nickname" isInvalid={!!errors.nickname}>
					<FormLabel>Nickname</FormLabel>
					<Input type="text" {...register("nickname")} />
					<FormErrorMessage>{errors.nickname?.message as string}</FormErrorMessage>
				</FormControl>

				<FormControl id="email" isInvalid={!!errors.email}>
					<FormLabel>Email address</FormLabel>
					<Input type="email" {...register("email")} />
					<FormErrorMessage>{errors.email?.message as string}</FormErrorMessage>
				</FormControl>

				<FormControl id="password" isInvalid={!!errors.password}>
					<FormLabel>Password</FormLabel>
					<PasswordInput register={register} formKey="password" />
					<FormErrorMessage>{errors.password?.message as string}</FormErrorMessage>
				</FormControl>

				<FormControl id="confirmPassword" isInvalid={!!errors.confirmPassword}>
					<FormLabel>Confirm Password</FormLabel>
					<PasswordInput register={register} formKey="confirmPassword" />
					<FormErrorMessage>{errors.password?.message as string}</FormErrorMessage>
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
						Sign up
					</Button>
				</Stack>
				<Stack pt={6}>
					<Text align="center">
						Already a user? <Link to="/login">Login</Link>
					</Text>
				</Stack>
			</Stack>
		</form>
	);
}

export default RegisterForm;
