import { Box, Flex, Stack, Heading } from "@chakra-ui/react";
import React, { ReactNode } from "react";

type Props = {
  heading: string;
  children?: ReactNode;
};

function UnauthLayout({ heading, children }: Props) {
  return (
    <Flex minH="100vh" align="center" justify="center" bg="gray.50">
      <Stack spacing={8} mx="auto" py={12} px={6} minW="45vw" maxW="65vw">
        <Stack align="center">
          <Heading fontSize="4xl">{heading}</Heading>
        </Stack>

        <Box rounded="lg" bg="white" boxShadow="lg" p={8}>
          {children}
        </Box>
      </Stack>
    </Flex>
  );
}

export default UnauthLayout;
