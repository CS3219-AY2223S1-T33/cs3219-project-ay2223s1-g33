const defaultTimeoutMS = 5000;

function getGrpcDeadline(timeout: number = defaultTimeoutMS) {
  return new Date(Date.now() + timeout);
}

export default getGrpcDeadline;
