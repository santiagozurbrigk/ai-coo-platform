import { LaunchesPageContent } from "@/components/lanzamientos";
import { getLaunchesAction } from "@/app/lanzamientos/actions";

export default async function LanzamientosPage() {
  const launches = await getLaunchesAction();

  return <LaunchesPageContent initialLaunches={launches} />;
}
