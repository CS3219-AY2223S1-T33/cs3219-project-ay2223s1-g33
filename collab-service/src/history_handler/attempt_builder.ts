import { HistoryAttempt, Question } from '../proto/types';
import { decodeAttempt } from '../message_handler/room/connect_message_builder';
import IAttemptBuilder from './attempt_builder_types';

class AttemptBuilder implements IAttemptBuilder {
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

  buildHistoryAttempt(): HistoryAttempt {
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

function createAttemptBuilder() {
  return new AttemptBuilder();
}

export {
  AttemptBuilder,
  createAttemptBuilder,
};
