import prisma from "../../../shared/prisma";
import ApiError from "../../../errors/ApiErrors";
import * as bcrypt from "bcrypt";
import { IPaginationOptions } from "../../../interfaces/paginations";
import { paginationHelper } from "../../../helpers/paginationHelper";
import { Prisma, User } from "@prisma/client";
import { userSearchAbleFields } from "./demo.costant";
import config from "../../../config";
import { fileUploader } from "../../../helpers/fileUploader";
import { IUserFilterRequest, TUser } from "./demo.interface";

const createUserIntoDb = async (payload: TUser) => {
  const existingUser = await prisma.user.findFirst({
    where: {
      email: payload.email,
    },
  });

  if (existingUser) {
    if (existingUser.email === payload.email) {
      throw new ApiError(
        400,
        `User with this email ${payload.email} already exists`
      );
    }
  }
  const hashedPassword: string = await bcrypt.hash(
    payload.password,
    Number(config.bcrypt_salt_rounds)
  );

  const result = await prisma.user.create({
    data: { ...payload, password: hashedPassword },
    select: {
      id: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return result;
};

const getUsersFromDb = async (
  params: IUserFilterRequest,
  options: IPaginationOptions
) => {
  const { page, limit, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = params;

  const andCondions: Prisma.UserWhereInput[] = [];

  if (params.searchTerm) {
    andCondions.push({
      OR: userSearchAbleFields.map((field) => ({
        [field]: {
          contains: params.searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  if (Object.keys(filterData).length > 0) {
    andCondions.push({
      AND: Object.keys(filterData).map((key) => ({
        [key]: {
          equals: (filterData as any)[key],
        },
      })),
    });
  }
  const whereConditons: Prisma.UserWhereInput = { AND: andCondions };

  const result = await prisma.user.findMany({
    where: whereConditons,
    skip,
    orderBy:
      options.sortBy && options.sortOrder
        ? {
            [options.sortBy]: options.sortOrder,
          }
        : {
            createdAt: "desc",
          },
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  const total = await prisma.user.count({
    where: whereConditons,
  });

  if (!result || result.length === 0) {
    throw new ApiError(404, "No active users found");
  }
  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

const getSingleUser = async (id: string) => {
  const userProfile = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      fullName: true,
      email: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return userProfile;
};

const updateProfile = async (payload: User, imageFile: any, userId: string) => {
  const result = await prisma.$transaction(async (prisma) => {
    let image = "";
    if (imageFile) {
      image = (await fileUploader.uploadToCloudinary(imageFile)).Location;
    }

    const createUserProfile = await prisma.user.update({
      where: { id: userId },
      data: { ...payload, image },
    });

    return createUserProfile;
  });

  return result;
};

export const userService = {
  createUserIntoDb,
  getUsersFromDb,
  getSingleUser,
  updateProfile,
};
