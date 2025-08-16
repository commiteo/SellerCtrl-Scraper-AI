import * as React from "react"
import * as ToastPrimitives from "@radix-ui/react-toast"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const ToastProvider = ToastPrimitives.Provider

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]",
      className
    )}
    {...props}
  />
))
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-lg border p-6 pr-8 shadow-xl transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
  {
    variants: {
      variant: {
        default: "border-[#2A2A2A] bg-[#1F1F1F] text-[#E0E0E0] shadow-[0_8px_32px_rgba(0,0,0,0.3)]",
        destructive:
          "border-[#FF4444] bg-[#FF0000] text-[#FFFFFF] shadow-[0_8px_32px_rgba(255,0,0,0.3)] font-semibold",
        success:
          "border-[#00CC44] bg-[#00AA33] text-[#FFFFFF] shadow-[0_8px_32px_rgba(0,170,51,0.3)] font-semibold",
        warning:
          "border-[#FFAA00] bg-[#FF8800] text-[#FFFFFF] shadow-[0_8px_32px_rgba(255,136,0,0.3)] font-semibold",
        info:
          "border-[#0088FF] bg-[#0066CC] text-[#FFFFFF] shadow-[0_8px_32px_rgba(0,102,204,0.3)] font-semibold",
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
>(({ className, variant, ...props }, ref) => {
  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    />
  )
})
Toast.displayName = ToastPrimitives.Root.displayName

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-[#FF6666] group-[.destructive]:hover:border-[#FF4444] group-[.destructive]:hover:bg-[#CC0000] group-[.destructive]:hover:text-[#FFFFFF] group-[.destructive]:focus:ring-[#FF4444] group-[.success]:border-[#66FF66] group-[.success]:hover:border-[#44FF44] group-[.success]:hover:bg-[#008800] group-[.success]:hover:text-[#FFFFFF] group-[.success]:focus:ring-[#44FF44] group-[.warning]:border-[#FFCC66] group-[.warning]:hover:border-[#FFAA44] group-[.warning]:hover:bg-[#CC6600] group-[.warning]:hover:text-[#FFFFFF] group-[.warning]:focus:ring-[#FFAA44] group-[.info]:border-[#66CCFF] group-[.info]:hover:border-[#44AAFF] group-[.info]:hover:bg-[#004499] group-[.info]:hover:text-[#FFFFFF] group-[.info]:focus:ring-[#44AAFF]",
      className
    )}
    {...props}
  />
))
ToastAction.displayName = ToastPrimitives.Action.displayName

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      "absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100 group-[.destructive]:text-[#FFCCCC] group-[.destructive]:hover:text-[#FFFFFF] group-[.destructive]:focus:ring-[#FF4444] group-[.destructive]:focus:ring-offset-[#FF0000] group-[.success]:text-[#CCFFCC] group-[.success]:hover:text-[#FFFFFF] group-[.success]:focus:ring-[#44FF44] group-[.success]:focus:ring-offset-[#00AA33] group-[.warning]:text-[#FFEECC] group-[.warning]:hover:text-[#FFFFFF] group-[.warning]:focus:ring-[#FFAA44] group-[.warning]:focus:ring-offset-[#FF8800] group-[.info]:text-[#CCEEFF] group-[.info]:hover:text-[#FFFFFF] group-[.info]:focus:ring-[#44AAFF] group-[.info]:focus:ring-offset-[#0066CC]",
      className
    )}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
))
ToastClose.displayName = ToastPrimitives.Close.displayName

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn("text-sm font-bold", className)}
    {...props}
  />
))
ToastTitle.displayName = ToastPrimitives.Title.displayName

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn("text-sm font-medium opacity-95", className)}
    {...props}
  />
))
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
