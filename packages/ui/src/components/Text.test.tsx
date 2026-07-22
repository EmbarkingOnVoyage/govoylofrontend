import React from 'react';
import { describe, test, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Text } from './Text';

describe('Cross-Platform Text Atom Component', () => {
  test('should render children text layout correctly', () => {
    const { getByText } = render(<Text variant="title">Govoylo Title</Text>);
    expect(getByText('Govoylo Title')).toBeTruthy();
  });
});
