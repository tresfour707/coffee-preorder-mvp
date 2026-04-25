import { redirect } from "next/navigation";

import { StaffAccessForm } from "@/components/staff/staff-access-form";
import { PageShell } from "@/components/ui/page-shell";
import { hasStaffSession } from "@/lib/staff-auth";

export const dynamic = "force-dynamic";

export default async function StaffAccessPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const accessGranted = await hasStaffSession();
  const params = await searchParams;
  const nextPath =
    typeof params.next === "string" && params.next.startsWith("/")
      ? params.next
      : "/barista";

  if (accessGranted) {
    redirect(nextPath);
  }

  return (
    <PageShell
      eyebrow="Staff"
      title="Демо-доступ"
      description="Перед показом внутренних экранов откройте staff-доступ. Это лёгкая защита для демо, а не настоящая staff-авторизация."
    >
      <StaffAccessForm nextPath={nextPath} />
    </PageShell>
  );
}
