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
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between animate-fade-in">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {title}
        </h1>
        {description ? (
          <p className="mt-1 max-w-2xl text-sm text-muted">{description}</p>
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
        "rounded-xl border border-border bg-surface-raised shadow-sm transition-colors",
        className,
      )}
    >
      {title || description ? (
        <div className="border-b border-border px-5 py-4">
          {title ? (
            <h2 className="text-base font-semibold text-foreground">{title}</h2>
          ) : null}
          {description ? (
            <p className="mt-1 text-sm text-muted">{description}</p>
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
    <div className="rounded-xl border border-dashed border-border bg-surface px-6 py-12 text-center animate-fade-in">
      <div className="mx-auto max-w-sm">
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        {description ? (
          <p className="mx-auto mt-2 max-w-md text-sm text-muted">
            {description}
          </p>
        ) : null}
        {action ? <div className="mt-4">{action}</div> : null}
      </div>
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
      "border-accent bg-accent text-accent-foreground hover:bg-accent/90 focus-visible:outline-accent",
    secondary:
      "border-border bg-surface-raised text-foreground hover:bg-surface focus-visible:outline-accent",
    danger:
      "border-danger bg-danger text-danger-foreground hover:bg-danger/90 focus-visible:outline-danger",
  };

  return (
    <button
      {...props}
      className={cx(
        "inline-flex h-9 items-center justify-center rounded-lg border px-3 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
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
      <div className="h-8 w-56 animate-pulse rounded bg-surface-raised" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-28 animate-pulse rounded-xl border border-border bg-surface-raised"
          />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="h-36 animate-pulse rounded-xl border border-border bg-surface-raised"
        />
      ))}
    </div>
  );
}
