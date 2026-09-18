import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ToastService } from '../../../core/services/toast.service';

describe('ToastService and Container', () => {
  let service: ToastService;

  beforeEach(() => {
    service = new ToastService();
    vi.useFakeTimers();
  });

  it('should display only one active toast at a time in the queue', () => {
    service.show({ variant: 'success', message: 'First message', duration: 3000 });
    service.show({ variant: 'error', message: 'Second message', duration: 3000 });

    // Only 1 toast is active at a time
    expect(service.toasts().length).toBe(1);
    expect(service.toasts()[0].message).toBe('First message');

    // Dismiss first toast
    service.dismiss(service.toasts()[0].id);
    vi.advanceTimersByTime(200);

    // Now second toast should be displayed
    expect(service.toasts().length).toBe(1);
    expect(service.toasts()[0].message).toBe('Second message');
  });

  it('should support convenience methods success, error, warning, info', () => {
    service.success('Success message');
    expect(service.toasts()[0].variant).toBe('success');
    expect(service.toasts()[0].message).toBe('Success message');

    service.dismiss(service.toasts()[0].id);
    vi.advanceTimersByTime(200);

    service.error('Error message');
    expect(service.toasts()[0].variant).toBe('error');
    expect(service.toasts()[0].message).toBe('Error message');
  });

  it('should auto dismiss after duration', () => {
    service.show({ variant: 'info', message: 'Auto dismiss', duration: 1000 });
    expect(service.toasts().length).toBe(1);

    vi.advanceTimersByTime(1100);
    expect(service.toasts().length).toBe(0);
  });
});
