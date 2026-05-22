import { redirect } from "next/navigation";

import { ProfileClient } from "@/components/customer/profile-client";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const viewer = await getCurrentUser();

  if (!viewer) {
    redirect("/sign-in?next=/profile");
  }

  return <ProfileClient viewer={viewer} />;
}
