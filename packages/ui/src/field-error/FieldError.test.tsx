/* @vitest-environment jsdom */
import { cleanup, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, describe, expect, it } from "vitest";

import { FieldError } from "./FieldError.js";

afterEach(cleanup);

describe("FieldError", () => {
  it("renders error content with validation-specific state styling", () => {
    render(<FieldError id="name-error">Name is required.</FieldError>);

    const error = screen.getByText("Name is required.");
    expect(error.getAttribute("id")).toBe("name-error");
    expect(error.dataset.omInvalid).toBe("true");
    expect(error.dataset.omComponent).toBe("field-error");
  });

  it("does not render meaningless empty content", () => {
    const { container } = render(<FieldError />);

    expect(container.firstChild).toBeNull();
  });

  it("forwards ref and preserves plain class name", () => {
    const ref = createRef<HTMLElement>();
    render(
      <FieldError ref={ref} className="custom-error">
        Invalid value.
      </FieldError>
    );

    expect(ref.current?.textContent).toBe("Invalid value.");
    expect(ref.current?.classList.contains("om-field__error")).toBe(true);
    expect(ref.current?.classList.contains("custom-error")).toBe(true);
  });
});
