import type { NavItem } from "@/lib/navigation/nav-types";

export function isNavItemActive(
  href: string,
  pathname: string,
  children?: NavItem[]
): boolean {
  if (children?.length) {
    return children.some((child) => isPathActive(child.href, pathname));
  }
  return isPathActive(href, pathname);
}

export function isPathActive(href: string, pathname: string): boolean {
  if (pathname === href) return true;
  if (href !== "/" && pathname.startsWith(`${href}/`)) return true;
  return false;
}
