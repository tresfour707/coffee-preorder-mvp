import { redirect } from "next/navigation";

import { BaristaClient } from "@/components/barista/barista-client";
import { getQueueSnapshot } from "@/lib/queue";
import { hasStaffSession } from "@/lib/staff-auth";

export const dynamic = "force-dynamic";

export default async function BaristaPage() {
  const accessGranted = await hasStaffSession();

  if (!accessGranted) {
    redirect("/staff-access?next=/barista");
  }

  const queue = await getQueueSnapshot();
  return <BaristaClient initialQueue={queue} />;
}
