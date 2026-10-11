import { createHmac } from "node:crypto";

/**
 * Paystack integration boundary (PAY-1). No live credentials are configured
 * in this environment — `configured` is false and callers must not simulate
 * a successful payment. Wire PAYSTACK_SECRET_KEY / PAYSTACK_WEBHOOK_SECRET to
 * enable real checkout.
 */
export const paystackConfigured = Boolean(process.env.PAYSTACK_SECRET_KEY);

export interface InitializeTransactionResult {
  authorizationUrl: string;
  reference: string;
}

export async function initializeTransaction(params: {
  email: string;
  amountMinor: number;
  currency: string;
  reference: string;
  callbackUrl: string;
}): Promise<InitializeTransactionResult> {
  if (!paystackConfigured) {
    throw new Error("Paystack is not configured in this environment.");
  }
  const response = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: params.email,
      amount: params.amountMinor,
      currency: params.currency,
      reference: params.reference,
      callback_url: params.callbackUrl,
    }),
  });
  if (!response.ok) {
    throw new Error(`Paystack initialize failed: ${response.status}`);
  }
  const json = (await response.json()) as {
    data: { authorization_url: string; reference: string };
  };
  return { authorizationUrl: json.data.authorization_url, reference: json.data.reference };
}

/** Verify the `x-paystack-signature` header against the raw request body (PAY-4). */
export function verifyPaystackSignature(rawBody: string, signatureHeader: string | null): boolean {
  if (!signatureHeader || !process.env.PAYSTACK_WEBHOOK_SECRET) return false;
  const expected = createHmac("sha512", process.env.PAYSTACK_WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");
  return expected === signatureHeader;
}
