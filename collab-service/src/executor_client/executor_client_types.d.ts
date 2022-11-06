import {
  CreateExecuteRequest,
  CreateExecuteResponse,
  GetExecuteRequest, GetExecuteResponse,
} from '../proto/execute-service';

declare interface IExecuteServiceClient {
  createExecution(
    input: CreateExecuteRequest,
    metadata: { deadline: number },
    callback: (value: CreateExecuteResponse) => void,
  )
  retrieveExecution(
    input: GetExecuteRequest,
    metadata: { deadline: number },
    callback: (value: GetExecuteResponse) => void,
  )
  deleteExecution(
    input: GetExecuteRequest,
    metadata: { deadline: number },
    callback: (value: GetExecuteResponse) => void,
  )
}
