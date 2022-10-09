import { HistoryAttempt } from '../proto/types';

declare interface IAttemptCache {
  setQuestion(qns: string)
  setUsers(username: string[])
  setLangContent(data: Uint8Array)
  isValid(): boolean
  isEmpty(): boolean;
  reset();
  getHistoryAttempt(): HistoryAttempt
}

export default IAttemptCache;
