import { ProjectSelector } from "../projects/ProjectSelector";
import { getProjects } from "@/lib/api";
import { getCurrentProjectId } from "@/lib/project-cookie";
import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";

const mobileLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/test-cases", label: "Tests" },
  { href: "/runs", label: "Runs" },
  { href: "/analytics", label: "Analytics" },
  { href: "/settings", label: "Settings" },
];

export async function Header() {
  const [projects, selected] = await Promise.all([
    getProjects(),
    getCurrentProjectId(),
  ]);

  return (
    <header className="sticky top-0 z-10 border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950">
      <div className="flex min-h-16 items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-gray-950 dark:text-gray-50">
            Assertive
          </div>
          <div className="truncate text-xs text-gray-500 dark:text-gray-400">
            Test Management Platform
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 sm:inline">
            Project
          </span>
          <ProjectSelector projects={projects} selected={selected} />
          <ThemeToggle />
        </div>
      </div>

      <nav
        className="flex gap-1 overflow-x-auto border-t border-gray-200 px-3 py-2 dark:border-gray-800 lg:hidden"
        aria-label="Primary"
      >
        {mobileLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-950 dark:text-gray-300 dark:hover:bg-gray-900 dark:hover:text-white"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
