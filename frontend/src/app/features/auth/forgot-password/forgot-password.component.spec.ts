import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ForgotPasswordComponent } from './forgot-password.component';
import { AuthService } from '../../../core/auth/auth.service';
import { LanguageService } from '../../../core/services/language.service';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';

describe('ForgotPasswordComponent', () => {
  let component: ForgotPasswordComponent;
  let fixture: ComponentFixture<ForgotPasswordComponent>;
  let mockAuthService: any;

  beforeEach(async () => {
    mockAuthService = {
      forgotPassword: vi.fn().mockReturnValue(of({ success: true, message: 'Recovery email dispatched' }))
    };

    await TestBed.configureTestingModule({
      imports: [ForgotPasswordComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: mockAuthService },
        LanguageService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ForgotPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component with empty form', () => {
    expect(component).toBeTruthy();
    expect(component.forgotForm.valid).toBe(false);
    expect(component.isSubmitted()).toBe(false);
  });

  it('should validate email format', () => {
    const emailControl = component.forgotForm.get('email');
    emailControl?.setValue('invalid-email');
    expect(emailControl?.valid).toBe(false);

    emailControl?.setValue('valid@example.com');
    expect(emailControl?.valid).toBe(true);
  });

  it('should call authService.forgotPassword and switch to success view upon submit', () => {
    component.forgotForm.setValue({ email: 'user@domain.org' });
    component.onSubmit();

    expect(mockAuthService.forgotPassword).toHaveBeenCalledWith('user@domain.org');
    expect(component.isSubmitted()).toBe(true);
    expect(component.submittedEmail()).toBe('user@domain.org');
  });

  it('should show error banner when service fails', () => {
    mockAuthService.forgotPassword.mockReturnValue(throwError(() => ({
      error: { message: 'Network error occurred' }
    })));

    component.forgotForm.setValue({ email: 'user@domain.org' });
    component.onSubmit();

    expect(component.isSubmitted()).toBe(false);
    expect(component.errorMessage()).toBe('Network error occurred');
  });

  it('should reset form and view state on resetForm()', () => {
    component.isSubmitted.set(true);
    component.submittedEmail.set('test@test.com');
    component.resetForm();

    expect(component.isSubmitted()).toBe(false);
    expect(component.forgotForm.value.email).toBeFalsy();
  });
});
