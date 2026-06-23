"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  {
    href: "/dashboard",
    label: "📊 Dashboard",
  },

  {
    href: "/test-cases",
    label: "🧪 Test Cases",
  },

  {
    href: "/runs",
    label: "🏃 Runs",
  },

  {
    href: "/analytics",
    label: "📈 Analytics",
  },

  {
    href: "/settings",
    label: "⚙️ Settings",
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r bg-gray-900">
      <div className="border-b p-6">
        <h1 className="text-xl font-bold text-amber-400">Assertive</h1>
      </div>

      <nav className="flex flex-col gap-1 p-4">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`
              rounded-md px-3 py-2 transition-colors

              ${
                pathname === link.href
                  ? "bg-gray-800 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }
            `}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
