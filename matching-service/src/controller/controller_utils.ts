import { ApiHeaderMap } from '../api_server/api_server_types';

function safeReadFirstHeader(headers: ApiHeaderMap, name: string): (string | undefined) {
  if (!(name in headers)) {
    return undefined;
  }

  const value = headers[name];
  if (value.length === 0) {
    return undefined;
  }
  return headers[name][0];
}

export {
  // eslint-disable-next-line import/prefer-default-export
  safeReadFirstHeader,
};
