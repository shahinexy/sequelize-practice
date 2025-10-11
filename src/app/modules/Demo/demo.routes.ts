import express, { NextFunction, Request, Response } from "express";
import validateRequest from "../../middlewares/validateRequest";
import { UserValidation } from "./demo.validation";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import { fileUploader } from "../../../helpers/fileUploader";
import { userController } from "./demo.controller";

const router = express.Router();

router
  .route("/")
  .get(userController.getUsers)
  .post(
    validateRequest(UserValidation.CreateUserValidationSchema),
    userController.createUser
  );

router
  .route("/profile")
  .get(auth(UserRole.ADMIN, UserRole.USER), userController.getSingleUser)
  .put(
    auth(UserRole.ADMIN, UserRole.USER),
    fileUploader.uploadSingle,
    (req: Request, res: Response, next: NextFunction) => {
      req.body = JSON.parse(req.body.data);
      next();
    },
    validateRequest(UserValidation.userUpdateSchema),
    userController.updateProfile
  );

export const UserRoutes = router;
