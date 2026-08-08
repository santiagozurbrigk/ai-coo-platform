"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@ai-coo/ui";
import { CalendarDays, CalendarRange, History } from "lucide-react";

export function ReportesPageTabs({
  weeklyContent,
  monthlyContent,
  historyContent,
}: {
  weeklyContent: React.ReactNode;
  monthlyContent: React.ReactNode;
  historyContent: React.ReactNode;
}) {
  return (
    <Tabs defaultValue="weekly" className="space-y-6">
      <TabsList className="h-auto gap-1 bg-transparent p-0">
        <TabsTrigger
          value="weekly"
          className="gap-2 rounded-lg border data-[state=active]:border-violet-500/50 data-[state=active]:bg-violet-500/10 data-[state=active]:text-violet-600 dark:data-[state=active]:text-violet-400"
        >
          <CalendarDays className="h-3.5 w-3.5" />
          Semanal
        </TabsTrigger>
        <TabsTrigger
          value="monthly"
          className="gap-2 rounded-lg border data-[state=active]:border-violet-500/50 data-[state=active]:bg-violet-500/10 data-[state=active]:text-violet-600 dark:data-[state=active]:text-violet-400"
        >
          <CalendarRange className="h-3.5 w-3.5" />
          Mensual
        </TabsTrigger>
        <TabsTrigger
          value="history"
          className="gap-2 rounded-lg border data-[state=active]:border-violet-500/50 data-[state=active]:bg-violet-500/10 data-[state=active]:text-violet-600 dark:data-[state=active]:text-violet-400"
        >
          <History className="h-3.5 w-3.5" />
          Historial
        </TabsTrigger>
      </TabsList>

      <TabsContent value="weekly">{weeklyContent}</TabsContent>
      <TabsContent value="monthly">{monthlyContent}</TabsContent>
      <TabsContent value="history">{historyContent}</TabsContent>
    </Tabs>
  );
}
