import { z } from "zod";

const CreatePurchasedPlanValidationSchema = z.object({
  planId: z.string(),
  paymentId: z.string().optional(),
});

export const PurchasedPlanValidation = {
  CreatePurchasedPlanValidationSchema,
};
