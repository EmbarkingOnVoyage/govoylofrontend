import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { AutoCompleteDropdown } from "./AutoCompleteDropdown";

describe("Generic Component Contract: AutoCompleteDropdown", () => {
  it("should process structural filtering and item selection with a simple string array", () => {
    const mockOnSelect = vi.fn();
    const stringDataset = ["London", "New York", "Paris", "Tokyo"];

    const { getByPlaceholderText, getByLabelText, queryByText } = render(
      <AutoCompleteDropdown<string>
        data={stringDataset}
        placeholder="Select destination"
        onSelect={mockOnSelect}
        labelExtractor={(item) => item}
        keyExtractor={(item) => item}
      />
    );

    const inputElement = getByPlaceholderText("Select destination") as HTMLInputElement;
    expect(inputElement).toBeTruthy();

    // Type a search query to filter the dataset
    fireEvent.change(inputElement, { target: { value: "Lon" } });

    // Verify filter logic matched and displayed correct options
    const filteredSelection = getByLabelText("Select London");
    expect(filteredSelection).toBeTruthy();
    expect(queryByText("Paris")).toBeNull(); // Shaken away via filter criteria

    // Execute selection item event tap
    fireEvent.click(filteredSelection);

    // Verify state updates and parent notification pipeline contracts match
    expect(inputElement.value).toBe("London");
    expect(mockOnSelect).toHaveBeenCalledWith("London");
  });

  it("should support complex domain object structures cleanly using custom extractors", () => {
    interface LocationModel {
      id: number;
      name: string;
      code: string;
    }

    const mockOnSelect = vi.fn();
    const objectDataset: LocationModel[] = [
      { id: 101, name: "Heathrow Airport", code: "LHR" },
      { id: 102, name: "John F Kennedy Airport", code: "JFK" }
    ];

    const { getByPlaceholderText, getByLabelText } = render(
      <AutoCompleteDropdown<LocationModel>
        data={objectDataset}
        placeholder="Select Airport"
        onSelect={mockOnSelect}
        labelExtractor={(item) => `${item.name} (${item.code})`}
        keyExtractor={(item) => item.id.toString()}
      />
    );

    const inputElement = getByPlaceholderText("Select Airport");
    fireEvent.change(inputElement, { target: { value: "JFK" } });

    const targetedSelection = getByLabelText("Select John F Kennedy Airport (JFK)");
    fireEvent.click(targetedSelection);

    expect(mockOnSelect).toHaveBeenCalledWith({ id: 102, name: "John F Kennedy Airport", code: "JFK" });
  });
});
