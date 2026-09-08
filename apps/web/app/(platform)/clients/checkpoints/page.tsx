import { JourneyPage } from "@/components/clients/checkpoints";
import { getJourneyPageDataAction } from "@/app/clients/checkpoint-actions";

export default async function CheckpointsRoute() {
  const data = await getJourneyPageDataAction();
  return <JourneyPage initialData={data} />;
}
