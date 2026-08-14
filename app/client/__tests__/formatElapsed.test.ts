import { time_elapsed_format } from "../src/components/ui/formatElapsed";

describe("formatElapsed", () => {
  it("formats seconds under an hour as minutes", () => {
    expect(time_elapsed_format(30 * 60)).toBe("30m ago"); // 30 minutes
  });

  it("formats seconds under a day as hours", () => {
    expect(time_elapsed_format(5 * 60 * 60)).toBe("5h ago"); // 5 hours
  });

  it("formats seconds over a day as days", () => {
    expect(time_elapsed_format(3 * 24 * 60 * 60)).toBe("3d ago"); // 3 days
  });

  it("returns an empty string when elapsedSeconds is undefined", () => {
    expect(time_elapsed_format(undefined)).toBe("");
  });
});
