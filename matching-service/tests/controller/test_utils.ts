function makeRedisAdapter() {
  return {
    pushStream: jest.fn(),
    removeFromSteam: jest.fn(),
    lockIfUnset: jest.fn(),
    setUserLock: jest.fn(),
    getUserLock: jest.fn(),
    deleteUserLock: jest.fn(),
  };
}

function makeRoomSessionAgent() {
  return {
    createToken: jest.fn(),
    verifyToken: jest.fn(),
  };
}

export {
  makeRedisAdapter,
  makeRoomSessionAgent,
};
