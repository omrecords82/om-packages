export type ModuleLoadingStateProps = {
  readonly label?: string;
};

export function ModuleLoadingState({ label = "Loading module…" }: ModuleLoadingStateProps) {
  return (
    <div className="om-module-state" role="status" aria-live="polite" data-state="loading">
      <p className="om-module-state__title">{label}</p>
    </div>
  );
}
