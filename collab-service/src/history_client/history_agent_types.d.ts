import { CreateAttemptResponse } from '../proto/history-crud-service';

declare interface IHistoryAgent {
  uploadHistoryAttempt(): Promise<CreateAttemptResponse>
}
