import { describe, it, expect, vi } from 'vitest';
import { ButtonComponent } from './button.component';

describe('ButtonComponent', () => {
  it('should initialize with default inputs', () => {
    const component = new ButtonComponent();
    expect(component.variant).toBe('primary');
    expect(component.size).toBe('md');
    expect(component.type).toBe('button');
    expect(component.disabled).toBe(false);
    expect(component.isLoading).toBe(false);
    expect(component.fullWidth).toBe(false);
  });

  it('should include minimum 40px touch target classes for sm size', () => {
    const component = new ButtonComponent();
    component.size = 'sm';
    const classes = component.buttonClasses;
    expect(classes).toContain('min-h-[40px]');
    expect(classes).toContain('min-w-[40px]');
  });

  it('should emit clicked event when not disabled and not loading', () => {
    const component = new ButtonComponent();
    const emitSpy = vi.spyOn(component.clicked, 'emit');
    const event = new MouseEvent('click');
    component.handleClick(event);
    expect(emitSpy).toHaveBeenCalledWith(event);
  });

  it('should not emit clicked event when disabled', () => {
    const component = new ButtonComponent();
    component.disabled = true;
    const emitSpy = vi.spyOn(component.clicked, 'emit');
    const event = new MouseEvent('click');
    component.handleClick(event);
    expect(emitSpy).not.toHaveBeenCalled();
  });

  it('should not emit clicked event when loading', () => {
    const component = new ButtonComponent();
    component.isLoading = true;
    const emitSpy = vi.spyOn(component.clicked, 'emit');
    const event = new MouseEvent('click');
    component.handleClick(event);
    expect(emitSpy).not.toHaveBeenCalled();
  });
});
