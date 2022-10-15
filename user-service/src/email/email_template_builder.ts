import { EmailBody } from '../adapter/email_adapter';

interface IEmailBuilder {
  createResetPasswordEmail(nickname: string, token: string): EmailBody;
}

type PasswordResetUrlBuilder = (token: string) => string;

class EmailBuilder implements IEmailBuilder {
  passwordResetUrlBuilder: PasswordResetUrlBuilder;

  constructor(passwordResetUrlBuilder: PasswordResetUrlBuilder) {
    this.passwordResetUrlBuilder = passwordResetUrlBuilder;
  }

  createResetPasswordEmail(nickname: string, token: string): EmailBody {
    const url = this.passwordResetUrlBuilder(token);
    return {
      text: '',
      html: `Hello ${nickname},<br/>`
        + '<br/>'
        + 'You have requested to reset your password for Peerprep. Click on the link below to reset your password<br/>'
        + `<a href="${url}">${url}</a><br/>`
        + 'If you did not request for a password reset, you can ignore this email.<br/>'
        + '<br/>'
        + 'This is a system generated message, please do not reply.',
    };
  }
}

function createEmailBuilder(passwordResetUrlBuilder: PasswordResetUrlBuilder): IEmailBuilder {
  return new EmailBuilder(passwordResetUrlBuilder);
}

export {
  IEmailBuilder,
  PasswordResetUrlBuilder,
  createEmailBuilder,
};
