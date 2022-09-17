import { Question } from '../proto/types';

declare type StoredQuestion = Omit<Question, 'questionId'> & { questionId?: number };

export {
  // eslint-disable-next-line import/prefer-default-export
  StoredQuestion,
};
