import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ButtonComponent } from './button.component';

describe('ButtonComponent', () => {
  let component: ButtonComponent;
  let fixture: ComponentFixture<ButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit clicked event when not disabled and not loading', () => {
    const emitSpy = vi.spyOn(component.clicked, 'emit');
    
    component.disabled = false;
    component.isLoading = false;
    
    const event = new MouseEvent('click');
    component.handleClick(event);
    
    expect(emitSpy).toHaveBeenCalledWith(event);
  });

  it('should not emit clicked event when disabled', () => {
    const emitSpy = vi.spyOn(component.clicked, 'emit');
    
    component.disabled = true;
    component.isLoading = false;
    
    const event = new MouseEvent('click');
    component.handleClick(event);
    
    expect(emitSpy).not.toHaveBeenCalled();
  });

  it('should not emit clicked event when loading', () => {
    const emitSpy = vi.spyOn(component.clicked, 'emit');
    
    component.disabled = false;
    component.isLoading = true;
    
    const event = new MouseEvent('click');
    component.handleClick(event);
    
    expect(emitSpy).not.toHaveBeenCalled();
  });
});
