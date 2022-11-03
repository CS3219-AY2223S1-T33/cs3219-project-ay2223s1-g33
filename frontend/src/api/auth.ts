import {
  ChangeNicknameRequest,
  ChangeNicknameResponse,
  ChangePasswordRequest,
  ChangePasswordResponse,
  ConsumeResetTokenRequest,
  ConsumeResetTokenResponse,
  LoginRequest,
  LoginResponse,
  LogoutRequest,
  LogoutResponse,
  RegisterRequest,
  RegisterResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
} from "../proto/user-service";
import { sendRequest } from "./general";

const login = (req: LoginRequest) =>
  sendRequest<LoginRequest, LoginResponse>("/api/user/login", req, true);

const register = (req: RegisterRequest) =>
  sendRequest<RegisterRequest, RegisterResponse>("/api/user/register", req);

const logout = () =>
  sendRequest<LogoutRequest, LogoutResponse>("/api/user/logout", {}, true);

const changeNickname = (req: ChangeNicknameRequest) =>
  sendRequest<ChangeNicknameRequest, ChangeNicknameResponse>(
    "/api/user/nickname",
    req,
    true
  );

const changePassword = (req: ChangePasswordRequest) =>
  sendRequest<ChangePasswordRequest, ChangePasswordResponse>(
    "/api/user/password",
    req,
    true
  );

const resetPassword = (req: ResetPasswordRequest) =>
  sendRequest<ResetPasswordRequest, ResetPasswordResponse>("/api/reset", req);

const setNewPassword = (req: ConsumeResetTokenRequest) =>
  sendRequest<ConsumeResetTokenRequest, ConsumeResetTokenResponse>(
    "/api/reset/confirm",
    req
  );

export default {
  login,
  register,
  logout,
  changeNickname,
  changePassword,
  resetPassword,
  setNewPassword,
};
