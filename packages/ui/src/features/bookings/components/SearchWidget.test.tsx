import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { SearchWidget } from "./SearchWidget";

// 1. Stub out API module boundaries to control state injection profiles
vi.mock("@workspace/api", () => {
  return {
    useLocations: vi.fn(() => ({
      data: ["Mumbai", "Delhi", "Bangalore"],
      isLoading: false,
      isError: false,
    })),
  };
});

// Avoid native picker parsing crashes in tests
vi.mock("@react-native-community/datetimepicker", () => {
  return { default: () => <div data-testid="native-picker" /> };
});

describe("Feature Component Contract: SearchWidget Pipeline", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should verify integrated selection flow and call submission handler on complete inputs", () => {
    const mockOnSubmit = vi.fn();
    const { getByPlaceholderText, getByLabelText, getByText } = render(
      <SearchWidget onSearchSubmit={mockOnSubmit} />
    );

    // 2. Simulate User selecting "From" destination city
    const fromInput = getByPlaceholderText("From");
    fireEvent.change(fromInput, { target: { value: "Mumbai" } });
    fireEvent.click(getByLabelText("Select Mumbai"));

    // 3. Simulate User selecting "To" destination city
    const toInput = getByPlaceholderText("To");
    fireEvent.change(toInput, { target: { value: "Delhi" } });
    fireEvent.click(getByLabelText("Select Delhi"));

    // 4. Click Action Button to submit the selected criteria
    const submitActionBtn = getByText("Search");
    fireEvent.click(submitActionBtn);

    // 5. Invariant Assertion Contract Checking
    expect(mockOnSubmit).toHaveBeenCalledWith({
      fromCity: "Mumbai",
      toCity: "Delhi",
      startDate: expect.any(Date),
      endDate: expect.any(Date),
    });
  });
});
