declare interface IHistoryAgent {
  uploadHistoryAttempt(userAttempt: HistoryAttempt): Promise<string>
  getHasBeenCompleted(username: string, questionId: number): Promise<boolean>
}
