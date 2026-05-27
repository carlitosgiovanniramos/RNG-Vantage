import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col font-inter bg-background text-foreground">
      <Navbar />
      {/* Espaciador para compensar el navbar fixed (~90px = py-6 + logo 42px) */}
      <div className="h-[90px] shrink-0" />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
