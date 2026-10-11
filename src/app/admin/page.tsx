import Link from "next/link";
import { BookOpen, Users, FileClock } from "lucide-react";
import { auth } from "@/auth";
import { Container } from "@/components/ui/container";
import { Card, CardBody } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/button";
import { getAdminOverview } from "@/lib/data/admin";
import { formatDate } from "@/lib/format";

export const metadata = { title: "Admin overview" };

export default async function AdminOverviewPage() {
  const session = await auth();
  const data = await getAdminOverview(session!);
  const isAdmin = session!.user.role === "admin";

  return (
    <Container className="py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-navy">
          {isAdmin ? "Platform overview" : "Your courses"}
        </h1>
        <LinkButton href="/admin/courses/new">New course</LinkButton>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <CardBody className="flex items-center gap-3">
            <BookOpen className="h-5 w-5 text-blue" />
            <div>
              <p className="text-xl font-semibold text-navy">{data.totalCourses}</p>
              <p className="text-xs text-muted">Total courses</p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex items-center gap-3">
            <BookOpen className="h-5 w-5 text-signal-normal" />
            <div>
              <p className="text-xl font-semibold text-navy">{data.publishedCourses}</p>
              <p className="text-xs text-muted">Published</p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex items-center gap-3">
            <FileClock className="h-5 w-5 text-accent-yellow" />
            <div>
              <p className="text-xl font-semibold text-navy">{data.draftCourses}</p>
              <p className="text-xs text-muted">Drafts</p>
            </div>
          </CardBody>
        </Card>
        {isAdmin ? (
          <Card>
            <CardBody className="flex items-center gap-3">
              <Users className="h-5 w-5 text-blue" />
              <div>
                <p className="text-xl font-semibold text-navy">{data.totalUsers}</p>
                <p className="text-xs text-muted">Registered users</p>
              </div>
            </CardBody>
          </Card>
        ) : null}
      </div>

      {isAdmin ? (
        <section className="mt-10">
          <h2 className="text-lg font-semibold text-navy">Recent admin activity</h2>
          {data.recentAuditLog.length === 0 ? (
            <p className="mt-3 text-sm text-muted">No audited actions have been recorded yet.</p>
          ) : (
            <Card className="mt-4">
              <ul className="divide-y divide-border">
                {data.recentAuditLog.map((entry) => (
                  <li key={entry.id} className="flex items-center justify-between px-5 py-3 text-sm">
                    <span>
                      <span className="font-medium text-ink">{entry.actor?.name ?? "System"}</span>{" "}
                      <span className="text-muted">{entry.action}</span>
                    </span>
                    <span className="text-xs text-muted">{formatDate(entry.createdAt)}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
          <Link href="/admin/audit-log" className="mt-3 inline-block text-sm text-blue">
            View full audit log →
          </Link>
        </section>
      ) : null}
    </Container>
  );
}
