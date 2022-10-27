declare interface IExecutorAgent {
  uploadCode(language: string, code: string): Promise<string>
  retrieveCode(token: string): Promise<string>
}
