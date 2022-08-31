import {
	Box,
	Flex,
	useColorModeValue,
	Stack,
	Heading,
	FormControl,
	FormLabel,
	Input,
	InputGroup,
	InputRightElement,
	Button,
	useBoolean,
	Text,
	FormErrorMessage,
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import React from "react";
import { useForm } from "react-hook-form";
import Link from "../components/ui/Link";

function Register() {
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm();
	const [showPassword, setShowPassword] = useBoolean();

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
					<Heading fontSize="4xl">Sign up</Heading>
				</Stack>
				<Box rounded="lg" bg={useColorModeValue("white", "gray.700")} boxShadow="lg" p={8}>
					<form onSubmit={handleSubmit(validFormHandler, invalidFormHandler)}>
						<Stack spacing={4}>
							<FormControl id="nickname" isInvalid={!!errors.nickname}>
								<FormLabel>Nickname</FormLabel>
								<Input
									type="text"
									{...register("nickname", { required: "Please enter your nickname." })}
								/>
								<FormErrorMessage>{errors.nickname?.message as string}</FormErrorMessage>
							</FormControl>
							<FormControl id="email" isInvalid={!!errors.email}>
								<FormLabel>Email address</FormLabel>
								<Input type="email" {...register("email", { required: "Please enter your email." })} />
								<FormErrorMessage>{errors.email?.message as string}</FormErrorMessage>
							</FormControl>
							<FormControl id="password" isInvalid={!!errors.password}>
								<FormLabel>Password</FormLabel>
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
									Already a user? <Link to="/">Login</Link>
								</Text>
							</Stack>
						</Stack>
					</form>
				</Box>
			</Stack>
		</Flex>
	);
}

export default Register;
