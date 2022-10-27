import { CreateExecuteRequest, CreateExecuteResponse } from '../proto/execute-service';

declare interface IExecuteServiceClient {
  createExecution(
    input: CreateExecuteRequest,
    metadata: { timeout: number },
    callback: (value: CreateExecuteResponse, err: string | null) => void,
  )
}
