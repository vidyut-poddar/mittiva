import { z } from "zod";

/**
 * Server-side input validation. NEVER trust form data from the browser.
 * Every payment/checkout route parses incoming bodies through these schemas
 * before doing anything with them.
 */

// Indian mobile: optional +91, then 10 digits starting 6-9.
const phoneRegex = /^(?:\+?91[-\s]?)?[6-9]\d{9}$/;
// Indian PIN code: 6 digits, not starting with 0.
const pinRegex = /^[1-9]\d{5}$/;

export const checkoutSchema = z.object({
  cartId: z.string().min(1, "Missing cart"),
  zone: z.string().optional(),
  contact: z.object({
    email: z.string().email("Enter a valid email"),
    phone: z.string().regex(phoneRegex, "Enter a valid Indian mobile number"),
  }),
  shippingAddress: z.object({
    firstName: z.string().trim().min(1, "First name required").max(60),
    lastName: z.string().trim().min(1, "Last name required").max(60),
    address1: z.string().trim().min(3, "Address required").max(120),
    address2: z.string().trim().max(120).optional().default(""),
    city: z.string().trim().min(2, "City required").max(60),
    province: z.string().trim().max(60).optional().default(""),
    zip: z.string().regex(pinRegex, "Enter a valid 6-digit PIN code"),
  }),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export const verifySchema = z.object({
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  signature: z.string().min(1),
});

export type VerifyInput = z.infer<typeof verifySchema>;
