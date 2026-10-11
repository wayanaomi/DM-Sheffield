import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPaystackSignature } from "@/lib/payments/paystack";

interface PaystackChargeEvent {
  event: string;
  data: {
    id: number;
    reference: string;
    status: string;
    amount: number;
    currency: string;
  };
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-paystack-signature");

  if (!verifyPaystackSignature(rawBody, signature)) {
    return NextResponse.json({ error: { code: "invalid_signature", message: "Signature verification failed" } }, { status: 401 });
  }

  const event = JSON.parse(rawBody) as PaystackChargeEvent;
  const gatewayEventId = `${event.data.id}`;

  if (event.event !== "charge.success") {
    return NextResponse.json({ received: true });
  }

  const order = await prisma.order.findFirst({
    where: { gatewayReference: event.data.reference },
    include: { items: true },
  });
  if (!order) {
    return NextResponse.json({ error: { code: "order_not_found", message: "No matching order" } }, { status: 404 });
  }

  try {
    await prisma.$transaction(async (tx) => {
      // Unique gatewayEventId enforces idempotency — a retried webhook delivery
      // for the same event throws here and is caught below as a no-op.
      await tx.payment.create({
        data: {
          orderId: order.id,
          gatewayEventId,
          status: "verified",
          amountMinor: event.data.amount,
          currency: event.data.currency,
          rawPayloadJson: rawBody,
          verifiedAt: new Date(),
        },
      });

      await tx.order.update({ where: { id: order.id }, data: { status: "paid" } });

      for (const item of order.items) {
        await tx.enrollment.upsert({
          where: { userId_courseId: { userId: order.userId, courseId: item.courseId } },
          create: { userId: order.userId, courseId: item.courseId, source: "purchase", status: "active" },
          update: {},
        });
      }

      await tx.auditLog.create({
        data: {
          actorId: order.userId,
          action: "payment.verified",
          entityType: "Order",
          entityId: order.id,
        },
      });
    });
  } catch (err) {
    // Likely a duplicate webhook delivery (unique gatewayEventId) — already processed.
    console.warn("Webhook processing skipped (likely duplicate):", err);
  }

  return NextResponse.json({ received: true });
}
