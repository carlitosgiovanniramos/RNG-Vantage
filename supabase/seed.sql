-- =============================================================
-- RNG-Vantage: Seed data (datos de prueba)
-- =============================================================

-- Catalogo real de Ruth (10 servicios)
-- Nota: por regla de negocio, solo manejo_redes puede renovarse automaticamente.
insert into public.services (name, description, type, price, duration_months, is_active) values
  ('Redes Sociales Inicial', 'Plan inicial de manejo de redes sociales para presencia constante en canales digitales.', 'manejo_redes', 299.99, 1, true),
  ('Redes Sociales Work', 'Plan intermedio de manejo de redes sociales con mayor volumen de contenido.', 'manejo_redes', 319.99, 1, true),
  ('Redes Sociales Premium', 'Plan premium de manejo de redes sociales con estrategia y ejecucion avanzada.', 'manejo_redes', 555.00, 1, true),
  ('Auditoria', 'Diagnostico integral de canales digitales con recomendaciones de mejora.', 'auditoria', 70.00, 1, true),
  ('Sesion Fotografica', 'Sesion fotografica profesional para contenido de marca.', 'otro', 130.00, 1, true),
  ('Sesion Audiovisual (2 videos)', 'Produccion audiovisual de 2 videos editados para redes.', 'otro', 150.00, 1, true),
  ('Sesion Audiovisual (6 videos)', 'Produccion audiovisual de 6 videos editados para redes.', 'otro', 230.00, 1, true),
  ('Sesion Audiovisual (15 videos)', 'Produccion audiovisual de 15 videos editados para campanas completas.', 'otro', 500.00, 1, true),
  ('Curso x 3 meses', 'Capacitacion estructurada de marketing digital durante 3 meses.', 'capacitacion', 500.00, 3, true),
  ('Modelo por 1 hora', 'Servicio de modelo por hora para sesiones de contenido.', 'otro', 25.00, 1, true);
