import Link from "next/link";
import Image from "next/image";
import { Network, BarChart, GraduationCap, TrendingUp, Calendar, Package } from "lucide-react";

// MOCK DATA: Simula la respuesta futura de Supabase
const mockServices = [
  {
    id: "01",
    icon: Network,
    name: "Manejo de Redes",
    description: "Estrategia de contenido y gestión de comunidades con enfoque en conversión.",
    price: 150,
    unit: "/mes"
  },
  {
    id: "02",
    icon: BarChart,
    name: "Auditoría Digital",
    description: "Análisis profundo de tus métricas y procesos para detectar fugas de capital.",
    price: 299,
    unit: "/audit"
  },
  {
    id: "03",
    icon: GraduationCap,
    name: "Capacitación",
    description: "Formación técnica para equipos de ventas y gestión administrativa.",
    price: 450,
    unit: "/sesión"
  }
];

export default function LandingPage() {
  return (
    <>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: flex;
          width: 200%;
          animation: marquee 20s linear infinite;
        }
      `}</style>
      
      <main className="flex flex-col min-h-screen">
        {/* --- Hero Section --- */}
        <section className="relative flex flex-col justify-center px-4 sm:px-8 py-20 overflow-hidden min-h-[calc(100vh-64px)] lg:min-h-[819px]">
          <div className="max-w-[1440px] mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Texto Principal */}
            <div className="lg:col-span-8 z-10 pt-10">
              <div className="inline-block bg-primary text-white px-4 py-1 font-spaceGrotesk text-xs tracking-widest uppercase mb-6">
                Digital Marketing Authority
              </div>
              
              <h1 className="text-6xl sm:text-7xl md:text-9xl font-black tracking-tighter leading-[0.85] mb-8 uppercase text-foreground">
                RNG-Vantage
              </h1>
              
              <p className="text-lg sm:text-xl md:text-2xl font-inter max-w-2xl mb-12 text-muted-foreground leading-relaxed">
                Automatización de ventas, reservas y control financiero para tu emprendimiento de marketing digital. <span className="text-primary font-bold">Escala sin límites.</span>
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6">
                <Link href="/catalogo">
                  <button className="w-full sm:w-auto bg-primary text-primary-foreground px-10 py-5 font-spaceGrotesk font-black text-lg uppercase tracking-tight hover:bg-[#851e00] transition-all active:scale-95 shadow-[8px_8px_0px_0px_rgba(44,47,46,1)] dark:shadow-[8px_8px_0px_0px_rgba(245,247,245,1)]">
                    Ver Servicios
                  </button>
                </Link>
                <Link href="/reservar">
                  <button className="w-full sm:w-auto border-4 border-foreground text-foreground px-10 py-5 font-spaceGrotesk font-black text-lg uppercase tracking-tight hover:bg-foreground hover:text-background transition-all active:scale-95">
                    Reservar Capacitación
                  </button>
                </Link>
              </div>
            </div>

            {/* Imagen Lateral (Solo Desktop) */}
            <div className="lg:col-span-4 relative hidden lg:block">
              <div className="w-full aspect-square bg-muted relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  alt="Data visualization dashboard" 
                  className="w-full h-full object-cover grayscale contrast-125 brightness-90" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAErxv1SSMzOwO3yl8XkD9_mjW6IEyzqcXbeVcwx7RWVjqxeFaYYumyFBv5zr_FrrupwtAS2gZNRqbvCoVX3vHt4bPxcToOVRXVgVjRRAYeJoxBjuGRmGL9NL0A3Uy9RFoyecTCsr7SKSmens2_KRx6cDQmggEfhX8LLUFCPS7-538Ff8reLkhh32BzGf5Zis2uQvKG2ygZwA2W32Djlrq7fQRcTosOat77WibS65eo80PxD2mDuYL0eyPyGa9GREd4zzTJW5EBFw77"
                />
                <div className="absolute -bottom-6 -left-6 bg-primary p-8 text-primary-foreground">
                  <TrendingUp className="h-12 w-12" />
                </div>
              </div>
            </div>
          </div>

          {/* Kinetic Marquee */}
          <div className="absolute bottom-0 left-0 w-full bg-foreground py-4 overflow-hidden whitespace-nowrap">
            <div className="flex space-x-20 animate-marquee items-center">
              <span className="text-background font-spaceGrotesk font-black text-2xl sm:text-4xl uppercase opacity-20">Scale</span>
              <span className="text-primary font-spaceGrotesk font-black text-2xl sm:text-4xl uppercase">Automate</span>
              <span className="text-background font-spaceGrotesk font-black text-2xl sm:text-4xl uppercase opacity-20">Control</span>
              <span className="text-primary font-spaceGrotesk font-black text-2xl sm:text-4xl uppercase">Growth</span>
              <span className="text-background font-spaceGrotesk font-black text-2xl sm:text-4xl uppercase opacity-20">Efficiency</span>
              <span className="text-primary font-spaceGrotesk font-black text-2xl sm:text-4xl uppercase">Scale</span>
              <span className="text-background font-spaceGrotesk font-black text-2xl sm:text-4xl uppercase opacity-20">Automate</span>
              <span className="text-primary font-spaceGrotesk font-black text-2xl sm:text-4xl uppercase">Growth</span>
              <span className="text-background font-spaceGrotesk font-black text-2xl sm:text-4xl uppercase opacity-20">Control</span>
            </div>
          </div>
        </section>

        {/* --- Nuestros Servicios (Bento Grid) --- */}
        <section className="py-20 sm:py-32 px-4 sm:px-8 bg-muted/50">
          <div className="max-w-[1440px] mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 sm:mb-20 gap-8">
              <div className="max-w-xl">
                <h2 className="text-4xl sm:text-5xl md:text-7xl font-spaceGrotesk font-black uppercase tracking-tighter mb-6 text-foreground">
                  Nuestros Servicios
                </h2>
                <p className="text-muted-foreground font-inter text-base sm:text-lg">
                  Estructuras sólidas para negocios digitales que buscan la excelencia operativa y el crecimiento medible.
                </p>
              </div>
              <div className="font-spaceGrotesk text-sm uppercase tracking-widest text-primary font-bold">
                Services / 2026
              </div>
            </div>
            
            {/* Grid de Servicios Mocks */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-border">
              {mockServices.map((service, index) => {
                const Icon = service.icon;
                return (
                  <div 
                    key={service.id} 
                    className={`bg-background p-8 sm:p-12 group hover:bg-primary transition-colors duration-500 relative ${
                      index !== mockServices.length - 1 ? 'border-b md:border-b-0 md:border-r border-border' : ''
                    }`}
                  >
                    <Icon className="h-12 w-12 sm:h-16 sm:w-16 mb-8 sm:mb-12 text-primary group-hover:text-primary-foreground transition-colors" />
                    
                    <h3 className="text-2xl sm:text-3xl font-spaceGrotesk font-black uppercase mb-4 text-foreground group-hover:text-primary-foreground transition-colors">
                      {service.name}
                    </h3>
                    
                    <p className="text-muted-foreground mb-8 sm:mb-12 group-hover:text-primary-foreground/80 transition-colors">
                      {service.description}
                    </p>
                    
                    <div className="text-3xl sm:text-4xl font-spaceGrotesk font-black text-foreground group-hover:text-primary-foreground transition-colors">
                      ${service.price}
                      <span className="text-sm font-inter text-muted-foreground group-hover:text-primary-foreground/70 font-normal">
                        {service.unit}
                      </span>
                    </div>
                    
                    <div className="absolute top-8 right-8 text-muted-foreground/20 font-spaceGrotesk font-black text-5xl sm:text-6xl group-hover:text-primary-foreground/10 select-none">
                      {service.id}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* --- Cómo Funciona --- */}
        <section className="py-20 sm:py-32 px-4 sm:px-8 bg-foreground text-background">
          <div className="max-w-[1440px] mx-auto">
            <div className="mb-16 sm:mb-24">
              <h2 className="text-4xl sm:text-5xl md:text-7xl font-spaceGrotesk font-black uppercase tracking-tighter mb-8">
                Cómo Funciona
              </h2>
              <div className="h-1 w-24 sm:w-32 bg-primary"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 sm:gap-16">
              <div className="flex flex-col relative">
                <div className="text-[8rem] sm:text-[12rem] font-spaceGrotesk font-black leading-none text-primary/20 -ml-2 sm:-ml-4 mb-4 select-none absolute -top-16 outline-text">
                  1
                </div>
                <div className="relative z-10 pt-16 sm:pt-24 mt-4">
                  <Calendar className="h-10 w-10 sm:h-12 sm:w-12 mb-6 text-primary" />
                  <h3 className="text-2xl sm:text-3xl font-spaceGrotesk font-black uppercase mb-4">Reserva</h3>
                  <p className="text-background/70 font-inter leading-relaxed">
                    Agenda una sesión de diagnóstico inicial para entender tus cuellos de botella actuales.
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col relative">
                <div className="text-[8rem] sm:text-[12rem] font-spaceGrotesk font-black leading-none text-primary/20 -ml-2 sm:-ml-4 mb-4 select-none absolute -top-16 outline-text">
                  2
                </div>
                <div className="relative z-10 pt-16 sm:pt-24 mt-4">
                  <Package className="h-10 w-10 sm:h-12 sm:w-12 mb-6 text-primary" />
                  <h3 className="text-2xl sm:text-3xl font-spaceGrotesk font-black uppercase mb-4">Elige</h3>
                  <p className="text-background/70 font-inter leading-relaxed">
                    Selecciona el plan de automatización o servicio que mejor se adapte a tu escala actual.
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col relative">
                <div className="text-[8rem] sm:text-[12rem] font-spaceGrotesk font-black leading-none text-primary/20 -ml-2 sm:-ml-4 mb-4 select-none absolute -top-16 outline-text">
                  3
                </div>
                <div className="relative z-10 pt-16 sm:pt-24 mt-4">
                  <TrendingUp className="h-10 w-10 sm:h-12 sm:w-12 mb-6 text-primary" />
                  <h3 className="text-2xl sm:text-3xl font-spaceGrotesk font-black uppercase mb-4">Crece</h3>
                  <p className="text-background/70 font-inter leading-relaxed">
                    Implementamos y monitoreamos tus resultados mientras tú te enfocas en el core del negocio.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- Final CTA --- */}
        <section className="py-24 sm:py-40 px-4 sm:px-8 relative overflow-hidden bg-background">
          <div className="max-w-[1440px] mx-auto text-center relative z-10">
            <h2 className="text-4xl sm:text-6xl md:text-9xl font-spaceGrotesk font-black uppercase tracking-tighter mb-12 leading-[1.1] sm:leading-none text-foreground">
              Empieza a transformar <br className="hidden sm:block" /> tu negocio hoy
            </h2>
            <div className="flex justify-center">
              <Link href="/register">
                <button className="bg-primary text-primary-foreground px-8 sm:px-16 py-6 sm:py-8 font-spaceGrotesk font-black text-xl sm:text-2xl uppercase tracking-tight hover:bg-[#851e00] transition-all active:scale-95 shadow-[8px_8px_0px_0px_rgba(44,47,46,1)] dark:shadow-[8px_8px_0px_0px_rgba(245,247,245,1)]">
                  Comenzar Ahora
                </button>
              </Link>
            </div>
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 sm:w-96 sm:h-96 bg-primary/20 blur-[80px] sm:blur-[120px] rounded-full"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 sm:w-96 sm:h-96 bg-primary/10 blur-[80px] sm:blur-[120px] rounded-full"></div>
        </section>
      </main>
    </>
  );
}
