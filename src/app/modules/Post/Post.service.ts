import { IPaginationOptions } from "../../../interfaces/paginations";
import { IPostFilterRequest, TPost } from "./Post.interface";
import { Post } from "./Post.model";

const createPostIntoDb = async (payload: any) => {
  const res = await Post.create(payload);
  return res;
};

const getPostsFromDb = async (
  params: IPostFilterRequest,
  options: IPaginationOptions
) => {
  const res = await Post.findAll({
    attributes: ["id", "email", "age", "isStudent"],
  });

  return res;
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
