/* eslint class-methods-use-this: 0 */
import { getDatabase, Question } from '../db';
import { StoredQuestion } from '../model/question_store_model';
import { QuestionDifficulty } from '../proto/types';
import { IQuestionStore } from './storage';

const returnValues = ['questionId', 'name', 'difficulty', 'content', 'solution'];

class QuestionStore implements IQuestionStore {
  async addQuestion(question: StoredQuestion): Promise<StoredQuestion> {
    const { name, difficulty } = question;

    if (difficulty === QuestionDifficulty.UNUSED) {
      throw new Error('Question must have a difficulty');
    }

    const isExist = await getDatabase()
      .getQuestionRepo()
      .findOneBy({ name });

    if (isExist) {
      throw new Error('Question with same name already exists');
    }

    const insertResult: Question = (
      await getDatabase()
        .getQuestionRepo()
        .createQueryBuilder()
        .insert()
        .into(Question)
        .values([question])
        .returning(returnValues)
        .execute()
    ).raw[0];
    const newQuestion: StoredQuestion = {
      ...insertResult,
    };
    return newQuestion;
  }

  async removeQuestion(questionId: number): Promise<void> {
    await getDatabase()
      .getDataSource()
      .createQueryBuilder()
      .delete()
      .from(Question)
      .where('questionId = :questionId', { questionId })
      .execute();
  }

  async replaceQuestion(question: StoredQuestion): Promise<void> {
    const { name, questionId } = question;

    const isExist = await getDatabase()
      .getQuestionRepo()
      .findOneBy({ name });

    if (isExist) {
      throw new Error('Question with same name already exists');
    }

    await getDatabase()
      .getDataSource()
      .createQueryBuilder()
      .update(Question)
      .set(question)
      .where('questionId = :questionId', { questionId })
      .execute();
  }

  async getQuestion(questionId: number): Promise<StoredQuestion | undefined> {
    const selectResult: Question | null = await getDatabase()
      .getQuestionRepo()
      .createQueryBuilder('question')
      .where('question.questionId = :questionId', { questionId })
      .getOne();

    if (!selectResult) {
      return undefined;
    }
    const question: StoredQuestion = {
      ...selectResult,
    };
    return question;
  }

  async getQuestionByName(name: string): Promise<StoredQuestion | undefined> {
    const selectResult: Question | null = await getDatabase()
      .getQuestionRepo()
      .createQueryBuilder('question')
      .where('question.name = :name', { name })
      .getOne();

    if (!selectResult) {
      return undefined;
    }
    const question: StoredQuestion = {
      ...selectResult,
    };
    return question;
  }

  async getRandomQuestionByDifficulty(diffciulty: QuestionDifficulty):
  Promise<StoredQuestion | undefined> {
    const selectResult: Question | null = await getDatabase()
      .getQuestionRepo()
      .createQueryBuilder('question')
      .where('question.difficulty = :diffciulty', { diffciulty })
      .orderBy('RANDOM()')
      .limit(1)
      .getOne();

    if (!selectResult) {
      return undefined;
    }
    const question: StoredQuestion = {
      ...selectResult,
    };
    return question;
  }

  async getAllQuestion(): Promise<StoredQuestion[]> {
    const selectResult: Question[] = await getDatabase()
      .getQuestionRepo()
      .createQueryBuilder('question')
      .getMany();

    const storedQuestion: StoredQuestion[] = selectResult.map((question) => ({
      ...question,
    }));
    return storedQuestion;
  }
}

export default QuestionStore;
