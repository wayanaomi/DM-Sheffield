import { auth } from "@/auth";
import { requireRole } from "@/lib/rbac";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import { getUsersForAdmin } from "@/lib/data/admin";
import { formatDate } from "@/lib/format";
import { RoleSelect, StatusToggle } from "./user-controls";

export const metadata = { title: "Manage users" };

export default async function AdminUsersPage() {
  await requireRole(await auth(), ["admin"]);
  const users = await getUsersForAdmin();

  return (
    <Container className="py-10">
      <h1 className="text-2xl font-semibold text-navy">Users</h1>
      <div className="mt-6 overflow-hidden rounded-lg border border-border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-blue-50/60 text-left text-xs font-semibold uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-4 py-3 font-medium text-ink">{user.name}</td>
                <td className="px-4 py-3 text-muted">{user.email}</td>
                <td className="px-4 py-3">
                  <RoleSelect userId={user.id} role={user.role} />
                </td>
                <td className="px-4 py-3">
                  <Badge tone={user.status === "active" ? "success" : "red"}>{user.status}</Badge>
                </td>
                <td className="px-4 py-3 text-muted">{formatDate(user.createdAt)}</td>
                <td className="px-4 py-3 text-right">
                  <StatusToggle userId={user.id} status={user.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Container>
  );
}
