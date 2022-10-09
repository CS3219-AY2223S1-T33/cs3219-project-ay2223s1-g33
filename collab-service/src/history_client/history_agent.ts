import { ChannelCredentials, ServiceError } from '@grpc/grpc-js';
import { IHistoryAgent } from './history_agent_types';
import {
  IHistoryCrudServiceClient,
  HistoryCrudServiceClient,
} from '../proto/history-crud-service.grpc-client';
import { HistoryAttempt } from '../proto/types';
import { CreateAttemptResponse } from '../proto/history-crud-service';
import getGrpcDeadline from '../utils/grpc_deadline';

function buildErrorMessage(err: ServiceError): CreateAttemptResponse {
  return CreateAttemptResponse.create({
    errorMessage: err.details,
  });
}

class HistoryAgent implements IHistoryAgent {
  historyClient: IHistoryCrudServiceClient;

  constructor(historyURL: string) {
    this.historyClient = new HistoryCrudServiceClient(
      historyURL,
      ChannelCredentials.createInsecure(),
      {},
      {},
    );
  }

  uploadHistoryAttempt(userAttempt: HistoryAttempt): Promise<CreateAttemptResponse> {
    return new Promise<CreateAttemptResponse>((resolve, reject) => {
      this.historyClient.createAttempt(
        {
          attempt: userAttempt,
        },
        {
          deadline: getGrpcDeadline(),
        },
        (err, value) => {
          if (value) {
            resolve(value);
          } else if (err) {
            resolve(buildErrorMessage(err));
          } else {
            reject();
          }
        },
      );
    });
  }
}

function createHistoryService(
  historyURL: string,
): IHistoryAgent {
  return new HistoryAgent(historyURL);
}

export default createHistoryService;
