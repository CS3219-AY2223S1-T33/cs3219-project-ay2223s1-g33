import {
  CheckQueueStatusRequest,
  CheckQueueStatusResponse,
  JoinQueueRequest,
  JoinQueueResponse,
  LeaveQueueRequest,
  LeaveQueueResponse,
} from "../proto/matching-service";
import { sendRequest } from "./general";

const joinQueue = (req: JoinQueueRequest) =>
  sendRequest<JoinQueueRequest, JoinQueueResponse>(
    "/api/queue/join",
    req,
    true
  );

const leaveQueue = () =>
  sendRequest<LeaveQueueRequest, LeaveQueueResponse>(
    "/api/queue/leave",
    {},
    true
  );

const checkQueueStatus = () =>
  sendRequest<CheckQueueStatusRequest, CheckQueueStatusResponse>(
    "/api/queue/status",
    {},
    true
  );

export default { joinQueue, leaveQueue, checkQueueStatus };
