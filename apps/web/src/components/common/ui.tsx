import type { ReactNode } from "react";

export function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

type PageHeaderProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
};

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-950 dark:text-gray-50">
          {title}
        </h1>
        {description ? (
          <p className="mt-1 max-w-2xl text-sm text-gray-600 dark:text-gray-400">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </div>
  );
}

type SectionCardProps = {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

export function SectionCard({
  title,
  description,
  children,
  className,
}: SectionCardProps) {
  return (
    <section
      className={cx(
        "rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950",
        className,
      )}
    >
      {title || description ? (
        <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-800">
          {title ? (
            <h2 className="text-base font-semibold text-gray-950 dark:text-gray-50">
              {title}
            </h2>
          ) : null}
          {description ? (
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {description}
            </p>
          ) : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: ReactNode;
};

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="rounded-lg border border-dashed border-gray-300 bg-white px-6 py-10 text-center dark:border-gray-700 dark:bg-gray-950">
      <h2 className="text-base font-semibold text-gray-950 dark:text-gray-50">
        {title}
      </h2>
      {description ? (
        <p className="mx-auto mt-2 max-w-md text-sm text-gray-600 dark:text-gray-400">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

type ButtonProps = {
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger";
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({
  children,
  variant = "secondary",
  className,
  ...props
}: ButtonProps) {
  const variants = {
    primary:
      "border-blue-600 bg-blue-600 text-white hover:bg-blue-700 focus-visible:outline-blue-600 dark:border-blue-500 dark:bg-blue-600 dark:hover:bg-blue-500",
    secondary:
      "border-gray-300 bg-white text-gray-800 hover:bg-gray-50 focus-visible:outline-blue-600 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-200 dark:hover:bg-gray-900",
    danger:
      "border-red-600 bg-red-600 text-white hover:bg-red-700 focus-visible:outline-red-600 dark:border-red-500 dark:bg-red-600 dark:hover:bg-red-500",
  };

  return (
    <button
      {...props}
      className={cx(
        "inline-flex h-9 items-center justify-center rounded-md border px-3 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        className,
      )}
    >
      {children}
    </button>
  );
}

type SkeletonPageProps = {
  rows?: number;
};

export function SkeletonPage({ rows = 3 }: SkeletonPageProps) {
  return (
    <div className="space-y-6">
      <div className="h-8 w-56 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-28 animate-pulse rounded-lg border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-gray-900"
          />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="h-36 animate-pulse rounded-lg border border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-gray-900"
        />
      ))}
    </div>
  );
}
