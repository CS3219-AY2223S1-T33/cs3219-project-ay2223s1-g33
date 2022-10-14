import { EmailMetadata, IEmailAdapter } from '../adapter/email_adapter';
import { createEmailBuilder, IEmailBuilder } from './email_template_builder';

interface IEmailSender {
  sendResetEmail(target: string, nickname: string, token: string): Promise<boolean>;
}

const subject = 'Peerprep Password Reset';

class EmailSender implements IEmailSender {
  emailAdapter: IEmailAdapter;

  emailBuilder: IEmailBuilder;

  constructor(emailAdapter: IEmailAdapter, resetUrlTemplate: string) {
    this.emailAdapter = emailAdapter;

    const resetUrlBuilder = (token: string) => resetUrlTemplate.replace('$TOKEN', token);
    this.emailBuilder = createEmailBuilder(resetUrlBuilder);
  }

  async sendResetEmail(target: string, nickname: string, token: string): Promise<boolean> {
    const emailBody = this.emailBuilder.createResetPasswordEmail(nickname, token);
    const emailHeader: EmailMetadata = {
      target,
      subject,
    };

    const isSuccess = await this.emailAdapter.sendEmail(emailHeader, emailBody);
    return isSuccess;
  }
}

function createEmailSender(emailAdapter: IEmailAdapter, resetUrlTemplate: string): IEmailSender {
  return new EmailSender(emailAdapter, resetUrlTemplate);
}

export {
  IEmailSender,
  createEmailSender,
};
