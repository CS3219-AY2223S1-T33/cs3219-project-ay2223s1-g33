import { IStorage } from './storage';
import QuestionStore from './question_store';

class AppStorage implements IStorage {
  questionStore: QuestionStore;

  constructor() {
    this.questionStore = new QuestionStore();
  }

  getQuestionStore(): QuestionStore {
    return this.questionStore;
  }
}

export default AppStorage;
