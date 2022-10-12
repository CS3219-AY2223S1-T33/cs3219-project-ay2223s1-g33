import {
  GetAttemptHistoryRequest,
  GetAttemptHistoryResponse,
} from "../proto/history-service";

const createAttemptHistoryReqFactory = (questionId: number) => {
  const fn = (offset: number, limit: number) => {
    const req: GetAttemptHistoryRequest = {
      offset,
      limit,
      questionId,
    };
    return req;
  };
  return fn;
};

const createAttemptHistoryExtractor = () => {
  const fn = (data: GetAttemptHistoryResponse) => {
    const { errorMessage } = data;
    if (errorMessage !== "") {
      throw new Error(errorMessage);
    }

    const { attempts, totalCount } = data;
    return { items: attempts, total: totalCount };
  };

  return fn;
};

export { createAttemptHistoryReqFactory, createAttemptHistoryExtractor };
