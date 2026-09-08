import { WinsPage } from "@/components/clients/wins";
import { getWinsPageDataAction } from "@/app/clients/win-page-actions";

export default async function WinsRoute() {
  const data = await getWinsPageDataAction();
  return <WinsPage initialData={data} />;
}
