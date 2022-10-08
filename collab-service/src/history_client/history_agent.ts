import { ChannelCredentials } from '@grpc/grpc-js';
import { IHistoryAgent } from './history_agent_types';
import {
  HistoryCrudServiceClient,
} from '../proto/history-crud-service.grpc-client';
import { HistoryAttempt } from '../proto/types';
import { CreateAttemptResponse } from '../proto/history-crud-service';

class HistoryAgent implements IHistoryAgent {
  historyClient: HistoryCrudServiceClient;

  constructor(historyURL: string) {
    this.historyClient = new HistoryCrudServiceClient(
      historyURL,
      ChannelCredentials.createInsecure(),
      {},
      {},
    );
  }

  uploadHistoryAttempt(attempt: HistoryAttempt): Promise<CreateAttemptResponse> {
    return new Promise<CreateAttemptResponse>((resolve, reject) => {
      this.historyClient.createAttempt(
        {
          attempt,
        },
        (err, value) => {
          if (value) {
            resolve(value);
          }
          reject(err);
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
