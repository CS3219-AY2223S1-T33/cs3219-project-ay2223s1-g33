import { Code, ListItem, Text, UnorderedList } from "@chakra-ui/react";
import React from "react";

type Props = {
  constraints: string[];
};

function ConstraintsList({ constraints }: Props) {
  return (
    <>
      <Text fontWeight="bold">Constraints</Text>
      <UnorderedList pl={4}>
        {constraints.map((constraint: string, id: number) => (
          // eslint-disable-next-line react/no-array-index-key
          <ListItem key={`c-${id}`}>
            <Code>{constraint}</Code>
          </ListItem>
        ))}
      </UnorderedList>
    </>
  );
}

export default ConstraintsList;
