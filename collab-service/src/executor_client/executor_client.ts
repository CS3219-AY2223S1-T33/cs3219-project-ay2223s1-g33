import fetch from 'node-fetch';
import { IExecuteServiceClient } from './executor_client_types';
import { CreateExecuteRequest, CreateExecuteResponse } from '../proto/execute-service';
import { getFetchDeadline } from '../utils/call_deadline';

class ExecutorClient implements IExecuteServiceClient {
  apiURL: string;

  constructor(apiURL: string) {
    this.apiURL = apiURL;
  }

  async createExecution(
    input: CreateExecuteRequest,
    metadata: { timeout: number },
    callback: (value: CreateExecuteResponse, err: (string | null)) => void,
  ) {
    const rawResponse = await fetch(this.apiURL, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      signal: getFetchDeadline(metadata.timeout),
      body: JSON.stringify({
        source_code: input.executeCode?.code,
        language_id: input.executeCode?.language,
      }),
    });
    const content = await rawResponse.json();
    console.log(content);

    const protoResponse = CreateExecuteResponse.create();
    protoResponse.output = 'output';
    protoResponse.errorMessage = '';

    callback(protoResponse, null);
  }
}

export default ExecutorClient;
