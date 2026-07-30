import type { ReactNode } from "react";

export type ModuleHeaderProps = {
  readonly title: string;
  readonly description?: string;
  readonly actions?: ReactNode;
};

export function ModuleHeader({ title, description, actions }: ModuleHeaderProps) {
  return (
    <header className="om-module-header">
      <div>
        <h1 className="om-module-header__title">{title}</h1>
        {description ? <p className="om-module-header__description">{description}</p> : null}
      </div>
      {actions ? <div className="om-module-header__actions">{actions}</div> : null}
    </header>
  );
}
