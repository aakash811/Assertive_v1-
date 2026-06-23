import { z } from "zod";

export const assertiveConfigSchema = z.object({
  apiUrl: z.string().url(),
  apiKey: z.string().min(1),
  framework: z.enum(["playwright"]),
  projectId: z.string().uuid(),
  include: z.array(z.string()).optional(),
  ignore: z.array(z.string()).optional(),
  sync: z
    .object({
      staleDays: z.number().default(30),
    })
    .optional(),
});

export type AssertiveConfig = z.infer<typeof assertiveConfigSchema>;
