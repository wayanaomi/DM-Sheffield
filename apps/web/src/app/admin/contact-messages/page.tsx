import { auth } from "@/auth";
import { requireRole } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/format";
import { markMessageReviewed } from "./actions";

export const metadata = { title: "Contact messages" };

export default async function ContactMessagesPage() {
  await requireRole(await auth(), ["admin"]);
  const messages = await prisma.contactMessage.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <Container className="py-10">
      <h1 className="text-2xl font-semibold text-navy">Contact messages</h1>
      <div className="mt-6 space-y-3">
        {messages.length === 0 ? (
          <EmptyState title="No messages yet" description="Messages submitted through the public contact form will appear here." />
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="rounded-lg border border-border bg-white p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-ink">
                    {msg.name} <span className="font-normal text-muted">&lt;{msg.email}&gt;</span>
                  </p>
                  {msg.organisation ? <p className="text-xs text-muted">{msg.organisation}</p> : null}
                </div>
                <div className="flex items-center gap-3">
                  <Badge tone={msg.status === "new" ? "yellow" : "success"}>{msg.status}</Badge>
                  <span className="text-xs text-muted">{formatDate(msg.createdAt)}</span>
                </div>
              </div>
              <p className="mt-3 text-sm text-ink whitespace-pre-line">{msg.message}</p>
              {msg.status === "new" ? (
                <form action={async () => { "use server"; await markMessageReviewed(msg.id); }} className="mt-3">
                  <Button type="submit" variant="secondary">
                    Mark reviewed
                  </Button>
                </form>
              ) : null}
            </div>
          ))
        )}
      </div>
    </Container>
  );
}
