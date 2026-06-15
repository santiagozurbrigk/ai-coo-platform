export type LaunchStatus = "planning" | "active" | "completed" | "cancelled";

export type LaunchPostMortem = {
  summary: string;
  what_worked: string[];
  what_didnt_work: string[];
  key_learnings: string[];
  next_launch_recommendations: string[];
  overall_rating: number;
};

export type LaunchProductSummary = {
  name: string;
  type: string | null;
  price?: number | null;
  currency?: string | null;
};

export type LaunchMetric = {
  id: string;
  date: string;
  revenue: number;
  newClients: number;
  conversationsStarted: number;
  bookings: number;
};

export type LaunchSummary = {
  id: string;
  name: string;
  description: string | null;
  status: LaunchStatus;
  launchDate: string | null;
  endDate: string | null;
  goalRevenue: number | null;
  actualRevenue: number;
  goalClients: number | null;
  actualClients: number;
  product: LaunchProductSummary | null;
  taskCount: number;
  hasPostMortem: boolean;
  tags: string[];
};

export type LaunchDetail = LaunchSummary & {
  postMortem: LaunchPostMortem | null;
  postMortemGeneratedAt: string | null;
  productId: string | null;
  metrics: LaunchMetric[];
  tasks: LaunchLinkedTask[];
};

export type LaunchLinkedTask = {
  id: string;
  title: string;
  area: string;
  status: string;
  assigneeName: string | null;
  actualMinutes: number | null;
};

export type LaunchPickerOption = {
  id: string;
  name: string;
  status: LaunchStatus;
};
