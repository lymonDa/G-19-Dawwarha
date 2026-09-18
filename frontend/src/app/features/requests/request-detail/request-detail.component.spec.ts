import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { RequestDetailComponent } from './request-detail.component';
import { RequestApiService } from '../services/request-api.service';

describe('RequestDetailComponent', () => {
  let component: RequestDetailComponent;
  let fixture: ComponentFixture<RequestDetailComponent>;
  let mockApi: jasmine.SpyObj<RequestApiService>;

  beforeEach(async () => {
    mockApi = jasmine.createSpyObj('RequestApiService', ['getById', 'changeStatus']);
    mockApi.getById.and.returnValue(of({
      _id: 'req123',
      categoryId: { name: 'Electronics' },
      quantity: 3,
      urgency: 'medium',
      location: { city: 'Giza' },
      status: 'draft',
      createdAt: new Date().toISOString()
    }));

    await TestBed.configureTestingModule({
      imports: [RequestDetailComponent],
      providers: [
        { provide: RequestApiService, useValue: mockApi },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: (key: string) => (key === 'id' ? 'req123' : null)
              }
            }
          }
        },
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RequestDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load request details by ID on init', () => {
    expect(mockApi.getById).toHaveBeenCalledWith('req123');
    expect(component.request).toBeTruthy();
    expect(component.categoryName).toBe('Electronics');
  });

  it('should publish draft request', () => {
    mockApi.changeStatus.and.returnValue(of({
      _id: 'req123',
      categoryId: { name: 'Electronics' },
      quantity: 3,
      urgency: 'medium',
      location: { city: 'Giza' },
      status: 'published',
      createdAt: new Date().toISOString()
    }));

    component.publishRequest();
    expect(mockApi.changeStatus).toHaveBeenCalledWith('req123', 'publish');
  });
});
