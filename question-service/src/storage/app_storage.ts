import { IStorage } from './storage';
import QuestionStore from './question_store';
import { IDatabase } from '../db';

class AppStorage implements IStorage {
  questionStore: QuestionStore;

  constructor(dbConn: IDatabase) {
    this.questionStore = new QuestionStore(dbConn);
  }

  getQuestionStore(): QuestionStore {
    return this.questionStore;
  }
}

export default AppStorage;
