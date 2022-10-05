import { UserEntity } from '../db';
import HistoryAttemptEntity from '../db/History';
import { HistoryAttempt } from '../proto/types';

declare type StoredAttempt = HistoryAttemptEntity;

function convertToStoredAttempt(
  attempt: HistoryAttempt,
  users: number[],
): (HistoryAttemptEntity | undefined) {
  if (!attempt.question) {
    return undefined;
  }

  const userObjects: UserEntity[] = users.map((x): UserEntity => ({
    userId: x,
    username: '',
    nickname: '',
    password: '',
    isActive: true,
    createDateTime: new Date(),
    updateDateTime: new Date(),
  }));

  return {
    attemptId: attempt.attemptId,
    question: {
      questionId: attempt.question?.questionId,
      name: '',
      difficulty: 0,
      content: '',
      solution: '',
    },
    users: userObjects,
    submission: attempt.submission,
    language: attempt.language,
  };
}

function convertToProtoAttempt(attempt: HistoryAttemptEntity): (HistoryAttempt | undefined) {
  if (!attempt.createDateTime) {
    return undefined;
  }

  let users: string[] = [];
  if (attempt.users) {
    users = attempt.users.map((user) => user.username);
  }

  return {
    attemptId: attempt.attemptId,
    question: attempt.question,
    submission: attempt.submission,
    language: attempt.language,
    timestamp: Math.floor(attempt.createDateTime.getTime() / 1000),
    users,
  };
}

export {
  StoredAttempt,
  convertToStoredAttempt,
  convertToProtoAttempt,
};
