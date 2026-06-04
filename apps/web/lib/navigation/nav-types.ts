export type NavItem = {
  label: string;
  href: string;
  icon?: string;
  badge?: number;
  children?: NavItem[];
};
