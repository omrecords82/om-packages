import type { WorkshopError, WorkshopErrorCode } from "@om/workshop-contracts";

import { createWorkshopError } from "@om/workshop-contracts";

export class WorkshopSdkError extends Error {
  readonly code: WorkshopErrorCode;
  readonly correlationId?: string;
  readonly details?: Readonly<Record<string, unknown>>;

  constructor(error: WorkshopError) {
    super(error.message);
    this.name = "WorkshopSdkError";
    this.code = error.code;
    if (error.correlationId !== undefined) {
      this.correlationId = error.correlationId;
    }
    if (error.details !== undefined) {
      this.details = error.details;
    }
  }

  toDTO(): WorkshopError {
    return createWorkshopError(this.code, this.message, {
      ...(this.correlationId ? { correlationId: this.correlationId } : {}),
      ...(this.details ? { details: this.details } : {})
    });
  }
}

export function toSdkError(
  code: WorkshopErrorCode,
  message: string,
  correlationId?: string,
  details?: Readonly<Record<string, unknown>>
): WorkshopSdkError {
  return new WorkshopSdkError(
    createWorkshopError(code, message, {
      ...(correlationId ? { correlationId } : {}),
      ...(details ? { details } : {})
    })
  );
}
