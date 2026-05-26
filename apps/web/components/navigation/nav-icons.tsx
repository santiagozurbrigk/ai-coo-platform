import {
  Activity,
  BookOpen,
  Brain,
  Briefcase,
  Crown,
  FileBarChart,
  LayoutDashboard,
  MessageSquare,
  Plug,
  Settings,
  Shield,
  Sparkles,
  Users,
  Wallet,
  Megaphone,
  type LucideIcon,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  "layout-dashboard": LayoutDashboard,
  wallet: Wallet,
  megaphone: Megaphone,
  "message-square": MessageSquare,
  activity: Activity,
  "file-bar-chart": FileBarChart,
  "book-open": BookOpen,
  brain: Brain,
  briefcase: Briefcase,
  sparkles: Sparkles,
  plug: Plug,
  users: Users,
  settings: Settings,
  crown: Crown,
  shield: Shield,
};

export function NavIcon({
  name,
  className = "h-4 w-4 shrink-0",
}: {
  name: string;
  className?: string;
}) {
  const Icon = ICON_MAP[name] ?? LayoutDashboard;
  return <Icon className={className} />;
}
