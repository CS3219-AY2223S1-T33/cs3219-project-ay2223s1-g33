import { ChannelCredentials } from '@grpc/grpc-js';
import { QuestionServiceClient } from '../proto/question-service.grpc-client';
import { Question, QuestionDifficulty } from '../proto/types';
import loadEnvironment from '../utils/env_loader';

const envConfig = loadEnvironment();

const questionClient = new QuestionServiceClient(
  envConfig.QUESTION_SERVER_URL,
  ChannelCredentials.createInsecure(),
  {},
  {},
);

function getQuestionByDifficulty(difficulty: QuestionDifficulty): Promise<Question | undefined> {
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
    questionClient.getQuestion(
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

export default getQuestionByDifficulty;
