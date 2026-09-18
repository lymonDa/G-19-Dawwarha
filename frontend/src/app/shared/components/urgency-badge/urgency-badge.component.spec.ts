import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UrgencyBadgeComponent } from './urgency-badge.component';

describe('UrgencyBadgeComponent (DESIGN.md Section 13)', () => {
  let component: UrgencyBadgeComponent;
  let fixture: ComponentFixture<UrgencyBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UrgencyBadgeComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(UrgencyBadgeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should format High urgency variant correctly', () => {
    component.urgency = 'high';
    fixture.detectChanges();
    expect(component.label).toBe('High urgency');
    expect(component.badgeClasses).toContain('text-danger');
    const el = fixture.nativeElement.querySelector('[role="status"]');
    expect(el).toBeTruthy();
    expect(el.textContent).toContain('High urgency');
  });

  it('should format Medium urgency variant correctly', () => {
    component.urgency = 'medium';
    fixture.detectChanges();
    expect(component.label).toBe('Medium urgency');
    expect(component.badgeClasses).toContain('text-warning');
    const el = fixture.nativeElement.querySelector('[role="status"]');
    expect(el.textContent).toContain('Medium urgency');
  });

  it('should format Low urgency variant correctly', () => {
    component.urgency = 'low';
    fixture.detectChanges();
    expect(component.label).toBe('Low urgency');
    expect(component.badgeClasses).toContain('text-info');
    const el = fixture.nativeElement.querySelector('[role="status"]');
    expect(el.textContent).toContain('Low urgency');
  });

  it('should default to medium urgency for unknown or empty input', () => {
    component.urgency = '';
    fixture.detectChanges();
    expect(component.normalizedUrgency).toBe('medium');
    expect(component.label).toBe('Medium urgency');
  });
});
