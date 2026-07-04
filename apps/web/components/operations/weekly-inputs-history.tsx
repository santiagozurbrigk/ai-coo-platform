"use client";

import { useEffect, useState, useTransition } from "react";
import {
  getWeeklyInputsForWeekAction,
  getWeeklyInputsHistoryAction,
} from "@/app/operations/actions";
import { mapWeeklyInputRowsToTeamInputs } from "@/lib/operations/weekly-input-mapper";
import { formatWeekRange } from "@/lib/operations/weekly-utils";
import { Panel } from "@/components/shared/panel";
import { WeeklyInputsList } from "./weekly-inputs-list";

export function WeeklyInputsHistory({
  currentWeekStart,
}: {
  currentWeekStart: string;
}) {
  const [weeks, setWeeks] = useState<string[]>([]);
  const [selectedWeek, setSelectedWeek] = useState(currentWeekStart);
  const [loading, startLoad] = useTransition();

  useEffect(() => {
    void getWeeklyInputsHistoryAction().then((history) => {
      const unique = history.length > 0 ? history : [currentWeekStart];
      setWeeks(unique);
      if (!unique.includes(selectedWeek)) {
        setSelectedWeek(unique[0] ?? currentWeekStart);
      }
    });
  }, [currentWeekStart, selectedWeek]);

  const [inputs, setInputs] = useState(
    mapWeeklyInputRowsToTeamInputs([])
  );

  useEffect(() => {
    startLoad(async () => {
      const rows = await getWeeklyInputsForWeekAction(selectedWeek);
      setInputs(mapWeeklyInputRowsToTeamInputs(rows));
    });
  }, [selectedWeek]);

  if (weeks.length <= 1 && inputs.length === 0) return null;

  return (
    <Panel title="Historial de inputs">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <label htmlFor="week-history" className="text-xs text-muted-foreground">
          Semana:
        </label>
        <select
          id="week-history"
          className="h-9 rounded-md border border-border bg-background px-3 text-sm"
          value={selectedWeek}
          onChange={(e) => setSelectedWeek(e.target.value)}
          disabled={loading}
        >
          {weeks.map((week) => (
            <option key={week} value={week}>
              {formatWeekRange(week)}
            </option>
          ))}
        </select>
      </div>
      <WeeklyInputsList
        inputs={inputs}
        editable
        onChanged={() => {
          void getWeeklyInputsForWeekAction(selectedWeek).then((rows) => {
            setInputs(mapWeeklyInputRowsToTeamInputs(rows));
          });
        }}
      />
    </Panel>
  );
}
