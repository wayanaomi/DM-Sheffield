import Link from "next/link";
import { auth } from "@/auth";
import { requireRole } from "@/lib/rbac";
import { Logo } from "@/components/layout/logo";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = requireRole(await auth(), ["admin", "instructor"]);
  const isAdmin = session.user.role === "admin";

  const links = [
    { href: "/admin", label: "Overview" },
    { href: "/admin/courses", label: "Courses" },
    ...(isAdmin
      ? [
          { href: "/admin/users", label: "Users" },
          { href: "/admin/audit-log", label: "Audit log" },
          { href: "/admin/contact-messages", label: "Contact messages" },
        ]
      : []),
  ];

  return (
    <>
      <header className="border-b border-border bg-navy text-white">
        <Container className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Logo className="[&_span]:text-white" />
            <nav className="hidden items-center gap-6 md:flex">
              {links.map((link) => (
                <Link key={link.href} href={link.href} className="text-sm font-medium text-blue-100 hover:text-white">
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <Badge tone="yellow">{isAdmin ? "Administrator" : "Instructor"}</Badge>
            <Link href="/dashboard" className="text-sm text-blue-100 hover:text-white">
              Exit to dashboard
            </Link>
          </div>
        </Container>
      </header>
      <main className="flex-1 bg-blue-50/30">{children}</main>
    </>
  );
}
