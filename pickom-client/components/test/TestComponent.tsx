import React from 'react';

export interface TestComponentProps {
  text?: string;
}

export const TestComponent: React.FC<TestComponentProps> = ({ text = 'Hello World' }) => {
  return <div>{text}</div>;
};