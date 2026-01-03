import express from "express";
import { UserRoutes } from "../modules/User/user.routes";
import { PostRoutes } from "../modules/Post/Post.routes";

const router = express.Router();

const moduleRoutes = [
  {
    path: "/users",
    route: UserRoutes,
  },
  {
    path: "/posts",
    route: PostRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
