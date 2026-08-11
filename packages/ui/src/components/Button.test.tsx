import React from 'react';
import { describe, test, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Cross-Platform Button Atom Component', () => {
  test('should render the correct text label inside the button framework', () => {
    // Render our button into a simulated virtual DOM
    const { getByText } = render(
      <Button label="Click Me" onPress={() => {}} />
    );

    // Verify the label string exists on the screen layout
    expect(getByText('Click Me')).toBeTruthy();
  });

  test('should trigger the onPress constructor callback method when clicked by a user', () => {
    // Create an isolated mock tracking function (spy function)
    const mockOnPress = vi.fn();

    const { getByText } = render(
      <Button label="Submit" onPress={mockOnPress} />
    );

    // Simulate a user clicking on the button text element
    fireEvent.click(getByText('Submit'));

    // Assert that our architecture tracked exactly one execution pass
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });
});
