import type { ReactNode } from "react";

import { ModuleHeader } from "../ModuleHeader/ModuleHeader.js";

export type ModulePageProps = {
  readonly title: string;
  readonly description?: string;
  readonly actions?: ReactNode;
  readonly children: ReactNode;
};

export function ModulePage({ title, description, actions, children }: ModulePageProps) {
  return (
    <section className="om-module-page" data-om-module-page="">
      <ModuleHeader
        title={title}
        {...(description === undefined ? {} : { description })}
        {...(actions === undefined ? {} : { actions })}
      />
      <div className="om-module-page__body">{children}</div>
    </section>
  );
}
