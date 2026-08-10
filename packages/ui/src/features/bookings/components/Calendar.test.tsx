import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { Platform } from "react-native";
import { Calendar } from "./Calendar";

// Safely intercept the flow-typed native third-party file before parsing
vi.mock("@react-native-community/datetimepicker", () => {
  return {
    default: function MockPicker({ value, onChange }: any) {
      return (
        <div data-testid="mocked-native-picker">
          <span data-testid="picker-value">{value.toISOString()}</span>
          <button
            data-testid="picker-trigger-change"
            onClick={() => {
              const targetDate = new Date(value);
              targetDate.setDate(targetDate.getDate() + 2);
              onChange({ type: "set" }, targetDate);
            }}
          >
            Trigger Native Select
          </button>
        </div>
      );
    }
  };
});

describe("Calendar Component Architectural & Platform Matrix", () => {
  const mockOnDateChange = vi.fn();
  const baseDate = new Date("2026-07-24T12:00:00.000Z");

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Gracefully return global application platform variables to default states
    Object.defineProperty(Platform, "OS", { value: "ios", writable: true });
  });

  // ==========================================
  // 1. MOBILE NATIVE SUBSYSTEM VALIDATION
  // ==========================================
  describe("Mobile Platform Slicing Contract", () => {
    beforeEach(() => {
      Object.defineProperty(Platform, "OS", { value: "android", writable: true });
    });

    it("should process target selection events and verify the Android auto-close invariant", () => {
      // Enforce web engine casing parameters strictly: getByTestId (lowercase 'd')
      const { getByLabelText, getByTestId, getByText, queryByTestId } = render(
        <Calendar onDateChange={mockOnDateChange} minDate={baseDate} />
      );

      const checkInTarget = getByLabelText("Select check in date");
      fireEvent.click(checkInTarget);

      const nativePicker = getByTestId("mocked-native-picker");
      expect(nativePicker).toBeTruthy();
      expect(getByTestId("picker-value").textContent).toBe(baseDate.toISOString());

      const triggerButton = getByTestId("picker-trigger-change");
      fireEvent.click(triggerButton);

      expect(getByText("26 Jul 2026")).toBeTruthy();
      expect(mockOnDateChange).toHaveBeenCalled();

      // Android UI Contract Check: Picker container layout must be removed immediately on select
      expect(queryByTestId("mocked-native-picker")).toBeNull();
    });

    it("should preserve the open picker layout state when running on iOS", () => {
      Object.defineProperty(Platform, "OS", { value: "ios", writable: true });

      const { getByLabelText, getByTestId } = render(
        <Calendar onDateChange={mockOnDateChange} minDate={baseDate} />
      );

      const checkInTarget = getByLabelText("Select check in date");
      fireEvent.click(checkInTarget);

      const triggerButton = getByTestId("picker-trigger-change");
      fireEvent.click(triggerButton);

      // iOS UI Contract Check: Selection components remain active inline
      expect(getByTestId("mocked-native-picker")).toBeTruthy();
    });
  });

  // ==========================================
  // 2. WEB DOM SUBSYSTEM VALIDATION
  // ==========================================
  describe("Web Browser Dom Slicing Contract", () => {
    beforeEach(() => {
      Object.defineProperty(Platform, "OS", { value: "web", writable: true });
    });

    it("should fall back to standard HTML5 input blocks and verify native event channels", () => {
      const { getByLabelText, getByTestId } = render(
        <Calendar onDateChange={mockOnDateChange} minDate={baseDate} />
      );

      const checkInTarget = getByLabelText("Select check in date");
      fireEvent.click(checkInTarget);

      const webInputNode = getByTestId("web-checkin-input") as HTMLInputElement;
      expect(webInputNode.type).toBe("date");

      fireEvent.change(webInputNode, { target: { value: "2026-07-28" } });
      expect(mockOnDateChange).toHaveBeenCalled();
    });
  });

  // ==========================================
  // 3. BUSINESS VALIDATION LOGIC CONTRACTS
  // ==========================================
  describe("Domain Invariant Rule Enforcement", () => {
    it("should adjust checkout date automatically to keep it chronologically after check-in", () => {
      Object.defineProperty(Platform, "OS", { value: "ios", writable: true });
      const { getByLabelText, getByTestId, getByText } = render(
        <Calendar onDateChange={mockOnDateChange} minDate={baseDate} />
      );

      expect(getByText("25 Jul 2026")).toBeTruthy();

      fireEvent.click(getByLabelText("Select check in date"));
      
      const triggerButton = getByTestId("picker-trigger-change");
      fireEvent.click(triggerButton);

      // Business Rule Invariant Check: Checkout changes to July 27 to preserve date integrity
      expect(getByText("27 Jul 2026")).toBeTruthy();
    });
  });
});
