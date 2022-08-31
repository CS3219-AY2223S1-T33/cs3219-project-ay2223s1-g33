import {
	Box,
	Button,
	Flex,
	FormControl,
	FormErrorMessage,
	FormLabel,
	Heading,
	Input,
	Stack,
	Text,
} from "@chakra-ui/react";
import React from "react";
import { useForm } from "react-hook-form";
import Link from "../components/ui/Link";

function Login() {
	const {
		register,
		handleSubmit,
		// watch,
		formState: { errors },
	} = useForm();

	const validFormHandler = (data: any) => {
		// ! At this point, submit to the backend to login
		console.info("valid");
		console.log(data);
	};

	const invalidFormHandler = (data: any) => {
		console.warn("invalid");
		console.log(data);
	};

	return (
		<Flex minH="100vh" align="center" justify="center" bg="gray.50">
			<Stack spacing={8} mx="auto" py={12} px={6} minW="45vw" maxW="65vw">
				<Stack align="center">
					<Heading fontSize="4xl">PeerPrep</Heading>
				</Stack>

				<Box rounded="lg" bg="white" boxShadow="lg" p={8}>
					<form onSubmit={handleSubmit(validFormHandler, invalidFormHandler)}>
						<Stack spacing={6}>
							<FormControl id="email" isInvalid={!!errors.email}>
								<FormLabel>Email address</FormLabel>
								<FormErrorMessage>{errors.email?.message as string}</FormErrorMessage>
								<Input type="text" {...register("email", { required: "Please enter your email." })} />
							</FormControl>

							<FormControl id="password" isInvalid={!!errors.password}>
								<FormLabel>Password</FormLabel>
								<Input
									type="password"
									{...register("password", {
										required: "Please enter your password",
										minLength: {
											value: 8,
											message: "Please make sure your password is at least 8 characters long.",
										},
									})}
								/>
								<FormErrorMessage>{errors.password?.message as string}</FormErrorMessage>
							</FormControl>

							<Button type="submit">Sign in</Button>

							<Text align="center">
								Not a user? <Link to="/register">Register</Link>
							</Text>
						</Stack>
					</form>
				</Box>
			</Stack>
		</Flex>
	);
}

export default Login;
