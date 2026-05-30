"use client";

import { useCallback, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type ConfirmOptions = {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Si es true, el boton de confirmar usa el estilo destructivo (rojo). */
  destructive?: boolean;
};

type ConfirmState = ConfirmOptions & {
  resolve: (value: boolean) => void;
};

/**
 * Hook de confirmacion con dialogo estilizado (reemplaza window.confirm).
 *
 * Uso:
 *   const { confirm, confirmDialog } = useConfirm();
 *   if (!(await confirm({ title, message }))) return;
 *   // ...accion...
 *   return (<>...{confirmDialog}</>);
 */
export function useConfirm() {
  const [state, setState] = useState<ConfirmState | null>(null);

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setState({ ...options, resolve });
    });
  }, []);

  const close = useCallback(
    (result: boolean) => {
      setState((current) => {
        current?.resolve(result);
        return null;
      });
    },
    [],
  );

  const confirmDialog = (
    <Dialog
      open={state !== null}
      onOpenChange={(open) => {
        if (!open) close(false);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-spaceGrotesk text-base font-black uppercase tracking-[0.12em]">
            {state?.title}
          </DialogTitle>
        </DialogHeader>

        <p className="font-workSans text-sm text-muted-foreground">
          {state?.message}
        </p>

        <div className="flex justify-end gap-2 pt-4">
          <Button
            variant="outline"
            onClick={() => close(false)}
            className="font-spaceGrotesk text-xs font-bold uppercase tracking-wide"
          >
            {state?.cancelLabel ?? "Cancelar"}
          </Button>
          <Button
            variant={state?.destructive ? "destructive" : "default"}
            onClick={() => close(true)}
            className="font-spaceGrotesk text-xs font-bold uppercase tracking-wide"
          >
            {state?.confirmLabel ?? "Confirmar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  return { confirm, confirmDialog };
}
