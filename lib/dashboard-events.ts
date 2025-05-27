/**
 * Утилиты для работы с событиями дашбордов
 */

export interface DashboardEventDetail {
  dashboard?: any;
  uid?: string;
  action?: 'created' | 'updated' | 'deleted' | 'duplicated';
}

/**
 * Уведомляет об создании дашборда
 */
export const notifyDashboardCreated = (dashboard: any) => {
  const event = new CustomEvent('dashboard-created', {
    detail: { dashboard, action: 'created' }
  });
  window.dispatchEvent(event);

  // Также сохраняем в localStorage для синхронизации между вкладками
  localStorage.setItem('dashboards-updated', Date.now().toString());
};

/**
 * Уведомляет об обновлении дашборда
 */
export const notifyDashboardUpdated = (dashboard: any) => {
  const event = new CustomEvent('dashboard-updated', {
    detail: { dashboard, action: 'updated' }
  });
  window.dispatchEvent(event);

  localStorage.setItem('dashboards-updated', Date.now().toString());
};

/**
 * Уведомляет об удалении дашборда
 */
export const notifyDashboardDeleted = (uid: string) => {
  const event = new CustomEvent('dashboard-deleted', {
    detail: { uid, action: 'deleted' }
  });
  window.dispatchEvent(event);

  localStorage.setItem('dashboards-updated', Date.now().toString());
};

/**
 * Уведомляет о дублировании дашборда
 */
export const notifyDashboardDuplicated = (originalUid: string, newDashboard: any) => {
  const event = new CustomEvent('dashboard-duplicated', {
    detail: {
      dashboard: newDashboard,
      originalUid: originalUid,
      action: 'duplicated'
    }
  });
  window.dispatchEvent(event);

  localStorage.setItem('dashboards-updated', Date.now().toString());
};

/**
 * Принудительное обновление списка дашбордов
 */
export const triggerDashboardsRefresh = () => {
  const event = new CustomEvent('apply-dashboard-filters');
  window.dispatchEvent(event);
};
