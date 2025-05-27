import { dashboardApi } from '@/lib/dashboard-api';

// Функция для логирования запросов и ответов
function logApiOperation(operation: string, request?: any, response?: any, error?: any) {
  console.log(`\n---- ${operation} ----`);
  if (request) console.log('Запрос:', JSON.stringify(request, null, 2));
  if (response) console.log('Ответ:', JSON.stringify(response, null, 2));
  if (error) console.error('Ошибка:', error);
  console.log('-'.repeat(operation.length + 10));
}

async function testDashboardsAPI() {
  try {
    // 1. Проверка соединения (health check)
    console.log("🔍 Проверка соединения с API...");
    try {
      const response = await fetch('http://localhost:8050/healthz');
      const health = await response.json();
      console.log("✅ API доступно:", health.status === 'healthy');
      console.log("Данные:", health);
    } catch (error) {
      console.error("❌ API недоступно:", error);
      return;
    }

    // 2. Создание тестового дашборда
    console.log("\n🏗️ Создание тестового дашборда...");

    const dashboardData = {
      dashboard: {
        title: "Test Dashboard " + new Date().toISOString(),
        description: "Test dashboard created by integration test",
        tags: ["test", "integration"],
        style: "dark",
        timezone: "browser",
        editable: true,
        hideControls: false,
        graphTooltip: 1,
        time: {
          from: "now-1h",
          to: "now"
        },
        timepicker: {
          refresh_intervals: ["5s", "10s", "30s", "1m", "5m", "15m", "30m", "1h", "2h", "1d"],
          time_options: ["5m", "15m", "1h", "6h", "12h", "24h", "2d", "7d", "30d"]
        },
        templating: {
          list: []
        },
        annotations: {
          list: []
        },
        refresh: "30s",
        schemaVersion: 36,
        version: 0,
        panels: [],
        links: [],
        fiscalYearStartMonth: 0,
        liveNow: false,
        weekStart: ""
      },
      folderId: 0,
      overwrite: false
    };

    try {
      const response = await fetch('http://localhost:8050/api/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dashboardData)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      const result = await response.json();
      logApiOperation("Создание дашборда", dashboardData, result);

      // Сохраняем UID для дальнейших операций
      const dashboardUid = result.uid;

      if (!dashboardUid) {
        throw new Error("Не удалось получить UID дашборда");
      }

      console.log("✅ Дашборд создан. UID:", dashboardUid);

      // 3. Добавление тестовой панели
      console.log("\n🧩 Добавление тестовой панели...");

      const panelData = {
        title: "CPU Usage",
        type: "stat",
        datasource: {
          type: "prometheus",
          uid: "prometheus"
        },
        targets: [
          {
            refId: "A",
            expr: "100 - (avg by (instance) (rate(node_cpu_seconds_total{mode=\"idle\"}[5m])) * 100)",
            legendFormat: "CPU Usage %",
            datasource: {
              type: "prometheus",
              uid: "prometheus"
            }
          }
        ],
        gridPos: {
          h: 8,
          w: 12,
          x: 0,
          y: 0
        }
      };

      try {
        const panelResponse = await fetch(`http://localhost:8050/api/${dashboardUid}/panels`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(panelData)
        });

        if (!panelResponse.ok) {
          throw new Error(`HTTP ${panelResponse.status}: ${await panelResponse.text()}`);
        }

        const panelResult = await panelResponse.json();
        logApiOperation("Создание панели", panelData, panelResult);

        console.log("✅ Панель добавлена. ID:", panelResult.id);

        // 4. Проверка созданного дашборда
        console.log("\n🔍 Проверка созданного дашборда...");

        try {
          const getDashboardResponse = await fetch(`http://localhost:8050/api/${dashboardUid}`);
          const getDashboardResult = await getDashboardResponse.json();

          // Выводим только краткую информацию
          console.log("✅ Дашборд получен:");
          console.log("- Название:", getDashboardResult.dashboard?.title);
          console.log("- Кол-во панелей:", getDashboardResult.dashboard?.panels?.length || 0);
          console.log("- URL:", getDashboardResult.meta?.url);

          console.log("\n🎉 Тестирование успешно завершено!");
          console.log(`Перейдите по ссылке для просмотра дашборда: http://localhost:3001${getDashboardResult.meta?.url}`);

        } catch (error) {
          console.error("❌ Ошибка при получении дашборда:", error);
        }

      } catch (error) {
        console.error("❌ Ошибка при создании панели:", error);
      }

    } catch (error) {
      console.error("❌ Ошибка при создании дашборда:", error);
    }

  } catch (error) {
    console.error("❌ Произошла общая ошибка:", error);
  }
}

// Запускаем тест
testDashboardsAPI();

// Экспортируем функцию для запуска из консоли
export { testDashboardsAPI };
