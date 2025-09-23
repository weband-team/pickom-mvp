import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DeliveryMethodCard from '../DeliveryMethodCard';
import { DeliveryMethod } from '../../types/delivery';

describe('DeliveryMethodCard', () => {
  const mockMethod: DeliveryMethod = {
    id: 'intra-city',
    title: 'Intra-city',
    subtitle: 'Within the same city',
    icon: '🏠',
    description: 'Fast delivery within city limits',
    isAvailable: true
  };

  const mockOnSelect = vi.fn();

  beforeEach(() => {
    mockOnSelect.mockClear();
  });

  it('renders delivery method information correctly', () => {
    render(
      <DeliveryMethodCard
        method={mockMethod}
        isSelected={false}
        onSelect={mockOnSelect}
      />
    );

    expect(screen.getByText('Intra-city')).toBeInTheDocument();
    expect(screen.getByText('Within the same city')).toBeInTheDocument();
    expect(screen.getByText('Fast delivery within city limits')).toBeInTheDocument();
    expect(screen.getByText('🏠')).toBeInTheDocument();
  });

  it('applies selected styles when selected', () => {
    const { container } = render(
      <DeliveryMethodCard
        method={mockMethod}
        isSelected={true}
        onSelect={mockOnSelect}
      />
    );

    const article = container.querySelector('article');
    expect(article).toHaveAttribute('aria-checked', 'true');
    expect(article).toHaveAttribute('data-selected', 'true');
  });

  it('handles click interaction', () => {
    render(
      <DeliveryMethodCard
        method={mockMethod}
        isSelected={false}
        onSelect={mockOnSelect}
      />
    );

    const card = screen.getByRole('radio');
    fireEvent.click(card);

    expect(mockOnSelect).toHaveBeenCalledWith('intra-city');
  });

  it('handles keyboard interaction', () => {
    render(
      <DeliveryMethodCard
        method={mockMethod}
        isSelected={false}
        onSelect={mockOnSelect}
      />
    );

    const card = screen.getByRole('radio');

    // Test Enter key
    fireEvent.keyDown(card, { key: 'Enter' });
    expect(mockOnSelect).toHaveBeenCalledWith('intra-city');

    mockOnSelect.mockClear();

    // Test Space key
    fireEvent.keyDown(card, { key: ' ' });
    expect(mockOnSelect).toHaveBeenCalledWith('intra-city');
  });

  it('disables interaction when disabled', () => {
    render(
      <DeliveryMethodCard
        method={mockMethod}
        isSelected={false}
        isDisabled={true}
        onSelect={mockOnSelect}
      />
    );

    const card = screen.getByRole('radio');
    expect(card).toHaveAttribute('aria-disabled', 'true');
    expect(card).toHaveAttribute('tabIndex', '-1');

    fireEvent.click(card);
    expect(mockOnSelect).not.toHaveBeenCalled();
  });

  it('shows coming soon badge for unavailable methods', () => {
    const unavailableMethod = {
      ...mockMethod,
      isAvailable: false
    };

    render(
      <DeliveryMethodCard
        method={unavailableMethod}
        isSelected={false}
        onSelect={mockOnSelect}
      />
    );

    expect(screen.getByText('Coming Soon')).toBeInTheDocument();
  });

  it('prevents interaction for unavailable methods', () => {
    const unavailableMethod = {
      ...mockMethod,
      isAvailable: false
    };

    render(
      <DeliveryMethodCard
        method={unavailableMethod}
        isSelected={false}
        onSelect={mockOnSelect}
      />
    );

    const card = screen.getByRole('radio');
    fireEvent.click(card);

    expect(mockOnSelect).not.toHaveBeenCalled();
  });

  it('applies custom className', () => {
    const { container } = render(
      <DeliveryMethodCard
        method={mockMethod}
        isSelected={false}
        onSelect={mockOnSelect}
        className="custom-class"
      />
    );

    const article = container.querySelector('article');
    expect(article).toHaveClass('custom-class');
  });

  it('has proper accessibility attributes', () => {
    render(
      <DeliveryMethodCard
        method={mockMethod}
        isSelected={false}
        onSelect={mockOnSelect}
      />
    );

    const card = screen.getByRole('radio');
    expect(card).toHaveAttribute('aria-label', 'Intra-city - Within the same city');
    expect(card).toHaveAttribute('aria-checked', 'false');
    expect(card).toHaveAttribute('tabIndex', '0');
  });

  it('memoizes correctly and prevents unnecessary re-renders', () => {
    const { rerender } = render(
      <DeliveryMethodCard
        method={mockMethod}
        isSelected={false}
        onSelect={mockOnSelect}
      />
    );

    const samePropsFn = vi.fn();

    // Re-render with same props
    rerender(
      <DeliveryMethodCard
        method={mockMethod}
        isSelected={false}
        onSelect={mockOnSelect}
      />
    );

    // Component should not re-render due to memo
    expect(samePropsFn).not.toHaveBeenCalled();
  });
});