import { Box, Button, Flex, FormControl, FormLabel, Heading, Input, Stack } from "@chakra-ui/react";
import React from "react";

function Login() {
	return (
		<Flex h="100vh" align="center" justify="center" bg="gray.100">
			<Stack>
				<Stack align="center">
					<Heading>Log In</Heading>
				</Stack>
				<Box>
					<Stack>
						<form>
							<FormControl>
								<FormLabel htmlFor="email">Email:</FormLabel>
								<Input id="name" placeholder="Email" />
								{/* To be added later */}
								{/* <FormErrorMessage></FormErrorMessage> */}
							</FormControl>
							<FormControl>
								<FormLabel htmlFor="password">Password: </FormLabel>
								<Input id="password" placeholder="Password" type="password" />
							</FormControl>
							{/* Add forgot password link here */}
							<Button type="submit">Sign in</Button>
						</form>
					</Stack>
				</Box>
			</Stack>
		</Flex>
	);
}

export default Login;
