function printMessage(logLevel: string, message: string) {
  const timestamp = new Date().toLocaleString('en-us', {});
  // eslint-disable-next-line no-console
  console.log(`[${logLevel}][${timestamp}] ${message}`);
}

class Logger {
  static info(message: string) {
    printMessage('INFO', message);
  }

  static debug(message: string) {
    printMessage('DEBUG', message);
  }

  static warn(message: string) {
    printMessage('WARN', message);
  }

  static error(message: string) {
    printMessage('ERROR', message);
  }
}

export default Logger;
