import { Box, Button, Flex, FormControl, FormLabel, Heading, Input, Stack, Text } from "@chakra-ui/react";
import React from "react";
import Link from "../components/ui/Link";

function Login() {
	return (
		<Flex minH="100vh" align="center" justify="center" bg="gray.50">
			<Stack spacing={8} mx="auto" py={12} px={6} minW="45vw" maxW="65vw">
				<Stack align="center">
					<Heading fontSize="4xl">PeerPrep</Heading>
				</Stack>

				<Box rounded="lg" bg="white" boxShadow="lg" p={8}>
					<Stack spacing={6}>
						<FormControl id="email">
							<FormLabel>Email address</FormLabel>
							<Input type="email" />
						</FormControl>
						<FormControl id="password">
							<FormLabel>Password</FormLabel>
							<Input type="password" />
						</FormControl>
						{/* Forgot password and register */}
						<Button>Sign in</Button>

						<Text align="center">
							Not a user? <Link to="/register">Register</Link>
						</Text>
					</Stack>
				</Box>
			</Stack>
		</Flex>
	);
}

export default Login;
