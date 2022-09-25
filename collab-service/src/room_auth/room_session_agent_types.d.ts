declare interface IRoomSessionAgent {
  verifyToken(token: string): Promise<{ difficulty: number; roomId: string } | undefined>;
}

export default IRoomSessionAgent;
