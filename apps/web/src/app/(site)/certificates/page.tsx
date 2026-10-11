import { redirect } from "next/navigation";

export default async function CertificatesIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  if (id) redirect(`/certificates/${encodeURIComponent(id)}`);
  redirect("/certificates/verify");
}
