"use client";

/**
 * A · La pantalla de Wins: tracker y dashboard, en dos solapas.
 *
 * Son dos preguntas distintas sobre los mismos datos — el tracker es por win, el
 * dashboard es por cliente — y por eso conviven acá en vez de en dos páginas.
 */

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@ai-coo/ui";
import { PageHeader } from "@/components/shared/page-header";
import type { Client, ClientTracking } from "@/types/clients";
import type { ClientBaseline, ClientWin } from "@/types/wins";
import type { FieldDefinition } from "@/types/custom-fields";
import { getWinsPageDataAction } from "@/app/clients/win-page-actions";
import { WinsTracker } from "@/components/clients/wins/wins-tracker";
import { WinsDashboard } from "@/components/clients/wins/wins-dashboard";

export type WinsPageData = {
  wins: ClientWin[];
  clients: Client[];
  winFields: FieldDefinition[];
  baselines: Record<string, ClientBaseline>;
  niches: Record<string, string>;
  tracking: Record<string, ClientTracking>;
};

export function WinsPage({ initialData }: { initialData: WinsPageData }) {
  const [data, setData] = useState(initialData);

  async function refresh() {
    setData(await getWinsPageDataAction());
  }

  return (
    <div className="space-y-6">
      {/* El título ya lo pone el topbar (ver PageHeader). */}
      <PageHeader description="Los logros de tus clientes, con su fecha, su captura y su número. El número es lo que arma el recorrido en el dashboard." />

      <Tabs defaultValue="tracker">
        <TabsList>
          <TabsTrigger value="tracker">Tracker</TabsTrigger>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
        </TabsList>

        <TabsContent value="tracker" className="pt-4">
          <WinsTracker
            wins={data.wins}
            clients={data.clients}
            winFields={data.winFields}
            onChanged={refresh}
          />
        </TabsContent>

        <TabsContent value="dashboard" className="pt-4">
          <WinsDashboard
            wins={data.wins}
            clients={data.clients}
            baselines={data.baselines}
            niches={data.niches}
            tracking={data.tracking}
            onChanged={refresh}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
