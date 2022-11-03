import {
  GetUserProfileRequest,
  GetUserProfileResponse,
} from "../proto/user-service";
import { sendRequest } from "./general";

const getUserProfile = () =>
  sendRequest<GetUserProfileRequest, GetUserProfileResponse>(
    "/api/user/profile",
    {},
    true
  );

export default { getUserProfile };
