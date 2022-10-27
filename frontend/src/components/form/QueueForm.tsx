import { Button, Stack } from "@chakra-ui/react";
import { useDispatch, useSelector } from "react-redux";
import React from "react";
import { enterQueue, toggleDifficulty } from "../../feature/matching/matchingSlice";
import { JoinQueueRequest } from "../../proto/matching-service";
import { RootState } from "../../app/store";
import useFixedToast from "../../utils/hooks/useFixedToast";
import { QuestionDifficulty } from "../../proto/types";
import MatchingAPI from "../../api/matching";

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
	const difficulties = useSelector((state: RootState) => state.matching.diffSelected);
	const noneSelected = difficulties.every((d) => !d);
	const toast = useFixedToast();

	const toggleDifficultyHandler = (index: number) => {
		dispatch(toggleDifficulty({ index }));
	};

	const enterQueueHandler = () => {
		// API call to enter queue, probably may need to pass some information to redux store
		if (noneSelected) {
			toast.sendErrorMessage("You must select at least 1 difficulty");
			return;
		}

		const selectedDifficulties: QuestionDifficulty[] = [];
		difficulties
			.map((isSelected, index) => (isSelected ? index + 1 : undefined))
			.filter((x) => x)
			.forEach((x) => selectedDifficulties.push(x as QuestionDifficulty));

		const joinQueueReq: JoinQueueRequest = {
			difficulties: selectedDifficulties,
		};

		MatchingAPI.joinQueue(joinQueueReq)
			.then(() => {
				dispatch(enterQueue());
			})
			.catch((err) => {
				toast.sendErrorMessage(err.message);
			});
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
