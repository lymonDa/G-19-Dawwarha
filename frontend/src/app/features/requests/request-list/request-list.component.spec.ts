import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { RequestListComponent } from './request-list.component';
import { RequestApiService } from '../services/request-api.service';

describe('RequestListComponent', () => {
  let component: RequestListComponent;
  let fixture: ComponentFixture<RequestListComponent>;
  let mockApi: jasmine.SpyObj<RequestApiService>;

  beforeEach(async () => {
    mockApi = jasmine.createSpyObj('RequestApiService', ['getAll', 'getCategories']);
    mockApi.getAll.and.returnValue(of({ success: true, data: [] }));
    mockApi.getCategories.and.returnValue(of({ success: true, data: [] }));

    await TestBed.configureTestingModule({
      imports: [RequestListComponent],
      providers: [
        { provide: RequestApiService, useValue: mockApi },
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RequestListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load requests on initialization', () => {
    expect(mockApi.getAll).toHaveBeenCalled();
  });
});
