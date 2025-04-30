"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit, Trash2, ExternalLink } from "lucide-react"
import { Modal } from "@/components/ui/modal"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertModal } from "@/components/ui/alert-modal"

export default function DevicesPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedDevice, setSelectedDevice] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredDevices, setFilteredDevices] = useState<any[]>([])

  const devices = [
    {
      id: 1,
      name: "Web-01",
      ip: "192.168.1.10",
      type: "Веб-сервер",
      status: "online",
      lastCheck: "1 минуту назад",
    },
    {
      id: 2,
      name: "DB-01",
      ip: "192.168.1.20",
      type: "База данных",
      status: "warning",
      lastCheck: "2 минуты назад",
    },
    {
      id: 3,
      name: "API-Gateway",
      ip: "192.168.1.30",
      type: "API Сервис",
      status: "online",
      lastCheck: "1 минуту назад",
    },
    {
      id: 4,
      name: "Redis-01",
      ip: "192.168.1.40",
      type: "Кэш",
      status: "offline",
      lastCheck: "5 минут назад",
    },
    {
      id: 5,
      name: "Monitoring-01",
      ip: "192.168.1.50",
      type: "Мониторинг",
      status: "online",
      lastCheck: "1 минуту назад",
    },
  ]

  // Filter devices based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredDevices(devices)
      return
    }

    const lowercasedSearch = searchTerm.toLowerCase()
    const filtered = devices.filter(
      (device) =>
        device.name.toLowerCase().includes(lowercasedSearch) ||
        device.ip.toLowerCase().includes(lowercasedSearch) ||
        device.type.toLowerCase().includes(lowercasedSearch),
    )

    setFilteredDevices(filtered)
  }, [searchTerm])

  // Initialize filtered devices with all devices
  useEffect(() => {
    setFilteredDevices(devices)
  }, [])

  const handleEdit = (device: any) => {
    setSelectedDevice(device)
    setIsEditModalOpen(true)
  }

  const handleDelete = (device: any) => {
    setSelectedDevice(device)
    setIsDeleteModalOpen(true)
  }

  const onDelete = () => {
    // Здесь будет логика удаления
    setIsDeleteModalOpen(false)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Управление устройствами</h1>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Добавить устройство
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Поиск устройств по имени, IP или типу..."
            className="pl-8 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Устройства системы</CardTitle>
          <CardDescription>Управление устройствами и их мониторинг</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Имя</TableHead>
                <TableHead>IP-адрес</TableHead>
                <TableHead>Тип</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Последняя проверка</TableHead>
                <TableHead className="text-right">Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDevices.length > 0 ? (
                filteredDevices.map((device) => (
                  <TableRow key={device.id}>
                    <TableCell className="font-medium">{device.name}</TableCell>
                    <TableCell>{device.ip}</TableCell>
                    <TableCell>{device.type}</TableCell>
                    <TableCell>
                      {device.status === "online" ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          В сети
                        </Badge>
                      ) : device.status === "warning" ? (
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                          Предупреждение
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                          Не в сети
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{device.lastCheck}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(device)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(device)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                    Устройства не найдены
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Модальное окно создания устройства */}
      <Modal
        title="Добавить устройство"
        description="Добавьте новое устройство для мониторинга"
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      >
        <div className="space-y-4 py-2 pb-4">
          <div className="space-y-2">
            <Label htmlFor="name">Имя устройства</Label>
            <Input id="name" placeholder="Введите имя устройства" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ip">IP-адрес</Label>
            <Input id="ip" placeholder="Введите IP-адрес" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Тип устройства</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Выберите тип устройства" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="web">Веб-сервер</SelectItem>
                <SelectItem value="db">База данных</SelectItem>
                <SelectItem value="api">API Сервис</SelectItem>
                <SelectItem value="cache">Кэш</SelectItem>
                <SelectItem value="monitoring">Мониторинг</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="pt-6 space-x-2 flex items-center justify-end w-full">
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              Отмена
            </Button>
            <Button onClick={() => setIsCreateModalOpen(false)}>Добавить</Button>
          </div>
        </div>
      </Modal>

      {/* Модальное окно редактирования устройства */}
      {selectedDevice && (
        <Modal
          title="Редактировать устройство"
          description="Измените параметры устройства"
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
        >
          <div className="space-y-4 py-2 pb-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Имя устройства</Label>
              <Input id="edit-name" defaultValue={selectedDevice.name} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-ip">IP-адрес</Label>
              <Input id="edit-ip" defaultValue={selectedDevice.ip} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-type">Тип устройства</Label>
              <Select
                defaultValue={
                  selectedDevice.type === "Веб-сервер"
                    ? "web"
                    : selectedDevice.type === "База данных"
                      ? "db"
                      : selectedDevice.type === "API Сервис"
                        ? "api"
                        : selectedDevice.type === "Кэш"
                          ? "cache"
                          : "monitoring"
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Выберите тип устройства" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="web">Веб-сервер</SelectItem>
                  <SelectItem value="db">База данных</SelectItem>
                  <SelectItem value="api">API Сервис</SelectItem>
                  <SelectItem value="cache">Кэш</SelectItem>
                  <SelectItem value="monitoring">Мониторинг</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="pt-6 space-x-2 flex items-center justify-end w-full">
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Отмена
              </Button>
              <Button onClick={() => setIsEditModalOpen(false)}>Сохранить</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Модальное окно удаления устройства */}
      <AlertModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={onDelete}
        title="Удалить устройство"
        description={`Вы уверены, что хотите удалить устройство "${selectedDevice?.name}"? Это действие нельзя будет отменить.`}
      />
    </div>
  )
}
