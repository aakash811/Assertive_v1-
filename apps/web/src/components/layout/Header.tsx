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
    <header className="sticky top-0 z-10 border-b border-border bg-surface-raised/80 backdrop-blur-sm">
      <div className="flex min-h-16 items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-foreground">
            Assertive
          </div>
          <div className="truncate text-xs text-muted">
            Test Management Platform
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden text-xs font-medium uppercase tracking-wide text-muted sm:inline">
            Project
          </span>
          <ProjectSelector projects={projects} selected={selected} />
          <ThemeToggle />
        </div>
      </div>

      <nav
        className="flex gap-1 overflow-x-auto border-t border-border px-3 py-2 lg:hidden"
        aria-label="Primary"
      >
        {mobileLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium text-muted hover:bg-surface-raised hover:text-foreground"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
