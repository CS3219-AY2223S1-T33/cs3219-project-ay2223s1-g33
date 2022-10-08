import { ChannelCredentials } from '@grpc/grpc-js';
import { IHistoryAgent } from './history_agent_types';
import {
  HistoryCrudServiceClient,
} from '../proto/history-crud-service.grpc-client';
import { HistoryAttempt, Question } from '../proto/types';
import { decodeAttempt } from '../message_handler/room/connect_message_builder';
import { CreateAttemptResponse } from '../proto/history-crud-service';

class HistoryAgent implements IHistoryAgent {
  historyClient: HistoryCrudServiceClient;

  question: Question | undefined;

  lang: string;

  submission: string;

  users: string[];

  constructor(historyURL: string) {
    this.historyClient = new HistoryCrudServiceClient(
      historyURL,
      ChannelCredentials.createInsecure(),
      {},
      {},
    );
    this.lang = '';
    this.submission = '';
    this.users = [];
  }

  setQuestion(qns: Question) {
    this.question = qns;
  }

  setUsers(username: string[]) {
    this.users = username;
  }

  setLangContent(data: Uint8Array) {
    const {
      lang,
      content,
    } = decodeAttempt(data);
    this.lang = lang;
    this.submission = content;
  }

  reset() {
    this.question = undefined;
    this.lang = '';
    this.submission = '';
    this.users = [];
  }

  uploadHistoryAttempt(): Promise<CreateAttemptResponse> {
    const attempt = HistoryAttempt.create({
      question: this.question,
      language: this.lang,
      submission: this.submission,
      users: this.users,
    });
    this.reset();
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
