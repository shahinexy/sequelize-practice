import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { AuthServices } from "./auth.service";
import sendResponse from "../../../shared/sendResponse";

const loginUser = catchAsync(async (req, res) => {
  const result = await AuthServices.loginUser(req.body);
  res.cookie("token", result.token, { httpOnly: true });
  sendResponse(res, {
    message: "User logged in successfully",
    data: result,
  });
});

const logoutUser = catchAsync(async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
  sendResponse(res, {
    message: "User Successfully logged out",
    data: null,
  });
});

const changePassword = catchAsync(async (req, res) => {
  const userToken = req.headers.authorization;
  const { oldPassword, newPassword } = req.body;
  const result = await AuthServices.changePassword(
    userToken as string,
    newPassword,
    oldPassword
  );
  sendResponse(res, {
    message: "Password changed successfully",
    data: result,
  });
});

const forgotPassword = catchAsync(async (req, res) => {
  const result = await AuthServices.forgotPassword(req.body);
  sendResponse(res, {
    message: "Check your email!",
    data: result,
  });
});

const resendOtp = catchAsync(async (req, res) => {
  const result = await AuthServices.resendOtp(req.body.email);
  sendResponse(res, {
    message: "Check your email!",
    data: result,
  });
});

const verifyOtp = catchAsync(
  async (req: Request, res: Response) => {
    const result = await AuthServices.verifyOtp(req.body);
    sendResponse(res, {
      message: "OTP verification successful",
      data: result,
    });
  }
);

const resetPassword = catchAsync(async (req, res) => {
  await AuthServices.resetPassword(req.body);
  sendResponse(res, {
    message: "Password Reset!",
    data: null,
  });
});

export const AuthController = {
  loginUser,
  logoutUser,
  changePassword,
  forgotPassword,
  resetPassword,
  resendOtp,
  verifyOtp,
};
