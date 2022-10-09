import { HistoryAttempt, Question } from '../proto/types';
import { CreateAttemptResponse } from '../proto/history-crud-service';

declare interface IAttemptCache {
  setQuestion(qns: Question)
  setUsers(username: string[])
  setLangContent(data: Uint8Array)
  isValid(): boolean
  setUploader(call: (attempt: HistoryAttempt) => Promise<CreateAttemptResponse>)
  uploadHistoryAttempt(): Promise<CreateAttemptResponse>
}

export default IAttemptCache;
