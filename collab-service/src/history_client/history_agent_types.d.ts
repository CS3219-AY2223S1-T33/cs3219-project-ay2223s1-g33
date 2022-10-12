declare interface IHistoryAgent {
  uploadHistoryAttempt(userAttempt: HistoryAttempt): Promise<string>
}
