import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MatchCardComponent } from './match-card.component';
import { Match } from '../../../core/models/match.model';

describe('MatchCardComponent', () => {
  let component: MatchCardComponent;
  let fixture: ComponentFixture<MatchCardComponent>;

  const mockMatch: Match = {
    _id: 'match123',
    id: 'match123',
    score: 0.92,
    scoreBreakdown: {
      category: 1.0,
      location: 1.0,
      quantity: 0.9,
      urgency: 1.0,
      availability: 0.85
    },
    status: 'proposed',
    providerId: 'provider456',
    requesterId: 'requester789',
    resourceId: {
      title: 'Emergency Generator',
      categoryId: { name: 'Power Equipment' },
      quantity: 2,
      location: { city: 'Cairo', area: 'Maadi' }
    },
    requestId: {
      categoryId: { name: 'Power Equipment' },
      quantity: 1,
      urgency: 'high',
      location: { city: 'Cairo', area: 'Maadi' }
    },
    createdAt: new Date().toISOString()
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatchCardComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(MatchCardComponent);
    component = fixture.componentInstance;
    component.match = mockMatch;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should correctly display resource and request summaries', () => {
    expect(component.resourceTitle).toBe('Emergency Generator');
    expect(component.resourceCategory).toBe('Power Equipment');
    expect(component.requestQuantity).toBe(1);
    expect(component.requestUrgency).toBe('high');
  });

  it('should trigger accept confirmation modal', () => {
    component.triggerAccept();
    expect(component.showAcceptConfirm).toBeTrue();
  });

  it('should emit accept event when confirmed', () => {
    spyOn(component.accept, 'emit');
    component.confirmAccept();
    expect(component.accept.emit).toHaveBeenCalledWith(mockMatch);
  });

  it('should trigger reject confirmation modal and emit on confirm', () => {
    spyOn(component.reject, 'emit');
    component.triggerReject();
    expect(component.showRejectConfirm).toBeTrue();
    component.confirmReject();
    expect(component.reject.emit).toHaveBeenCalledWith(mockMatch);
  });
});
