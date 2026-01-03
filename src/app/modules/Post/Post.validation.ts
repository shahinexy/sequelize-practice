import { z } from "zod";

export const PostSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  isDeleted: z.boolean().optional(),
});

export const UpdatePostSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  isDeleted: z.boolean().optional(),
});

export const PostValidation = {
  PostSchema,
  UpdatePostSchema,
};
