import { OrganizationsList } from "@/components/super-admin";
import { HoldingsAdminPanel } from "@/components/super-admin/holdings-admin-panel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@ai-coo/ui";
import { loadOrganizationsList } from "@/lib/super-admin/queries";
import {
  loadAvailableBusinessOrgs,
  loadHoldingsForAdmin,
} from "@/lib/super-admin/holdings-admin";

export default async function SuperAdminOrganizationsPage() {
  const [organizations, holdings, availableOrgs] = await Promise.all([
    loadOrganizationsList(),
    loadHoldingsForAdmin(),
    loadAvailableBusinessOrgs(),
  ]);

  return (
    <Tabs defaultValue="founders" className="space-y-6">
      <TabsList>
        <TabsTrigger value="founders">Founders</TabsTrigger>
        <TabsTrigger value="holdings">Holdings</TabsTrigger>
      </TabsList>
      <TabsContent value="founders">
        <OrganizationsList organizations={organizations} />
      </TabsContent>
      <TabsContent value="holdings">
        <HoldingsAdminPanel
          holdings={holdings}
          availableOrgs={availableOrgs}
        />
      </TabsContent>
    </Tabs>
  );
}
