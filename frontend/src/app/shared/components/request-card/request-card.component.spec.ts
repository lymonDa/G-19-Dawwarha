import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RequestCardComponent } from './request-card.component';
import { Request } from '../../../core/models/request.model';

describe('RequestCardComponent (DESIGN.md Section 15)', () => {
  let component: RequestCardComponent;
  let fixture: ComponentFixture<RequestCardComponent>;

  const mockRequest: Request = {
    _id: 'req123',
    id: 'req123',
    requesterId: 'user123',
    categoryId: { _id: 'cat1', name: 'Medical Supplies' },
    quantity: 10,
    urgency: 'high',
    location: { city: 'Alexandria', area: 'Smouha' },
    description: 'Urgent need for first aid kits.',
    status: 'published',
    createdAt: new Date().toISOString()
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RequestCardComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(RequestCardComponent);
    component = fixture.componentInstance;
    component.request = mockRequest;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should display category name as highest prominence', () => {
    expect(component.categoryName).toBe('Medical Supplies');
  });

  it('should format location correctly', () => {
    expect(component.locationText).toBe('Alexandria · Smouha');
  });

  it('should associate proper status badge class', () => {
    expect(component.statusBadgeClass).toContain('text-info');
  });

  it('should render default card with link and description', () => {
    component.variant = 'default';
    fixture.detectChanges();
    const nativeEl: HTMLElement = fixture.nativeElement;
    expect(nativeEl.querySelector('a')).toBeTruthy();
    expect(nativeEl.textContent).toContain('Medical Supplies');
    expect(nativeEl.textContent).toContain('Requested: 10 items');
    expect(nativeEl.textContent).toContain('Alexandria · Smouha');
    expect(nativeEl.textContent).toContain('Urgent need for first aid kits.');
  });

  it('should render compact variant correctly for match-card reuse', () => {
    component.variant = 'compact';
    fixture.detectChanges();
    const nativeEl: HTMLElement = fixture.nativeElement;
    expect(nativeEl.textContent).toContain('Target Request');
    expect(nativeEl.textContent).toContain('Qty: 10');
    expect(nativeEl.textContent).toContain('Medical Supplies');
    expect(nativeEl.textContent).toContain('Alexandria · Smouha');
    // Compact does not render the full link wrapper
    expect(nativeEl.querySelector('a')).toBeNull();
  });
});
