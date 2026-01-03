import { Op } from "sequelize";
import { fileUploader } from "../../../helpers/fileUploader";
import { paginationHelper } from "../../../helpers/paginationHelper";
import { IPaginationOptions } from "../../../interfaces/paginations";
import { User } from "../User/user.model";
import { PostSearchAbleFields } from "./Post.costant";
import { IPostFilterRequest } from "./Post.interface";
import { Post } from "./Post.model";

const createPostIntoDb = async (
  payload: Post,
  imageFile: any,
  userId: string
) => {
  let image = "";
  if (imageFile) {
    image = (await fileUploader.uploadToCloudinary(imageFile)).Location;
  }

  const res = await Post.create({ ...payload, userId, image });
  return res;
};

const getPostsFromDb = async (
  params: IPostFilterRequest,
  options: IPaginationOptions
) => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = params;

  const andConditions: any[] = [];

  if (searchTerm) {
    andConditions.push({
      [Op.or]: PostSearchAbleFields.map((field) => ({
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

  const res = await Post.findAndCountAll({
    where: whereCondition,
    limit,
    offset: skip,
    order: [[sortBy, sortOrder]],
    include: { model: User, as: "users", attributes: ["id", "email"] },
  });

  return {
    meta: { page, limit, total: res.count },
    data: res.rows,
  };
};

const singlePost = async (id: string) => {
  const res = await Post.findByPk(id);
  return res;
};

const updateProfile = async (
  payload: any,
  imageFile: any,
  PostId: number
) => {};

export const PostService = {
  createPostIntoDb,
  getPostsFromDb,
  singlePost,
  updateProfile,
};
