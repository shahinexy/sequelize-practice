import { Secret } from "jsonwebtoken";
import config from "../../../config";
import { jwtHelpers } from "../../../helpars/jwtHelpers";
import prisma from "../../../shared/prisma";
import * as bcrypt from "bcrypt";
import ApiError from "../../../errors/ApiErrors";
import httpStatus from "http-status";
import crypto from "crypto";
import { emailSender } from "../../../shared/emailSender";

const loginUser = async (payload: { email: string; password: string }) => {
  const userData = await prisma.user.findUnique({
    where: {
      email: payload.email,
    },
    select: {
      id: true,
      verifiedEmail: true,
      activePlan: true,
      email: true,
      password: true,
      role: true,
      otp: true,
      expirationOtp: true,
    },
  });

  if (!userData?.email) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "User not found! with this email " + payload.email
    );
  }
  const isCorrectPassword: boolean = await bcrypt.compare(
    payload.password,
    userData.password
  );

  if (!isCorrectPassword) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Password incorrect!");
  }
  if (!userData.verifiedEmail && userData.role !== "ADMIN") {
    const otp = Number(crypto.randomInt(1000, 9999));

    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    const html = `
<div style="font-family: 'Segoe UI', sans-serif; background-color: #f4f4f4; padding: 40px;">
  <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
    
    <div style="background-color: #0A4225; padding: 30px; text-align: center;">
      <h1 style="margin: 0; color: #ffffff; font-size: 26px;">Email verification OTP</h1>
      <p style="margin: 8px 0 0; color: #e0f7ec; font-size: 14px;">Your One-Time Password (OTP) is below</p>
    </div>
    
    <div style="padding: 30px; text-align: center;">
      <p style="font-size: 16px; color: #333333; margin-bottom: 10px;">Use the OTP below to verify your email:</p>
      <p style="font-size: 36px; font-weight: bold; color: #0A4225; margin: 20px 0;">${otp}</p>
      <p style="font-size: 14px; color: #666666; margin: 0 0 20px;">This code will expire in <strong>10 minutes</strong>.</p>
    </div>

    <div style="padding: 0 30px 30px; text-align: center;">
      <p style="font-size: 14px; color: #999999; margin: 0;">If you didn’t request this, you can safely ignore this email.</p>
      <p style="font-size: 14px; color: #999999; margin: 8px 0 0;">Need help? Contact us at <a href="mailto:support@humkadam.com" style="color: #0A4225; text-decoration: none; font-weight: 500;">support@nmbull.com</a></p>
    </div>

    <div style="background-color: #f0f0f0; padding: 20px; text-align: center; font-size: 12px; color: #999999;">
      Best regards,<br/>
      <strong style="color: #0A4225;">Humkadam Team</strong>
    </div>

  </div>
</div>`;

    await emailSender(userData.email, html, "Email varification OTP");

    await prisma.user.update({
      where: { id: userData.id },
      data: {
        otp: otp,
        expirationOtp: otpExpires,
      },
    });

    return {
      message: "Email verification code sended successfully",
      verifiedEmail: userData.verifiedEmail,
    };
  }

  const accessToken = jwtHelpers.generateToken(
    {
      id: userData.id,
      email: userData.email,
      role: userData.role,
    },
    config.jwt.jwt_secret as Secret,
    config.jwt.expires_in as string
  );

  return {
    role: userData.role,
    verifiedEmail: userData.verifiedEmail,
    activePlan: userData.activePlan,
    token: accessToken,
  };
};

const changePassword = async (
  userToken: string,
  newPassword: string,
  oldPassword: string
) => {
  const decodedToken = jwtHelpers.verifyToken(
    userToken,
    config.jwt.jwt_secret!
  );

  const user = await prisma.user.findUnique({
    where: { id: decodedToken?.id },
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isPasswordValid = await bcrypt.compare(oldPassword, user?.password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Incorrect old password");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: {
      id: decodedToken.id,
    },
    data: {
      password: hashedPassword,
    },
  });

  return { message: "Password changed successfully" };
};

const forgotPassword = async (payload: { email: string }) => {
  const userData = await prisma.user.findFirstOrThrow({
    where: {
      email: payload.email,
    },
  });

  const otp = Number(crypto.randomInt(1000, 9999));

  const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

  const html = `
<div style="font-family: Arial, sans-serif; background-color: #f6f8f7; padding: 40px;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); overflow: hidden;">
    
    <div style="background-color: #0A4225; padding: 25px 0; text-align: center;">
      <h2 style="color: #ffffff; font-size: 24px; margin: 0;">Forgot Password OTP</h2>
    </div>

    <div style="padding: 30px; text-align: center; color: #333;">
      <p style="font-size: 16px; margin-bottom: 10px;">
        Use the OTP code below to reset your password.
      </p>
      <p style="font-size: 36px; font-weight: bold; color: #0A4225; margin: 20px 0;">
        ${otp}
      </p>

      <p style="font-size: 14px; color: #555; margin-bottom: 20px;">
        This OTP will expire in <strong>10 minutes</strong>.<br/>
        If you didn’t request a password reset, you can safely ignore this message.
      </p>

      <a href="mailto:support@humkadam.com" style="display: inline-block; padding: 10px 20px; background-color: #0A4225; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 10px;">
        Contact Support
      </a>
    </div>

    <div style="background-color: #f1f4f2; text-align: center; padding: 15px; font-size: 12px; color: #777;">
      <p style="margin: 0;">Best regards,<br/>
      <strong style="color: #0A4225;">Humkadam Team</strong></p>
    </div>
  </div>
</div>
`;

  await emailSender(userData.email, html, "Forgot Password OTP");

  await prisma.user.update({
    where: { id: userData.id },
    data: {
      otp: otp,
      expirationOtp: otpExpires,
    },
  });

  return { message: "Reset password OTP sent to your email successfully" };
};

const resendOtp = async (email: string) => {
  const user = await prisma.user.findUnique({
    where: { email: email },
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "This user is not found!");
  }

  const otp = Number(crypto.randomInt(1000, 9999));

  const otpExpires = new Date(Date.now() + 5 * 60 * 1000);

  const html = `
<div style="font-family: Arial, sans-serif; background-color: #f6f8f7; padding: 40px;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); overflow: hidden;">
    
    <div style="background-color: #0A4225; padding: 25px 0; text-align: center;">
      <h2 style="color: #ffffff; font-size: 24px; margin: 0;">Resend OTP</h2>
    </div>

    <div style="padding: 30px; text-align: center; color: #333;">
      <p style="font-size: 16px; margin-bottom: 10px;">
        Here is your new OTP code to continue the verification process.
      </p>

      <p style="font-size: 36px; font-weight: bold; color: #0A4225; margin: 20px 0;">
        ${otp}
      </p>

      <p style="font-size: 14px; color: #555; margin-bottom: 20px;">
        This OTP will expire in <strong>5 minutes</strong>.<br/>
        If you didn’t request this code, please ignore this email.
      </p>

      <a href="mailto:support@humkadam.com" style="display: inline-block; padding: 10px 20px; background-color: #0A4225; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 10px;">
        Contact Support
      </a>
    </div>

    <!-- Footer -->
    <div style="background-color: #f1f4f2; text-align: center; padding: 15px; font-size: 12px; color: #777;">
      <p style="margin: 0;">Best regards,<br/>
      <strong style="color: #0A4225;">Humkadam Team</strong></p>
    </div>
  </div>
</div>
`;

  await emailSender(user.email, html, "Resend OTP");

  await prisma.user.update({
    where: { id: user.id },
    data: {
      otp: otp,
      expirationOtp: otpExpires,
    },
  });

  return { message: "OTP resent successfully" };
};

const verifyOtp = async (payload: {
  email: string;
  otp: number;
}) => {
  const user = await prisma.user.findUnique({
    where: { email: payload.email },
    select: {
      id: true,
      email: true,
      role: true,
      otp: true,
      expirationOtp: true,
    },
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "This user is not found!");
  }

  if (
    user.otp !== payload.otp ||
    !user.expirationOtp ||
    user.expirationOtp < new Date()
  ) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid OTP");
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      otp: null,
      expirationOtp: null,
    },
  });

  const accessToken = jwtHelpers.generateToken(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    config.jwt.jwt_secret as Secret,
    config.jwt.expires_in as string
  );

  return {
    message: "OTP verification successful",
    role: user.role,
    token: accessToken,
  };
};

const resetPassword = async (payload: { password: string; email: string }) => {
  const user = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "This user is not found!");
  }

  const hashedPassword = await bcrypt.hash(payload.password, 10);

  await prisma.user.update({
    where: { email: payload.email },
    data: {
      password: hashedPassword,
      otp: null,
      expirationOtp: null,
    },
  });

  return { message: "Password reset successfully" };
};

export const AuthServices = {
  loginUser,
  changePassword,
  forgotPassword,
  resetPassword,
  resendOtp,
  verifyOtp,
};
