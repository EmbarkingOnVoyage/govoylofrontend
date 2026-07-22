import React from 'react';
import { describe, test, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Card } from './Card';
import { Text } from './Text';

describe('Cross-Platform Card Container Component', () => {
  test('should embed wrapped children components perfectly within its structural borders', () => {
    const { getByText } = render(
      <Card>
        <Text>Card Content Body Text</Text>
      </Card>
    );
    expect(getByText('Card Content Body Text')).toBeTruthy();
  });
});
