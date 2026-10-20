import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Logo } from "./logo";

const columns = [
  {
    heading: "Training",
    links: [
      { href: "/training?category=offshore_safety", label: "Offshore Safety" },
      { href: "/training?category=process_safety", label: "Process Safety" },
      { href: "/training?category=piping", label: "Piping & Instrumentation" },
      { href: "/training?category=hazop_risk", label: "HAZOP and Risk" },
      { href: "/training", label: "All courses" },
    ],
  },
  {
    heading: "Explore",
    links: [
      { href: "/simulator", label: "P&ID Simulator" },
      { href: "/organisations", label: "Organisational Training" },
      { href: "/about", label: "About DM Sheffield" },
      { href: "/contact", label: "Contact us" },
    ],
  },
  {
    heading: "Learner resources",
    links: [
      { href: "/sign-in", label: "Learner sign in" },
      { href: "/register", label: "Create an account" },
      { href: "/certificates/verify", label: "Verify a certificate" },
      { href: "/dashboard", label: "Learner dashboard" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { href: "/legal/privacy", label: "Privacy policy" },
      { href: "/legal/terms", label: "Terms of service" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="bg-blue text-white">
      <Container className="py-12 sm:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(4,minmax(0,1fr))]">
          <div>
            <div className="inline-flex rounded-sm bg-white p-2">
              <Logo size="standard" />
            </div>
            <p className="mt-5 max-w-xs text-sm leading-7 text-white/80">
              Technical learning in offshore safety, process safety, piping,
              instrumentation and process risk, supported by interactive
              learning experiences.
            </p>
            <Link
              href="/training"
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-white hover:underline"
            >
              Explore training <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          {columns.map((column) => (
            <div key={column.heading}>
              <h2 className="text-sm font-semibold text-white">
                {column.heading}
              </h2>
              <ul className="mt-4 space-y-3">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm leading-6 text-white/75 transition-colors hover:text-white hover:underline"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Container>

      <div className="bg-white text-gray-600">
        <Container className="flex flex-col gap-3 py-5 text-xs leading-5 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} DM Sheffield. All rights reserved.
          </p>
          <p className="max-w-3xl">
            BOSIET preparation content does not constitute OPITO-accredited
            certification and does not replace required practical, in-person
            survival training.
          </p>
        </Container>
      </div>
    </footer>
  );
}
