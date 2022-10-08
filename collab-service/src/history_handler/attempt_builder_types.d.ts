import { HistoryAttempt, Question } from '../proto/types';

declare interface IAttemptBuilder {
  setQuestion(qns: Question)
  setUsers(username: string[])
  setLangContent(data: Uint8Array)
  buildHistoryAttempt(): HistoryAttempt
}

export default IAttemptBuilder;
