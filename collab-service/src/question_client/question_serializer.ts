import { Question } from '../proto/types';

function serializeQuestion(question: Question): string {
  return JSON.stringify(question);
}

function deserializeQuestion(question: string): Question | undefined {
  try {
    const qns: Question = JSON.parse(question);
    return qns;
  } catch (err) {
    return undefined;
  }
}

export {
  serializeQuestion,
  deserializeQuestion,
};
