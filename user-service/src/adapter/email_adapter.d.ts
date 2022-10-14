declare type EmailMetadata = {
  sender: string;
  target: string;
  subject: string;
};

declare type EmailBody = {
  text: string;
  html: string;
};

declare interface IEmailAdapter {
  async sendEmail(metadata: EmailMetadata, body: EmailBody): Promise<boolean>;
}

export {
  EmailMetadata,
  EmailBody,
  IEmailAdapter,
};
