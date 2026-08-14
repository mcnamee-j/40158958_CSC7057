import { format_label } from "../src/utils/format";

describe("format_label", () => {
  it("replaces underscores with spaces and capitalises each word", () => {
    expect(format_label("pharmacy_staff")).toBe("Pharmacy Staff");
  });

  it("capitalises a single word correctly", () => {
    expect(format_label("resolved")).toBe("Resolved");
  });
});
