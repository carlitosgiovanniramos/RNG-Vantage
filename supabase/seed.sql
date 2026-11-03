-- =============================================================
-- RGL Estudio: Seed data (servicios reales)
-- =============================================================

-- Catalogo real de Ruth (8 servicios)
-- Nota: por regla de negocio, solo manejo_redes puede renovarse automaticamente.
insert into public.services (name, description, type, price, duration_months, is_active) values
  ('Redes Sociales - Paquete Inicial', 'Incluye: planificación estratégica de contenido, 1 producción audiovisual (1 min - 1:30 min), 4 horas de grabación, 5 spots publicitarios (0:35 - 0:55 seg), iPhone 15, micrófonos DJI mini, equipo de luz e informe básico de contenido. No incluye transporte, automatización de mensajería ni sesión fotográfica.', 'manejo_redes', 299.00, 1, true),
  ('Redes Sociales - Paquete Standard', 'Incluye: dos días de producción, planificación estratégica, 2 producciones audiovisuales (1 min 30 seg), 10 spots publicitarios, 5 fotografías profesionales editadas, 5 afiches publicitarios para Facebook e Instagram, cámara Sony X600, asistencia en poses, informe mensual y análisis de métricas. Precios no incluyen 15% IVA.', 'manejo_redes', 399.99, 1, true),
  ('Redes Sociales - Paquete Premium', 'Incluye: 2 días de producción, 2 producciones audiovisuales (1:30 min - 3:00 min), 15 spots publicitarios, 20 fotografías profesionales editadas, 18 flyers publicitarios para Facebook e Instagram, planificación estratégica, Dron DJI NEO2, cámara Sony X600, automatización de mensajería y comentarios, informe mensual y análisis de métricas. Precios no incluyen 15% IVA.', 'manejo_redes', 599.99, 1, true),
  ('Auditoría de Marca', 'Reunión especializada mensual con la agencia. Incluye: análisis de marca, análisis de estrategias de contenido, consultas personalizadas por mensaje y 1 llamada por Zoom (1 h 30 min) para presentación de proyecto y estrategia de marketing.', 'auditoria', 70.00, 1, true),
  ('Curso de Marketing (3 meses)', 'Aprende a crear contenido desde cero. Incluye: fotografía y video, creación y planificación de contenido, estrategia de comunicación, edición de video en CapCut, edición de fotografía en Photoshop, análisis de métricas en Meta Ads y TikTok Ads y creación de contenido con IA.', 'capacitacion', 500.00, 3, true),
  ('Sesión Audiovisual (2 videos)', 'Sesión audiovisual con entrega de 2 videos de 0:45 seg a 1:25 min, ideal como video de presentación para profesionales. Incluye: guion estructurado, guía de poses, equipo de luminaria, iPhone 15, micrófonos DJI mini y Dron DJI NEO2. No incluye costos por cambio de fecha ni devolución.', 'otro', 150.00, 1, true),
  ('Sesión Audiovisual (6 videos)', 'Sesión audiovisual con entrega de 6 videos de 0:45 seg a 1:25 min cada uno, para presentación profesional o contenido de marca. Incluye: guion estructurado, guía de poses, equipo de luminaria, iPhone 15, micrófonos DJI mini y Dron DJI NEO2. No incluye costos por cambio de fecha ni devolución.', 'otro', 230.00, 1, true),
  ('Sesión Audiovisual (15 videos)', 'Sesión audiovisual con entrega de 15 videos de 0:45 seg a 1:25 min cada uno, para mantener contenido constante en redes. Incluye: guion estructurado, guía de poses, equipo de luminaria, iPhone 15, micrófonos DJI mini y Dron DJI NEO2. No incluye costos por cambio de fecha ni devolución.', 'otro', 500.00, 1, true),
  ('Sesión Fotográfica (1 hora)', 'Sesión para graduación, retrato o boda civil privada. Entrega en 5 días. Pago: 50% de reserva y 50% el día de la sesión. Incluye: 50 fotografías profesionales editadas, cámara Sony X600, equipo de luces y asistencia en poses. No incluye producción audiovisual ni fotos sin edición.', 'otro', 130.00, 1, true),
  ('Modelo para Producciones Audiovisuales (1 hora)', 'Modelo profesional de buena presentación, dicción y desenvuelta frente a cámara. Precio por hora. No incluye costos de transporte, movilización, snacks, bebidas ni alimentación.', 'otro', 25.00, 1, true);


-- =============================================================
-- Seed data: Usuarios, reservaciones, suscripciones, transacciones
-- Para poblar dashboard, graficos y paginas admin con datos realistas.
--
-- UUIDs fijos para referenciar entre tablas:
--   Ruth (admin):  'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d'
--   Cliente demo:  'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e'
-- =============================================================


-- =============================================================
-- 1. USUARIOS DE PRUEBA (auth.users + profiles)
-- Deshabilitamos el trigger handle_new_user porque insertamos
-- profiles manualmente con todos los campos necesarios.
-- =============================================================

-- Deshabilitar trigger para evitar conflicto con insert manual de profiles
ALTER TABLE auth.users DISABLE TRIGGER on_auth_user_created;

-- Admin: Ruth (la administradora del estudio)
INSERT INTO auth.users (
  id, instance_id, aud, role,
  email, encrypted_password,
  email_confirmed_at, confirmation_sent_at,
  raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at
) VALUES (
  'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  'ruth@rglestudio.com',
  crypt('Admin123!', gen_salt('bf')),
  now(), now(),
  '{"provider": "email", "providers": ["email"], "role": "admin"}'::jsonb,
  '{"first_name": "Ruth", "last_name": "Garcia Lopez"}'::jsonb,
  now() - interval '90 days', now()
);

-- Cliente de ejemplo: Maria
INSERT INTO auth.users (
  id, instance_id, aud, role,
  email, encrypted_password,
  email_confirmed_at, confirmation_sent_at,
  raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at
) VALUES (
  'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated',
  'maria.torres@gmail.com',
  crypt('Client123!', gen_salt('bf')),
  now(), now(),
  '{"provider": "email", "providers": ["email"], "role": "client"}'::jsonb,
  '{"first_name": "Maria", "last_name": "Torres Mendez"}'::jsonb,
  now() - interval '60 days', now()
);

-- Re-habilitar trigger
ALTER TABLE auth.users ENABLE TRIGGER on_auth_user_created;

-- Profiles (insertar directamente porque deshabilitamos el trigger)
INSERT INTO public.profiles (id, first_name, last_name, role, data_consent_at, created_at, updated_at) VALUES
  ('a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', 'Ruth', 'Garcia Lopez', 'admin', now() - interval '90 days', now() - interval '90 days', now()),
  ('b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', 'Maria', 'Torres Mendez', 'client', now() - interval '60 days', now() - interval '60 days', now());


-- =============================================================
-- 2. RESERVACIONES (10 registros)
-- Mix de estados, fechas distribuidas en ultimos 2 meses.
-- Algunas con user_id (cliente registrado), otras anonimas.
-- =============================================================
INSERT INTO public.reservations (user_id, first_name, last_name, email, phone, preferred_date, status, notes, data_consent, created_at) VALUES
  -- 4 pending
  ('b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', 'Maria', 'Torres Mendez', 'maria.torres@gmail.com', '0991234567', now() + interval '5 days', 'pending', 'Quiero una sesion fotografica para mi graduacion', true, now() - interval '2 days'),
  (NULL, 'Carlos', 'Ramirez Vega', 'carlos.ramirez@hotmail.com', '0987654321', now() + interval '10 days', 'pending', 'Me interesa la auditoria de marca para mi emprendimiento', true, now() - interval '1 day'),
  (NULL, 'Lucia', 'Paredes Soto', 'lucia.paredes@outlook.com', '0976543210', now() + interval '7 days', 'pending', NULL, true, now() - interval '3 days'),
  (NULL, 'Andres', 'Villacis Mora', 'andres.villacis@gmail.com', '0965432109', now() + interval '14 days', 'pending', 'Consulta sobre paquetes de redes sociales', true, now()),

  -- 3 confirmed
  ('b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', 'Maria', 'Torres Mendez', 'maria.torres@gmail.com', '0991234567', now() + interval '3 days', 'confirmed', 'Sesion audiovisual confirmada, horario 10:00 AM', true, now() - interval '10 days'),
  (NULL, 'Sofia', 'Herrera Cruz', 'sofia.herrera@yahoo.com', '0954321098', now() + interval '8 days', 'confirmed', 'Video presentacion profesional', true, now() - interval '7 days'),
  (NULL, 'Diego', 'Montoya Rios', 'diego.montoya@gmail.com', NULL, now() + interval '12 days', 'confirmed', NULL, true, now() - interval '5 days'),

  -- 2 completed
  (NULL, 'Valentina', 'Cevallos Paz', 'valentina.cevallos@gmail.com', '0943210987', now() - interval '15 days', 'completed', 'Sesion fotografica realizada exitosamente', true, now() - interval '30 days'),
  (NULL, 'Fernando', 'Jaramillo Loor', 'fernando.jaramillo@outlook.com', '0932109876', now() - interval '25 days', 'completed', 'Curso iniciado, primera clase completada', true, now() - interval '45 days'),

  -- 1 cancelled
  (NULL, 'Patricia', 'Suarez Mena', 'patricia.suarez@gmail.com', '0921098765', now() - interval '5 days', 'cancelled', 'Cancelado por cambio de fecha del cliente', true, now() - interval '20 days'));


-- =============================================================
-- 3. SUSCRIPCIONES (8 registros)
-- Referencian servicios reales via subquery.
-- auto_renew = true solo para manejo_redes (trigger lo valida).
-- =============================================================
INSERT INTO public.subscriptions (id, user_id, service_id, starts_at, ends_at, status, auto_renew, created_at) VALUES
  -- 4 active (manejo_redes con auto_renew=true)
  ('c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f',
   'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e',
   (SELECT id FROM public.services WHERE name = 'Redes Sociales - Paquete Inicial' LIMIT 1),
   now() - interval '15 days', now() + interval '15 days', 'active', true,
   now() - interval '15 days'),

  ('d4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f80',
   'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e',
   (SELECT id FROM public.services WHERE name = 'Redes Sociales - Paquete Standard' LIMIT 1),
   now() - interval '20 days', now() + interval '10 days', 'active', true,
   now() - interval '20 days'),

  ('e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8091',
   'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e',
   (SELECT id FROM public.services WHERE name = 'Redes Sociales - Paquete Premium' LIMIT 1),
   now() - interval '10 days', now() + interval '20 days', 'active', true,
   now() - interval '10 days'),

  -- 1 active (auditoria, auto_renew=false)
  ('f6a7b8c9-d0e1-4f2a-3b4c-5d6e7f809102',
   'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e',
   (SELECT id FROM public.services WHERE name = 'Auditoría de Marca' LIMIT 1),
   now() - interval '5 days', now() + interval '25 days', 'active', false,
   now() - interval '5 days'),

  -- 2 pending (esperando pago)
  ('a7b8c9d0-e1f2-4a3b-4c5d-6e7f80910213',
   'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e',
   (SELECT id FROM public.services WHERE name = 'Sesión Fotográfica (1 hora)' LIMIT 1),
   now(), now() + interval '30 days', 'pending', false,
   now()),

  ('b8c9d0e1-f2a3-4b4c-5d6e-7f8091021324',
   'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e',
   (SELECT id FROM public.services WHERE name = 'Curso de Marketing (3 meses)' LIMIT 1),
   now(), now() + interval '90 days', 'pending', false,
   now()),

  -- 1 expired
  ('c9d0e1f2-a3b4-4c5d-6e7f-809102132435',
   'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e',
   (SELECT id FROM public.services WHERE name = 'Sesión Audiovisual (2 videos)' LIMIT 1),
   now() - interval '60 days', now() - interval '30 days', 'expired', false,
   now() - interval '60 days'),

  -- 1 cancelled
  ('d0e1f2a3-b4c5-4d6e-7f80-910213243546',
   'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e',
   (SELECT id FROM public.services WHERE name = 'Modelo para Producciones Audiovisuales (1 hora)' LIMIT 1),
   now() - interval '45 days', now() - interval '15 days', 'cancelled', false,
   now() - interval '45 days'));


-- =============================================================
-- 4. TRANSACCIONES (14 registros)
-- Distribuidas en los ultimos 6 meses para el grafico de barras.
-- Amounts coherentes con los precios de los servicios.
-- =============================================================
INSERT INTO public.transactions (user_id, subscription_id, amount, payment_method, status, notes, created_at) VALUES
  -- ── Mes actual (mayo 2026) ── completed: 2, pending: 2
  ('b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e',
   'e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8091',
   599.99, 'transfer', 'completed',
   'Pago Redes Premium - mayo', now() - interval '3 days'),

  ('b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e',
   'f6a7b8c9-d0e1-4f2a-3b4c-5d6e7f809102',
   70.00, 'cash', 'completed',
   'Pago Auditoria de Marca', now() - interval '5 days'),

  ('b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e',
   'a7b8c9d0-e1f2-4a3b-4c5d-6e7f80910213',
   130.00, 'pending', 'pending',
   'Pendiente de pago - Sesion Fotografica', now() - interval '1 day'),

  ('b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e',
   'b8c9d0e1-f2a3-4b4c-5d6e-7f8091021324',
   500.00, 'pending', 'pending',
   'Pendiente de pago - Curso Marketing', now()),

  -- ── Abril 2026 ── completed: 2
  ('b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e',
   'c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f',
   299.00, 'transfer', 'completed',
   'Pago Redes Inicial - abril', now() - interval '35 days'),

  ('b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e',
   'd4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f80',
   399.99, 'card', 'completed',
   'Pago Redes Standard - abril', now() - interval '40 days'),

  -- ── Marzo 2026 ── completed: 2, failed: 1
  ('b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e',
   'c9d0e1f2-a3b4-4c5d-6e7f-809102132435',
   150.00, 'transfer', 'completed',
   'Pago Sesion Audiovisual', now() - interval '65 days'),

  ('b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e',
   NULL,
   70.00, 'cash', 'completed',
   'Auditoria de Marca - pago directo', now() - interval '70 days'),

  ('b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e',
   'd0e1f2a3-b4c5-4d6e-7f80-910213243546',
   25.00, 'transfer', 'failed',
   'Pago rechazado - modelo audiovisual', now() - interval '75 days'),

  -- ── Febrero 2026 ── completed: 1, pending: 1
  ('b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e',
   NULL,
   299.00, 'transfer', 'completed',
   'Pago Redes Inicial - febrero', now() - interval '95 days'),

  ('b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e',
   NULL,
   130.00, 'cash', 'pending',
   'Sesion Fotografica - pendiente antiguo', now() - interval '100 days'),

  -- ── Enero 2026 ── completed: 1, refunded: 1
  ('b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e',
   NULL,
   399.99, 'card', 'completed',
   'Pago Redes Standard - enero', now() - interval '130 days'),

  ('b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e',
   NULL,
   599.99, 'transfer', 'refunded',
   'Reembolso Redes Premium - cliente cambio de opinion', now() - interval '135 days'),

  -- ── Diciembre 2025 ── completed: 1
  ('b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e',
   NULL,
   150.00, 'cash', 'completed',
   'Sesion Audiovisual - pago diciembre', now() - interval '160 days');
