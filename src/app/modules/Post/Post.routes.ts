import express, { NextFunction, Request, Response } from "express";
import validateRequest from "../../middlewares/validateRequest";
import { PostValidation } from "./Post.validation";
import { PostController } from "./Post.controller";
import auth from "../../middlewares/auth";
import { fileUploader } from "../../../helpers/fileUploader";

const router = express.Router();

router.route("/").get(PostController.getPosts).post(PostController.createPost);

router
  .route("/:id")
  .get(PostController.singlePost)
  .put(
    fileUploader.uploadSingle,
    (req: Request, res: Response, next: NextFunction) => {
      req.body = JSON.parse(req.body.data);
      next();
    },
    validateRequest(PostValidation.PostUpdateSchema),
    PostController.updateProfile
  );

export const PostRoutes = router;
