import { is_old } from "../src/components/ui/BadgeHelper";

describe("is_old", () => {
  it("returns false for a new query under the threshold", () => {
    expect(is_old("new", 60 * 60)).toBe(false); // 1 hour
  });

  it("returns true for a new query over the threshold", () => {
    expect(is_old("new", 25 * 60 * 60)).toBe(true); // 25 hours
  });

  it("returns false exactly at the threshold boundary", () => {
    expect(is_old("new", 24 * 60 * 60)).toBe(false); // exactly 24 hours - on boundary
  });

  it("returns true for any non-resolved status over the threshold", () => {
    expect(is_old("in_progress", 25 * 60 * 60)).toBe(true);
    expect(is_old("awaiting_response", 25 * 60 * 60)).toBe(true);
    expect(is_old("escalated", 25 * 60 * 60)).toBe(true);
  });

  it("returns false for a resolved query, regardless of elapsed time", () => {
    expect(is_old("resolved", 100 * 60 * 60)).toBe(false);
  });

  it("returns false when elapsedSeconds is undefined", () => {
    expect(is_old("new", undefined)).toBe(false);
  });
});
