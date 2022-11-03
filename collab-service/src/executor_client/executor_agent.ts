import { IExecuteServiceClient } from './executor_client_types';
import ExecuteServiceClient from './executor_client';
import { ExecuteCode } from '../proto/types';
import Logger from '../utils/logger';

const TIMEOUT = 2000;

class ExecuteAgent implements IExecuteAgent {
  executeClient: IExecuteServiceClient;

  constructor(judge0URL: string) {
    this.executeClient = new ExecuteServiceClient(judge0URL);
  }

  uploadCode(executeCode: ExecuteCode): Promise<string> {
    return new Promise<string>((resolve) => {
      this.executeClient.createExecution(
        {
          executeCode,
        },
        {
          deadline: TIMEOUT,
        },
        (value) => {
          if (!value.errorMessage) {
            resolve(value.token);
          } else {
            Logger.error(value.errorMessage);
            resolve(value.errorMessage);
          }
        },
      );
    });
  }

  retrieveResult(token: string): Promise<string> {
    return new Promise<string>((resolve) => {
      this.executeClient.retrieveExecution(
        {
          token,
        },
        {
          deadline: TIMEOUT,
        },
        (value) => {
          if (value.errorMessage === 'Processing') {
            resolve('');
          } else if (value.errorMessage === 'Accepted'
            || value.errorMessage === 'Processing'
            || value.errorMessage === 'Runtime Error (NZEC)'
            || value.errorMessage === 'Compilation Error') {
            resolve(value.output);
          } else {
            resolve(value.errorMessage);
          }
        },
      );
    });
  }

  deleteResult(token: string) {
    this.executeClient.deleteExecution(
      {
        token,
      },
      {
        deadline: TIMEOUT,
      },
      (value) => {
        if (value.errorMessage) {
          Logger.error(value.errorMessage);
        }
      },
    );
  }
}

function createExecuteAgent(
  judge0URL: string,
): IExecuteAgent {
  return new ExecuteAgent(judge0URL);
}

export default createExecuteAgent;
