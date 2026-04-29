"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  CalendarClock,
  CreditCard,
  LayoutDashboard,
  Menu,
  Repeat,
  Settings,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { logout } from "@/app/(auth)/actions";
import { useSupabase } from "@/hooks/use-supabase";
import { cn } from "@/lib/utils";

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
  const supabase = useSupabase();
  const [open, setOpen] = useState(false);
  const [displayName, setDisplayName] = useState("Administrador");
  const [roleLabel, setRoleLabel] = useState("Admin");

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

  const activeLabel = useMemo(() => {
    const match = navItems.find((item) =>
      pathname === item.href || pathname.startsWith(item.href + "/"),
    );
    return match?.label ?? "Panel";
  }, [pathname]);

  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((chunk) => chunk[0]?.toUpperCase())
    .join("");

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(174,41,0,0.08),transparent_35%),radial-gradient(circle_at_85%_0%,rgba(174,41,0,0.05),transparent_28%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-30 [background-image:linear-gradient(to_right,rgba(44,47,46,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(44,47,46,0.06)_1px,transparent_1px)] [background-size:48px_48px]"
      />

      <div className="relative flex min-h-screen">
        <aside className="hidden w-72 shrink-0 flex-col border-r border-border/60 bg-card/80 backdrop-blur-sm md:flex">
          <div className="flex items-center gap-3 px-6 py-7">
            <Image
              src="/images/logo-rng.webp"
              alt="RGL Estudio Logo"
              width={34}
              height={34}
            />
            <div>
              <p className="font-spaceGrotesk text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
                RGL Estudio
              </p>
              <p className="font-spaceGrotesk text-lg font-black uppercase tracking-tight text-foreground">
                Admin Panel
              </p>
            </div>
          </div>

          <nav className="flex flex-1 flex-col gap-2 px-4">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 border border-transparent px-4 py-3 font-spaceGrotesk text-[0.72rem] font-bold uppercase tracking-[0.18em] transition-colors",
                    isActive
                      ? "border-primary/40 bg-primary/10 text-primary"
                      : "text-foreground/80 hover:border-border/60 hover:bg-muted",
                  )}
                >
                  <span className="text-primary/80">{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto border-t border-border/60 px-6 py-6">
            <div className="flex items-center gap-3">
              <Avatar size="lg">
                <AvatarFallback>{initials || "AD"}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-spaceGrotesk text-sm font-bold text-foreground">
                  {displayName}
                </p>
                <p className="text-xs text-muted-foreground">{roleLabel}</p>
              </div>
            </div>
            <form action={logout} className="mt-4">
              <Button
                type="submit"
                variant="outline"
                className="h-11 w-full border-border/70 font-spaceGrotesk text-[0.68rem] font-bold uppercase tracking-[0.16em]"
              >
                Cerrar sesion
              </Button>
            </form>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-sm">
            <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4">
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
                    <div className="flex items-center gap-3 px-6 py-6">
                      <Image
                        src="/images/logo-rng.webp"
                        alt="RGL Estudio Logo"
                        width={30}
                        height={30}
                      />
                      <div>
                        <p className="font-spaceGrotesk text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
                          RGL Estudio
                        </p>
                        <p className="font-spaceGrotesk text-lg font-black uppercase tracking-tight text-foreground">
                          Admin Panel
                        </p>
                      </div>
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
                      <form action={logout} className="mt-4">
                        <Button
                          type="submit"
                          variant="outline"
                          className="h-11 w-full border-border/70 font-spaceGrotesk text-[0.68rem] font-bold uppercase tracking-[0.16em]"
                        >
                          Cerrar sesion
                        </Button>
                      </form>
                    </div>
                  </SheetContent>
                </Sheet>

                <div>
                  <p className="font-spaceGrotesk text-[0.62rem] font-bold uppercase tracking-[0.22em] text-muted-foreground">
                    Panel administrativo
                  </p>
                  <div className="flex items-center gap-2">
                    <h2 className="font-spaceGrotesk text-lg font-black uppercase tracking-tight text-foreground">
                      {activeLabel}
                    </h2>
                    <BarChart3 className="size-4 text-primary" />
                  </div>
                </div>
              </div>

              <div className="hidden items-center gap-3 md:flex">
                <div className="text-right">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    Sesion activa
                  </p>
                  <p className="font-spaceGrotesk text-sm font-bold text-foreground">
                    {displayName}
                  </p>
                </div>
                <Avatar>
                  <AvatarFallback>{initials || "AD"}</AvatarFallback>
                </Avatar>
              </div>
            </div>
          </header>

          <main className="min-h-screen">{children}</main>
        </div>
      </div>
    </div>
  );
}
