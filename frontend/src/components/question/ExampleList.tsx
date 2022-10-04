import { Box } from "@chakra-ui/react";
import React from "react";
import ExampleItem from "./ExampleItem";

type Props = {
  examples: string[];
};

function ExampleList({ examples }: Props) {
  return (
    <Box id="example-content">
      {examples.map((example: string, id: number) => (
        // eslint-disable-next-line react/no-array-index-key
        <ExampleItem id={id} example={example} key={id} />
      ))}
    </Box>
  );
}
export default ExampleList;
