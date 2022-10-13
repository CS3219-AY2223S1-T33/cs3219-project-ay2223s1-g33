import { Code, Divider, Heading, VStack } from "@chakra-ui/react";
import React from "react";
import LoadingSection from "../ui/LoadingSection";

type Props = {
  submission: string | undefined;
};

function HistorySection({ submission }: Props) {
  return (
    <VStack spacing={4} width="50%">
      <Heading as="h4" size="md">
        Code Submitted
      </Heading>
      <Divider />
      {submission ? (
        <LoadingSection message="Loading Submission..." />
      ) : (
        <Code width="100%" overflow="scroll">
          {submission}
        </Code>
      )}
    </VStack>
  );
}

export default HistorySection;
