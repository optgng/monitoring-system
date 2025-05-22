"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Modal } from "@/components/ui/modal"
import { AlertModal } from "@/components/ui/alert-modal"
import { Label } from "@/components/ui/label"
import { Plus, Search, Edit, Trash2, Loader2, RefreshCw } from "lucide-react"

type Device = {
  id: string
  name: string
  system_name: string
  ip_address: string
  description: string
  status?: "online" | "offline"
  lastCheck?: string
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://monitoring-service.localhost:8000"

function validateHostName(name: string) {
  return /^[a-zA-Z0-9-]{2,64}$/.test(name)
}
function validateIp(ip: string) {
  return /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/.test(ip)
}

export default function DevicesPage() {
  const [devices, setDevices] = useState<Device[]>([])
  const [filteredDevices, setFilteredDevices] = useState<Device[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingAction, setLoadingAction] = useState(false)

  // Create form state
  const [createName, setCreateName] = useState("")
  const [createSystemName, setCreateSystemName] = useState("")
  const [createIp, setCreateIp] = useState("")
  const [createDescription, setCreateDescription] = useState("")
  const [createErrors, setCreateErrors] = useState<{ name?: string; system_name?: string; ip?: string }>({})

  // Edit form state
  const [editName, setEditName] = useState("")
  const [editSystemName, setEditSystemName] = useState("")
  const [editIp, setEditIp] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [editErrors, setEditErrors] = useState<{
    name?: string
    system_name?: string
    ip?: string
    description?: string
  }>({})

  // Получение списка устройств и статусов
  useEffect(() => {
    setLoading(true)
    fetch(`${API_URL}/api/v1/devices/`)
      .then((res) => res.json())
      .then(async (data) => {
        // Получаем статусы устройств через метрики
        const metricsRes = await fetch(`${API_URL}/api/v1/metrics/metrics`)
        const metricsText = await metricsRes.text()
        // Парсим device_up{host_name="..."} ...\n
        const statusMap: Record<string, "online" | "offline"> = {}
        metricsText.split("\n").forEach((line) => {
          const match = line.match(/device_up\{host_name="([^"]+)"\}\s+([01])/)
          if (match) {
            statusMap[match[1]] = match[2] === "1" ? "online" : "offline"
          }
        })
        const now = new Date()
        setDevices(
          data.map((d: any) => ({
            id: d.id,
            name: d.name,
            system_name: d.system_name,
            ip_address: d.ip_address,
            description: d.description,
            status: statusMap[d.name] || "offline",
            lastCheck: now.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }),
          })),
        )
        setLoading(false)
      })
      .catch(() => {
        setDevices([])
        setLoading(false)
      })
  }, [])

  // Фильтрация устройств
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredDevices(devices)
      return
    }
    const lowercasedSearch = searchTerm.toLowerCase()
    setFilteredDevices(
      devices.filter(
        (device) =>
          device.name.toLowerCase().includes(lowercasedSearch) ||
          device.ip_address.toLowerCase().includes(lowercasedSearch) ||
          device.description.toLowerCase().includes(lowercasedSearch),
      ),
    )
  }, [searchTerm, devices])

  // Открытие модалки редактирования
  const handleEdit = (device: Device) => {
    setSelectedDevice(device)
    setEditName(device.name)
    setEditSystemName(device.system_name)
    setEditIp(device.ip_address)
    setEditDescription(device.description)
    setEditErrors({})
    setIsEditModalOpen(true)
  }

  // Открытие модалки удаления
  const handleDelete = (device: Device) => {
    setSelectedDevice(device)
    setIsDeleteModalOpen(true)
  }

  // Добавление устройства
  const handleCreate = async () => {
    const errors: { name?: string; system_name?: string; ip?: string } = {}
    if (!validateHostName(createName)) errors.name = "Некорректное имя хоста"
    if (!createSystemName.trim()) errors.system_name = "Имя системы обязательно"
    if (!validateIp(createIp)) errors.ip = "Некорректный IP-адрес"
    if (Object.keys(errors).length > 0) {
      setCreateErrors(errors)
      return
    }
    setLoadingAction(true)
    try {
      const res = await fetch(`${API_URL}/api/v1/devices/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: createName,
          system_name: createSystemName,
          description: createDescription,
          ip_address: createIp,
        }),
      })
      if (!res.ok) throw new Error("Ошибка при добавлении устройства")
      setIsCreateModalOpen(false)
      setCreateName("")
      setCreateSystemName("")
      setCreateIp("")
      setCreateDescription("")
      setCreateErrors({})
      setSuccessMessage("Устройство успешно добавлено")
      setIsSuccessModalOpen(true)
      // Обновить список устройств
      const updated = await res.json()
      setDevices((prev) => [
        {
          id: updated.id,
          name: updated.name,
          system_name: updated.system_name,
          ip_address: updated.ip_address,
          description: updated.description,
          status: "offline",
          lastCheck: new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }),
        },
        ...prev,
      ])
    } catch (e: any) {
      setErrorMessage(e.message || "Ошибка при добавлении устройства")
      setIsErrorModalOpen(true)
    }
    setLoadingAction(false)
  }

  // Сохранение изменений устройства
  const handleEditSave = async () => {
    const errors: { name?: string; system_name?: string; ip?: string; description?: string } = {}
    if (!validateHostName(editName)) errors.name = "Некорректное имя хоста"
    if (!editSystemName.trim()) errors.system_name = "Имя системы обязательно"
    if (!validateIp(editIp)) errors.ip = "Некорректный IP-адрес"
    if (!editDescription.trim()) errors.description = "Описание обязательно"
    if (Object.keys(errors).length > 0) {
      setEditErrors(errors)
      return
    }
    setLoadingAction(true)
    try {
      const res = await fetch(`${API_URL}/api/v1/devices/${selectedDevice?.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          system_name: editSystemName,
          description: editDescription,
          ip_address: editIp,
        }),
      })
      if (!res.ok) throw new Error("Ошибка при изменении устройства")
      setIsEditModalOpen(false)
      setSelectedDevice(null)
      setSuccessMessage("Устройство успешно изменено")
      setIsSuccessModalOpen(true)
      // Обновить список устройств
      setDevices((devices) =>
        devices.map((d) =>
          d.id === selectedDevice?.id
            ? { ...d, name: editName, system_name: editSystemName, ip_address: editIp, description: editDescription }
            : d,
        ),
      )
    } catch (e: any) {
      setErrorMessage(e.message || "Ошибка при изменении устройства")
      setIsErrorModalOpen(true)
    }
    setLoadingAction(false)
  }

  // Удаление устройства
  const onDelete = async () => {
    setLoadingAction(true)
    try {
      const res = await fetch(`${API_URL}/api/v1/devices/${selectedDevice?.id}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error("Ошибка при удалении устройства")
      setDevices((devices) => devices.filter((d) => d.id !== selectedDevice?.id))
      setIsDeleteModalOpen(false)
      setSelectedDevice(null)
      setSuccessMessage("Устройство успешно удалено")
      setIsSuccessModalOpen(true)
    } catch (e: any) {
      setIsDeleteModalOpen(false)
      setErrorMessage(e.message || "Ошибка при удалении устройства")
      setIsErrorModalOpen(true)
    }
    setLoadingAction(false)
  }

  // Функция для обновления списка устройств
  const refreshDevices = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/v1/devices/`)
      const data = await res.json()
      // Получаем статусы устройств через метрики
      const metricsRes = await fetch(`${API_URL}/api/v1/metrics/metrics`)
      const metricsText = await metricsRes.text()
      const statusMap: Record<string, "online" | "offline"> = {}
      metricsText.split("\n").forEach((line) => {
        const match = line.match(/device_up\{host_name="([^"]+)"\}\s+([01])/)
        if (match) {
          statusMap[match[1]] = match[2] === "1" ? "online" : "offline"
        }
      })
      const now = new Date()
      setDevices(
        data.map((d: any) => ({
          id: d.id,
          name: d.name,
          system_name: d.system_name,
          ip_address: d.ip_address,
          description: d.description,
          status: statusMap[d.name] || "offline",
          lastCheck: now.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }),
        })),
      )
    } catch {
      setDevices([])
    }
    setLoading(false)
  }

  useEffect(() => {
    refreshDevices()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Управление устройствами</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refreshDevices} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Обновить
          </Button>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Добавить устройство
          </Button>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Поиск устройств по имени, IP или описанию..."
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
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Имя</TableHead>
                  <TableHead>Имя системы</TableHead>
                  <TableHead>IP-адрес</TableHead>
                  <TableHead>Описание</TableHead>
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
                      <TableCell>{device.system_name}</TableCell>
                      <TableCell>{device.ip_address}</TableCell>
                      <TableCell>{device.description}</TableCell>
                      <TableCell>
                        {device.status === "online" ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            В сети
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
                    <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                      Устройства не найдены
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
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
            <Input
              id="name"
              placeholder="Введите имя устройства"
              value={createName}
              onChange={(e) => setCreateName(e.target.value)}
              disabled={loadingAction}
            />
            {createErrors.name && <div className="text-red-500 text-xs">{createErrors.name}</div>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="system_name">Имя системы</Label>
            <Input
              id="system_name"
              placeholder="Введите имя системы"
              value={createSystemName}
              onChange={(e) => setCreateSystemName(e.target.value)}
              disabled={loadingAction}
            />
            {createErrors.system_name && <div className="text-red-500 text-xs">{createErrors.system_name}</div>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="ip">IP-адрес</Label>
            <Input
              id="ip"
              placeholder="Введите IP-адрес"
              value={createIp}
              onChange={(e) => setCreateIp(e.target.value)}
              disabled={loadingAction}
            />
            {createErrors.ip && <div className="text-red-500 text-xs">{createErrors.ip}</div>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Описание</Label>
            <Input
              id="description"
              placeholder="Введите описание"
              value={createDescription}
              onChange={(e) => setCreateDescription(e.target.value)}
              disabled={loadingAction}
            />
          </div>
          <div className="pt-6 space-x-2 flex items-center justify-end w-full">
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)} disabled={loadingAction}>
              Отмена
            </Button>
            <Button onClick={handleCreate} disabled={loadingAction}>
              {loadingAction ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
              Добавить
            </Button>
          </div>
        </div>
      </Modal>

      {/* Модальное окно редактирования устройства */}
      {selectedDevice && isEditModalOpen && (
        <Modal
          title="Редактировать устройство"
          description="Измените параметры устройства"
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
        >
          <div className="space-y-4 py-2 pb-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Имя устройства</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                disabled={loadingAction}
              />
              {editErrors.name && <div className="text-red-500 text-xs">{editErrors.name}</div>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-system_name">Имя системы</Label>
              <Input
                id="edit-system_name"
                value={editSystemName}
                onChange={(e) => setEditSystemName(e.target.value)}
                disabled={loadingAction}
              />
              {editErrors.system_name && <div className="text-red-500 text-xs">{editErrors.system_name}</div>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-ip">IP-адрес</Label>
              <Input id="edit-ip" value={editIp} onChange={(e) => setEditIp(e.target.value)} disabled={loadingAction} />
              {editErrors.ip && <div className="text-red-500 text-xs">{editErrors.ip}</div>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Описание</Label>
              <Input
                id="edit-description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                disabled={loadingAction}
              />
              {editErrors.description && <div className="text-red-500 text-xs">{editErrors.description}</div>}
            </div>
            <div className="pt-6 space-x-2 flex items-center justify-end w-full">
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)} disabled={loadingAction}>
                Отмена
              </Button>
              <Button onClick={handleEditSave} disabled={loadingAction}>
                {loadingAction ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
                Сохранить
              </Button>
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
        loading={loadingAction}
      />

      {/* Модальное окно успеха */}
      <Modal
        title="Успех"
        description={successMessage}
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
      >
        <div className="flex justify-end pt-4">
          <Button onClick={() => setIsSuccessModalOpen(false)}>Ок</Button>
        </div>
      </Modal>

      {/* Модальное окно ошибки */}
      <Modal
        title="Ошибка"
        description={errorMessage}
        isOpen={isErrorModalOpen}
        onClose={() => setIsErrorModalOpen(false)}
      >
        <div className="flex justify-end pt-4">
          <Button onClick={() => setIsErrorModalOpen(false)}>Ок</Button>
        </div>
      </Modal>
    </div>
  )
}
