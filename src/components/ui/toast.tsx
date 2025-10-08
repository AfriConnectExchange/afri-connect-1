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
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
  {
    variants: {
      variant: {
        default: "border bg-background text-foreground",
        destructive:
          // Use a solid red background and white text for error toasts so they are
          // clearly readable (high contrast) — override token-based 'destructive'
          // classes which were too translucent in the previous design.
          "group border-transparent bg-red-600 text-white",
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
      {/* Left accent */}
      {isDestructive ? (
        <div className="flex-shrink-0 w-10 h-10 rounded-md flex items-center justify-center bg-red-700 text-white" aria-hidden>
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 9v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="16.5" r="1" fill="currentColor" />
          </svg>
        </div>
      ) : (
        // Modern slim accent for success: vertical bar with a small centered check
        <div className="relative flex-shrink-0 h-10 w-2 rounded-r-md bg-green-500" aria-hidden>
          <div className="absolute left-2 -translate-x-1/2 top-1/2 -translate-y-1/2">
            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        {children}

        {/* progress bar: green for success, white/bright for destructive */}
        <div className={cn("mt-3 h-1 w-full overflow-hidden rounded-full", isDestructive ? "bg-white/20" : "bg-green-50")}>
          {isDestructive ? (
            <div className="h-full bg-white/70 animate-toast-progress" style={{ width: '100%' }} />
          ) : (
            <div className="h-full bg-gradient-to-r from-green-500 to-green-400 animate-toast-progress" style={{ width: '100%' }} />
          )}
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
