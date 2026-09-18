import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { MatchCardComponent } from './match-card.component';
import { Match } from '../../../core/models/match.model';
import { AuthService } from '../../../core/auth/auth.service';
import { User } from '../../../core/models/user.model';

describe('MatchCardComponent', () => {
  let component: MatchCardComponent;
  let fixture: ComponentFixture<MatchCardComponent>;
  let currentUserSignal = signal<User | null>(null);

  const mockAuthService = {
    currentUser: currentUserSignal
  };

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
      _id: 'res123',
      id: 'res123',
      title: 'Emergency Generator',
      description: 'Emergency Generator power unit',
      categoryId: 'cat1',
      category: { id: 'cat1', name: 'Power Equipment' },
      quantity: 2,
      location: { city: 'Cairo', area: 'Maadi' },
      providerId: 'provider456',
      status: 'available',
      availabilityWindow: { start: '', end: '' },
      createdAt: '',
      updatedAt: ''
    },
    requestId: {
      _id: 'req123',
      id: 'req123',
      requesterId: 'requester789',
      categoryId: { _id: 'cat1', name: 'Power Equipment' },
      quantity: 1,
      urgency: 'high',
      location: { city: 'Cairo', area: 'Maadi' },
      status: 'matched',
      createdAt: ''
    },
    createdAt: new Date().toISOString()
  };

  beforeEach(async () => {
    currentUserSignal.set({
      id: 'provider456',
      _id: 'provider456',
      name: 'Provider User',
      email: 'provider@example.com',
      role: 'user',
      status: 'active',
      createdAt: ''
    });

    await TestBed.configureTestingModule({
      imports: [MatchCardComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: mockAuthService }
      ]
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
    expect(component.resourceQuantity).toBe(2);
    expect(component.requestObject.quantity).toBe(1);
    expect(component.requestObject.urgency).toBe('high');
  });

  it('should render MatchScore and compact RequestCard in the DOM anatomy', () => {
    const nativeEl: HTMLElement = fixture.nativeElement;
    expect(nativeEl.querySelector('app-match-score')).toBeTruthy();
    expect(nativeEl.querySelector('app-request-card')).toBeTruthy();
    expect(nativeEl.textContent).toContain('Supplied Resource');
    expect(nativeEl.textContent).toContain('Emergency Generator');
  });

  it('should show Accept and Reject buttons when current user is an authorized party', () => {
    currentUserSignal.set({
      id: 'provider456',
      _id: 'provider456',
      name: 'Provider User',
      email: 'provider@example.com',
      role: 'user',
      status: 'active',
      createdAt: ''
    });
    fixture.detectChanges();

    expect(component.isAuthorizedParty).toBe(true);
    const nativeEl: HTMLElement = fixture.nativeElement;
    expect(nativeEl.textContent).toContain('Accept Match');
    expect(nativeEl.textContent).toContain('Reject');
  });

  it('should hide Accept and Reject buttons when current user is not a party to the match', () => {
    currentUserSignal.set({
      id: 'unrelatedUser999',
      _id: 'unrelatedUser999',
      name: 'Unrelated User',
      email: 'other@example.com',
      role: 'user',
      status: 'active',
      createdAt: ''
    });
    fixture.detectChanges();

    expect(component.isAuthorizedParty).toBe(false);
    const nativeEl: HTMLElement = fixture.nativeElement;
    expect(nativeEl.textContent).not.toContain('Accept Match');
    expect(nativeEl.textContent).not.toContain('Reject');
  });

  it('should show Accept and Reject buttons when current user is admin', () => {
    currentUserSignal.set({
      id: 'adminUser',
      _id: 'adminUser',
      name: 'Admin',
      email: 'admin@example.com',
      role: 'admin',
      status: 'active',
      createdAt: ''
    });
    fixture.detectChanges();

    expect(component.isAuthorizedParty).toBe(true);
    const nativeEl: HTMLElement = fixture.nativeElement;
    expect(nativeEl.textContent).toContain('Accept Match');
  });

  it('should open accept dialog and emit accept event when confirmed', () => {
    const emitSpy = vi.spyOn(component.accept, 'emit');
    component.triggerAccept();
    expect(component.showAcceptConfirm).toBe(true);

    component.confirmAccept();
    expect(component.showAcceptConfirm).toBe(false);
    expect(emitSpy).toHaveBeenCalledWith(mockMatch);
  });

  it('should open reject dialog and emit reject event when confirmed', () => {
    const emitSpy = vi.spyOn(component.reject, 'emit');
    component.triggerReject();
    expect(component.showRejectConfirm).toBe(true);

    component.confirmReject();
    expect(component.showRejectConfirm).toBe(false);
    expect(emitSpy).toHaveBeenCalledWith(mockMatch);
  });
});
