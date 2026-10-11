import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { LinkButton } from "@/components/ui/button";
import { formatDate, formatPrice } from "@/lib/format";

export const metadata = { title: "Order history" };

const statusTone = { pending: "yellow", paid: "success", failed: "red", refunded: "neutral" } as const;

export default async function OrdersPage() {
  const session = await auth();
  const orders = await prisma.order.findMany({
    where: { userId: session!.user.id },
    include: { items: { include: { course: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <Container className="py-10">
      <SectionHeading eyebrow="Billing" title="Order history" />
      <div className="mt-8">
        {orders.length === 0 ? (
          <EmptyState
            title="No orders yet"
            description="Paid course purchases will appear here with their payment status."
            action={<LinkButton href="/training">Browse training</LinkButton>}
          />
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <div key={order.id} className="rounded-lg border border-border bg-white p-5">
                <div className="flex items-center justify-between">
                  <div>
                    {order.items.map((item) => (
                      <p key={item.id} className="text-sm font-medium text-ink">
                        {item.course.title}
                      </p>
                    ))}
                    <p className="mt-1 text-xs text-muted">{formatDate(order.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-navy">
                      {formatPrice(order.totalMinor, order.currency)}
                    </p>
                    <Badge tone={statusTone[order.status as keyof typeof statusTone] ?? "neutral"}>
                      {order.status}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Container>
  );
}
