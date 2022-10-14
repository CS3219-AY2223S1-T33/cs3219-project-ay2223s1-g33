import { createTransport, Transporter } from 'nodemailer';
import Logger from '../utils/logger';
import { EmailBody, EmailMetadata, IEmailAdapter } from './email_adapter';
import { SMTPCredentials, SMTPServer } from './smtp_types';

class SMTPAdapter implements IEmailAdapter {
  server: SMTPServer;

  credentials: SMTPCredentials;

  transporter: Transporter;

  constructor(server: SMTPServer, credentials: SMTPCredentials) {
    this.server = server;
    this.credentials = credentials;

    const transporterArgs = {
      service: server.service,
      host: server.server,
      port: server.port,
      secure: server.isSecure,
      auth: {
        user: credentials.username,
        pass: credentials.password,
      },
      tls: {
      },
    };

    if (server.isSecure) {
      transporterArgs.tls = {
        ciphers: 'SSLv3',
        rejectUnauthorized: false,
      };
    }

    this.transporter = createTransport(transporterArgs);
  }

  async sendEmail(metadata: EmailMetadata, body: EmailBody): Promise<boolean> {
    try {
      await this.transporter.sendMail({
        from: metadata.sender, // sender address
        to: metadata.target, // list of receivers
        subject: metadata.subject, // Subject line
        text: body.text, // plain text body
        html: body.html, // html body
      });
    } catch (ex) {
      Logger.warn(`Email Sending Failed With Error ${ex}`);
      return false;
    }

    return true;
  }
}

export default function createSMTPAdapter(
  server: SMTPServer,
  credentials: SMTPCredentials,
): IEmailAdapter {
  return new SMTPAdapter(server, credentials);
}
