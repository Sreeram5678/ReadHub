"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Settings2, RotateCcw } from "lucide-react"
import { WidgetInstance, WidgetConfig, getDefaultWidgetInstances } from "./widgetsConfig"

interface WidgetCustomizationPanelProps {
  widgets: WidgetInstance[]
  widgetConfigs: WidgetConfig[]
  onWidgetsChange: (widgets: WidgetInstance[]) => void
  onReset: () => void
}

export function WidgetCustomizationPanel({
  widgets,
  widgetConfigs,
  onWidgetsChange,
  onReset,
}: WidgetCustomizationPanelProps) {
  const [open, setOpen] = useState(false)
  const [localWidgets, setLocalWidgets] = useState(widgets)

  // Keep local state in sync when dialog is opened with updated props
  useEffect(() => {
    if (open) {
      setLocalWidgets(widgets)
    }
  }, [open, widgets])

  const widgetMap = new Map(widgets.map((w) => [w.id, w]))

  const groupedWidgets = {
    stats: widgetConfigs.filter((c) => c.category === "stats"),
    activity: widgetConfigs.filter((c) => c.category === "activity"),
    tools: widgetConfigs.filter((c) => c.category === "tools"),
    goals: widgetConfigs.filter((c) => c.category === "goals"),
  }

  const handleToggle = (widgetId: string) => {
    const updated = localWidgets.map((w) =>
      w.id === widgetId ? { ...w, visible: !w.visible } : w
    )
    setLocalWidgets(updated)
  }

  const handleSave = () => {
    onWidgetsChange(localWidgets)
    setOpen(false)
  }

  const handleReset = () => {
    const defaults = getDefaultWidgetInstances()
    setLocalWidgets(defaults)
    onReset()
    setOpen(false)
  }

  const handleCancel = () => {
    setLocalWidgets(widgets)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings2 className="mr-2 h-4 w-4" />
          Customize Dashboard
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Customize Dashboard</DialogTitle>
          <DialogDescription>
            Choose which widgets to display on your dashboard
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {Object.entries(groupedWidgets).map(([category, configs]) => (
            <div key={category} className="space-y-3">
              <h3 className="text-sm font-semibold capitalize">{category}</h3>
              <div className="space-y-2">
                {configs.map((config) => {
                  const widget = widgetMap.get(config.id)
                  const visible = widget?.visible ?? config.defaultVisible
                  return (
                    <div
                      key={config.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex-1">
                        <Label
                          htmlFor={`widget-${config.id}`}
                          className="font-medium cursor-pointer"
                        >
                          {config.title}
                        </Label>
                        {config.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {config.description}
                          </p>
                        )}
                      </div>
                      <Switch
                        id={`widget-${config.id}`}
                        checked={localWidgets.find((w) => w.id === config.id)?.visible ?? visible}
                        onCheckedChange={() => handleToggle(config.id)}
                      />
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between pt-4 border-t">
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset to Default
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
