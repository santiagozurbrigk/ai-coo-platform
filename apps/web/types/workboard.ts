export type SprintAreaFocus =
  | "ventas"
  | "marketing"
  | "operaciones"
  | "delivery"
  | "producto"
  | "general";

export type SprintStatus = "planning" | "active" | "completed";

export type TaskArea =
  | "marketing"
  | "ventas"
  | "operaciones"
  | "finanzas"
  | "clientes"
  | "general";

export type TaskStatus = "todo" | "in_progress" | "review" | "done";

export type TaskPriority = "low" | "medium" | "high";

export type WorkboardMember = {
  id: string;
  name: string;
  email: string;
  role: string;
  initials: string;
};

export type WorkboardAssignee = {
  id: string;
  name: string;
  initials: string;
};

export type WorkboardTask = {
  id: string;
  status: TaskStatus;
  title: string;
  description: string;
  area: TaskArea;
  priority: TaskPriority;
  assignee?: WorkboardAssignee;
  assigneeId?: string | null;
  dueDate?: string;
  tags: string[];
  position: number;
  estimatedMinutes?: number;
  actualMinutes?: number;
  sprintId?: string | null;
  launchId?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type WorkboardColumn = {
  id: string;
  title: string;
  tasks: WorkboardTask[];
};

export type TaskTimeKind = "strategic" | "operational";

export type MemberTaskTimeEntry = {
  taskId: string;
  title: string;
  hours: number;
  kind: TaskTimeKind;
  estimatedMinutes?: number;
  variancePercent?: number;
};

export type WorkboardSprint = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  completedTasks: number;
  totalTasks: number;
  goal: string;
  areaFocus?: SprintAreaFocus;
  status: SprintStatus;
  completionRate: number;
  totalMinutesLogged?: number;
};

export type MemberTimeReport = {
  memberId: string;
  name: string;
  initials: string;
  avatarColor: string;
  avatarUrl?: string;
  totalHours: number;
  strategicPercent: number;
  operationalPercent: number;
  topTasks: MemberTaskTimeEntry[];
  totalCostUsd?: number;
  hourlyRate?: number;
  currency?: string;
};
