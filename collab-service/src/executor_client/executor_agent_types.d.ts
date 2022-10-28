declare interface IExecuteAgent {
  uploadCode(executeCode: ExecuteCode): Promise<string>
  retrieveResult(token: string): Promise<string>
}
