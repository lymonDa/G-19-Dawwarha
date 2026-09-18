import { describe, it, expect } from 'vitest';
import { BadgeComponent } from './badge.component';

describe('BadgeComponent', () => {
  it('should initialize with default inputs', () => {
    const component = new BadgeComponent();
    expect(component.variant).toBe('neutral');
    expect(component.size).toBe('md');
    expect(component.dot).toBe(false);
  });

  it('should return correct badgeClasses for various variants', () => {
    const component = new BadgeComponent();
    component.variant = 'success';
    expect(component.badgeClasses).toContain('bg-success-bg');

    component.variant = 'danger';
    expect(component.badgeClasses).toContain('bg-danger-bg');

    component.size = 'sm';
    expect(component.badgeClasses).toContain('px-2');
  });

  it('should return matching dot class for variant', () => {
    const component = new BadgeComponent();
    component.variant = 'warning';
    expect(component.dotClass).toBe('bg-warning');

    component.variant = 'danger';
    expect(component.dotClass).toBe('bg-danger');
  });
});
