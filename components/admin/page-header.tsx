import type { ReactNode } from "react";

type PageHeaderProps = {
  kicker?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
};

export function PageHeader({
  kicker = "Gestión comercial",
  title,
  description,
  actions,
}: PageHeaderProps) {
  return (
    <header className="admin-page-header">
      <div>
        <span className="section-kicker">{kicker}</span>
        <h1 className="admin-page-title">{title}</h1>
        {description ? (
          <p className="admin-page-description">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="admin-page-actions">{actions}</div> : null}
    </header>
  );
}
