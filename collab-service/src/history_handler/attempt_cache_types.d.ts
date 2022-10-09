import { HistoryAttempt } from '../proto/types';
import { CreateAttemptResponse } from '../proto/history-crud-service';

declare interface IAttemptCache {
  setQuestion(qns: string)
  setUsers(username: string[])
  setLangContent(data: Uint8Array)
  isValid(): boolean
  isEmpty(): boolean;
  reset();
  setUploader(call: (attempt: HistoryAttempt) => Promise<CreateAttemptResponse>)
  executeUploader(): Promise<CreateAttemptResponse>
}

export default IAttemptCache;
