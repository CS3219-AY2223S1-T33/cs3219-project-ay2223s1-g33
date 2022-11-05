import HistoryCompletionEntity from '../db/history_completion_entity';
import { HistoryCompletion } from '../proto/types';

declare type StoredCompletion = HistoryCompletionEntity;

function convertToStoredCompletion(
  userId: number,
  questionId: number,
): HistoryCompletionEntity {
  return {
    userId,
    questionId,
  };
}

function convertToProtoCompletion(
  username: string,
  completion: HistoryCompletionEntity | undefined,
): (HistoryCompletion | undefined) {
  if (!completion) {
    return undefined;
  }
  if (!completion.questionId) {
    return undefined;
  }
  return {
    username,
    questionId: completion.questionId,
  };
}

export {
  StoredCompletion,
  convertToStoredCompletion,
  convertToProtoCompletion,
};
