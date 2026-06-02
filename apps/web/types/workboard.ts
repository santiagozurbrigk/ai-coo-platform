export type TaskArea =
  | "marketing"
  | "ventas"
  | "operaciones"
  | "finanzas"
  | "clientes"
  | "general";

export type TaskPriority = "low" | "medium" | "high";

export type WorkboardAssignee = {
  id: string;
  name: string;
  initials: string;
};

export type WorkboardTask = {
  id: string;
  title: string;
  description: string;
  area: TaskArea;
  priority: TaskPriority;
  assignee?: WorkboardAssignee;
  dueDate?: string;
  tags: string[];
};

export type WorkboardColumn = {
  id: string;
  title: string;
  tasks: WorkboardTask[];
};
