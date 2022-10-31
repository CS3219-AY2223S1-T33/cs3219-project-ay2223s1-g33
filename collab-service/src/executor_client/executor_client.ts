import { IExecuteServiceClient } from './executor_client_types';
import {
  CreateExecuteRequest,
  CreateExecuteResponse,
  GetExecuteRequest, GetExecuteResponse,
} from '../proto/execute-service';
import { getFetchDeadline } from '../utils/call_deadline';

class ExecuteServiceClient implements IExecuteServiceClient {
  apiURL: string;

  constructor(apiURL: string) {
    this.apiURL = apiURL;
  }

  async createExecution(
    input: CreateExecuteRequest,
    metadata: { deadline: number },
    callback: (value: CreateExecuteResponse) => void,
  ) {
    let protoResponse: CreateExecuteResponse;
    try {
      const rawResponse = await fetch(`http://${this.apiURL}/submissions`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        signal: getFetchDeadline(metadata.deadline),
        body: JSON.stringify({
          source_code: input.executeCode?.code,
          language_id: input.executeCode?.languageId,
          stdin: input.executeCode?.stdin,
        }),
      });
      const content = await rawResponse.json();
      protoResponse = CreateExecuteResponse.create({
        token: content.token,
        errorMessage: '',
      });
      callback(protoResponse);
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        protoResponse = CreateExecuteResponse.create({
          token: undefined,
          errorMessage: 'Timeout',
        });
      } else {
        protoResponse = CreateExecuteResponse.create({
          token: undefined,
          errorMessage: 'Execute Retrieval Failed',
        });
      }
    }
    callback(protoResponse);
  }

  async retrieveExecution(
    input: GetExecuteRequest,
    metadata: { deadline: number },
    callback: (value: GetExecuteResponse) => void,
  ) {
    let protoResponse: GetExecuteResponse;
    try {
      const rawResponse = await fetch(`http://${this.apiURL}/submissions/${input.token}?fields=stdout,status`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        signal: getFetchDeadline(metadata.deadline),
      });
      const content = await rawResponse.json();
      protoResponse = GetExecuteResponse.create({
        output: content.stdout,
        errorMessage: content.status.description,
      });
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        protoResponse = GetExecuteResponse.create({
          output: undefined,
          errorMessage: 'Timeout',
        });
      } else {
        protoResponse = GetExecuteResponse.create({
          output: undefined,
          errorMessage: 'Execute Retrieval Failed',
        });
      }
    }
    callback(protoResponse);
  }
}

export default ExecuteServiceClient;
