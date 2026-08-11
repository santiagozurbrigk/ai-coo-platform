"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "../lib/utils";

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-[4px] dark:bg-black/60 dark:backdrop-blur-[8px]",
      "data-[state=open]:animate-dialog-overlay-show data-[state=closed]:animate-dialog-overlay-hide",
      "motion-reduce:data-[state=open]:animate-none motion-reduce:data-[state=closed]:animate-none",
      className
    )}
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "glass-liquid-border fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-modal)]",
        "origin-center data-[state=open]:animate-dialog-content-show data-[state=closed]:animate-dialog-content-hide",
        "motion-reduce:data-[state=open]:animate-dialog-content-show-reduced motion-reduce:data-[state=closed]:animate-dialog-content-hide-reduced",
        "dark:border-glass dark:bg-[#111111]/80 dark:backdrop-blur-xl dark:backdrop-saturate-[180%]",
        // Siempre cortar overflow horizontal; el scroll vertical se habilita pasando overflow-y-auto en className.
        // Evita que al aparecer la scrollbar vertical el contenido se expanda horizontalmente
        // y genere una scrollbar horizontal innecesaria.
        "overflow-x-hidden",
        // Ocultar el track del scrollbar en WebKit y Firefox cuando se activa overflow-y-auto.
        // El contenido sigue siendo scrolleable — solo se oculta la barra visual.
        "[&::-webkit-scrollbar]:hidden [scrollbar-width:none]",
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-muted text-muted-foreground opacity-90 transition-all duration-150 hover:bg-accent hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 disabled:pointer-events-none dark:border-white/10 dark:bg-white/[0.06] dark:text-white/60 dark:hover:bg-white/[0.09] dark:hover:text-white">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 border-b border-border px-6 py-5 text-center sm:text-left dark:border-white/[0.06]",
      className
    )}
    {...props}
  />
);

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse border-t border-border px-6 py-4 sm:flex-row sm:justify-end sm:space-x-2 dark:border-white/[0.06]",
      className
    )}
    {...props}
  />
);

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("text-lg font-medium leading-none tracking-tight text-foreground", className)}
    {...props}
  />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
