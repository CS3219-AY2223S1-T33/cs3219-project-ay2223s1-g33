import { Code, Divider, Heading, VStack, Spinner, Center } from "@chakra-ui/react";
import React from "react";

type Props = {
  submission: string | undefined;
};

function HistorySection({ submission }: Props) {
  let contentSection = (
    <Center width="100%">
      <VStack spacing={4} width="100%">
        <Spinner size='xl' />
        <br/>
        <Heading as="h5" size="sm">
          Loading Submission...
        </Heading>
      </VStack>
    </Center>
  );

  if (submission) {
    contentSection = (
      <Code width="100%" overflow="scroll">{submission}</Code>
    );
  }
  return (
    <VStack spacing={4} width="50%">
      <Heading as="h4" size="md">
        Code Submitted
      </Heading>
      <Divider />
      {contentSection}
    </VStack>
  );
}

export default HistorySection;
