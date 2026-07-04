/**
 * @ai-coo/ui — AI COO Design System (Phase 0.2)
 */

// Utilities
export { cn } from "./lib/utils";

// Primitives
export { Button, buttonVariants, type ButtonProps } from "./primitives/button";
export { Badge, badgeVariants, type BadgeProps } from "./primitives/badge";
export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
} from "./primitives/card";
export { Input, type InputProps } from "./primitives/input";
export { Label } from "./primitives/label";
export { Textarea, type TextareaProps } from "./primitives/textarea";
export { Separator } from "./primitives/separator";
export { Skeleton } from "./primitives/skeleton";
export {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "./primitives/table";
export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "./primitives/dialog";
export { Tabs, TabsList, TabsTrigger, TabsContent } from "./primitives/tabs";
export {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "./primitives/tooltip";
export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuPortal,
} from "./primitives/dropdown-menu";
export { Heading, Text, Caption, Mono } from "./primitives/typography";

// Composite components
export { GlassPanel, type GlassPanelProps } from "./components/glass-panel";
export { MetricCard, type MetricCardProps, type MetricTrend } from "./components/metric-card";
export { MetricStat, type MetricStatProps } from "./components/metric-stat";
export { MetricBand, type MetricBandProps } from "./components/metric-band";
export { NotchedCard, type NotchedCardProps } from "./components/notched-card";
export {
  SteppedAlert,
  type SteppedAlertProps,
  type SteppedAlertVariant,
} from "./components/stepped-alert";
export {
  DecorativeSparkline,
  type MetricSparklinePreset,
} from "./components/decorative-sparkline";
export {
  SectionHeader,
  type SectionHeaderProps,
  type SectionHeaderVariant,
} from "./components/section-header";
export { Sparkline, type SparklineProps } from "./components/sparkline";
export { AiCard, type AiCardProps } from "./components/ai-card";
export {
  AnimatedNumber,
  MetricAnimatedValue,
  type AnimatedNumberProps,
  type MetricAnimatedValueProps,
} from "./components/animated-number";
export { Spotlight, type SpotlightProps } from "./components/spotlight";
export {
  OtcMascot,
  type OtcMascotAssets,
  type OtcMascotProps,
  type OtcMascotState,
} from "./components/otc-mascot";
export {
  StaggerFade,
  StaggerFadeItem,
  type StaggerFadeProps,
  type StaggerFadeItemProps,
} from "./components/stagger-fade";
export { usePrefersReducedMotion } from "./hooks/use-prefers-reduced-motion";
export { BarChart, type BarChartProps, type BarChartDatum } from "./components/bar-chart";
export { FormField, type FormFieldProps } from "./components/form-field";
export {
  SidebarShell,
  type SidebarShellProps,
  type SidebarNavItem,
} from "./components/sidebar-shell";
export { Topbar, type TopbarProps } from "./components/topbar";
export { DataTable, type DataTableProps, type DataTableColumn } from "./components/data-table";
