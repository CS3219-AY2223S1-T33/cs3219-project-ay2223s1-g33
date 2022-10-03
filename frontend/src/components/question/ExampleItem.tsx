import { Box, Code, Text } from "@chakra-ui/react";
import React from "react";
import boldTestcaseKeyword from "../../utils/boldTestcaseKeyword";

type Props = {
  id: number;
  example: string;
};

function ExampleItem({ id, example }: Props) {
  return (
    <Box>
      <Text fontWeight="bold">Example {id + 1}:</Text>
      <Code w="100%" p="4" mb="4" borderRadius={4}>
        {example.split("\n").map((e, idx) => (
          // eslint-disable-next-line react/no-array-index-key
          <Text key={`ex-${id}-${idx}`}>
            <b>{boldTestcaseKeyword(e).keyword}</b>
            {boldTestcaseKeyword(e).lnContent}
          </Text>
        ))}
      </Code>
    </Box>
  );
}

export default ExampleItem;
