import { describe, it, expect } from 'vitest';
import { SpinnerComponent } from './spinner.component';

describe('SpinnerComponent', () => {
  it('should initialize with default inputs', () => {
    const component = new SpinnerComponent();
    expect(component.size).toBe('md');
    expect(component.color).toBe('primary');
  });

  it('should return correct sizeClass for sm, md, and lg', () => {
    const component = new SpinnerComponent();
    expect(component.sizeClass).toBe('w-5 h-5');

    component.size = 'sm';
    expect(component.sizeClass).toBe('w-4 h-4');

    component.size = 'lg';
    expect(component.sizeClass).toBe('w-8 h-8');
  });
});
