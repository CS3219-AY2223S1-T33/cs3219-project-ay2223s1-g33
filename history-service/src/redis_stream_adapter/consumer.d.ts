declare interface IStreamConsumer {
  addListener(call: (response: { [property: string]: string }) => void)
  run()
}
