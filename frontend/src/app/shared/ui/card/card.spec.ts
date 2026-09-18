import { describe, it, expect, vi } from 'vitest';
import { CardComponent } from './card.component';

describe('CardComponent', () => {
  it('should initialize with default properties', () => {
    const component = new CardComponent();
    expect(component.variant).toBe('bordered');
    expect(component.padding).toBe('md');
    expect(component.isInteractive).toBe(false);
    expect(component.isSelected).toBe(false);
  });

  it('should generate appropriate classes based on padding and variant', () => {
    const component = new CardComponent();
    component.padding = 'lg';
    component.variant = 'sand';
    const classes = component.cardClasses;
    expect(classes).toContain('p-6');
    expect(classes).toContain('bg-sand-50');
  });

  it('should emit clicked on handleClick only when interactive', () => {
    const component = new CardComponent();
    const emitSpy = vi.spyOn(component.clicked, 'emit');
    const mouseEvent = new MouseEvent('click');

    component.isInteractive = false;
    component.handleClick(mouseEvent);
    expect(emitSpy).not.toHaveBeenCalled();

    component.isInteractive = true;
    component.handleClick(mouseEvent);
    expect(emitSpy).toHaveBeenCalledWith(mouseEvent);
  });

  it('should emit clicked and prevent default on handleKeydown when interactive', () => {
    const component = new CardComponent();
    component.isInteractive = true;
    const emitSpy = vi.spyOn(component.clicked, 'emit');
    const kbEvent = new KeyboardEvent('keydown', { key: 'Enter' });
    const preventSpy = vi.spyOn(kbEvent, 'preventDefault');

    component.handleKeydown(kbEvent);
    expect(preventSpy).toHaveBeenCalled();
    expect(emitSpy).toHaveBeenCalledWith(kbEvent);
  });
});
