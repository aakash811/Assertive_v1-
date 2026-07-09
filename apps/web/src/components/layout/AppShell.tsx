import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
type Props = {
  children: ReactNode;
};

export function AppShell({ children }: Props) {
  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-950 dark:bg-gray-950 dark:text-gray-50">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header />

        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-screen-2xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
