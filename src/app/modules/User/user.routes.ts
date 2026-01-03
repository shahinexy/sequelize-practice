import express from "express";
import { userController } from "./user.controller";
import auth from "../../middlewares/auth";

const router = express.Router();

router.route("/").get(auth(),userController.getUsers).post(userController.createUser);

router.route("/login").post(userController.loginUser);

router
  .route("/:id")
  .get(userController.singleUser)
  .put(userController.updateProfile);

export const UserRoutes = router;
