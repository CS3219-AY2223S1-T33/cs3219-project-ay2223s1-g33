import { Code, Divider, Heading, VStack } from "@chakra-ui/react";
import React from "react";

type Props = {
  submission: string;
};

function HistorySection({ submission }: Props) {
  return (
    <VStack spacing={4} width="50%">
      <Heading as="h4" size="md">
        Code Submitted
      </Heading>
      <Divider />
      <Code overflow="scroll">{submission}</Code>
    </VStack>
  );
}

export default HistorySection;
