export type ModuleEmptyState = {
  readonly kind: "empty";
  readonly title: string;
  readonly message?: string;
};

export type ModuleErrorState = {
  readonly kind: "error";
  readonly title: string;
  readonly message: string;
  readonly code?: string;
};

export type ModuleUnavailableState = {
  readonly kind: "unavailable";
  readonly title: string;
  readonly message: string;
  readonly capabilityId?: string;
};

export type ModuleViewState = ModuleEmptyState | ModuleErrorState | ModuleUnavailableState;

export function createEmptyState(title: string, message?: string): ModuleEmptyState {
  return message === undefined ? { kind: "empty", title } : { kind: "empty", title, message };
}

export function createErrorState(title: string, message: string, code?: string): ModuleErrorState {
  return code === undefined
    ? { kind: "error", title, message }
    : { kind: "error", title, message, code };
}
