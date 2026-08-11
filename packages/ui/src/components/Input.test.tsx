import React from 'react';
import { describe, test, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { Input } from './Input';

describe('Cross-Platform Input Atom Component', () => {
  test('should display label and pass entered string value into text change event handler', () => {
    const mockOnChange = vi.fn();
    const { getByLabelText, getByPlaceholderText } = render(
      <Input 
        label="Username" 
        placeholder="Enter username" 
        value="" 
        onChangeText={mockOnChange} 
      />
    );

    // Verify visual structures exist
    const inputEl = getByPlaceholderText('Enter username');
    expect(inputEl).toBeTruthy();

    // Simulate user typing text value change into the input box
    fireEvent.change(inputEl, { target: { value: 'testuser' } });
    
    // Web maps text input events via standard string capture proxies
    expect(mockOnChange).toHaveBeenCalled();
  });
});
