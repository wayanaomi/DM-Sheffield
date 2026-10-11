import Link from "next/link";
import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import { Logo } from "@/components/layout/logo";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import { ROLE_LABELS, type UserRole } from "@/lib/enums";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/certificates", label: "Certificates" },
  { href: "/dashboard/orders", label: "Orders" },
  { href: "/simulator", label: "P&ID Simulator" },
  { href: "/training", label: "Browse training" },
];

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/sign-in?callbackUrl=/dashboard");

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-white">
        <Container className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Logo />
            <nav className="hidden items-center gap-6 md:flex">
              {links.map((link) => (
                <Link key={link.href} href={link.href} className="text-sm font-medium text-ink hover:text-blue">
                  {link.label}
                </Link>
              ))}
              {["admin", "instructor"].includes(session.user.role) ? (
                <Link href="/admin" className="text-sm font-medium text-ink hover:text-blue">
                  Admin console
                </Link>
              ) : null}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <Badge tone="blue">{ROLE_LABELS[session.user.role as UserRole] ?? session.user.role}</Badge>
            <span className="hidden text-sm text-muted sm:inline">{session.user.email}</span>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <button type="submit" className="text-sm font-medium text-muted hover:text-blue">
                Sign out
              </button>
            </form>
          </div>
        </Container>
      </header>
      <main className="flex-1 bg-blue-50/30">{children}</main>
    </>
  );
}
