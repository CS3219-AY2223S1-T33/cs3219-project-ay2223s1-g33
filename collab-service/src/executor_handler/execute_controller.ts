import { ExecuteCode } from '../proto/types';
import decodeAttempt from '../history_handler/attempt_decoder';

const languageNameToId = new Map([
  ['javascript', 63],
  ['go', 60],
  ['java', 62],
  ['python', 71],
]);

const RETRY_LIMIT = 10;
const RETRY_INTERVAL = 1000;

class ExecuteController {
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

    let counter = 0;
    const interval = setInterval(async () => {
      const res = await this.executeAgent.retrieveResult(token);
      if (res || counter >= RETRY_LIMIT) {
        clearInterval(interval);
        callback(this.buildInputAndOutput(res));
        this.executeAgent.deleteResult(token);
      }
      counter += 1;
    }, RETRY_INTERVAL);
  }

  private buildInputAndOutput(res: string): string {
    return `Input: ${this.stdin}\nOutput: ${res}`;
  }
}

export default ExecuteController;
