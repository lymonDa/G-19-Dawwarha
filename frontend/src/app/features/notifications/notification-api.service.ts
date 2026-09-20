import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
import { ApiBaseService } from '../../core/services/api-base.service';
import { Notification } from '../../core/models/notification.model';
import { Pagination } from '../../core/models/pagination.model';
import { environment } from '../../../environments/environment';

export interface NotificationListResponse {
  notifications: Notification[];
  pagination: Pagination;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationApiService {
  private api = inject(ApiBaseService);
  private http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl || '/api';

  /**
   * Retrieves paginated notifications for the authenticated user.
   * Endpoint: GET /api/notifications
   */
  getNotifications(params?: {
    page?: number;
    limit?: number;
    unreadOnly?: boolean;
  }): Observable<NotificationListResponse> {
    const queryParams: Record<string, any> = {};
    if (params?.page) queryParams['page'] = params.page;
    if (params?.limit) queryParams['limit'] = params.limit;
    if (params?.unreadOnly) queryParams['unreadOnly'] = 'true';

    return this.api.get<{
      success: boolean;
      data: {
        notifications: Notification[];
        pagination: Pagination;
      };
    }>('/notifications', queryParams).pipe(
      map(res => {
        const rawList = res?.data?.notifications || [];
        const notifications: Notification[] = rawList.map(n => ({
          ...n,
          id: n.id || (n as any)._id,
          read: n.readAt !== null && n.readAt !== undefined
        }));

        const pagination: Pagination = res?.data?.pagination || {
          total: notifications.length,
          page: params?.page || 1,
          limit: params?.limit || 20,
          totalPages: 1
        };

        return {
          notifications,
          pagination
        };
      }),
      catchError(err => {
        return throwError(() => ({
          statusCode: err?.status || 500,
          code: err?.error?.error?.code || 'NOTIFICATION_ERROR',
          message: err?.error?.error?.message || 'تعذر تحميل الإشعارات'
        }));
      })
    );
  }

  /**
   * Marks a notification as read.
   * Endpoint: PATCH /api/notifications/:id/read
   */
  markAsRead(id: string): Observable<Notification> {
    return this.http.patch<{ success: boolean; data: Notification }>(
      `${this.baseUrl}/notifications/${id}/read`,
      {}
    ).pipe(
      map(res => {
        const n = res.data;
        return {
          ...n,
          id: n.id || (n as any)._id,
          read: true,
          readAt: n.readAt || new Date().toISOString()
        };
      }),
      catchError(err => {
        return throwError(() => ({
          statusCode: err?.status || 500,
          code: err?.error?.error?.code || 'MARK_READ_ERROR',
          message: err?.error?.error?.message || 'تعذر تحديث حالة الإشعار'
        }));
      })
    );
  }
}
