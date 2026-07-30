import type { WorkshopError } from "@om/workshop-contracts";

export type CapabilityUnavailableProps = {
  readonly capabilityId: string;
  readonly message?: string;
  readonly error?: WorkshopError;
};

export function CapabilityUnavailable({
  capabilityId,
  message,
  error
}: CapabilityUnavailableProps) {
  return (
    <div
      className="om-module-state"
      role="status"
      data-state="capability-unavailable"
      data-capability={capabilityId}
    >
      <h2 className="om-module-state__title">Capability unavailable</h2>
      <p className="om-module-state__body">
        {message ??
          error?.message ??
          `The host capability '${capabilityId}' is not available for this module.`}
      </p>
    </div>
  );
}
