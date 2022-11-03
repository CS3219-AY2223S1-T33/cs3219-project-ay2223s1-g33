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
      const rawResponse = await fetch(
        `http://${this.apiURL}/submissions`,
        {
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
        },
      );
      const content = await rawResponse.json();
      protoResponse = ExecuteServiceClient
        .createCreateResponse(content.token, '');
      callback(protoResponse);
    } catch (err) {
      if (ExecuteServiceClient.isTimeoutError(err)) {
        protoResponse = ExecuteServiceClient
          .createErrorCreateResponse('Server Timeout');
      } else {
        protoResponse = ExecuteServiceClient
          .createErrorCreateResponse('Execute Retrieval Failed');
      }
    }
    callback(protoResponse);
  }

  private static createCreateResponse(
    token: string | undefined,
    errorMessage: string,
  ) {
    return CreateExecuteResponse.create({
      token,
      errorMessage,
    });
  }

  private static createErrorCreateResponse(errorMessage: string) {
    return ExecuteServiceClient
      .createCreateResponse(undefined, errorMessage);
  }

  async retrieveExecution(
    input: GetExecuteRequest,
    metadata: { deadline: number },
    callback: (value: GetExecuteResponse) => void,
  ) {
    let protoResponse: GetExecuteResponse;
    try {
      const rawResponse = await fetch(
        `http://${this.apiURL}/submissions/${input.token}?fields=stdout,status,compile_output,exit_code`,
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          signal: getFetchDeadline(metadata.deadline),
        },
      );
      const content = await rawResponse.json();
      let output;
      if (content.exit_code !== null) {
        output = `Exited with ${content.exit_code}`;
      }
      output = content.stdout ? content.stdout : output;
      output = content.compile_output ? content.compile_output : output;
      protoResponse = ExecuteServiceClient
        .createGetResponse(output, content.status.description);
    } catch (err) {
      if (ExecuteServiceClient.isTimeoutError(err)) {
        protoResponse = ExecuteServiceClient
          .createErrorGetResponse('Server Timeout');
      } else {
        protoResponse = ExecuteServiceClient
          .createErrorGetResponse('Execute Retrieval Failed');
      }
    }
    callback(protoResponse);
  }

  async deleteExecution(
    input: GetExecuteRequest,
    metadata: { deadline: number },
    callback: (value: GetExecuteResponse) => void,
  ) {
    let protoResponse: GetExecuteResponse;
    try {
      const rawResponse = await fetch(
        `http://${this.apiURL}/submissions/${input.token}?fields=status`,
        {
          method: 'DELETE',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'X-Judge0-User': 'Auth-Judge0-User',
          },
          signal: getFetchDeadline(metadata.deadline),
        },
      );
      const content = await rawResponse.json();
      protoResponse = ExecuteServiceClient
        .createGetResponse(content.status.description, content.error);
    } catch (err) {
      if (ExecuteServiceClient.isTimeoutError(err)) {
        protoResponse = ExecuteServiceClient
          .createErrorGetResponse('Server Timeout');
      } else {
        protoResponse = ExecuteServiceClient
          .createErrorGetResponse('Execute Deletion Failed');
      }
    }
    callback(protoResponse);
  }

  private static isTimeoutError(err: unknown) {
    return (err as Error).name === 'AbortError';
  }

  private static createGetResponse(
    output: string | undefined,
    errorMessage: string,
  ) {
    return GetExecuteResponse.create({
      output,
      errorMessage,
    });
  }

  private static createErrorGetResponse(errorMessage: string) {
    return ExecuteServiceClient
      .createGetResponse(undefined, errorMessage);
  }
}

export default ExecuteServiceClient;
