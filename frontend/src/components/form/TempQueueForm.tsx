import { Button, Radio, RadioGroup, Stack, useToast } from "@chakra-ui/react";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../app/store";
import axios from "../../axios";
import { enterQueue } from "../../feature/matching/matchingSlice";
import { JoinQueueResponse, JoinQueueRequest } from "../../proto/matching-service";
import { QuestionDifficulty } from "../../proto/types";

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
	const toast = useToast();
	const sessionToken = useSelector((state: RootState) => state.user.sessionToken);
	const dispatch = useDispatch();
	const [selectedDiff, setSelectedDiff] = useState("Easy");

	const enterQueueHandler = () => {
		// API call to enter queue
		const difficulty: QuestionDifficulty = DIFFICULTY.findIndex((d) => d.name === selectedDiff) + 1;
		const joinQueueReq: JoinQueueRequest = { sessionToken, difficulty };

		// Not necessary since backend will check also (and should NOT trigger this at all)
		// Will probably show something meaningful
		if (difficulty === 0) {
			console.error("No difficulty selected");
		}
		axios
			.post<JoinQueueResponse>("/queue/join", joinQueueReq)
			.then((res) => {
				const { errorCode, errorMessage } = res.data;

				if (errorCode) {
					throw new Error(errorMessage);
				}

				// For now just change the flag
				dispatch(enterQueue());
			})
			.catch((err) => {
				toast({
					title: "Error",
					status: "error",
					duration: 5000,
					isClosable: true,
					position: "top",
					description: err.message,
				});
			});
	};

	return (
		<RadioGroup onChange={setSelectedDiff} value={selectedDiff}>
			<Stack spacing={6}>
				{DIFFICULTY.map((d) => (
					<Radio value={d.name} key={d.name}>
						<Button onClick={() => setSelectedDiff(d.name)} colorScheme={d.colorScheme} variant="solid">
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
