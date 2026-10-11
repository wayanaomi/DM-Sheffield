import { auth } from "@/auth";
import { requireRole } from "@/lib/rbac";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { getAuditLog } from "@/lib/data/admin";
import { formatDate } from "@/lib/format";

export const metadata = { title: "Audit log" };

export default async function AuditLogPage() {
  await requireRole(await auth(), ["admin"]);
  const entries = await getAuditLog();

  return (
    <Container className="py-10">
      <h1 className="text-2xl font-semibold text-navy">Audit log</h1>
      <p className="mt-1 text-sm text-muted">The most recent 200 recorded administrative actions.</p>

      <div className="mt-6">
        {entries.length === 0 ? (
          <EmptyState title="No audited actions yet" description="Administrative actions will appear here as they occur." />
        ) : (
          <div className="overflow-hidden rounded-lg border border-border bg-white">
            <table className="w-full text-sm">
              <thead className="bg-blue-50/60 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-4 py-3">When</th>
                  <th className="px-4 py-3">Actor</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Entity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {entries.map((entry) => (
                  <tr key={entry.id}>
                    <td className="px-4 py-3 text-muted">{formatDate(entry.createdAt)}</td>
                    <td className="px-4 py-3 text-ink">{entry.actor?.name ?? "System"}</td>
                    <td className="px-4 py-3 font-tag text-xs text-ink">{entry.action}</td>
                    <td className="px-4 py-3 text-muted">
                      {entry.entityType}
                      {entry.entityId ? ` #${entry.entityId.slice(0, 8)}` : ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Container>
  );
}
