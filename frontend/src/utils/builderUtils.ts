import { AxiosResponse } from "axios";
import { throwIfError } from "../api/general";
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
  const fn = (res: AxiosResponse<GetAttemptHistoryResponse, any>) => {
    throwIfError(res);

    const { attempts, totalCount } = res.data;
    return { items: attempts, total: totalCount };
  };

  return fn;
};

export { createAttemptHistoryReqFactory, createAttemptHistoryExtractor };
