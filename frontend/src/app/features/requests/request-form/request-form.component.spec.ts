import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { RequestFormComponent } from './request-form.component';
import { RequestApiService } from '../services/request-api.service';

describe('RequestFormComponent', () => {
  let component: RequestFormComponent;
  let fixture: ComponentFixture<RequestFormComponent>;
  let mockApi: jasmine.SpyObj<RequestApiService>;

  beforeEach(async () => {
    mockApi = jasmine.createSpyObj('RequestApiService', ['getById', 'create', 'update', 'getCategories']);
    mockApi.getCategories.and.returnValue(of({ success: true, data: [] }));

    await TestBed.configureTestingModule({
      imports: [RequestFormComponent],
      providers: [
        { provide: RequestApiService, useValue: mockApi },
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RequestFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form as invalid when empty', () => {
    expect(component.form.valid).toBeFalse();
  });

  it('should validate form when valid values are provided', () => {
    component.form.patchValue({
      categoryId: 'cat123',
      quantity: 5,
      urgency: 'high',
      location: {
        city: 'Cairo',
        area: 'Dokki'
      },
      description: 'Need supplies urgently'
    });
    expect(component.form.valid).toBeTrue();
  });
});
