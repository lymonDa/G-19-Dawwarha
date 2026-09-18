import { describe, it, expect } from 'vitest';
import { SkeletonComponent } from './skeleton.component';

describe('SkeletonComponent', () => {
  it('should initialize with default variant text', () => {
    const component = new SkeletonComponent();
    expect(component.variant).toBe('text');
  });

  it('should include correct classes for text and circular variants', () => {
    const component = new SkeletonComponent();
    expect(component.skeletonClasses).toContain('animate-pulse');
    expect(component.skeletonClasses).toContain('h-4');

    component.variant = 'circular';
    expect(component.skeletonClasses).toContain('rounded-full');

    component.variant = 'card';
    expect(component.skeletonClasses).toContain('rounded-card');
  });

  it('should append customClass', () => {
    const component = new SkeletonComponent();
    component.customClass = 'my-custom-margin';
    expect(component.skeletonClasses).toContain('my-custom-margin');
  });
});
