import { Stack, Text } from "@chakra-ui/react";
import React from "react";

type Props = {
  remainingTime: number;
};

function CountdownText({ remainingTime: timeRemaining }: Props) {
  return (
    <Stack align="center">
      <Text fontSize="3xl">{timeRemaining}</Text>
      <Text>Seconds</Text>
    </Stack>
  );
}

export default CountdownText;
