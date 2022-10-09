import IAttemptCache from './attempt_cache_types';
import { HistoryAttempt, Question } from '../proto/types';
import decodeAttempt from './attempt_decoder';

/**
 * Intermediate representation of a code submission.
 * Temporary storage & validator of history attempt.
 */
class AttemptCache implements IAttemptCache {
  question: Question | undefined;

  lang: string;

  submission: string;

  users: string[];

  constructor() {
    this.question = undefined;
    this.lang = '';
    this.submission = '';
    this.users = [];
  }

  setQuestion(qns: string) {
    if (!qns) {
      this.question = undefined;
    } else {
      this.question = JSON.parse(qns);
    }
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

  /**
   * Checks if cache has all fields populated
   */
  isValid(): boolean {
    return !(
      this.question === undefined
    || this.lang === ''
    || this.submission === ''
    || !this.users.length
    );
  }

  /**
   * Checks if all fields are cleared
   */
  isEmpty(): boolean {
    return (
      this.question === undefined
      && this.lang === ''
      && this.submission === ''
      && !this.users.length
    );
  }

  /**
   * Resets all fields
   */
  reset() {
    this.question = undefined;
    this.lang = '';
    this.submission = '';
    this.users = [];
  }

  /**
   * Generate history attempt object from cached fields
   * @private
   * @return attempt
   */
  getHistoryAttempt(): HistoryAttempt {
    const attempt = HistoryAttempt.create({
      question: this.question,
      language: this.lang,
      submission: this.submission,
      users: this.users,
    });
    this.reset();
    return attempt;
  }
}

function createAttemptCache() {
  return new AttemptCache();
}

export {
  AttemptCache,
  createAttemptCache,
};
