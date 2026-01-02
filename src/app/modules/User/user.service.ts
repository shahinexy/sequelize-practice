import { IPaginationOptions } from "../../../interfaces/paginations";
import { IUserFilterRequest, TUser } from "./user.interface";

const createUserIntoDb = async (payload: any) => {
  console.log(payload);
};

const getUsersFromDb = async (
  params: IUserFilterRequest,
  options: IPaginationOptions
) => {};

const getMyProfile = async (id: number) => {};

const updateProfile = async (
  payload: any,
  imageFile: any,
  userId: number
) => {};

export const userService = {
  createUserIntoDb,
  getUsersFromDb,
  getMyProfile,
  updateProfile,
};
