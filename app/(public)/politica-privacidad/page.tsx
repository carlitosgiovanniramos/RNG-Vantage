export default function PoliticaPrivacidadPage() {
  return (
    <section className="px-4 py-16 sm:px-8 sm:py-24">
      <article className="mx-auto max-w-4xl rounded-xl border border-border bg-card p-6 sm:p-10">
        <header className="mb-8 border-b border-border pb-6">
          <h1 className="text-3xl font-spaceGrotesk font-black uppercase tracking-tight text-foreground sm:text-4xl">
            Politica de Privacidad y Tratamiento de Datos Personales
          </h1>
          <p className="mt-3 font-workSans text-sm text-muted-foreground">
            Ultima actualizacion: 03 de abril de 2026
          </p>
        </header>

        <div className="space-y-8 font-workSans text-sm leading-relaxed text-foreground sm:text-base">
          <section>
            <h2 className="mb-2 text-xl font-spaceGrotesk font-bold text-foreground">
              1. Responsable Del Tratamiento
            </h2>
            <p>
              El responsable del tratamiento de datos personales es RNG-Vantage, plataforma
              orientada a la gestion de reservas, servicios y suscripciones para un
              emprendimiento de marketing digital.
            </p>
            <p className="mt-2">
              Correo de contacto de privacidad: <strong>privacidad@rng-vantage.com</strong>
              .
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-spaceGrotesk font-bold text-foreground">
              2. Marco Normativo Aplicable
            </h2>
            <p>
              Esta politica se emite conforme a la Ley Organica de Proteccion de Datos
              Personales (LOPDP) del Ecuador y su normativa complementaria, bajo los
              principios de licitud, lealtad, transparencia, minimizacion, seguridad y
              responsabilidad proactiva.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-spaceGrotesk font-bold text-foreground">
              3. Datos Que Recopilamos
            </h2>
            <ul className="list-disc space-y-1 pl-5">
              <li>Datos de identificacion: nombres, apellidos y correo electronico.</li>
              <li>Datos de contacto: telefono (cuando se proporciona).</li>
              <li>Datos de reserva: fecha preferida, notas y estado de la reserva.</li>
              <li>
                Datos de cuenta: credenciales de autenticacion y metadatos de sesion
                administrados mediante Supabase Auth.
              </li>
              <li>
                Datos transaccionales y de suscripcion: servicio contratado, vigencia,
                estado y renovacion.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-spaceGrotesk font-bold text-foreground">
              4. Finalidades Del Tratamiento
            </h2>
            <ul className="list-disc space-y-1 pl-5">
              <li>Crear y administrar cuentas de usuario.</li>
              <li>Gestionar reservas de capacitacion y solicitudes de contacto.</li>
              <li>Gestionar suscripciones, servicios y transacciones del sistema.</li>
              <li>Enviar comunicaciones operativas relacionadas con el servicio.</li>
              <li>Garantizar seguridad, trazabilidad y prevencion de fraude.</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-spaceGrotesk font-bold text-foreground">
              5. Base Juridica
            </h2>
            <ul className="list-disc space-y-1 pl-5">
              <li>
                Consentimiento del titular, otorgado expresamente mediante el checkbox de
                aceptacion de esta politica.
              </li>
              <li>
                Ejecucion de medidas precontractuales y contractuales para prestar los
                servicios solicitados.
              </li>
              <li>
                Cumplimiento de obligaciones legales y defensa de derechos en sede
                administrativa o judicial.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-spaceGrotesk font-bold text-foreground">
              6. Conservacion De Datos
            </h2>
            <p>
              Conservamos los datos personales solo durante el tiempo necesario para cumplir
              las finalidades descritas y las obligaciones legales aplicables. Cuando la
              conservacion deja de ser necesaria, los datos se suprimen o anonimizan de forma
              segura.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-spaceGrotesk font-bold text-foreground">
              7. Encargados, Cesiones Y Transferencias
            </h2>
            <p>
              Para operar la plataforma utilizamos servicios de terceros (por ejemplo,
              infraestructura en la nube y autenticacion). Dichos proveedores actuan como
              encargados del tratamiento bajo contratos y medidas de seguridad adecuadas.
            </p>
            <p className="mt-2">
              Si existe transferencia internacional de datos, se aplicaran las garantias
              exigidas por la LOPDP.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-spaceGrotesk font-bold text-foreground">
              8. Derechos Del Titular
            </h2>
            <p>Como titular puedes ejercer, entre otros, los siguientes derechos:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>Acceso a tus datos personales.</li>
              <li>Rectificacion y actualizacion.</li>
              <li>Eliminacion o supresion.</li>
              <li>Oposicion al tratamiento cuando proceda.</li>
              <li>Portabilidad de tus datos en los casos aplicables.</li>
              <li>Suspension del tratamiento cuando corresponda.</li>
              <li>Revocatoria del consentimiento.</li>
            </ul>
            <p className="mt-2">
              Para ejercer tus derechos escribe a <strong>privacidad@rng-vantage.com</strong>
              indicando tu nombre completo, solicitud y medio de respuesta.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-spaceGrotesk font-bold text-foreground">
              9. Seguridad De La Informacion
            </h2>
            <p>
              Implementamos medidas tecnicas y organizativas razonables para proteger la
              confidencialidad, integridad y disponibilidad de la informacion, incluyendo
              controles de acceso, autenticacion y politicas de minimizacion de datos.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-spaceGrotesk font-bold text-foreground">
              10. Autoridad De Control Y Reclamos
            </h2>
            <p>
              Si consideras que tu solicitud no fue atendida adecuadamente, puedes presentar
              un reclamo ante la autoridad de control competente en Ecuador (Superintendencia
              de Proteccion de Datos Personales), conforme a la normativa vigente.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-xl font-spaceGrotesk font-bold text-foreground">
              11. Cambios A Esta Politica
            </h2>
            <p>
              Esta politica puede actualizarse por cambios legales, regulatorios o
              funcionales del servicio. La version vigente estara disponible en esta misma
              pagina con su fecha de actualizacion.
            </p>
          </section>

          <section className="rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
            <p>
              Nota: este contenido se presenta como base de cumplimiento operativo para el
              proyecto academico. Antes de publicar en produccion, se recomienda revision
              final con asesoria legal especializada en LOPDP.
            </p>
          </section>
        </div>
      </article>
    </section>
  );
}
