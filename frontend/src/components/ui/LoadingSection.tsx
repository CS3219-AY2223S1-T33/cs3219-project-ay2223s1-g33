import { Center, Heading, Spinner, VStack } from "@chakra-ui/react";
import React from "react";

type Props = {
  message: string;
};

export default function LoadingSection({ message }: Props) {
  return (
    <Center width="100%">
      <VStack spacing={4} width="100%">
        <Spinner size="xl" />
        <br />
        <Heading as="h5" size="sm">
          {message}
        </Heading>
      </VStack>
    </Center>
  );
}
