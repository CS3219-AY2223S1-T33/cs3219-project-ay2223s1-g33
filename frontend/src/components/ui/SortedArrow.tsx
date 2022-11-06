import { TriangleDownIcon, TriangleUpIcon } from "@chakra-ui/icons";
import { chakra } from "@chakra-ui/react";
import React from "react";

type Props = {
  isSorted: boolean;
  isDesc: boolean | undefined;
};

function SortedArrow({ isSorted, isDesc }: Props) {
  if (!isSorted) {
    return null;
  }

  return (
    <chakra.span pl="4">
      {isDesc ? (
        <TriangleDownIcon aria-label="sorted descending" />
      ) : (
        <TriangleUpIcon aria-label="sorted ascending" />
      )}
    </chakra.span>
  );
}

export default SortedArrow;
