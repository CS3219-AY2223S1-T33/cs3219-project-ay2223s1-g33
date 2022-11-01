import { Badge, Button } from "@chakra-ui/react";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../app/store";
import { changeIsCompleted } from "../../feature/session/sessionSlice";
import { SetHistoryCompletionRequest } from "../../proto/history-service";
import { HistoryCompletion, Question } from "../../proto/types";
import { CompletionConfig } from "../../types";
import useFixedToast from "../../utils/hooks/useFixedToast";
import HistoryAPI from "../../api/history";

type Props = {
	config: CompletionConfig;
	question: Question;
	isCompleted: boolean | undefined;
};

function CompletionStatus({ config, question, isCompleted }: Props) {
	const username = useSelector((state: RootState) => state.user.user)?.username;
	const dispatch = useDispatch();
	const toast = useFixedToast();

	const toggleCompletionHandler = () => {
		if (!username) {
			return;
		}

		const { questionId } = question;

		const completed: HistoryCompletion = { questionId, username };
		const request: SetHistoryCompletionRequest = { completed };
		HistoryAPI.setHistoryCompletion(request)
			.then(() => {
				dispatch(changeIsCompleted({ isComplete: !isCompleted }));
			})
			.catch((err) => {
				toast.sendErrorMessage(err.message);
			});
	};

	return (
		<>
			{" "}
			<Badge colorScheme={config.colorScheme} size="lg" fontWeight="bold">
				{config.badgeText}
			</Badge>
			<br />
			<Button size="sm" onClick={toggleCompletionHandler}>
				Mark as {config.btnText}
			</Button>
		</>
	);
}

export default CompletionStatus;
