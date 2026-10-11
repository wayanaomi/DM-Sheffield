import QRCode from "qrcode";
import { CheckCircle2, XCircle } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { formatDate } from "@/lib/format";
import { verifyCertificate } from "@/lib/certificates";

export const metadata = { title: "Certificate verification" };

export default async function CertificateVerificationPage({
  params,
}: {
  params: Promise<{ publicId: string }>;
}) {
  const { publicId } = await params;
  const result = await verifyCertificate(publicId);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const qrDataUrl = result.valid
    ? await QRCode.toDataURL(`${siteUrl}/certificates/${publicId}`, { margin: 1, width: 160 })
    : null;

  return (
    <Container className="flex flex-col items-center py-16">
      <SectionHeading eyebrow="Public verification" title="Certificate verification" align="center" />

      <div className="mt-8 w-full max-w-md rounded-lg border border-border p-8 text-center">
        {result.valid ? (
          <>
            <CheckCircle2 className="mx-auto h-10 w-10 text-signal-normal" />
            <p className="mt-3 text-sm font-semibold text-signal-normal">Valid certificate</p>
            <p className="mt-4 text-xl font-semibold text-navy">{result.learnerName}</p>
            <p className="mt-1 text-muted">{result.courseTitle}</p>
            <p className="mt-4 font-tag text-xs text-muted">{publicId}</p>
            <dl className="mt-4 space-y-1 text-sm text-muted">
              <div className="flex justify-between">
                <dt>Issued</dt>
                <dd className="text-ink">{result.issuedAt ? formatDate(result.issuedAt) : "—"}</dd>
              </div>
              {result.expiresAt ? (
                <div className="flex justify-between">
                  <dt>Valid until</dt>
                  <dd className="text-ink">{formatDate(result.expiresAt)}</dd>
                </div>
              ) : null}
            </dl>
            {qrDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={qrDataUrl} alt="Verification QR code" className="mx-auto mt-6 h-32 w-32" />
            ) : null}
            <p className="mt-6 text-xs text-muted">
              This certificate confirms completion of an online DM Sheffield course.
              It does not imply OPITO accreditation.
            </p>
          </>
        ) : (
          <>
            <XCircle className="mx-auto h-10 w-10 text-accent-red" />
            <p className="mt-3 text-sm font-semibold text-accent-red">
              {result.reason === "revoked"
                ? "This certificate has been revoked."
                : result.reason === "expired"
                  ? "This certificate has expired."
                  : "No certificate found with this ID."}
            </p>
            <p className="mt-2 text-sm text-muted">
              Double-check the certificate ID, or contact DM Sheffield if you believe this is an error.
            </p>
          </>
        )}
      </div>
    </Container>
  );
}
