import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatchScoreComponent } from './match-score.component';

describe('MatchScoreComponent (DESIGN.md Section 16)', () => {
  let component: MatchScoreComponent;
  let fixture: ComponentFixture<MatchScoreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatchScoreComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(MatchScoreComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should format decimals to whole integers without deceptive precision', () => {
    component.score = 0.9173;
    fixture.detectChanges();
    expect(component.percentage).toBe(92);
  });

  it('should handle percentage scale directly', () => {
    component.score = 85;
    fixture.detectChanges();
    expect(component.percentage).toBe(85);
  });

  it('should apply success styling for scores >= 85%', () => {
    component.score = 0.88;
    fixture.detectChanges();
    expect(component.isHighMatch).toBe(true);
    expect(component.scoreColorClasses).toContain('text-success');
  });

  it('should apply info styling for scores between 60% and 84%', () => {
    component.score = 0.72;
    fixture.detectChanges();
    expect(component.isModerateMatch).toBe(true);
    expect(component.scoreColorClasses).toContain('text-info');
  });

  it('should provide transparent, factual confidence copy without mysterious AI claims', () => {
    component.score = 0.92;
    fixture.detectChanges();
    expect(component.confidenceText).toBe('92% match based on category, location, quantity, urgency, and availability.');
    expect(component.confidenceText).not.toContain('AI');
  });

  it('should always provide the 5 signals in fixed order: Category, Location, Quantity, Urgency, Availability', () => {
    component.score = 0.9;
    component.breakdown = {
      category: 1.0,
      location: 0.8,
      quantity: 1.0,
      urgency: 0.9,
      availability: 1.0
    };
    fixture.detectChanges();

    const signalIds = component.signals.map(s => s.id);
    expect(signalIds).toEqual([
      'category',
      'location',
      'quantity',
      'urgency',
      'availability'
    ]);
  });

  it('should render the 5 signals, score, factual explanation, and accessibility attributes in DOM', () => {
    component.score = 0.92;
    component.breakdown = {
      category: 1.0,
      location: 0.85,
      quantity: 0.9,
      urgency: 1.0,
      availability: 0.75
    };
    fixture.detectChanges();

    const nativeEl: HTMLElement = fixture.nativeElement;
    const region = nativeEl.querySelector('[role="region"]');
    expect(region).toBeTruthy();
    expect(region?.getAttribute('aria-label')).toBe(component.confidenceText);

    // Score in DOM
    expect(nativeEl.textContent).toContain('92% Match');
    expect(nativeEl.textContent).toContain('92% match based on category, location, quantity, urgency, and availability.');

    // 5 signals in DOM
    expect(nativeEl.textContent).toContain('Category');
    expect(nativeEl.textContent).toContain('Location');
    expect(nativeEl.textContent).toContain('Quantity');
    expect(nativeEl.textContent).toContain('Urgency');
    expect(nativeEl.textContent).toContain('Availability');
  });
});
