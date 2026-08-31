import {
  Activity,
  BookOpen,
  Building2,
  Brain,
  Briefcase,
  CalendarCheck,
  Columns3,
  Crown,
  Layers,
  FileBarChart,
  Filter,
  LayoutDashboard,
  MessageSquare,
  Plug,
  Settings,
  Shield,
  Sparkles,
  Upload,
  UserRound,
  Users,
  Wallet,
  Megaphone,
  Rocket,
  type LucideIcon,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  "layout-dashboard": LayoutDashboard,
  wallet: Wallet,
  megaphone: Megaphone,
  "message-square": MessageSquare,
  activity: Activity,
  kanban: Columns3,
  layers: Layers,
  package: Layers,
  "file-bar-chart": FileBarChart,
  filter: Filter,
  "book-open": BookOpen,
  brain: Brain,
  briefcase: Briefcase,
  sparkles: Sparkles,
  plug: Plug,
  users: Users,
  settings: Settings,
  "calendar-check": CalendarCheck,
  crown: Crown,
  shield: Shield,
  rocket: Rocket,
  "building-2": Building2,
  "user-round": UserRound,
  upload: Upload,
};

/**
 * Nombres válidos, para que un config pueda verificarse contra el mapa.
 * `NavIcon` cae a un ícono por defecto ante un nombre desconocido, así que un
 * error de tipeo no rompe nada: pinta el ícono equivocado en silencio.
 */
export const NAV_ICON_NAMES = Object.keys(ICON_MAP);

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
