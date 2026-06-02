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
  createdAt: string;
  updatedAt: string;
};

export type WorkboardColumn = {
  id: string;
  title: string;
  tasks: WorkboardTask[];
};
