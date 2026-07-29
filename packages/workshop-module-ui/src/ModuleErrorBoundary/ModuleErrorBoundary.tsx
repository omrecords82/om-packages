import type { ErrorInfo, ReactNode } from "react";

import { Component } from "react";

import { Button } from "@om/ui/button";

export type ModuleErrorBoundaryProps = {
  readonly children: ReactNode;
  readonly title?: string;
  readonly onReset?: () => void;
};

type ModuleErrorBoundaryState = {
  readonly error: Error | null;
};

export class ModuleErrorBoundary extends Component<
  ModuleErrorBoundaryProps,
  ModuleErrorBoundaryState
> {
  override state: ModuleErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ModuleErrorBoundaryState {
    return { error };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    if (typeof console !== "undefined") {
      console.error("OM Workshop module error boundary", error, info.componentStack);
    }
  }

  override render(): ReactNode {
    if (this.state.error) {
      return (
        <div className="om-module-state om-module-state--error" role="alert" data-state="error">
          <h2 className="om-module-state__title">
            {this.props.title ?? "Something went wrong in this module"}
          </h2>
          <p className="om-module-state__body">{this.state.error.message}</p>
          {this.props.onReset ? (
            <Button
              variant="secondary"
              onAction={() => {
                this.setState({ error: null });
                this.props.onReset?.();
              }}
            >
              Try again
            </Button>
          ) : null}
        </div>
      );
    }
    return this.props.children;
  }
}
