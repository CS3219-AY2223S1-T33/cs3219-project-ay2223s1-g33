import { Button, Radio, RadioGroup, Stack } from "@chakra-ui/react";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { enterQueue } from "../../feature/matching/matchingSlice";

const DIFFICULTY = [
  {
    name: "Easy",
    colorScheme: "green",
  },
  {
    name: "Medium",
    colorScheme: "orange",
  },
  {
    name: "Hard",
    colorScheme: "red",
  },
];

/**
 * This component is temporarily implemented for the MVP. It only allows single difficulty selection.
 *  Once we are able to support multiple difficulties, this component will be deprecated.
 */
function TempQueueForm() {
  const dispatch = useDispatch();
  const [selectedDiff, setSelectedDiff] = useState("Easy");

  const enterQueueHandler = () => {
    // API call to enter queue, probably may need to pass some information to redux store

    // For now just change the flag
    dispatch(enterQueue());
  };

  return (
    <RadioGroup onChange={setSelectedDiff} value={selectedDiff}>
      <Stack spacing={6}>
        {DIFFICULTY.map((d) => (
          <Radio value={d.name} key={d.name}>
            <Button colorScheme={d.colorScheme} variant="solid">
              {`${d.name} Difficulty`}
            </Button>
          </Radio>
        ))}
        <Button onClick={enterQueueHandler}>Find Buddy</Button>
      </Stack>
    </RadioGroup>
  );
}

export default TempQueueForm;
