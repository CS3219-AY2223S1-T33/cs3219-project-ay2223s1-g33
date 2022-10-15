declare interface IStreamConsumer {
  runConsumer(call: (response: { [property: string]: string }) => void);
}
