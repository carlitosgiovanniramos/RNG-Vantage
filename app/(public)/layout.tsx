export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      {/* TODO: Navbar publica con links a catalogo, reservar, login */}
      <main>{children}</main>
      {/* TODO: Footer con link a politica de privacidad */}
    </div>
  );
}
