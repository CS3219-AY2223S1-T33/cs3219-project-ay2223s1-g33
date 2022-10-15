declare type SMTPServer = {
  service: string;
  server: string;
  port: number;
  isSecure: boolean;
};

declare type SMTPCredentials = {
  username: string;
  password: string;
};

export {
  SMTPServer,
  SMTPCredentials,
};
