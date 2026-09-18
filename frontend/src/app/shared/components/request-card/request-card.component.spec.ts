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
    categoryId: { name: 'Medical Supplies' },
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
});
