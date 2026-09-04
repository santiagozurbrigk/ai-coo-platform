import { WeeklyReviewPage } from "@/components/clients/weekly-review";
import { getWeeklyReviewAction } from "@/app/clients/tracking-actions";

export default async function WeeklyReviewRoute() {
  const data = await getWeeklyReviewAction();
  return <WeeklyReviewPage initialData={data} />;
}
