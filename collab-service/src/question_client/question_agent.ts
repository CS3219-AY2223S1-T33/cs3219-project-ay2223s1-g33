import { ChannelCredentials } from '@grpc/grpc-js';
import { IQuestionAgent } from './question_agent_types';
import {
  IQuestionServiceClient,
  QuestionServiceClient,
} from '../proto/question-service.grpc-client';
import { Question, QuestionDifficulty } from '../proto/types';
import { getGrpcDeadline } from '../utils/call_deadline';

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
    const questionRequest: Question = {
      questionId: 0,
      difficulty,
      name: '',
      solution: '',
      content: '',
      executionInput: '',
    };

    return new Promise<Question | undefined>((resolve, reject) => {
      this.questionClient.getQuestion(
        {
          question: questionRequest,
        },
        {
          deadline: getGrpcDeadline(),
        },
        (err, value) => {
          if (value) {
            resolve(value.question);
          } else if (err) {
            resolve(undefined);
          } else {
            reject();
          }
        },
      );
    });
  }
}

function createQuestionService(questionURL: string): IQuestionAgent {
  return new QuestionAgent(questionURL);
}

export default createQuestionService;
