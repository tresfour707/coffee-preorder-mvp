import { BaristaClient } from "@/components/barista/barista-client";
import { getQueueSnapshot } from "@/lib/queue";

export const dynamic = "force-dynamic";

export default async function BaristaPage() {
  const queue = await getQueueSnapshot();
  return <BaristaClient initialQueue={queue} />;
}
