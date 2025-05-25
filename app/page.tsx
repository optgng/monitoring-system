import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Overview from "@/components/dashboard/overview"
import { RecentAlerts } from "@/components/dashboard/recent-alerts"
import { SystemStatus } from "@/components/dashboard/system-status"

export default function Home() {
  return (
    <div className="flex flex-col gap-10 p-8">
      <h1 className="text-3xl font-bold">Система мониторинга</h1>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Обзор</TabsTrigger>
          <TabsTrigger value="alerts">Оповещения</TabsTrigger>
          <TabsTrigger value="status">Статус систем</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <Overview />
        </TabsContent>
        <TabsContent value="alerts" className="space-y-4">
          <RecentAlerts />
        </TabsContent>
        <TabsContent value="status" className="space-y-4">
          <SystemStatus />
        </TabsContent>
      </Tabs>
    </div>
  )
}
