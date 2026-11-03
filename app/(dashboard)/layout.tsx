"use client";

import {
  startTransition,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CalendarClock,
  ChevronsUpDown,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Repeat,
  Settings,
  UsersRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BrandLogo } from "@/components/brand-logo";
import { useSupabase } from "@/hooks/use-supabase";
import { cn } from "@/lib/utils";

const SIDEBAR_STORAGE_KEY = "rgl-admin-sidebar-collapsed";

type NavItem = {
  label: string;
  href: string;
  icon: ReactNode;
};

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard className="size-4" />,
  },
  {
    label: "Reservas",
    href: "/reservas",
    icon: <CalendarClock className="size-4" />,
  },
  {
    label: "Servicios",
    href: "/servicios",
    icon: <Settings className="size-4" />,
  },
  {
    label: "Clientes",
    href: "/clientes",
    icon: <UsersRound className="size-4" />,
  },
  {
    label: "Suscripciones",
    href: "/subscriptions",
    icon: <Repeat className="size-4" />,
  },
  {
    label: "Transacciones",
    href: "/transacciones",
    icon: <CreditCard className="size-4" />,
  },
];

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = useSupabase();
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [sidebarReady, setSidebarReady] = useState(false);
  const [displayName, setDisplayName] = useState("Administrador");
  const [roleLabel, setRoleLabel] = useState("Admin");

  // Restaura la preferencia del menú; la transición se activa después
  // para que no se anime al recargar la página.
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        setCollapsed(localStorage.getItem(SIDEBAR_STORAGE_KEY) === "1");
      } catch {
        // localStorage no disponible: se mantiene expandido
      }
      requestAnimationFrame(() => setSidebarReady(true));
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  // Cierra sesion desde el navegador: el cliente de Supabase borra las
  // cookies de sesion y luego se navega al login (que el middleware deja pasar).
  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }, [supabase, router]);

  const toggleSidebar = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SIDEBAR_STORAGE_KEY, next ? "1" : "0");
      } catch {
        // localStorage no disponible: la preferencia no se guarda
      }
      return next;
    });
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "b") {
        event.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [toggleSidebar]);

  useEffect(() => {
    let isMounted = true;

    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!isMounted) return;

      if (!user) {
        setDisplayName("Administrador");
        setRoleLabel("Admin");
        return;
      }

      const metadataFullName =
        typeof user.user_metadata?.full_name === "string"
          ? user.user_metadata.full_name.trim()
          : "";
      const metadataFirstName =
        typeof user.user_metadata?.first_name === "string"
          ? user.user_metadata.first_name.trim()
          : "";
      const metadataLastName =
        typeof user.user_metadata?.last_name === "string"
          ? user.user_metadata.last_name.trim()
          : "";
      const metadataName =
        metadataFullName || `${metadataFirstName} ${metadataLastName}`.trim();

      setDisplayName(metadataName || user.email?.split("@")[0] || "Admin");

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      if (!isMounted || !profile) return;

      setRoleLabel(profile.role === "admin" ? "Admin" : "Usuario");
    };

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void loadUser();
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((chunk) => chunk[0]?.toUpperCase())
    .join("");
  const firstName = displayName.split(" ").filter(Boolean)[0] ?? displayName;

  return (
    <div className="relative min-h-screen overflow-x-clip bg-background">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_12%,rgba(174,41,0,0.07),transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.72),rgba(218,222,219,0.34))]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-25 [background-image:linear-gradient(to_right,rgba(44,47,46,0.055)_1px,transparent_1px),linear-gradient(to_bottom,rgba(44,47,46,0.055)_1px,transparent_1px)] [background-size:44px_44px]"
      />

      <div className="relative flex min-h-screen">
        <aside
          className={cn(
            "sticky top-0 hidden h-screen shrink-0 flex-col overflow-hidden border-r border-border/70 bg-card/90 shadow-[18px_0_60px_rgba(44,47,46,0.05)] backdrop-blur-xl md:flex",
            sidebarReady && "transition-[width] duration-300 ease-out",
            collapsed ? "w-[76px]" : "w-72",
          )}
        >
          <div
            className={cn(
              "flex items-center py-7",
              collapsed ? "justify-center px-0" : "justify-between pl-8 pr-4",
            )}
          >
            {!collapsed ? (
              <Link href="/dashboard" aria-label="RGL Estudio, dashboard">
                <BrandLogo />
              </Link>
            ) : null}
            <button
              type="button"
              onClick={toggleSidebar}
              title={collapsed ? "Expandir menú (Ctrl+B)" : "Contraer menú (Ctrl+B)"}
              aria-label={collapsed ? "Expandir menú" : "Contraer menú"}
              aria-expanded={!collapsed}
              className="flex size-9 items-center justify-center text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {collapsed ? (
                <PanelLeftOpen className="size-[18px]" />
              ) : (
                <PanelLeftClose className="size-[18px]" />
              )}
            </button>
          </div>

          <nav className={cn("flex flex-1 flex-col gap-2", collapsed ? "px-3" : "px-4")}>
            {navItems.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  aria-label={collapsed ? item.label : undefined}
                  className={cn(
                    "flex items-center gap-3 whitespace-nowrap border border-transparent py-3 font-spaceGrotesk text-[0.72rem] font-bold uppercase tracking-[0.18em] transition-all",
                    collapsed ? "justify-center px-0" : "px-4",
                    isActive
                      ? "border-primary/30 bg-primary/10 text-primary shadow-[5px_5px_0_var(--border)]"
                      : "text-foreground/75 hover:border-border hover:bg-muted/80 hover:text-foreground",
                  )}
                >
                  <span className="text-primary/80">{item.icon}</span>
                  {!collapsed ? item.label : null}
                </Link>
              );
            })}
          </nav>

          <div className={cn("mt-auto border-t border-border/60 py-4", collapsed ? "flex justify-center px-0" : "px-4")}>
            <DropdownMenu>
              <DropdownMenuTrigger
                title={collapsed ? displayName : undefined}
                aria-label="Menú de cuenta"
                className={cn(
                  "flex items-center gap-3 border border-border/60 bg-background/70 text-left transition-colors hover:bg-muted data-popup-open:bg-muted",
                  collapsed ? "justify-center border-transparent bg-transparent p-1" : "w-full px-3 py-2.5",
                )}
              >
                <Avatar>
                  <AvatarFallback>{initials || "AD"}</AvatarFallback>
                </Avatar>
                {!collapsed ? (
                  <>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-spaceGrotesk text-sm font-bold text-foreground">
                        {firstName}
                      </span>
                      <span className="block text-xs text-muted-foreground">{roleLabel}</span>
                    </span>
                    <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
                  </>
                ) : null}
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side={collapsed ? "right" : "top"}
                sideOffset={8}
                className="w-64 rounded-none p-1.5"
              >
                <div className="px-2 py-2">
                  <p className="font-spaceGrotesk text-sm font-bold text-foreground">
                    {displayName}
                  </p>
                  <p className="text-xs text-muted-foreground">{roleLabel}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  className="rounded-none px-2 py-2"
                  onClick={() => startTransition(() => handleLogout())}
                >
                  <LogOut className="size-4" />
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-border/70 bg-background/88 backdrop-blur-xl md:hidden">
            <div className="flex w-full items-center px-4 py-3">
              <div className="flex items-center gap-3">
                <Sheet open={open} onOpenChange={setOpen}>
                  <SheetTrigger
                    render={<Button variant="ghost" size="icon" className="md:hidden" />}
                  >
                    <Menu className="size-5" />
                    <span className="sr-only">Abrir menu</span>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80 p-0">
                    <SheetTitle className="sr-only">Menu de dashboard</SheetTitle>
                    <div className="px-6 py-6">
                      <BrandLogo />
                    </div>
                    <div className="h-px w-full bg-border" />
                    <nav className="flex flex-col gap-2 px-4 py-5">
                      {navItems.map((item) => {
                        const isActive =
                          pathname === item.href ||
                          pathname.startsWith(item.href + "/");
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setOpen(false)}
                            className={cn(
                              "flex items-center gap-3 border border-transparent px-4 py-3 font-spaceGrotesk text-[0.72rem] font-bold uppercase tracking-[0.18em] transition-colors",
                              isActive
                                ? "border-primary/40 bg-primary/10 text-primary"
                                : "text-foreground/80 hover:border-border/60 hover:bg-muted",
                            )}
                          >
                            <span className="text-primary/80">
                              {item.icon}
                            </span>
                            {item.label}
                          </Link>
                        );
                      })}
                    </nav>
                    <div className="mt-auto border-t border-border/60 px-6 py-6">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>{initials || "AD"}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-spaceGrotesk text-sm font-bold text-foreground">
                            {displayName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {roleLabel}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => startTransition(() => handleLogout())}
                          className="h-11 w-full border-border/70 font-spaceGrotesk text-[0.68rem] font-bold uppercase tracking-[0.16em]"
                        >
                          Cerrar sesion
                        </Button>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>

                <BrandLogo />
              </div>
            </div>
          </header>

          <main className="min-h-screen">{children}</main>
        </div>
      </div>
    </div>
  );
}
