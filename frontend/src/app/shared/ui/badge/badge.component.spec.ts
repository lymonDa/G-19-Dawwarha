import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BadgeComponent } from './badge.component';

describe('BadgeComponent', () => {
  let component: BadgeComponent;
  let fixture: ComponentFixture<BadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BadgeComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BadgeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have neutral variant by default', () => {
    expect(component.variant).toBe('neutral');
    expect(component.badgeClasses).toContain('bg-neutral-100');
  });

  it('should change classes based on variant', () => {
    component.variant = 'success';
    fixture.detectChanges();
    expect(component.badgeClasses).toContain('bg-success-bg');
    expect(component.badgeClasses).toContain('text-success');
    
    component.variant = 'danger';
    fixture.detectChanges();
    expect(component.badgeClasses).toContain('bg-danger-bg');
  });

  it('should show dot and correct dot class if dot is true', () => {
    component.dot = true;
    component.variant = 'warning';
    fixture.detectChanges();
    
    expect(component.dotClass).toBe('bg-warning');
    const compiled = fixture.nativeElement as HTMLElement;
    const dotElement = compiled.querySelector('span.rounded-full');
    expect(dotElement).toBeTruthy();
    expect(dotElement?.className).toContain('bg-warning');
  });
});
