import { z } from "zod";

export const taskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title cannot exceed 100 characters"),

  description: z
    .string()
    .trim()
    .max(1000, "Description cannot exceed 1000 characters")
    .or(z.literal("")),

  status: z.enum(["Pending", "In Progress", "Completed"]),

  priority: z.enum(["High", "Medium", "Low"]),

  dueDate: z
    .union([z.iso.date(), z.literal("")])
    .transform((v) => (v === "" ? undefined : v)),
});

export type TaskFormValues = z.infer<typeof taskSchema>;
