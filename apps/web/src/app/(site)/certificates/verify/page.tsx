import Link from "next/link";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Label, Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Verify a certificate" };

export default function VerifyCertificatePage() {
  return (
    <Container className="flex min-h-[60vh] flex-col items-center py-16">
      <SectionHeading
        eyebrow="Public verification"
        title="Verify a DM Sheffield certificate"
        description="Enter the certificate ID printed on the certificate, or scan its QR code, to confirm validity."
        align="center"
      />
      <form action="/certificates" method="GET" className="mt-8 flex w-full max-w-md gap-2">
        <div className="flex-1">
          <Label htmlFor="id" className="sr-only">
            Certificate ID
          </Label>
          <Input id="id" name="id" placeholder="e.g. DMS-CERT-XXXXXXXX" required />
        </div>
        <Button type="submit">Verify</Button>
      </form>
      <p className="mt-4 text-xs text-muted">
        Or visit <Link href="/certificates/DMS-CERT-EXAMPLE" className="text-blue">/certificates/&lt;certificate id&gt;</Link> directly.
      </p>
    </Container>
  );
}
