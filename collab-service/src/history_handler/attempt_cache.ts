import IAttemptCache from './attempt_cache_types';
import { HistoryAttempt, Question } from '../proto/types';
import { CreateAttemptResponse } from '../proto/history-crud-service';
import decodeAttempt from './attempt_decoder';

class AttemptCache implements IAttemptCache {
  question: Question | undefined;

  lang: string;

  submission: string;

  users: string[];

  call: ((attempt: HistoryAttempt) => Promise<CreateAttemptResponse>) | undefined;

  constructor() {
    this.question = undefined;
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

  setUploader(call: (attempt: HistoryAttempt) => Promise<CreateAttemptResponse>) {
    this.call = call;
  }

  /**
   * Checks if cache has all fields populated
   * @return isValid
   */
  isValid(): boolean {
    return !(
      this.question === undefined
      || !this.lang || !this.submission || !this.users || this.call === undefined);
  }

  /**
   * Clears all fields
   */
  reset() {
    this.question = undefined;
    this.lang = '';
    this.submission = '';
    this.users = [];
    this.call = undefined;
  }

  /**
   * Generate history attempt object from cached fields
   * @private
   * @return attempt
   */
  private getHistoryAttempt(): HistoryAttempt {
    const attempt = HistoryAttempt.create({
      question: this.question,
      language: this.lang,
      submission: this.submission,
      users: this.users,
    });
    this.reset();
    return attempt;
  }

  async uploadHistoryAttempt(): Promise<CreateAttemptResponse> {
    if (this.call === undefined) {
      return CreateAttemptResponse.create();
    }
    return this.call(this.getHistoryAttempt());
  }
}

function createAttemptCache() {
  return new AttemptCache();
}

export {
  AttemptCache,
  createAttemptCache,
};
