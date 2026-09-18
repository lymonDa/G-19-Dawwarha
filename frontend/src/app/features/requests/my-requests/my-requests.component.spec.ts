import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { MyRequestsComponent } from './my-requests.component';
import { RequestApiService } from '../services/request-api.service';
import { AuthService } from '../../../core/auth/auth.service';

describe('MyRequestsComponent', () => {
  let component: MyRequestsComponent;
  let fixture: ComponentFixture<MyRequestsComponent>;
  let mockApi: jasmine.SpyObj<RequestApiService>;

  beforeEach(async () => {
    mockApi = jasmine.createSpyObj('RequestApiService', ['getAll']);
    mockApi.getAll.and.returnValue(of({ success: true, data: [] }));

    await TestBed.configureTestingModule({
      imports: [MyRequestsComponent],
      providers: [
        { provide: RequestApiService, useValue: mockApi },
        AuthService,
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MyRequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load my requests on init', () => {
    expect(mockApi.getAll).toHaveBeenCalled();
  });

  it('should switch status tabs', () => {
    component.setTab('published');
    expect(component.activeTab).toBe('published');
  });
});
