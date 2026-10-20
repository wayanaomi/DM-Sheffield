import Link from "next/link";
import { redirect } from "next/navigation";
import { Users, Building2, Armchair, ArrowLeft } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Container } from "@/components/ui/container";
import { Card, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Organisation dashboard" };

export default async function OrganisationDashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in?callbackUrl=/organisation/dashboard");
  }

  if (session.user.role !== "org_manager") {
    redirect("/dashboard");
  }

  const membership = await prisma.membership.findFirst({
    where: {
      userId: session.user.id,
      role: "manager",
    },
    include: {
      organisation: {
        include: {
          memberships: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  role: true,
                  status: true,
                },
              },
            },
            orderBy: { createdAt: "asc" },
          },
        },
      },
    },
  });

  if (!membership) {
    return (
      <Container className="py-12">
        <h1 className="text-2xl font-semibold text-navy">Organisation dashboard</h1>
        <p className="mt-3 text-sm text-muted">
          No organisation is linked to this manager account. Please contact support.
        </p>
      </Container>
    );
  }

  const organisation = membership.organisation;
  const members = organisation.memberships;
  const activeMembers = members.filter(
    (item) => item.user.status === "active" && item.role !== "manager"
  ).length;

  const stats = [
    { label: "Total members", value: members.length, icon: Users },
    { label: "Active members", value: activeMembers, icon: Building2 },
    { label: "Configured seats", value: organisation.seats, icon: Armchair },
  ];

  return (
    <Container className="py-10">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <p className="text-sm font-medium text-blue">DM Sheffield for organisations</p>
          <h1 className="mt-2 text-3xl font-semibold text-navy">
            {organisation.name}
          </h1>
          <p className="mt-2 text-sm text-muted">
            Manage your organisation account and view its current membership.
          </p>
        </div>
        <Link
          href="/organisations"
          className="inline-flex items-center gap-2 text-sm font-medium text-blue hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Organisation services
        </Link>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {stats.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardBody className="flex items-center gap-4">
              <div className="rounded-lg bg-blue-50 p-3">
                <Icon className="h-5 w-5 text-blue" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-navy">{value}</p>
                <p className="text-sm text-muted">{label}</p>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <section className="mt-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-navy">Organisation members</h2>
            <p className="mt-1 text-sm text-muted">
              People currently linked to this organisation.
            </p>
          </div>
          <Badge tone="blue">{members.length} account{members.length === 1 ? "" : "s"}</Badge>
        </div>

        <Card className="mt-4 overflow-hidden">
          {members.length === 0 ? (
            <CardBody>
              <p className="text-sm text-muted">No members have been added yet.</p>
            </CardBody>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-blue-50/60 text-muted">
                  <tr>
                    <th className="px-5 py-3 font-medium">Name</th>
                    <th className="px-5 py-3 font-medium">Email</th>
                    <th className="px-5 py-3 font-medium">Membership</th>
                    <th className="px-5 py-3 font-medium">Account status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {members.map((item) => (
                    <tr key={item.id}>
                      <td className="px-5 py-4 font-medium text-ink">
                        {item.user.name}
                      </td>
                      <td className="px-5 py-4 text-muted">{item.user.email}</td>
                      <td className="px-5 py-4 capitalize">{item.role}</td>
                      <td className="px-5 py-4">
                        <span className="capitalize">{item.user.status.replaceAll("_", " ")}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </section>

      <p className="mt-6 text-xs text-muted">
        Member invitations, seat allocation, and training reports are not enabled in this version.
      </p>
    </Container>
  );
}
