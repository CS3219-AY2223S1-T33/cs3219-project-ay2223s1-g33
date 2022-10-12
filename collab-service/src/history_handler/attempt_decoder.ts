import * as decoding from 'lib0/decoding';

function decodeAttempt(data: Uint8Array) {
  const decoder = decoding.createDecoder(data.slice(1, data.length)); // Skip opcode
  const lang = decoding.readVarString(decoder);
  const content = decoding.readVarString(decoder);
  return {
    lang,
    content,
  };
}

export default decodeAttempt;
