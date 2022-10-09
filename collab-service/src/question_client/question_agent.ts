import { ChannelCredentials, ServiceError } from '@grpc/grpc-js';
import { IQuestionAgent } from './question_agent_types';
import {
  IQuestionServiceClient,
  QuestionServiceClient,
} from '../proto/question-service.grpc-client';
import { Question, QuestionDifficulty } from '../proto/types';
import { GetQuestionResponse } from '../proto/question-service';
import getGrpcDeadline from '../utils/grpc_deadline';

function buildErrorMessage(err: ServiceError): GetQuestionResponse {
  return GetQuestionResponse.create({
    errorMessage: err.details,
  });
}

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

  getQuestionByDifficulty(difficulty: QuestionDifficulty): Promise<GetQuestionResponse> {
    const questionRequest: Question = {
      questionId: 0,
      difficulty,
      name: '',
      solution: '',
      content: '',
    };

    return new Promise<GetQuestionResponse>((resolve, reject) => {
      this.questionClient.getQuestion(
        {
          question: questionRequest,
        },
        {
          deadline: getGrpcDeadline(),
        },
        (err, value) => {
          if (value) {
            resolve(value);
          } else if (err) {
            resolve(buildErrorMessage(err));
          } else {
            reject();
          }
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
