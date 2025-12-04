import { z } from "zod";

const itemSchema = z.object({
  name: z
    .string()
    .describe("Short descriptive name, e.g. 'Managed switch (48-port)'."),
  category: z
    .string()
    .describe(
      "High-level category, e.g. 'network_switch', 'wireless_access_point', 'cabling', 'laptop', 'monitor'."
    ),
  quantity: z
    .number()
    .int()
    .describe("Quantity of the item. Use numeric amount; use specs/unit for meters, etc."),
  specs: z
    .record(z.string(),
    z.union([z.string(), z.number(), z.boolean()])
    )
    .optional()
    .describe("Optional technical details like ports, Wi-Fi version, cable length unit, etc."),
});

export const procurementSchema = z.object({
  originalText: z
    .string()
    .describe("Exactly the original user text."),
  budget: z
    .object({
      amount: z.number().describe("Budget amount as a number."),
      currency: z.string().describe("Currency code like USD, EUR, INR."),
    })
    .nullable()
    .describe("Total budget if specified, otherwise null."),
  deliveryDays: z
    .number()
    .int()
    .nullable()
    .describe("Required delivery/installation timeline in days, or null."),
  items: z
    .array(itemSchema)
    .describe("List of distinct items requested in the text."),
  paymentTerms: z
    .string()
    .nullable()
    .describe("Payment terms as text, e.g. 'net-30', or null."),
  warrantyMonths: z
    .number()
    .int()
    .nullable()
    .describe("Warranty duration in months, or null."),
});

export type ProcurementRequest = z.infer<typeof procurementSchema>;
