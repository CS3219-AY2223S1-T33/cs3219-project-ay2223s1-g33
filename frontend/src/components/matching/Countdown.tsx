import { Button, Stack, Text, useBoolean, useToast } from "@chakra-ui/react";
import { useDispatch, useSelector } from "react-redux";
import React from "react";
import { CountdownCircleTimer } from "react-countdown-circle-timer";
import { useNavigate } from "react-router-dom";
import axios from "../../axios";
import { leaveQueue } from "../../feature/matching/matchingSlice";
import CountdownText from "./CountdownText";
import { CheckQueueStatusRequest, CheckQueueStatusResponse, QueueStatus } from "../../proto/matching-service";
import { RootState } from "../../app/store";

// ! console.log() s ar e intentionally left here for backend implementation
function Countdown() {
	const sessionToken = useSelector((state: RootState) => state.user.sessionToken);
	const toast = useToast();
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const [isPlaying, setIsPlaying] = useBoolean(true);

	// Cleanup function for leaving the queue (may be extended for specific scenarios: timeout, matched)
	const leaveQueueHandler = () => {
		// TODO API call to leave queue, may require some information from the redux store
		console.log("Call API to leave the queue");
		setIsPlaying.off();
		dispatch(leaveQueue());
	};

	const completeTimeHandler = () => {
		console.log(`Times up. Leaving queue.`);
		leaveQueueHandler();
	};

	const updateTimeHandler = (remainingTime: number) => {
		// Prevents t=0 redirect.
		if (remainingTime === 30) {
			return;
		}

		console.log(`API update call made`);
		const checkRequest: CheckQueueStatusRequest = { sessionToken };
		axios
			.post<CheckQueueStatusResponse>("/queue/status", checkRequest)
			.then((res) => {
				const { errorCode, errorMessage, queueStatus, roomToken } = res.data;

				if (errorCode) {
					throw new Error(errorMessage);
				}

				switch (queueStatus) {
					case QueueStatus.PENDING:
						break;
					case QueueStatus.MATCHED:
						// Leave the queue and transit to session
						leaveQueueHandler();
						navigate(`/session/${roomToken}`);
						break;
					case QueueStatus.EXPIRED:
						completeTimeHandler();
						break;
					default:
						throw new Error("Invalid queueStatus");
				}
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
		<Stack spacing={6} align="center">
			<Text fontWeight={600} fontSize="2xl">
				Finding a buddy....
			</Text>
			<CountdownCircleTimer
				isPlaying={isPlaying}
				duration={30}
				colors="#004777"
				onUpdate={updateTimeHandler}
				onComplete={completeTimeHandler}
			>
				{({ remainingTime }) => <CountdownText remainingTime={remainingTime} />}
			</CountdownCircleTimer>
			<Button colorScheme="red" onClick={leaveQueueHandler}>
				Leave Queue
			</Button>
		</Stack>
	);
}

export default Countdown;
