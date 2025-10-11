import { z } from "zod";

const CreatePlanValidationSchema = z.object({
  title: z.string(),
  duration: z.number().int(),
  price: z.number(),
});

const PlanUpdateSchema = z.object({
  title: z.string().optional(),
  duration: z.number().int().optional(),
  price: z.number().optional(),
});

export const PlanValidation = {
  CreatePlanValidationSchema,
  PlanUpdateSchema,
};
