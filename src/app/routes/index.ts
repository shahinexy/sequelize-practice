import express from "express";
import { AuthRoutes } from "../modules/Auth/auth.routes";
import { UserRoutes } from "../modules/User/user.routes";
import { PlanRoutes } from "../modules/Plan/plan.routes";
import { PurchasedPlanRoutes } from "../modules/PurchasedPlan/purchasedPlan.routes";

const router = express.Router();

const moduleRoutes = [
  {
    path: "/users",
    route: UserRoutes,
  },
  {
    path: "/auth",
    route: AuthRoutes,
  },
    {
    path: "/plan",
    route: PlanRoutes,
  },
  {
    path: "/purchased-plan",
    route: PurchasedPlanRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
