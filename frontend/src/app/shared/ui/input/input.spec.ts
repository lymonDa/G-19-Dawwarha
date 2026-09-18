import { describe, it, expect, vi } from 'vitest';
import { InputComponent } from './input.component';

describe('InputComponent', () => {
  it('should initialize with default inputs', () => {
    const component = new InputComponent();
    expect(component.type).toBe('text');
    expect(component.disabled).toBe(false);
    expect(component.value()).toBe('');
    expect(component.isPasswordVisible()).toBe(false);
  });

  it('should toggle password visibility and actualType', () => {
    const component = new InputComponent();
    component.type = 'password';
    expect(component.actualType()).toBe('password');
    component.togglePasswordVisibility();
    expect(component.isPasswordVisible()).toBe(true);
    expect(component.actualType()).toBe('text');
    component.togglePasswordVisibility();
    expect(component.isPasswordVisible()).toBe(false);
    expect(component.actualType()).toBe('password');
  });

  it('should implement ControlValueAccessor writeValue', () => {
    const component = new InputComponent();
    component.writeValue('Test Value');
    expect(component.value()).toBe('Test Value');
    component.writeValue(null);
    expect(component.value()).toBe('');
  });

  it('should call onChange and update value on handleInput', () => {
    const component = new InputComponent();
    const changeSpy = vi.fn();
    component.registerOnChange(changeSpy);
    const mockInput = { value: 'New text' } as HTMLInputElement;
    component.handleInput({ target: mockInput } as any);
    expect(component.value()).toBe('New text');
    expect(changeSpy).toHaveBeenCalledWith('New text');
  });

  it('should update disabled state with setDisabledState', () => {
    const component = new InputComponent();
    component.setDisabledState(true);
    expect(component.disabled).toBe(true);
  });
});
