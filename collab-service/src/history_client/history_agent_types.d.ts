import { CreateAttemptResponse } from '../proto/history-crud-service';

declare interface IHistoryAgent {
  uploadHistoryAttempt(userAttempt: HistoryAttempt): Promise<CreateAttemptResponse>
}
