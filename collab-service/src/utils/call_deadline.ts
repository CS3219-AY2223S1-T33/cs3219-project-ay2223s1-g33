import { AbortController } from 'node-abort-controller';

const defaultTimeoutMS = 5000;

function getGrpcDeadline(timeout: number = defaultTimeoutMS) {
  return new Date(Date.now() + timeout);
}

function getFetchDeadline(timeout: number = defaultTimeoutMS) {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), timeout);
  return controller.signal;
}

export {
  getGrpcDeadline,
  getFetchDeadline,
};
