import { CreateAttemptResponse } from '../proto/history-crud-service';
import { HistoryAttempt } from '../proto/types';

declare interface IHistoryAgent {
  uploadHistoryAttempt(attempt: HistoryAttempt): Promise<CreateAttemptResponse>
}
