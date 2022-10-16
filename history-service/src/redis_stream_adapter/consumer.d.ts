declare interface IStreamConsumer {
  setListener(call: (response: { [property: string]: string }) => void)
  run()
}
