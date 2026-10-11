import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { LinkButton } from "@/components/ui/button";
import { formatDate } from "@/lib/format";

export const metadata = { title: "My certificates" };

export default async function MyCertificatesPage() {
  const session = await auth();
  const certificates = await prisma.certificate.findMany({
    where: { userId: session!.user.id },
    include: { enrollment: { include: { course: true } } },
    orderBy: { issuedAt: "desc" },
  });

  return (
    <Container className="py-10">
      <SectionHeading eyebrow="Your records" title="My certificates" />
      <div className="mt-8">
        {certificates.length === 0 ? (
          <EmptyState
            title="No certificates yet"
            description="Complete a course's required lessons to earn a certificate automatically."
            action={<LinkButton href="/training">Browse training</LinkButton>}
          />
        ) : (
          <Card>
            <ul className="divide-y divide-border">
              {certificates.map((cert) => (
                <li key={cert.id} className="flex items-center justify-between px-5 py-4 text-sm">
                  <div>
                    <p className="font-medium text-ink">{cert.enrollment.course.title}</p>
                    <p className="mt-0.5 font-tag text-xs text-muted">{cert.publicId}</p>
                    <p className="mt-0.5 text-xs text-muted">Issued {formatDate(cert.issuedAt)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {cert.revokedAt ? (
                      <span className="text-xs font-medium text-accent-red">Revoked</span>
                    ) : null}
                    <LinkButton href={`/certificates/${cert.publicId}`} variant="secondary">
                      View / verify
                    </LinkButton>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </Container>
  );
}
