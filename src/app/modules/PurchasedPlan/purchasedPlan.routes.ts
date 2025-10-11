import express from "express";
import validateRequest from "../../middlewares/validateRequest";
import auth from "../../middlewares/auth";
import { PurchasedPlanController } from "./purchasedPlan.controller";
import { PurchasedPlanValidation } from "./purchasedPlan.validation";

const router = express.Router();

router
  .route("/")
  .get(PurchasedPlanController.getPurchasedPlans)
  .post(
    auth(),
    validateRequest(
      PurchasedPlanValidation.CreatePurchasedPlanValidationSchema
    ),
    PurchasedPlanController.createPurchasedPlan
  );

router.get(
  "/my-purchased",
  auth(),
  PurchasedPlanController.getMyPurchasedPlan
);

router
  .route("/:id")
  .get(auth(), PurchasedPlanController.getSinglePurchasedPlan);

export const PurchasedPlanRoutes = router;
