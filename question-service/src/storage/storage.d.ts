import { StoredQuestion } from '../model/question_store_model';
import { QuestionDifficulty } from '../proto/types';

declare interface IStorage {
  getQuestionStore(): IQuestionStore;
}

declare interface IQuestionStore {
  addQuestion(question: StoredQuestion): Promise<StoredQuestion>;
  removeQuestion(id: number): Promise<void>;
  replaceQuestion(question: StoredQuestion): Promise<void>;
  getQuestion(id: number): Promise<StoredQuestion | undefined>;
  getQuestionByName(questionname: string): Promise<StoredQuestion | undefined>;
  getRandomQuestionByDifficulty(diffciulty: QuestionDifficulty):
  Promise<StoredQuestion | undefined>;
  getAllQuestion(): Promise<StoredQuestion[]>;
}

export { IStorage, IQuestionStore };
