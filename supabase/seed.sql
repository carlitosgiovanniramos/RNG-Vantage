-- =============================================================
-- RNG-Vantage: Seed data (datos de prueba)
-- =============================================================

-- Servicios de ejemplo: paquetes de manejo de redes
insert into public.services (name, description, type, price, duration_months) values
  ('Manejo de Redes - Mensual', 'Gestion profesional de redes sociales (Facebook, Instagram, TikTok). Incluye creacion de contenido, programacion de publicaciones y reportes mensuales.', 'manejo_redes', 150.00, 1),
  ('Manejo de Redes - Trimestral', 'Gestion profesional de redes sociales por 3 meses con estrategia de contenido personalizada y analisis de metricas.', 'manejo_redes', 400.00, 3),
  ('Manejo de Redes - Anual', 'Gestion integral de redes sociales por 12 meses. Incluye estrategia anual, creacion de contenido, pauta publicitaria y reportes detallados.', 'manejo_redes', 1400.00, 12);

-- Servicios de ejemplo: auditorias
insert into public.services (name, description, type, price, duration_months) values
  ('Auditoria de Redes Sociales', 'Analisis completo del estado actual de las redes sociales del negocio con recomendaciones de mejora y plan de accion.', 'auditoria', 80.00, 1),
  ('Auditoria + Estrategia Digital', 'Auditoria completa mas elaboracion de estrategia digital personalizada para 3 meses.', 'auditoria', 200.00, 3);

-- Servicios de ejemplo: capacitaciones
insert into public.services (name, description, type, price, duration_months) values
  ('Capacitacion en Marketing Digital', 'Sesion presencial introductoria sobre marketing digital, manejo de redes sociales y publicidad en linea.', 'capacitacion', 0.00, 1);
