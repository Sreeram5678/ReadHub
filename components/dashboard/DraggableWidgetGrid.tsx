"use client"

import { useState, useCallback } from "react"
import { GripVertical, X } from "lucide-react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { WidgetInstance, WidgetConfig } from "./widgetsConfig"

interface DraggableWidgetGridProps {
  widgets: WidgetInstance[]
  widgetConfigs: WidgetConfig[]
  isCustomizing: boolean
  onWidgetReorder: (widgets: WidgetInstance[]) => void
  renderWidget: (widget: WidgetInstance, config: WidgetConfig) => React.ReactNode
}

export function DraggableWidgetGrid({
  widgets,
  widgetConfigs,
  isCustomizing,
  onWidgetReorder,
  renderWidget,
}: DraggableWidgetGridProps) {
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  const visibleWidgets = widgets.filter((w) => w.visible).sort((a, b) => a.order - b.order)
  const configMap = new Map(widgetConfigs.map((c) => [c.id, c]))

  const handleDragStart = (e: React.DragEvent, widgetId: string) => {
    if (!isCustomizing) return
    setDraggedWidget(widgetId)
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/plain", widgetId)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    if (!isCustomizing || !draggedWidget) return
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    setDragOverIndex(index)
  }

  const handleDragLeave = () => {
    setDragOverIndex(null)
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    if (!isCustomizing || !draggedWidget) return
    e.preventDefault()

    const draggedIndex = visibleWidgets.findIndex((w) => w.id === draggedWidget)
    if (draggedIndex === -1 || draggedIndex === dropIndex) {
      setDraggedWidget(null)
      setDragOverIndex(null)
      return
    }

    const newWidgets = [...widgets]
    const draggedWidgetInstance = newWidgets.find((w) => w.id === draggedWidget)
    if (!draggedWidgetInstance) {
      setDraggedWidget(null)
      setDragOverIndex(null)
      return
    }

    // Remove dragged widget from its current position
    const draggedOrder = draggedWidgetInstance.order
    const dropOrder = newWidgets.find((w) => w.id === visibleWidgets[dropIndex].id)?.order ?? draggedOrder

    // Update orders
    if (draggedOrder < dropOrder) {
      // Moving down
      newWidgets.forEach((w) => {
        if (w.order > draggedOrder && w.order <= dropOrder) {
          w.order = w.order - 1
        }
      })
      draggedWidgetInstance.order = dropOrder
    } else {
      // Moving up
      newWidgets.forEach((w) => {
        if (w.order >= dropOrder && w.order < draggedOrder) {
          w.order = w.order + 1
        }
      })
      draggedWidgetInstance.order = dropOrder
    }

    onWidgetReorder(newWidgets)
    setDraggedWidget(null)
    setDragOverIndex(null)
  }

  const handleDragEnd = () => {
    setDraggedWidget(null)
    setDragOverIndex(null)
  }

  const getGridCols = (widget: WidgetInstance): string => {
    const config = configMap.get(widget.id)
    const cols = widget.cols ?? config?.gridCols ?? 1

    // Map logical column count to Tailwind span classes.
    // All widgets are single-column on mobile; they expand on larger screens.
    if (cols >= 4) {
      return "col-span-1 sm:col-span-2 lg:col-span-4"
    }
    if (cols === 2) {
      return "col-span-1 sm:col-span-2 lg:col-span-2"
    }
    return "col-span-1 sm:col-span-2 lg:col-span-1"
  }

  const handleResize = (widgetId: WidgetInstance["id"]) => {
    if (!isCustomizing) return
    const config = configMap.get(widgetId)
    const minCols = config?.minCols ?? 1
    const maxCols = config?.maxCols ?? 2

    const updated = widgets.map((w) => {
      if (w.id !== widgetId) return w
      const currentCols = w.cols ?? config?.gridCols ?? 1
      const nextCols = currentCols >= maxCols ? minCols : currentCols + 1
      return { ...w, cols: nextCols }
    })

    onWidgetReorder(updated)
  }

  if (visibleWidgets.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No widgets visible. Use the customize button to add widgets to your dashboard.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {visibleWidgets.map((widget, index) => {
        const config = configMap.get(widget.id)
        if (!config) return null

        const isDragging = draggedWidget === widget.id
        const isDragOver = dragOverIndex === index

        return (
          <div
            key={widget.id}
            className={cn(
              getGridCols(widget),
              "relative",
              isDragging && "opacity-50",
              isDragOver && "ring-2 ring-primary ring-offset-2"
            )}
            draggable={isCustomizing}
            onDragStart={(e) => handleDragStart(e, widget.id)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
          >
            {isCustomizing && (
              <>
                <div className="absolute -top-2 -left-2 z-10 flex items-center gap-1">
                  <div className="bg-primary text-primary-foreground rounded p-1 cursor-move">
                    <GripVertical className="h-4 w-4" />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleResize(widget.id)}
                  className="absolute -bottom-2 -right-2 z-10 rounded-full border bg-background px-2 py-0.5 text-[10px] text-muted-foreground shadow-sm"
                >
                  Resize
                </button>
              </>
            )}
            {renderWidget(widget, config)}
          </div>
        )
      })}
    </div>
  )
}

