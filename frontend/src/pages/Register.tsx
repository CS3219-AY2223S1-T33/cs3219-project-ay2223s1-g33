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
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import React from "react";
import Link from "../components/ui/Link";

function Register() {
	const [showPassword, setShowPassword] = useBoolean();

	return (
		<Flex minH="100vh" align="center" justify="center" bg="gray.50">
			<Stack spacing={8} mx="auto" py={12} px={6} minW="45vw" maxW="65vw">
				<Stack align="center">
					<Heading fontSize="4xl">Sign up</Heading>
					{/* <Text fontSize="lg" color="gray.600">
						to enjoy all of our cool features ✌️
					</Text> */}
				</Stack>
				<Box rounded="lg" bg={useColorModeValue("white", "gray.700")} boxShadow="lg" p={8}>
					<Stack spacing={4}>
						<FormControl id="nickname" isRequired>
							<FormLabel>Nickname</FormLabel>
							<Input type="text" />
						</FormControl>
						<FormControl id="email" isRequired>
							<FormLabel>Email address</FormLabel>
							<Input type="email" />
						</FormControl>
						<FormControl id="password" isRequired>
							<FormLabel>Password</FormLabel>
							<InputGroup>
								<Input type={showPassword ? "text" : "password"} />
								<InputRightElement h="full">
									<Button variant="ghost" onClick={setShowPassword.toggle}>
										{showPassword ? <ViewIcon /> : <ViewOffIcon />}
									</Button>
								</InputRightElement>
							</InputGroup>
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
				</Box>
			</Stack>
		</Flex>
	);
}

export default Register;
