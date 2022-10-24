declare interface IStreamProducer {
  pushMessage(msg: string): Promise<void>;
}
