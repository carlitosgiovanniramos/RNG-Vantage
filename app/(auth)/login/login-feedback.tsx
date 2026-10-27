"use client";

import { useActionState, useRef, useState } from "react";
import { Tooltip } from "@base-ui/react/tooltip";
import { resendSignupConfirmation } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export type Notice = { kind: "success" | "error" | "info"; message: string };

export function AuthNotice({ notice }: { notice: Notice | null }) {
  if (!notice) return null;

  return (
    <div
      role={notice.kind === "error" ? "alert" : "status"}
      aria-atomic="true"
      className={cn(
        "border-0 border-l-2 px-4 py-3 text-xs leading-6 transition-colors duration-300 motion-reduce:transition-none",
        notice.kind === "error"
          ? "border-red-200 bg-red-50 text-red-900 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200"
          : notice.kind === "success"
            ? "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200"
            : "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200",
      )}
    >
      <p
        key={`${notice.kind}:${notice.message}`}
        className="animate-in fade-in slide-in-from-top-1 duration-300 motion-reduce:animate-none"
      >
        {notice.message}
      </p>
    </div>
  );
}

function ConfirmationResendForm({ email }: { email: string }) {
  const [state, action, isPending] = useActionState(resendSignupConfirmation, {
    error: "",
    success: "",
    values: { email: "" },
  });
  const notice: Notice | null = state.error
    ? { kind: "error", message: state.error }
    : state.success
      ? { kind: "success", message: state.success }
      : null;

  return (
    <form action={action} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="confirmation-email">Correo electrónico</Label>
        <Input
          id="confirmation-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={state.values?.email || email}
          className="h-11 rounded-none border-0 border-b-2 border-transparent bg-muted/70 px-4 focus-visible:border-emerald-700 focus-visible:ring-0"
        />
      </div>
      <AuthNotice notice={notice} />
      <Button
        type="submit"
        disabled={isPending}
        className="h-11 w-full rounded-none bg-emerald-900 px-3 text-sm font-medium text-white hover:bg-emerald-800 dark:bg-emerald-800 dark:hover:bg-emerald-700"
      >
        {isPending ? "Reenviando..." : "Reenviar confirmación"}
      </Button>
    </form>
  );
}

export function ConfirmationHelp({ getEmail }: { getEmail: () => string }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Tooltip.Provider delay={250}>
        <Tooltip.Root>
          <Tooltip.Trigger
            ref={triggerRef}
            aria-label="¿No te llegó el correo de confirmación?"
            aria-haspopup="dialog"
            aria-expanded={open}
            onClick={() => {
              setEmail(getEmail().trim());
              setOpen(true);
            }}
            render={
              <Button
                type="button"
                variant="ghost"
                className="size-8 shrink-0 rounded-none bg-emerald-900/5 p-0 font-spaceGrotesk text-sm font-semibold text-emerald-900 hover:bg-emerald-900/10 focus-visible:border-emerald-700 focus-visible:ring-emerald-700/30 dark:text-emerald-300 dark:hover:bg-emerald-900/30"
              />
            }
          >
            <span aria-hidden="true">?</span>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Positioner side="bottom" align="end" sideOffset={8} className="z-50">
              <Tooltip.Popup role="tooltip" className="max-w-60 bg-emerald-950 px-3 py-2 text-xs leading-5 text-white shadow-md">
                ¿No te llegó el correo de confirmación?
              </Tooltip.Popup>
            </Tooltip.Positioner>
          </Tooltip.Portal>
        </Tooltip.Root>
      </Tooltip.Provider>
      <DialogContent
        finalFocus={triggerRef}
        showCloseButton={false}
        className="max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-none p-7 ring-0 sm:max-w-md"
      >
        <DialogClose
          aria-label="Cerrar"
          render={<Button type="button" variant="ghost" size="sm" className="absolute right-3 top-3 rounded-none px-2 text-xs text-muted-foreground" />}
        >
          Cerrar
        </DialogClose>
        <DialogHeader className="gap-3 pr-5">
          <DialogTitle className="font-spaceGrotesk text-2xl font-semibold leading-8 tracking-tight">
            Confirma tu correo
          </DialogTitle>
          <DialogDescription className="leading-6">
            Ingresa el correo con el que te registraste y te enviaremos un nuevo enlace de confirmación. Revisa también spam o promociones.
          </DialogDescription>
        </DialogHeader>
        <ConfirmationResendForm email={email} />
      </DialogContent>
    </Dialog>
  );
}
