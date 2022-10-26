import { ChannelCredentials } from '@grpc/grpc-js';
import {
  IHistoryCrudServiceClient,
  HistoryCrudServiceClient,
} from '../proto/history-crud-service.grpc-client';
import { HistoryAttempt } from '../proto/types';
import getGrpcDeadline from '../utils/grpc_deadline';

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

  uploadHistoryAttempt(userAttempt: HistoryAttempt): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      this.historyClient.createAttempt(
        {
          attempt: userAttempt,
        },
        {
          deadline: getGrpcDeadline(),
        },
        (err, value) => {
          if (value) {
            resolve('');
          } else if (err) {
            resolve('Saved failed');
          } else {
            reject();
          }
        },
      );
    });
  }

  getHasBeenCompleted(username: string, questionId: number): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      this.historyClient.getCompletion(
        {
          username,
          questionId,
        },
        {
          deadline: getGrpcDeadline(),
        },
        (_err, value) => {
          if (value && value.completed) {
            resolve(true);
          } else {
            resolve(false);
          }
        },
      );
    });
  }
}

function createHistoryAgent(
  historyURL: string,
): IHistoryAgent {
  return new HistoryAgent(historyURL);
}

export default createHistoryAgent;
