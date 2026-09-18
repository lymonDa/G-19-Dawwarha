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
  });

  it('should format Medium urgency variant correctly', () => {
    component.urgency = 'medium';
    fixture.detectChanges();
    expect(component.label).toBe('Medium urgency');
    expect(component.badgeClasses).toContain('text-warning');
  });

  it('should format Low urgency variant correctly', () => {
    component.urgency = 'low';
    fixture.detectChanges();
    expect(component.label).toBe('Low urgency');
    expect(component.badgeClasses).toContain('text-info');
  });
});
