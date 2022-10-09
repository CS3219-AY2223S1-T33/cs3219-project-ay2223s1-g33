import { HistoryAttempt } from '../../proto/types';
import { CreateAttemptResponse } from '../../proto/history-crud-service';
import Logger from '../../utils/logger';
import IAttemptCache from '../../history_handler/attempt_cache_types';
import {
  createSaveCodeAckPackage,
  createSaveCodeFailedPackage,
} from '../../message_handler/room/connect_message_builder';
import { IHistoryAgent } from '../../history_client/history_agent_types';

/**
 * Creates encapsulated lambda for uploading an attempt to client
 */
function createUploader(historyAgent: IHistoryAgent) {
  return async (attempt: HistoryAttempt): Promise<CreateAttemptResponse> => {
    const res = await historyAgent.uploadHistoryAttempt(attempt);
    if (res.errorMessage) {
      Logger.error(res.errorMessage);
    }
    // Returns attempt response
    return res;
  };
}

/**
 * Saves attempt to history.
 * @param attemptCache Current cache of attempt
 * @return response package
 */
async function saveAttempt(
  attemptCache: IAttemptCache,
): Promise<Uint8Array> {
  // Complete saving snapshot
  if (!attemptCache.isValid()) {
    Logger.error('Attempt is not valid');
    return createSaveCodeFailedPackage();
  }
  const attemptResponse = await attemptCache.executeUploader();
  if (attemptResponse.errorMessage) {
    Logger.error(`Attempt: ${attemptResponse.errorMessage}`);
  }
  return createSaveCodeAckPackage(attemptResponse.errorMessage);
}

export {
  saveAttempt,
  createUploader,
};
