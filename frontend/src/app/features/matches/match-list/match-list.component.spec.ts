import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { MatchListComponent } from './match-list.component';
import { MatchApiService } from '../services/match-api.service';

describe('MatchListComponent', () => {
  let component: MatchListComponent;
  let fixture: ComponentFixture<MatchListComponent>;
  let mockApi: jasmine.SpyObj<MatchApiService>;

  beforeEach(async () => {
    mockApi = jasmine.createSpyObj('MatchApiService', ['getAll', 'accept', 'reject', 'generate']);
    mockApi.getAll.and.returnValue(of({ success: true, data: [] }));

    await TestBed.configureTestingModule({
      imports: [MatchListComponent],
      providers: [
        { provide: MatchApiService, useValue: mockApi },
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MatchListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load matches on initialization', () => {
    expect(mockApi.getAll).toHaveBeenCalled();
  });

  it('should call accept API when accepting a match', () => {
    mockApi.accept.and.returnValue(of({ success: true }));
    const mockMatch: any = { _id: 'm123', score: 0.9 };

    component.onAccept(mockMatch);
    expect(mockApi.accept).toHaveBeenCalledWith('m123');
  });

  it('should call reject API when rejecting a match', () => {
    mockApi.reject.and.returnValue(of({ success: true }));
    const mockMatch: any = { _id: 'm123', score: 0.9 };

    component.onReject(mockMatch);
    expect(mockApi.reject).toHaveBeenCalledWith('m123');
  });
});
