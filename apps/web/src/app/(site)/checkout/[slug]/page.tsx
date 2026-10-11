import { notFound } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import { paystackConfigured } from "@/lib/payments/paystack";
import { startCheckout } from "./actions";

export const metadata = { title: "Checkout" };

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await auth();
  const course = await prisma.course.findUnique({ where: { slug } });
  if (!course || course.status !== "published" || course.isFree) notFound();

  return (
    <Container className="max-w-lg py-16">
      <SectionHeading eyebrow="Checkout" title={course.title} />
      <div className="mt-6 rounded-lg border border-border bg-white p-6">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <span className="text-sm text-muted">Course price</span>
          <span className="text-lg font-semibold text-navy">
            {formatPrice(course.priceMinor, course.currency)}
          </span>
        </div>

        {!paystackConfigured ? (
          <div className="mt-5 flex items-start gap-3 rounded-md border border-accent-yellow-bg bg-accent-yellow-bg p-4 text-sm text-ink">
            <AlertTriangle className="mt-0.5 h-5 w-5 flex-none text-accent-yellow" />
            <div>
              <p className="font-medium">Payments are not yet configured</p>
              <p className="mt-1 text-muted">
                This environment has no live Paystack credentials, so paid checkout is
                disabled rather than simulated. Set PAYSTACK_SECRET_KEY and
                PAYSTACK_WEBHOOK_SECRET to enable real payments — see docs/SETUP.md.
              </p>
            </div>
          </div>
        ) : (
          <form
            action={async () => {
              "use server";
              await startCheckout(course.id);
            }}
            className="mt-5"
          >
            <Button type="submit" className="w-full" disabled={!session?.user}>
              Pay with Paystack
            </Button>
            {!session?.user ? (
              <p className="mt-2 text-center text-xs text-muted">Sign in to continue to checkout.</p>
            ) : null}
          </form>
        )}
      </div>
    </Container>
  );
}
