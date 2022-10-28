import {
  CreateExecuteRequest,
  CreateExecuteResponse,
  GetExecuteRequest, GetExecuteResponse,
} from '../proto/execute-service';

declare interface IExecuteServiceClient {
  createExecution(
    input: CreateExecuteRequest,
    metadata: { deadline: number },
    callback: (value: CreateExecuteResponse, err: string | null) => void,
  )
  retrieveExecution(
    input: GetExecuteRequest,
    metadata: { deadline: number },
    callback: (value: GetExecuteResponse, err: string | null) => void,
  )
}
