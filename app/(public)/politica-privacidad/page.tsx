export default function PoliticaPrivacidadPage() {
  return (
    <div className="py-16 sm:py-24 px-4 sm:px-8">
      <div className="max-w-[860px] mx-auto">

        {/* Header */}
        <div className="mb-16 border-b border-border pb-10">
          <h1 className="text-4xl sm:text-5xl font-spaceGrotesk font-black uppercase tracking-tighter text-foreground mb-4">
            Política de Privacidad y Tratamiento de Datos Personales
          </h1>
          <p className="font-workSans text-muted-foreground text-base">
            Vigente desde el 4 de abril de 2026 · Alineada con la Ley Orgánica de Protección de Datos Personales (LOPDP) de Ecuador
          </p>
        </div>

        {/* Secciones */}
        <div className="space-y-12">

          {/* 1 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-spaceGrotesk font-black uppercase tracking-tight text-foreground mb-4">
              1. Responsable del Tratamiento
            </h2>
            <p className="font-workSans text-base text-muted-foreground leading-relaxed">
              El responsable del tratamiento de sus datos personales es <strong className="text-foreground">RNG-Vantage</strong>, con domicilio en Ecuador. Para cualquier consulta relacionada con el tratamiento de sus datos puede contactarnos en:{" "}
              <span className="font-medium text-foreground">privacidad@rngvantage.com</span>
            </p>
          </section>

          {/* 2 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-spaceGrotesk font-black uppercase tracking-tight text-foreground mb-4">
              2. Datos Personales que Recopilamos
            </h2>
            <p className="font-workSans text-base text-muted-foreground leading-relaxed mb-4">
              En función del servicio que utilice, podemos recopilar las siguientes categorías de datos:
            </p>
            <ul className="list-disc pl-6 space-y-2 font-workSans text-base text-muted-foreground">
              <li><strong className="text-foreground">Datos de identificación:</strong> nombre completo.</li>
              <li><strong className="text-foreground">Datos de contacto:</strong> dirección de correo electrónico y número de teléfono.</li>
              <li><strong className="text-foreground">Datos de reserva:</strong> fecha y hora preferida de la sesión o capacitación.</li>
              <li><strong className="text-foreground">Datos de cuenta:</strong> contraseña (almacenada de forma cifrada; nunca se almacena en texto plano).</li>
              <li><strong className="text-foreground">Datos de navegación:</strong> dirección IP, tipo de navegador, páginas visitadas y duración de la visita, recopilados mediante cookies técnicas.</li>
              <li><strong className="text-foreground">Consentimiento:</strong> registro de la fecha y hora en que usted aceptó esta política.</li>
            </ul>
          </section>

          {/* 3 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-spaceGrotesk font-black uppercase tracking-tight text-foreground mb-4">
              3. Finalidad del Tratamiento
            </h2>
            <p className="font-workSans text-base text-muted-foreground leading-relaxed mb-4">
              Sus datos son tratados exclusivamente para las siguientes finalidades:
            </p>
            <ul className="list-disc pl-6 space-y-2 font-workSans text-base text-muted-foreground">
              <li>Gestionar y confirmar las reservas de capacitación solicitadas.</li>
              <li>Administrar su cuenta de usuario y las suscripciones contratadas.</li>
              <li>Procesar los pagos y emitir los registros de transacciones correspondientes.</li>
              <li>Enviar comunicaciones relacionadas con el estado de su reserva o suscripción.</li>
              <li>Cumplir con las obligaciones legales y contables aplicables.</li>
              <li>Mejorar el funcionamiento y la seguridad de la plataforma.</li>
            </ul>
            <p className="font-workSans text-base text-muted-foreground leading-relaxed mt-4">
              No utilizamos sus datos para elaborar perfiles comerciales automatizados ni para tomar decisiones individuales automatizadas con efectos jurídicos sobre usted.
            </p>
          </section>

          {/* 4 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-spaceGrotesk font-black uppercase tracking-tight text-foreground mb-4">
              4. Base Jurídica del Tratamiento
            </h2>
            <ul className="list-disc pl-6 space-y-2 font-workSans text-base text-muted-foreground">
              <li>
                <strong className="text-foreground">Consentimiento explícito</strong> (art. 7 LOPDP): usted otorga su consentimiento al marcar la casilla de aceptación en el formulario de reserva o al crear una cuenta.
              </li>
              <li>
                <strong className="text-foreground">Ejecución de un contrato</strong>: el tratamiento es necesario para prestar los servicios contratados.
              </li>
              <li>
                <strong className="text-foreground">Cumplimiento de obligaciones legales</strong>: conservación de registros contables y fiscales conforme a la normativa ecuatoriana.
              </li>
            </ul>
          </section>

          {/* 5 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-spaceGrotesk font-black uppercase tracking-tight text-foreground mb-4">
              5. Plazo de Conservación
            </h2>
            <ul className="list-disc pl-6 space-y-2 font-workSans text-base text-muted-foreground">
              <li><strong className="text-foreground">Datos de reserva y cuenta:</strong> se conservan durante la relación contractual y hasta 5 años después de la última interacción, en cumplimiento de las obligaciones legales de archivo.</li>
              <li><strong className="text-foreground">Datos de navegación y cookies técnicas:</strong> máximo 12 meses desde su recopilación.</li>
              <li>Transcurridos dichos plazos, los datos serán suprimidos o anonimizados de forma irreversible.</li>
            </ul>
          </section>

          {/* 6 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-spaceGrotesk font-black uppercase tracking-tight text-foreground mb-4">
              6. Destinatarios y Transferencias Internacionales
            </h2>
            <p className="font-workSans text-base text-muted-foreground leading-relaxed mb-4">
              Sus datos pueden ser compartidos únicamente con los siguientes destinatarios:
            </p>
            <ul className="list-disc pl-6 space-y-2 font-workSans text-base text-muted-foreground">
              <li>
                <strong className="text-foreground">Supabase Inc.</strong> (procesador encargado), con servidores en Estados Unidos. La transferencia se realiza bajo cláusulas contractuales estándar que garantizan un nivel de protección equivalente al exigido por la LOPDP.
              </li>
              <li>
                <strong className="text-foreground">Autoridades públicas</strong> cuando la ley lo exija expresamente.
              </li>
            </ul>
            <p className="font-workSans text-base text-muted-foreground leading-relaxed mt-4">
              No vendemos, alquilamos ni cedemos sus datos personales a terceros con fines comerciales.
            </p>
          </section>

          {/* 7 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-spaceGrotesk font-black uppercase tracking-tight text-foreground mb-4">
              7. Sus Derechos
            </h2>
            <p className="font-workSans text-base text-muted-foreground leading-relaxed mb-4">
              De conformidad con los artículos 18 a 24 de la LOPDP, usted tiene derecho a:
            </p>
            <ul className="list-disc pl-6 space-y-2 font-workSans text-base text-muted-foreground">
              <li><strong className="text-foreground">Acceso:</strong> conocer qué datos suyos tratamos y obtener una copia.</li>
              <li><strong className="text-foreground">Rectificación:</strong> solicitar la corrección de datos inexactos o incompletos.</li>
              <li><strong className="text-foreground">Supresión:</strong> pedir la eliminación de sus datos cuando ya no sean necesarios o retire su consentimiento.</li>
              <li><strong className="text-foreground">Limitación:</strong> solicitar que suspendamos el tratamiento en determinadas circunstancias.</li>
              <li><strong className="text-foreground">Portabilidad:</strong> recibir sus datos en formato estructurado y de uso común.</li>
              <li><strong className="text-foreground">Oposición:</strong> oponerse al tratamiento basado en nuestro interés legítimo.</li>
              <li><strong className="text-foreground">Retirada del consentimiento:</strong> en cualquier momento y sin efecto retroactivo.</li>
            </ul>
          </section>

          {/* 8 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-spaceGrotesk font-black uppercase tracking-tight text-foreground mb-4">
              8. Cómo Ejercer sus Derechos
            </h2>
            <p className="font-workSans text-base text-muted-foreground leading-relaxed">
              Para ejercer cualquiera de los derechos descritos, envíe un correo a{" "}
              <span className="font-medium text-foreground">privacidad@rngvantage.com</span>{" "}
              con el asunto <em>&quot;Ejercicio de derechos LOPDP&quot;</em> e indique su nombre completo, el derecho que desea ejercer y, si corresponde, los datos específicos a los que hace referencia su solicitud. Responderemos en un plazo máximo de 15 días hábiles.
            </p>
          </section>

          {/* 9 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-spaceGrotesk font-black uppercase tracking-tight text-foreground mb-4">
              9. Reclamación ante la SNAI
            </h2>
            <p className="font-workSans text-base text-muted-foreground leading-relaxed">
              Si considera que el tratamiento de sus datos no se ajusta a la normativa vigente, tiene derecho a presentar una reclamación ante la{" "}
              <strong className="text-foreground">Superintendencia Nacional de Información y Datos Personales (SNAI)</strong>, organismo de control en materia de protección de datos en Ecuador. Puede obtener más información en{" "}
              <span className="font-medium text-foreground">www.protecciondatos.gob.ec</span>
            </p>
          </section>

          {/* 10 */}
          <section>
            <h2 className="text-xl sm:text-2xl font-spaceGrotesk font-black uppercase tracking-tight text-foreground mb-4">
              10. Actualización de esta Política
            </h2>
            <p className="font-workSans text-base text-muted-foreground leading-relaxed">
              Nos reservamos el derecho de actualizar esta política para adaptarla a cambios legislativos o en nuestros servicios. Cualquier modificación sustancial será comunicada a los usuarios registrados con al menos 15 días de antelación. La fecha de entrada en vigor de la versión actual es el <strong className="text-foreground">4 de abril de 2026</strong>.
            </p>
          </section>

        </div>

        {/* Footer legal */}
        <div className="mt-16 border-t border-border pt-8 font-workSans text-sm text-muted-foreground">
          RNG-Vantage · Ecuador · <span className="text-foreground">privacidad@rngvantage.com</span>
        </div>

      </div>
    </div>
  );
}
