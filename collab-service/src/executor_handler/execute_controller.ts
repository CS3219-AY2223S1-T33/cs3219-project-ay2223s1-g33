import { ExecuteCode } from '../proto/types';
import decodeAttempt from '../history_handler/attempt_decoder';

const languageNameToId = new Map([
  ['javascript', 63],
  ['go', 60],
  ['java', 62],
  ['python', 71],
]);

class ExecuteBridge {
  langName: string;

  stdin: string;

  codebase: string;

  executeAgent: IExecuteAgent;

  constructor(stdin: string, data: Uint8Array, executeAgent: IExecuteAgent) {
    const {
      lang,
      content,
    } = decodeAttempt(data);

    this.langName = lang;
    this.stdin = stdin;
    this.codebase = content;
    this.executeAgent = executeAgent;
  }

  getLanguageId(): number | undefined {
    return languageNameToId.get(this.langName);
  }

  createExecuteCode() {
    return ExecuteCode.create({
      languageId: this.getLanguageId(),
      stdin: this.stdin,
      code: this.codebase,
    });
  }

  async run(callback: (value: string) => void) {
    const executeCode = this.createExecuteCode();
    const token = await this.executeAgent.uploadCode(executeCode);

    const interval = setInterval(async () => {
      const res = await this.executeAgent.retrieveResult(token);
      if (res) {
        clearInterval(interval);
        callback(res);
      }
    }, 1000);
  }
}

export default ExecuteBridge;
