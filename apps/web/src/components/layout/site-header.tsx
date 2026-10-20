
import Link from "next/link";
import { auth, signOut } from "@/auth";
import { Logo } from "./logo";
import { Container } from "@/components/ui/container";
import { LinkButton } from "@/components/ui/button";

const navLinks = [
  { href: "/training", label: "Training" },
  { href: "/simulator", label: "P&ID Simulator" },
  { href: "/organisations", label: "Organisations" },
  { href: "/about", label: "About us" },
  { href: "/contact", label: "Contact" },
];

export async function SiteHeader() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-40 border-b border-blue-700 bg-blue text-white shadow-sm">
      <Container className="flex min-h-20 items-center justify-between gap-3 sm:gap-5">
        <div className="inline-flex shrink-0 rounded-md bg-white p-1.5 shadow-sm sm:p-2">
          <Logo
            size="compact"
            className="focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          />
        </div>

        <nav className="hidden flex-1 items-center justify-center lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="border-l border-white/15 px-4 py-5 text-sm font-medium text-white transition-colors hover:bg-white/10"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          {session?.user ? (
            <>
              <LinkButton
                href="/dashboard"
                variant="secondary"
                className="!border-white !bg-white !text-blue hover:!bg-blue-50"
              >
                Dashboard
              </LinkButton>

              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button
                  type="submit"
                  className="px-2 py-2 text-sm font-semibold text-white hover:underline"
                >
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <LinkButton
                href="/sign-in"
                variant="secondary"
                className="!inline-flex !border-white !bg-blue !text-white hover:!bg-blue-800"
              >
                Sign in
              </LinkButton>

              <LinkButton
                href="/register"
                className="!inline-flex !border-white !bg-white !text-blue hover:!bg-blue-50"
              >
                Get started
              </LinkButton>
            </>
          )}
        </div>
      </Container>

      <nav
        aria-label="Mobile navigation"
        className="flex gap-1 overflow-x-auto border-t border-white/15 px-4 py-2 lg:hidden"
      >
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="shrink-0 px-3 py-2 text-xs font-medium text-white hover:bg-white/10"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
