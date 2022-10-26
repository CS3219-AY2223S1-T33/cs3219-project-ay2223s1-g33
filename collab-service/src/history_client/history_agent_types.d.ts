declare interface IHistoryAgent {
  uploadHistoryAttempt(userAttempt: HistoryAttempt): Promise<string>
  getHasBeenCompletion(username: string, questionId: number): Promise<boolean>
}
