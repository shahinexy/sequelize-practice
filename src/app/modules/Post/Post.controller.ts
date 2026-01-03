import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { PostService } from "./Post.service";
import pick from "../../../shared/pick";
import { PostFilterableFields } from "./Post.costant";

const createPost = catchAsync(async (req, res) => {
  const result = await PostService.createPostIntoDb(req.body, req.file, req.user.id);
  sendResponse(res, {
    message: "Post Registered successfully!",
    data: result,
  });
});

const getPosts = catchAsync(async (req, res) => {
  const filters = pick(req.query, PostFilterableFields);
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
  const result = await PostService.getPostsFromDb(filters, options);
  sendResponse(res, {
    message: "Posts retrieve successfully!",
    data: result,
  });
});

const singlePost = catchAsync(async (req, res) => {
  const result = await PostService.singlePost(req.params.id);
  sendResponse(res, {
    message: "Post profile retrieved successfully",
    data: result,
  });
});

const updateProfile = catchAsync(async (req, res) => {
  const { id } = req?.user;
  const result = await PostService.updateProfile(req.body, req.file, id);
  sendResponse(res, {
    message: "Profile updated successfully!",
    data: result,
  });
});

export const PostController = {
  createPost,
  getPosts,
  singlePost,
  updateProfile,
};
