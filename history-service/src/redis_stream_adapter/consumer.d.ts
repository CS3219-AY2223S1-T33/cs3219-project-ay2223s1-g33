declare interface IStreamConsumer {
  setListener(call: (response: { [property: string]: string }) => void): void
  run(): void
}
