import { render, screen } from "@testing-library/react";
import Badge from "../src/components/ui/Badge";
import {
  priority_variant,
  priority_label,
  status_variant,
  status_label,
} from "../src/components/ui/BadgeHelper";

describe("Badge", () => {
  it("renders the given label", () => {
    render(<Badge label="High" variant="danger" />);
    expect(screen.getByText("High")).toBeInTheDocument();
  });
});

describe("badge maps", () => {
  it("has a variant and label for every priority", () => {
    (["high", "medium", "low"] as const).forEach((p) => {
      expect(priority_variant[p]).toBeDefined();
      expect(priority_label[p]).toBeDefined();
    });
  });

  it("has a variant and label for every status", () => {
    (
      [
        "new",
        "in_progress",
        "awaiting_response",
        "escalated",
        "resolved",
      ] as const
    ).forEach((s) => {
      expect(status_variant[s]).toBeDefined();
      expect(status_label[s]).toBeDefined();
    });
  });
});
