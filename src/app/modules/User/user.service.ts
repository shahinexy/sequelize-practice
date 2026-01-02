import httpStatus from "http-status";
import ApiError from "../../../errors/ApiErrors";
import { IPaginationOptions } from "../../../interfaces/paginations";
import { IUserFilterRequest } from "./user.interface";
import { User } from "./user.model";

const createUserIntoDb = async (payload: User) => {
  const res = await User.create(payload);

  return res;
};

const getUsersFromDb = async (
  params: IUserFilterRequest,
  options: IPaginationOptions
) => {
  const res = await User.findAll({
    attributes: ["id", "email", "age", "isStudent"],
  });

  return res;
};

const singleUser = async (id: string) => {
  const res = await User.findByPk(id);
  return res;
};

const updateProfile = async (payload: Partial<User>, id: string) => {
  const userData = await User.findByPk(id, { attributes: ["id"] });

  if (!userData) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  await userData.update(payload);

  return userData;
};

export const userService = {
  createUserIntoDb,
  getUsersFromDb,
  singleUser,
  updateProfile,
};
