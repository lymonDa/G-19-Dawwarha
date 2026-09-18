import { Component, Input, Output, EventEmitter, forwardRef, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { LucideAngularModule, UploadCloud, X, File as FileIcon, FileText, Image as ImageIcon, AlertCircle } from 'lucide-angular';

export interface FileUploadModel {
  file: File;
  previewUrl?: string;
}

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FileUploadComponent),
      multi: true
    }
  ],
  template: `
    <div class="w-full flex flex-col gap-1.5">
      <label *ngIf="label" class="block text-sm font-semibold text-neutral-900">
        {{ label }} <span *ngIf="required" class="text-danger">*</span>
      </label>

      <!-- Dropzone -->
      <div 
        *ngIf="!maxFilesReached()"
        class="relative w-full rounded-lg border-2 border-dashed transition-colors duration-200 flex flex-col items-center justify-center p-6 text-center cursor-pointer hover:bg-neutral-50"
        [ngClass]="{
          'border-primary-400 bg-primary-50': isDragging,
          'border-danger bg-danger-50': error,
          'border-neutral-300': !isDragging && !error,
          'opacity-50 cursor-not-allowed': disabled
        }"
        (dragover)="onDragOver($event)"
        (dragleave)="onDragLeave($event)"
        (drop)="onDrop($event)"
        (click)="triggerFileInput()"
        (keydown.enter)="triggerFileInput()"
        (keydown.space)="triggerFileInput()"
        tabindex="0"
        role="button"
        aria-label="Upload file">
        
        <input 
          #fileInput
          type="file" 
          class="hidden" 
          [accept]="accept"
          [multiple]="multiple"
          [disabled]="disabled"
          (change)="onFileSelected($event)">
          
        <div class="p-3 rounded-full bg-neutral-100 text-neutral-600 mb-3" [class.text-primary-600]="isDragging" [class.bg-primary-100]="isDragging">
          <lucide-icon name="upload-cloud" [size]="24"></lucide-icon>
        </div>
        
        <p class="text-sm font-medium text-neutral-900 mb-1">
          Click to upload <span class="font-normal text-neutral-500">or drag and drop</span>
        </p>
        <p class="text-xs text-neutral-500">
          {{ acceptText || accept }} (Max. {{ maxSizeMB }}MB)
        </p>
      </div>

      <!-- Error State -->
      <div *ngIf="error" class="flex items-center text-xs text-danger mt-1">
        <lucide-icon name="alert-circle" [size]="14" class="me-1.5"></lucide-icon>
        {{ error }}
      </div>
      <div *ngIf="helperText && !error" class="text-xs text-neutral-500 mt-1">
        {{ helperText }}
      </div>

      <!-- File Previews -->
      <div *ngIf="files.length > 0" class="mt-3 flex flex-col gap-2">
        <div *ngFor="let fileModel of files; let i = index" class="flex items-center justify-between p-3 border border-neutral-200 rounded-md bg-white">
          <div class="flex items-center flex-1 min-w-0">
            <!-- Image preview -->
            <img *ngIf="isImage(fileModel.file) && fileModel.previewUrl" [src]="fileModel.previewUrl" class="w-10 h-10 object-cover rounded me-3 shrink-0" alt="Preview">
            <!-- File icon -->
            <div *ngIf="!isImage(fileModel.file) || !fileModel.previewUrl" class="w-10 h-10 rounded bg-neutral-100 text-neutral-500 flex items-center justify-center me-3 shrink-0">
              <lucide-icon [name]="getFileIcon(fileModel.file)" [size]="20"></lucide-icon>
            </div>
            
            <div class="flex flex-col min-w-0 pe-4">
              <span class="text-sm font-medium text-neutral-900 truncate">{{ fileModel.file.name }}</span>
              <span class="text-xs text-neutral-500">{{ formatSize(fileModel.file.size) }}</span>
            </div>
          </div>
          
          <button 
            type="button" 
            (click)="removeFile(i)" 
            [disabled]="disabled"
            class="p-1.5 text-neutral-400 hover:text-danger hover:bg-danger-50 rounded-md transition-colors disabled:opacity-50"
            aria-label="Remove file">
            <lucide-icon name="x" [size]="16"></lucide-icon>
          </button>
        </div>
      </div>
    </div>
  `
})
export class FileUploadComponent implements ControlValueAccessor {
  @Input() label?: string;
  @Input() helperText?: string;
  @Input() accept = '*/*';
  @Input() acceptText?: string;
  @Input() multiple = false;
  @Input() maxSizeMB = 5;
  @Input() required = false;
  @Input() disabled = false;

  @Output() fileChanged = new EventEmitter<File[]>();

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  files: FileUploadModel[] = [];
  isDragging = false;
  error?: string;

  readonly UploadCloud = UploadCloud;
  readonly X = X;
  readonly FileIcon = FileIcon;
  readonly FileText = FileText;
  readonly ImageIcon = ImageIcon;
  readonly AlertCircle = AlertCircle;

  onChange: any = () => { };
  onTouched: any = () => { };

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (this.disabled || this.maxFilesReached()) return;
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    if (this.disabled || this.maxFilesReached()) return;

    const droppedFiles = event.dataTransfer?.files;
    if (droppedFiles && droppedFiles.length > 0) {
      this.handleFiles(Array.from(droppedFiles));
    }
  }

  triggerFileInput() {
    if (this.disabled || this.maxFilesReached()) return;
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFiles(Array.from(input.files));
      // Reset input value so same file can be selected again if removed
      input.value = '';
    }
  }

  handleFiles(newFiles: File[]) {
    this.error = undefined;
    this.onTouched();

    const validFiles: File[] = [];

    for (const file of newFiles) {
      // Check size
      if (file.size > this.maxSizeMB * 1024 * 1024) {
        this.error = `File size must be less than ${this.maxSizeMB}MB`;
        continue;
      }

      // We could add more robust accept checking here
      validFiles.push(file);
    }

    if (validFiles.length > 0) {
      if (!this.multiple) {
        this.files = [];
      }

      validFiles.forEach(file => {
        const model: FileUploadModel = { file };

        // Generate preview for images
        if (this.isImage(file)) {
          const reader = new FileReader();
          reader.onload = (e) => {
            model.previewUrl = e.target?.result as string;
          };
          reader.readAsDataURL(file);
        }

        this.files.push(model);
      });

      this.emitChange();
    }
  }

  removeFile(index: number) {
    if (this.disabled) return;
    this.files.splice(index, 1);
    this.emitChange();
  }

  emitChange() {
    const fileList = this.files.map(f => f.file);
    const val = this.multiple ? fileList : (fileList.length > 0 ? fileList[0] : null);
    this.onChange(val);
    this.fileChanged.emit(fileList);
  }

  maxFilesReached(): boolean {
    return !this.multiple && this.files.length >= 1;
  }

  isImage(file: File): boolean {
    return file.type.startsWith('image/');
  }

  getFileIcon(file: File): string {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type === 'application/pdf') return 'file-text';
    return 'file';
  }

  formatSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  writeValue(value: any): void {
    // For FileUpload, writeValue from reactive forms is typically tricky 
    // because we can't easily programmatically set File objects.
    // If it's a reset (null), we clear the files.
    if (!value || (Array.isArray(value) && value.length === 0)) {
      this.files = [];
      this.error = undefined;
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
