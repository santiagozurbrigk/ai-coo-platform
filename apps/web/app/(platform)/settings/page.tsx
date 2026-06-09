import { SettingsForm } from "@/components/settings";
import { getSettingsInitialData } from "@/lib/settings/initial-data";

export default async function SettingsPage() {
  const initialData = await getSettingsInitialData();
  return <SettingsForm initialData={initialData} />;
}
