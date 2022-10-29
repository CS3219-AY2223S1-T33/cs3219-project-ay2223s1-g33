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
        number_of_runs: 1,
        cpu_time_limit: 2,
        cpu_extra_time: 0,
        wall_time_limit: 3,
        memory_limit: 64000,
        stack_limit: 64000,
      }),
    });
    const content = await rawResponse.json();

    const protoResponse = CreateExecuteResponse.create({
      token: content.token,
      errorMessage: '',
    });
    callback(protoResponse);
  }

  async retrieveExecution(
    input: GetExecuteRequest,
    metadata: { deadline: number },
    callback: (value: GetExecuteResponse) => void,
  ) {
    const rawResponse = await fetch(`http://${this.apiURL}/submissions/${input.token}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      signal: getFetchDeadline(metadata.deadline),
    });
    const content = await rawResponse.json();
    console.log(content);

    const protoResponse = GetExecuteResponse.create({
      output: content.stdout,
      errorMessage: content.status.description,
    });
    callback(protoResponse);
  }
}

export default ExecuteServiceClient;
