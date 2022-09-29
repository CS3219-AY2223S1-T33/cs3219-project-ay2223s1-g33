import { ChannelCredentials } from '@grpc/grpc-js';
import {
  IQuestionServiceClient,
  QuestionServiceClient,
} from '../proto/question-service.grpc-client';
import { Question, QuestionDifficulty } from '../proto/types';
import { IQuestionAgent } from './question_agent_types';

class QuestionAgent implements IQuestionAgent {
  questionClient: IQuestionServiceClient;

  constructor(questionURL: string) {
    this.questionClient = new QuestionServiceClient(
      questionURL,
      ChannelCredentials.createInsecure(),
      {},
      {},
    );
  }

  getQuestionByDifficulty(difficulty: QuestionDifficulty): Promise<Question | undefined> {
    // Assume difficulty HARD, db not populated yet
    // eslint-disable-next-line no-param-reassign
    difficulty = QuestionDifficulty.HARD;

    const questionEasy: Question = {
      questionId: 1,
      difficulty,
      name: '',
      solution: '',
      content: '',
    };

    return new Promise<Question | undefined>((resolve, reject) => {
      this.questionClient.getQuestion(
        {
          question: questionEasy,
        },
        (err, value) => {
          if (value) {
            resolve(value.question);
          }
          reject(err);
        },
      );
    });
  }
}

function createQuestionService(
  questionURL: string,
): IQuestionAgent {
  return new QuestionAgent(questionURL);
}

export default createQuestionService;
