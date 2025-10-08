"use client"

import * as React from "react"
import * as ToastPrimitives from "@radix-ui/react-toast"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

// Context used to let child toast components know the current variant
const ToastVariantContext = React.createContext<"default" | "destructive" | undefined>(undefined)

const ToastProvider = ToastPrimitives.Provider

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:top-0 sm:right-0 sm:flex-col md:max-w-[420px]",
      className
    )}
    {...props}
  />
))
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-lg border p-4 pr-6 shadow-2xl transition-all will-change-transform transform-gpu data-[state=open]:animate-in data-[state=closed]:animate-out",
  {
    variants: {
      variant: {
        default: "border bg-white/80 backdrop-blur-sm text-foreground",
        destructive: "border-transparent bg-red-600 text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> &
    VariantProps<typeof toastVariants>
>(({ className, variant, children, ...props }, ref) => {
  const isDestructive = variant === "destructive"

  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    >
  <ToastVariantContext.Provider value={variant as "default" | "destructive" | undefined}>
      {/* 3D badge / accent */}
      <div className={cn("flex-shrink-0 rounded-md flex items-center justify-center", isDestructive ? "w-10 h-10 bg-red-700 text-white" : "w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 text-white")} aria-hidden>
        {/* layered circular badge for a subtle 3D effect */}
        <div className="relative w-9 h-9 rounded-full shadow-inner transform -translate-y-0.5">
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/30 to-white/5 opacity-60" />
          <div className="absolute inset-0 flex items-center justify-center">
            {isDestructive ? (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 9v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /><circle cx="12" cy="16.5" r="1" fill="currentColor" /></svg>
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {children}

        {/* progress rail + animated shrinking bar (shrinks left-to-right over auto-dismiss duration) */}
        <div className={cn("mt-3 h-1 w-full overflow-hidden rounded-full bg-black/5", isDestructive ? "bg-white/10" : "bg-gradient-to-r from-green-100/60 to-green-50/60")}>
          <div
            className={cn(
              "h-full rounded-full transform-gpu",
              isDestructive ? "bg-white/80 animate-toast-fill-destructive" : "bg-gradient-to-r from-green-500 to-green-400 animate-toast-fill"
            )}
            style={{ width: '100%' }}
            aria-hidden
          />
        </div>
      </div>
      </ToastVariantContext.Provider>
    </ToastPrimitives.Root>
  )
});
Toast.displayName = ToastPrimitives.Root.displayName

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => {
  const variant = React.useContext(ToastVariantContext)
  const isDestructive = variant === "destructive"

  return (
    <ToastPrimitives.Action
      ref={ref}
      className={cn(
        "inline-flex h-8 shrink-0 items-center justify-center rounded-md bg-white/6 px-3 text-sm font-medium transition-colors hover:bg-white/10 focus:outline-none disabled:pointer-events-none disabled:opacity-50",
        // when the toast is destructive the action should be white on red
        isDestructive && "bg-white/10 text-white",
        className
      )}
      {...props}
    />
  )
})
ToastAction.displayName = ToastPrimitives.Action.displayName

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => {
  const variant = React.useContext(ToastVariantContext)
  const isDestructive = variant === "destructive"

  return (
    <ToastPrimitives.Close
      ref={ref}
      className={cn(
        "absolute right-3 top-3 rounded-md p-1 text-foreground/60 hover:text-foreground focus:outline-none",
        // ensure the close icon is visible on destructive toasts
        isDestructive && "text-white/90",
        className
      )}
      toast-close=""
      {...props}
    >
      <X className="h-4 w-4" />
    </ToastPrimitives.Close>
  )
})
ToastClose.displayName = ToastPrimitives.Close.displayName

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => {
  const variant = React.useContext(ToastVariantContext)
  const isDestructive = variant === "destructive"

  return (
    <ToastPrimitives.Title
      ref={ref}
      className={cn(
        "text-sm font-semibold text-foreground",
        // title should be white in destructive toasts
        isDestructive && "text-white",
        className
      )}
      {...props}
    />
  )
})
ToastTitle.displayName = ToastPrimitives.Title.displayName

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => {
  const variant = React.useContext(ToastVariantContext)
  const isDestructive = variant === "destructive"

  return (
    <ToastPrimitives.Description
      ref={ref}
      className={cn(
        "text-sm text-muted-foreground",
        // description should be higher contrast for destructive toasts
        isDestructive && "text-white/90",
        className
      )}
      {...props}
    />
  )
})
ToastDescription.displayName = ToastPrimitives.Description.displayName

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>

type ToastActionElement = React.ReactElement<typeof ToastAction>

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
}
