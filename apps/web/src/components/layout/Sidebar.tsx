"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cx } from "@/components/common/ui";

type IconProps = {
  className?: string;
};

function DashboardIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 13h6V4H4v9ZM14 20h6V4h-6v16ZM4 20h6v-3H4v3Z" />
    </svg>
  );
}

function TestIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M9 3h6M10 3v5l-5 9a3 3 0 0 0 2.6 4.5h8.8A3 3 0 0 0 19 17L14 8V3M8 15h8" />
    </svg>
  );
}

function RunsIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="m5 12 5 5L20 7M4 6h8M4 18h6" />
    </svg>
  );
}

function AnalyticsIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 19V5M8 17v-6M13 17V7M18 17v-3M4 19h17" />
    </svg>
  );
}

function SettingsIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7ZM19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.4 1a7 7 0 0 0-2-1.2L14.2 3h-4.4l-.4 2.7a7 7 0 0 0-2 1.2l-2.4-1-2 3.4 2 1.5A7 7 0 0 0 5 12c0 .4 0 .8.1 1.2l-2 1.5 2 3.4 2.4-1a7 7 0 0 0 2 1.2l.4 2.7h4.4l.4-2.7a7 7 0 0 0 2-1.2l2.4 1 2-3.4-2-1.5c.1-.4.1-.8.1-1.2Z" />
    </svg>
  );
}

const links = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: DashboardIcon,
  },

  {
    href: "/test-cases",
    label: "Test Inventory",
    icon: TestIcon,
  },

  {
    href: "/runs",
    label: "Run History",
    icon: RunsIcon,
  },

  {
    href: "/analytics",
    label: "Analytics",
    icon: AnalyticsIcon,
  },

  {
    href: "/settings",
    label: "Settings",
    icon: SettingsIcon,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950 lg:block">
      <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-800">
        <h1 className="text-base font-semibold text-gray-950 dark:text-gray-50">
          Assertive
        </h1>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Test management
        </p>
      </div>

      <nav className="flex flex-col gap-1 p-3" aria-label="Primary">
        {links.map((link) => {
          const active =
            pathname === link.href || pathname.startsWith(`${link.href}/`);
          const Icon = link.icon;

          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={cx(
                "flex items-center gap-3 rounded-md border-l-2 px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "border-blue-600 bg-blue-50 text-blue-700 dark:border-blue-500 dark:bg-blue-950/40 dark:text-blue-300"
                  : "border-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-950 dark:text-gray-300 dark:hover:bg-gray-900 dark:hover:text-white",
              )}
            >
              <Icon className="h-4 w-4 stroke-current stroke-2" />
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="absolute bottom-0 w-64 border-t border-gray-200 p-4 dark:border-gray-800">
        <p className="text-xs text-gray-500 dark:text-gray-400">Assertive V1</p>
      </div>
    </aside>
  );
}
