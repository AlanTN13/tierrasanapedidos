import type { ReactNode } from "react";

type PageHeaderProps = {
  kicker?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
};

export function PageHeader({
  kicker = "Backoffice",
  title,
  description,
  actions,
}: PageHeaderProps) {
  return (
    <header className="admin-page-header">
      <div>
        <span className="section-kicker">{kicker}</span>
        <h1 className="mt-3 font-display text-4xl font-semibold text-olive-dark">{title}</h1>
        {description ? (
          <p className="mt-2 max-w-3xl text-sm leading-6 text-foreground/66">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
    </header>
  );
}
