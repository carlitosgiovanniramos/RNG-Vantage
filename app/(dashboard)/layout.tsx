export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
      <div className="relative">{children}</div>
    </div>
  );
}
