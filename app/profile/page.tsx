import { redirect } from "next/navigation";

import { ProfileClient } from "@/components/customer/profile-client";
import { getCurrentUser } from "@/lib/auth";
import { getPublicQueueSummary, getQueueHeadline } from "@/lib/queue";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const viewer = await getCurrentUser();

  if (!viewer) {
    redirect("/sign-in?next=/profile");
  }

  const [initialQueueSummary, queueHeadline] = await Promise.all([
    getPublicQueueSummary(),
    getQueueHeadline(viewer.id),
  ]);

  return (
    <ProfileClient
      viewer={viewer}
      initialQueueSummary={initialQueueSummary}
      queueHeadline={queueHeadline}
    />
  );
}
