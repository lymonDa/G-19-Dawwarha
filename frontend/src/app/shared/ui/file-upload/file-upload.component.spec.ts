import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FileUploadComponent } from './file-upload.component';

import { LucideAngularModule, UploadCloud, X, File as FileIcon, FileText, Image as ImageIcon, AlertCircle } from 'lucide-angular';

describe('FileUploadComponent', () => {
  let component: FileUploadComponent;
  let fixture: ComponentFixture<FileUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        FileUploadComponent,
        LucideAngularModule.pick({ UploadCloud, X, File: FileIcon, FileText, Image: ImageIcon, AlertCircle })
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FileUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set disabled state', () => {
    component.setDisabledState(true);
    expect(component.disabled).toBe(true);
  });

  it('should handle drag over', () => {
    const event = new DragEvent('dragover');
    Object.defineProperty(event, 'preventDefault', { value: vi.fn() });
    Object.defineProperty(event, 'stopPropagation', { value: vi.fn() });
    
    component.onDragOver(event);
    
    expect(event.preventDefault).toHaveBeenCalled();
    expect(event.stopPropagation).toHaveBeenCalled();
    expect(component.isDragging).toBe(true);
  });

  it('should handle file removal', () => {
    const file = new File([''], 'test.png', { type: 'image/png' });
    component.files = [{ file }];
    
    component.removeFile(0);
    
    expect(component.files.length).toBe(0);
  });
});
