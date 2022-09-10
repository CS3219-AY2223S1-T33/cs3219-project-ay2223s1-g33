import { Button, Stack } from "@chakra-ui/react";
import { useDispatch, useSelector } from "react-redux";
import React from "react";
import { enterQueue, toggleDifficulty } from "../../feature/matching/matchingSlice";
import { RootState } from "../../app/store";

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

function QueueForm() {
	const dispatch = useDispatch();
	// const [difficulty, setDifficulty] = useState([true, true, true]);
	const difficulties = useSelector((state: RootState) => state.matching.diffSelected);
	const noneSelected = difficulties.every((d) => !d);

	const toggleDifficultyHandler = (index: number) => {
		// const newDifficulty = [...difficulty];
		// newDifficulty.splice(index, 1, !difficulty[index]);
		// setDifficulty(newDifficulty);
		dispatch(toggleDifficulty({ index }));
	};

	const enterQueueHandler = () => {
		// API call to enter queue, probably may need to pass some information to redux store

		// For now just change the flag
		dispatch(enterQueue());
	};

	return (
		<Stack spacing={6}>
			{difficulties.map((d, i) => {
				const { name, colorScheme } = DIFFICULTY[i];
				return (
					<Button
						key={name}
						colorScheme={colorScheme}
						variant={difficulties[i] ? "solid" : "outline"}
						onClick={() => toggleDifficultyHandler(i)}
					>
						{DIFFICULTY[i].name}
					</Button>
				);
			})}

			<Button disabled={noneSelected} onClick={enterQueueHandler}>
				Find Buddy
			</Button>
		</Stack>
	);
}

export default QueueForm;
