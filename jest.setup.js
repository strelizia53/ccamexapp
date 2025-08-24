import '@testing-library/jest-dom';
import React from 'react';

// Mock Next.js Link component for tests
jest.mock('next/link', () => {
  return ({ children, ...props }) => React.createElement('a', props, children);
});
