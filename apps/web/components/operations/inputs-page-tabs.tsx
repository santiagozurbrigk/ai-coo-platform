"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@ai-coo/ui";
import { ClipboardList, MessageSquarePlus } from "lucide-react";

export function InputsPageTabs({
  isFounder,
  weeklyContent,
  teamContent,
}: {
  isFounder: boolean;
  weeklyContent: React.ReactNode;
  teamContent: React.ReactNode;
}) {
  return (
    <Tabs defaultValue={isFounder ? "weekly" : "team"} className="space-y-6">
      <TabsList className="h-auto gap-1 bg-transparent p-0">
        <TabsTrigger
          value="weekly"
          className="gap-2 rounded-lg border data-[state=active]:border-violet-500/50 data-[state=active]:bg-violet-500/10 data-[state=active]:text-violet-600 dark:data-[state=active]:text-violet-400"
        >
          <ClipboardList className="h-3.5 w-3.5" />
          Por departamento
        </TabsTrigger>
        <TabsTrigger
          value="team"
          className="gap-2 rounded-lg border data-[state=active]:border-violet-500/50 data-[state=active]:bg-violet-500/10 data-[state=active]:text-violet-600 dark:data-[state=active]:text-violet-400"
        >
          <MessageSquarePlus className="h-3.5 w-3.5" />
          Input rápido
        </TabsTrigger>
      </TabsList>

      <TabsContent value="weekly">{weeklyContent}</TabsContent>
      <TabsContent value="team">{teamContent}</TabsContent>
    </Tabs>
  );
}
