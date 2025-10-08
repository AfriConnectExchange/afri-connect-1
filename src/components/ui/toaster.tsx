"use client"

import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { CheckCircle, AlertTriangle, Info } from 'lucide-react'

export function Toaster() {
  const { toasts } = useToast()

  const variantIcon = (variant?: string) => {
    switch (variant) {
      case 'destructive':
        return <AlertTriangle className="w-5 h-5 text-red-400" />
      case 'info':
        return <Info className="w-5 h-5 text-blue-400" />
      default:
        return <CheckCircle className="w-5 h-5 text-green-400" />
    }
  }

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        return (
          <Toast key={id} {...props} variant={(variant as any) || 'default'}>
            <div className="flex items-start gap-4">
              <div className="mt-1">{variantIcon(variant ?? undefined)}</div>
              <div className="min-w-0">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && (
                  <ToastDescription>{description}</ToastDescription>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {action}
              <ToastClose />
            </div>
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
