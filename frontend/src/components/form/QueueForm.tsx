import { Button, Stack } from "@chakra-ui/react";
import React, { useState } from "react";

const DIFFICULTY = [
  {
    name: "Easy",
    colorScheme: "green"
  },
  {
    name: "Medium",
    colorScheme: "orange"
  },
  {
    name: "Hard",
    colorScheme: "red"
  }
];

function QueueForm() {
  const [difficulty, setDifficulty] = useState([true, true, true]);
  const noneSelected = difficulty.every((d) => !d);

  const toggleDifficultyHandler = (index: number) => {
    const newDifficulty = [...difficulty];
    newDifficulty.splice(index, 1, !difficulty[index]);
    setDifficulty(newDifficulty);
  };

  return (
    <Stack spacing={6}>
      {difficulty.map((d, i) => {
        const { name, colorScheme } = DIFFICULTY[i];
        return (
          <Button
            key={name}
            colorScheme={colorScheme}
            variant={difficulty[i] ? "solid" : "outline"}
            onClick={() => toggleDifficultyHandler(i)}
          >
            {DIFFICULTY[i].name}
          </Button>
        );
      })}

      <Button disabled={noneSelected}>Find a Buddy</Button>
    </Stack>
  );
}

export default QueueForm;
