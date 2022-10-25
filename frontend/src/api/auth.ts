import {
	ChangeNicknameRequest,
	ChangeNicknameResponse,
	ChangePasswordRequest,
	ChangePasswordResponse,
	LoginRequest,
	LoginResponse,
	LogoutRequest,
	LogoutResponse,
	RegisterRequest,
	RegisterResponse,
} from "../proto/user-service";
import { sendRequest } from "./general";

const login = (req: LoginRequest) => sendRequest<LoginRequest, LoginResponse>("/api/user/login", req, true);

const register = (req: RegisterRequest) => sendRequest<RegisterRequest, RegisterResponse>("/api/user/register", req);

const logout = () => sendRequest<LogoutRequest, LogoutResponse>("/api/user/logout", {});

const changeNickname = (req: ChangeNicknameRequest) =>
	sendRequest<ChangeNicknameRequest, ChangeNicknameResponse>("/api/user/nickname", req, true);

const changePassword = (req: ChangePasswordRequest) =>
	sendRequest<ChangePasswordRequest, ChangePasswordResponse>("/api/user/password", req, true);

export default { login, register, logout, changeNickname, changePassword };
