import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { ResourceCardComponent } from './resource-card.component';
import { Resource } from '../../../core/models/resource.model';

describe('ResourceCardComponent', () => {
  let component: ResourceCardComponent;
  let fixture: ComponentFixture<ResourceCardComponent>;

  const mockResource: Resource = {
    id: 'res-101',
    _id: 'res-101',
    title: 'Wheelchair in great condition',
    categoryId: { id: 'cat-1', name: 'Medical Equipment' } as any,
    quantity: 2,
    description: 'Lightly used wheelchair with adjustable footrests.',
    location: { city: 'Cairo', area: 'Maadi' },
    availabilityWindow: {
      start: '2026-10-01T00:00:00.000Z',
      end: '2026-10-15T00:00:00.000Z'
    },
    status: 'available',
    providerId: 'prov-1',
    createdAt: '2026-09-15T12:00:00.000Z'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResourceCardComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(ResourceCardComponent);
    component = fixture.componentInstance;
    component.resource = mockResource;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should render default variant with title, category, quantity, and location', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Wheelchair in great condition');
    expect(el.textContent).toContain('Medical Equipment');
    expect(el.textContent).toContain('Qty: 2');
    expect(el.textContent).toContain('Cairo · Maadi');
    expect(el.textContent).toContain('Available');
  });

  it('should render compact variant when requested', () => {
    component.variant = 'compact';
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Supplied Resource');
    expect(el.textContent).toContain('Qty: 2');
    expect(el.textContent).toContain('Wheelchair in great condition');
    expect(el.textContent).toContain('Cairo · Maadi');
  });

  it('should render correct status badge styling across lifecycle states', () => {
    component.resource = { ...mockResource, status: 'available' };
    expect(component.statusBadgeClass).toContain('bg-success-bg');

    component.resource = { ...mockResource, status: 'matched' };
    expect(component.statusBadgeClass).toContain('bg-primary-100');

    component.resource = { ...mockResource, status: 'in_handover' };
    expect(component.statusBadgeClass).toContain('bg-warning-bg');

    component.resource = { ...mockResource, status: 'draft' };
    expect(component.statusBadgeClass).toContain('bg-neutral-100');

    component.resource = { ...mockResource, status: 'cancelled' };
    expect(component.statusBadgeClass).toContain('text-neutral-500');
  });

  it('should have descriptive accessible aria-label on the card', () => {
    const el = fixture.nativeElement as HTMLElement;
    const cardAnchor = el.querySelector('a');
    expect(cardAnchor).toBeTruthy();
    expect(cardAnchor?.getAttribute('aria-label')).toContain('Medical Equipment resource: Wheelchair in great condition');
    expect(cardAnchor?.getAttribute('aria-label')).toContain('quantity 2');
  });

  it('should handle missing area in location gracefully', () => {
    component.resource = { ...mockResource, location: { city: 'Alexandria' } };
    fixture.detectChanges();
    expect(component.locationText).toBe('Alexandria');
  });

  it('should return null availabilityText when window is missing', () => {
    component.resource = { ...mockResource, availabilityWindow: { start: '', end: '' } };
    expect(component.availabilityText).toBeNull();
  });
});
