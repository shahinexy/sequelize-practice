import httpStatus from "http-status";
import ApiError from "../../../errors/ApiErrors";
import { IPaginationOptions } from "../../../interfaces/paginations";
import { IUserFilterRequest } from "./user.interface";
import { User } from "./user.model";
import { jwtHelpers } from "../../../helpers/jwtHelpers";
import config from "../../../config";
import { Secret } from "jsonwebtoken";
import { Post } from "../Post/Post.model";
import { col, fn, Op } from "sequelize";
import { paginationHelper } from "../../../helpers/paginationHelper";
import { userSearchAbleFields } from "./user.costant";

const createUserIntoDb = async (payload: User) => {
  const res = await User.create(payload);

  return res;
};

const getUsersFromDb = async (
  params: IUserFilterRequest,
  options: IPaginationOptions
) => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = params;

  const andConditions: any[] = [];

  if (searchTerm) {
    andConditions.push({
      [Op.or]: userSearchAbleFields.map((field) => ({
        [field]: {
          [Op.iLike]: `%${searchTerm}%`,
        },
      })),
    });
  }

  if (Object.keys(filterData).length > 0) {
    andConditions.push({
      [Op.and]: Object.entries(filterData).map(([key, value]) => ({
        [key]: value,
      })),
    });
  }

  const whereCondition = andConditions.length
    ? { [Op.and]: andConditions }
    : {};

  const res = await User.findAndCountAll({
    where: whereCondition,
    limit,
    offset: skip,
    order: [[sortBy, sortOrder]],
    attributes: [
      "id",
      "email",
      "age",
      "isStudent",
      "password",
      [fn("COUNT", col("posts.id")), "postsCount"],
    ],
    include: { model: Post, as: "posts", attributes: [] },
    group: ["User.id"],
    subQuery: false,
  });

  return {
    meta: {
      page,
      limit,
      total: Array.isArray(res.count) ? res.count.length : res.count,
    },
    data: res.rows,
  };
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

const loginUser = async (payload: { email: string; password: string }) => {
  const userData = await User.findOne({
    where: { email: payload.email },
    attributes: ["password", "id", "email"],
  });

  if (!userData) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "User not found! with this email " + payload.email
    );
  }

  const correctPassword: boolean = payload.password === userData.password;

  if (!correctPassword) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Password incorrect!");
  }

  const accessToken = jwtHelpers.generateToken(
    {
      id: userData.id,
      email: userData.email,
    },
    config.jwt.jwt_secret as Secret,
    config.jwt.expires_in as any
  );

  return {
    token: accessToken,
  };
};

export const userService = {
  createUserIntoDb,
  getUsersFromDb,
  singleUser,
  updateProfile,
  loginUser,
};
