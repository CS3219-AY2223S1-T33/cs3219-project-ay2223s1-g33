// import { sendRequest } from "./general";

import {
	GetAttemptSubmissionRequest,
	GetAttemptSubmissionResponse,
	SetHistoryCompletionRequest,
	SetHistoryCompletionResponse,
} from "../proto/history-service";
import { sendRequest } from "./general";

const getAttemptSubmission = (req: GetAttemptSubmissionRequest) =>
	sendRequest<GetAttemptSubmissionRequest, GetAttemptSubmissionResponse>("/api/user/history/submission", req, true);

const setHistoryCompletion = (req: SetHistoryCompletionRequest) =>
	sendRequest<SetHistoryCompletionRequest, SetHistoryCompletionResponse>("/api/user/history/completion", req, true);

export default { getAttemptSubmission, setHistoryCompletion };
