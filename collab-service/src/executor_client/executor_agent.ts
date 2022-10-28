import { IExecuteServiceClient } from './executor_client_types';
import ExecuteServiceClient from './executor_client';
import { ExecuteCode } from '../proto/types';

const timeout = 2 * 1000;

class ExecuteAgent implements IExecuteAgent {
  executeClient: IExecuteServiceClient;

  constructor(judge0URL: string) {
    this.executeClient = new ExecuteServiceClient(judge0URL);
  }

  uploadCode(executeCode: ExecuteCode): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      this.executeClient.createExecution(
        {
          executeCode,
        },
        {
          deadline: timeout,
        },
        (err, value) => {
          if (value) {
            resolve(value);
          } else if (err) {
            resolve(`${err}`);
          } else {
            reject();
          }
        },
      );
    });
  }

  retrieveResult(token: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      this.executeClient.retrieveExecution(
        {
          token,
        },
        {
          deadline: timeout,
        },
        (err, value) => {
          if (value) {
            resolve(value);
          } else if (err) {
            resolve(`${err}`);
          } else {
            reject();
          }
        },
      );
    });
  }
}

function createExecuteAgent(
  judge0URL: string,
): IExecuteAgent {
  return new ExecuteAgent(judge0URL);
}

export default createExecuteAgent;
