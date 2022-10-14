import HistoryAttemptEntity from '../db/history_entity';
import HistoryOwnerEntity from '../db/history_owner_entity';
import { HistoryAttempt, Question } from '../proto/types';

declare type StoredAttempt = HistoryAttemptEntity;

function convertToStoredAttempt(
  attempt: HistoryAttempt,
  users: number[],
): (HistoryAttemptEntity | undefined) {
  if (!attempt.question) {
    return undefined;
  }

  const userObjects: HistoryOwnerEntity[] = users.map((x): HistoryOwnerEntity => ({
    userId: x,
  }));

  return {
    attemptId: attempt.attemptId,
    questionId: attempt.question.questionId,
    users: userObjects,
    submission: attempt.submission,
    language: attempt.language,
  };
}

function convertToProtoAttempt(
  attempt: HistoryAttemptEntity,
  usernameMap: { [key: number]: string },
  questionMap: { [key: number]: Question },
): (HistoryAttempt | undefined) {
  if (!attempt.createDateTime) {
    return undefined;
  }

  let users: string[] = [];
  if (attempt.users) {
    users = attempt.users.map((owner): string => {
      if (!owner.userId) {
        return '';
      }

      if (!(owner.userId in usernameMap)) {
        return '';
      }

      return usernameMap[owner.userId];
    }).filter((x) => x.length > 0);
  }

  return {
    attemptId: attempt.attemptId,
    question: questionMap[attempt.questionId],
    submission: attempt.submission ? attempt.submission : '',
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
