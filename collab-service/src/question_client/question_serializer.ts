import { Question } from '../proto/types';

function serializeQuestion(question: Question): string {
  return JSON.stringify(question);
}

function deserializeQuestion(question: string): Question {
  return JSON.parse(question);
}

export {
  serializeQuestion,
  deserializeQuestion,
};
