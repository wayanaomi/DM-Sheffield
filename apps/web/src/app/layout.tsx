import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "DM Sheffield — Process Safety, Offshore & P&ID Training",
    template: "%s · DM Sheffield",
  },
  description:
    "Professional training in process safety, offshore safety, piping and instrumentation design and HAZOP, with an interactive, physics-informed P&ID simulator.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-white text-ink">{children}</body>
    </html>
  );
}
