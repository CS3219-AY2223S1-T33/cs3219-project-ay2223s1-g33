import HistoryCompletionEntity from '../db/history_completion_entity';
import { HistoryCompletion } from '../proto/types';

declare type StoredCompletion = HistoryCompletionEntity;

function convertToStoredCompletion(
  completion: HistoryCompletion,
): (HistoryCompletionEntity | undefined) {
  if (!completion.userId) {
    return undefined;
  }
  if (!completion.questionId) {
    return undefined;
  }
  return {
    userId: completion.userId,
    questionId: completion.questionId,
  };
}

function convertToProtoCompletion(
  completion: HistoryCompletionEntity,
): (HistoryCompletion | undefined) {
  if (!completion.userId) {
    return undefined;
  }
  if (!completion.questionId) {
    return undefined;
  }
  return {
    userId: completion.userId,
    questionId: completion.questionId,
  };
}

export {
  StoredCompletion,
  convertToStoredCompletion,
  convertToProtoCompletion,
};
