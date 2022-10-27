// import { sendRequest } from "./general";

import { GetAttemptSubmissionRequest, GetAttemptSubmissionResponse } from "../proto/history-service";
import { sendRequest } from "./general";

const getAttemptSubmission = (req: GetAttemptSubmissionRequest) =>
	sendRequest<GetAttemptSubmissionRequest, GetAttemptSubmissionResponse>("/api/user/history/submission", req, true);

export default { getAttemptSubmission };
