import { ArrowLeftIcon, ArrowRightIcon } from "@chakra-ui/icons";
import { Flex, Button } from "@chakra-ui/react";
import React from "react";

type Props = {
  hasPrevious: boolean;
  hasNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
};

function PaginationControl({
  hasPrevious,
  hasNext,
  onPrevious,
  onNext,
}: Props) {
  return (
    <Flex w="100%" pt={4}>
      <Button
        leftIcon={<ArrowLeftIcon />}
        isDisabled={hasPrevious}
        onClick={onPrevious}
        mr={4}
      >
        Previous
      </Button>
      <Button
        rightIcon={<ArrowRightIcon />}
        isDisabled={hasNext}
        onClick={onNext}
      >
        Next
      </Button>
    </Flex>
  );
}

export default PaginationControl;
