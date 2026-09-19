import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ResetPasswordComponent } from './reset-password.component';
import { AuthService } from '../../../core/auth/auth.service';
import { LanguageService } from '../../../core/services/language.service';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';

describe('ResetPasswordComponent', () => {
  let component: ResetPasswordComponent;
  let fixture: ComponentFixture<ResetPasswordComponent>;
  let mockAuthService: any;
  let queryParamsSubject: any;

  beforeEach(async () => {
    mockAuthService = {
      resetPassword: vi.fn().mockReturnValue(of({ success: true, message: 'Password reset successful' }))
    };

    queryParamsSubject = of({ token: 'test-reset-token-123' });

    await TestBed.configureTestingModule({
      imports: [ResetPasswordComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: mockAuthService },
        { provide: ActivatedRoute, useValue: { queryParams: queryParamsSubject } },
        LanguageService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ResetPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should initialize and read token from route query params', () => {
    expect(component).toBeTruthy();
    expect(component.token()).toBe('test-reset-token-123');
    expect(component.isSuccess()).toBe(false);
  });

  it('should validate password minimum length of 8 and match requirement', () => {
    component.resetForm.patchValue({ password: 'short', confirmPassword: 'short' });
    expect(component.hasMinLength()).toBe(false);
    expect(component.resetForm.valid).toBe(false);

    component.resetForm.patchValue({ password: 'password123', confirmPassword: 'different123' });
    expect(component.hasMinLength()).toBe(true);
    expect(component.hasNumber()).toBe(true);
    expect(component.passwordsMatch()).toBe(false);

    component.resetForm.patchValue({ password: 'Password123!', confirmPassword: 'Password123!' });
    expect(component.hasMinLength()).toBe(true);
    expect(component.hasNumber()).toBe(true);
    expect(component.passwordsMatch()).toBe(true);
    expect(component.resetForm.valid).toBe(true);
  });

  it('should call authService.resetPassword and show success state', () => {
    component.resetForm.patchValue({ password: 'Password123!', confirmPassword: 'Password123!' });
    component.onSubmit();

    expect(mockAuthService.resetPassword).toHaveBeenCalledWith('test-reset-token-123', 'Password123!');
    expect(component.isSuccess()).toBe(true);
  });

  it('should show error banner when service returns an expired token error', () => {
    mockAuthService.resetPassword.mockReturnValue(throwError(() => ({
      error: { message: 'The password reset link is invalid or has expired.' }
    })));

    component.resetForm.patchValue({ password: 'Password123!', confirmPassword: 'Password123!' });
    component.onSubmit();

    expect(component.isSuccess()).toBe(false);
    expect(component.errorMessage()).toBe('The password reset link is invalid or has expired.');
  });
});
