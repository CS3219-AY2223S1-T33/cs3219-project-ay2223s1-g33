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
    callback: (value: CreateExecuteResponse, err: (string | null)) => void,
  ) {
    const rawResponse = await fetch(this.apiURL, {
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
        number_of_runs: 1,
        cpu_time_limit: 2,
        cpu_extra_time: 0,
        wall_time_limit: 3,
        memory_limit: 64000,
        stack_limit: 64000,
      }),
    });
    const content = await rawResponse.json();
    console.log(content);

    const protoResponse = CreateExecuteResponse.create();
    protoResponse.token = 'token';
    protoResponse.errorMessage = '';

    callback(protoResponse, null);
  }

  async retrieveExecution(
    input: GetExecuteRequest,
    metadata: { deadline: number },
    callback: (value: GetExecuteResponse, err: (string | null)) => void,
  ) {
    const rawResponse = await fetch(`${this.apiURL}/submission/${input.token}?fields=stdout,status`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      signal: getFetchDeadline(metadata.deadline),
    });
    const content = await rawResponse.json();
    console.log(content);

    const protoResponse = GetExecuteResponse.create();
    protoResponse.output = 'output';
    protoResponse.errorMessage = '';

    callback(protoResponse, null);
  }
}

export default ExecuteServiceClient;
