import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Términos de Servicio",
  description: "Términos y condiciones de los servicios de marketing digital de RGL Estudio.",
};

export default function TerminosServicioPage() {
  return (
    <div className="py-16 sm:py-24 px-4 sm:px-8">
      <div className="max-w-[860px] mx-auto">

        {/* Header */}
        <div className="mb-16 border-b border-border pb-10">
          <h1 className="text-4xl sm:text-5xl font-spaceGrotesk font-black uppercase tracking-tighter text-foreground mb-4">
            Términos de Servicio
          </h1>
          <p className="font-workSans text-muted-foreground text-base">
            Vigente desde el 4 de abril de 2026 · Aplicable para Ecuador
          </p>
        </div>

        {/* Secciones */}
        <div className="space-y-12">

          {/* 1 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-spaceGrotesk font-black uppercase tracking-tight text-foreground mb-4">
              1. Aceptación de los Términos
            </h2>
            <p className="font-workSans text-base text-muted-foreground leading-relaxed">
              Al contratar los servicios de <strong className="text-foreground">RGL Estudio</strong> (en adelante, &quot;la Agencia&quot;) mediante nuestra plataforma, usted acepta expresamente los presentes Términos de Servicio. Estos términos constituyen un acuerdo legal vinculante entre usted y la Agencia, rigiendo el uso de nuestros servicios de marketing digital y la plataforma tecnológica asociada.
            </p>
          </section>

          {/* 2 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-spaceGrotesk font-black uppercase tracking-tight text-foreground mb-4">
              2. Descripción de los Servicios
            </h2>
            <p className="font-workSans text-base text-muted-foreground leading-relaxed mb-4">
              Ofrecemos servicios especializados en marketing digital divididos principalmente en:
            </p>
            <ul className="list-disc pl-6 space-y-2 font-workSans text-base text-muted-foreground">
              <li><strong className="text-foreground">Manejo de Redes Sociales:</strong> Planes mensuales bajo modelo de suscripción (ej. Plan Esencial, Plan Crecimiento, Plan Integral).</li>
              <li><strong className="text-foreground">Servicios Únicos:</strong> Auditorías de marca, sesiones fotográficas y creación de identidad visual.</li>
              <li><strong className="text-foreground">Capacitación:</strong> Sesiones de mentoría 1 a 1 y talleres online.</li>
            </ul>
            <p className="font-workSans text-base text-muted-foreground leading-relaxed mt-4">
              Los detalles específicos de entregables, límites y alcances de cada servicio se encuentran descritos en nuestro catálogo público y forman parte integral de estos términos. La inversión en pauta publicitaria (Ads) no está incluida en los honorarios de la Agencia salvo que se especifique lo contrario.
            </p>
          </section>

          {/* 3 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-spaceGrotesk font-black uppercase tracking-tight text-foreground mb-4">
              3. Proceso de Contratación y Suscripciones
            </h2>
            <p className="font-workSans text-base text-muted-foreground leading-relaxed mb-4">
              La contratación se realiza de forma digital a través de nuestra plataforma:
            </p>
            <ul className="list-disc pl-6 space-y-2 font-workSans text-base text-muted-foreground">
              <li>El cliente selecciona el servicio o plan y completa el checkout.</li>
              <li>En el caso de suscripciones, el cliente tiene la opción de activar la <strong className="text-foreground">renovación automática</strong>.</li>
              <li>El servicio inicia una vez que la Agencia confirme el pago y el cliente haya proporcionado los accesos necesarios (ej. roles en Meta Business Manager).</li>
            </ul>
          </section>

          {/* 4 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-spaceGrotesk font-black uppercase tracking-tight text-foreground mb-4">
              4. Pagos, Renovación y Cancelación
            </h2>
            <ul className="list-disc pl-6 space-y-2 font-workSans text-base text-muted-foreground">
              <li><strong className="text-foreground">Registro de pagos:</strong> Actualmente los pagos se registran de forma manual tras la validación de la transferencia bancaria correspondiente en Ecuador.</li>
              <li><strong className="text-foreground">Renovación automática:</strong> Para los planes de manejo de redes que tengan activa esta opción, se generará una nueva transacción pendiente y se extenderá el periodo de la suscripción al finalizar el ciclo actual.</li>
              <li><strong className="text-foreground">Cancelación:</strong> El cliente puede cancelar su suscripción en cualquier momento. La cancelación evitará futuras renovaciones, pero no se emitirán reembolsos proporcionales por el ciclo en curso. Se requiere notificación o cancelación desde el panel de cliente con al menos 5 días de anticipación al nuevo ciclo.</li>
              <li><strong className="text-foreground">Falta de pago:</strong> La Agencia se reserva el derecho de suspender la prestación de servicios si no se valida el pago dentro de los primeros 5 días del ciclo de facturación.</li>
            </ul>
          </section>

          {/* 5 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-spaceGrotesk font-black uppercase tracking-tight text-foreground mb-4">
              5. Obligaciones del Cliente
            </h2>
            <p className="font-workSans text-base text-muted-foreground leading-relaxed">
              El cliente se compromete a entregar oportunamente todo el material, información y accesos necesarios para la prestación del servicio. Los retrasos imputables al cliente no aplazarán las fechas de facturación de la suscripción. El cliente garantiza que todo el material provisto (logos, imágenes) no infringe derechos de autor de terceros.
            </p>
          </section>

          {/* 6 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-spaceGrotesk font-black uppercase tracking-tight text-foreground mb-4">
              6. Propiedad Intelectual
            </h2>
            <p className="font-workSans text-base text-muted-foreground leading-relaxed">
              Todo el contenido final entregado (artes, copys, manuales) será propiedad del cliente una vez que se hayan cancelado los honorarios correspondientes en su totalidad. Los archivos editables y las estrategias internas de la Agencia siguen siendo propiedad intelectual de RGL Estudio. La Agencia se reserva el derecho de usar los resultados y piezas creadas para su portafolio y marketing propio.
            </p>
          </section>

          {/* 7 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-spaceGrotesk font-black uppercase tracking-tight text-foreground mb-4">
              7. Limitación de Responsabilidad
            </h2>
            <p className="font-workSans text-base text-muted-foreground leading-relaxed">
              La Agencia aplica sus mejores prácticas comerciales, pero no puede garantizar resultados específicos de ventas, alcance o interacción, ya que estos dependen en gran medida de los algoritmos de plataformas de terceros (Meta, Google, TikTok, etc.). La Agencia no será responsable por bloqueos de cuentas, caídas de servicio o cambios en las políticas de dichas plataformas.
            </p>
          </section>

          {/* 8 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-spaceGrotesk font-black uppercase tracking-tight text-foreground mb-4">
              8. Protección de Datos Personales
            </h2>
            <p className="font-workSans text-base text-muted-foreground leading-relaxed">
              El manejo de su información personal, perfiles de usuario e historial de transacciones se realiza en estricto cumplimiento de la Ley Orgánica de Protección de Datos Personales (LOPDP) de Ecuador. Puede revisar a detalle cómo protegemos su información en nuestra <Link href="/politica-privacidad" className="text-foreground underline underline-offset-4 hover:opacity-80">Política de Privacidad</Link>.
            </p>
          </section>

          {/* 9 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-spaceGrotesk font-black uppercase tracking-tight text-foreground mb-4">
              9. Modificaciones a los Términos
            </h2>
            <p className="font-workSans text-base text-muted-foreground leading-relaxed">
              Nos reservamos el derecho de modificar estos términos en cualquier momento. Las modificaciones entrarán en vigencia inmediatamente al ser publicadas en esta página. Es responsabilidad del cliente revisar periódicamente estos términos.
            </p>
          </section>

          {/* 10 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-spaceGrotesk font-black uppercase tracking-tight text-foreground mb-4">
              10. Ley Aplicable y Jurisdicción
            </h2>
            <p className="font-workSans text-base text-muted-foreground leading-relaxed">
              Estos términos se rigen por las leyes de la República del Ecuador, en particular la Ley de Comercio Electrónico, Firmas Electrónicas y Mensajes de Datos. Cualquier controversia será sometida a los tribunales competentes de la ciudad de residencia de la Agencia en Ecuador.
            </p>
          </section>

        </div>

        {/* Footer legal */}
        <div className="mt-16 border-t border-border pt-8 font-workSans text-sm text-muted-foreground">
          RGL Estudio · Ecuador · <span className="text-foreground">contacto@rglestudio.com</span>
        </div>

      </div>
    </div>
  );
}
