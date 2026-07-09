"use client";

import { useState } from "react";
import { CheckCircle2, ClipboardList } from "lucide-react";
import { Button } from "@ai-coo/ui";
import { FathomTaskProposalModal } from "@/components/fathom/fathom-task-proposal-modal";
import type { FathomKnowledgeCall } from "@/types/business-context";
import type { FathomTaskProposal } from "@/lib/fathom/team-task-extraction";
import { isTeamMeetingCallType } from "@/lib/fathom/team-task-extraction";

type FathomCallDetailProps = {
  call: FathomKnowledgeCall;
  onTasksSent?: () => void;
};

export function FathomCallDetail({ call, onTasksSent }: FathomCallDetailProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [tasksSent, setTasksSent] = useState(Boolean(call.tasks_sent_to_board));

  const proposals = (call.ai_task_proposals ?? []) as FathomTaskProposal[];
  const isTeamMeeting = isTeamMeetingCallType(call.call_type);
  const hasProposals = proposals.length > 0;

  if (!isTeamMeeting || !hasProposals) return null;

  const handleSuccess = () => {
    setTasksSent(true);
    onTasksSent?.();
  };

  return (
    <>
      {tasksSent ? (
        <div className="mt-3 flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
            Tareas enviadas al tablero ✓
          </span>
        </div>
      ) : (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-violet-500/25 bg-violet-500/10 px-3 py-2.5">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-violet-600 dark:text-violet-400" />
            <span className="text-xs font-medium text-foreground">
              {proposals.length} tarea{proposals.length === 1 ? "" : "s"} detectada
              {proposals.length === 1 ? "" : "s"} en esta reunión
            </span>
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="border-violet-500/30 text-violet-700 hover:bg-violet-500/10 dark:text-violet-300"
            onClick={() => setModalOpen(true)}
          >
            Revisar y agregar al tablero
          </Button>
        </div>
      )}

      <FathomTaskProposalModal
        proposals={proposals}
        fathomCallId={call.id}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleSuccess}
      />
    </>
  );
}
