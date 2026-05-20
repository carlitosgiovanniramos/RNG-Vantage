-- =============================================================
-- RGL Estudio: Seed data (servicios reales)
-- =============================================================

-- Catalogo real de Ruth (8 servicios)
-- Nota: por regla de negocio, solo manejo_redes puede renovarse automaticamente.
insert into public.services (name, description, type, price, duration_months, is_active) values
  ('Auditoria de Marca', 'Reunion especializada mensual con la agencia. Incluye: analisis de marca, analisis de estrategias de contenido, consultas personalizadas por mensaje y 1 llamada por Zoom (1h30min) para presentacion de proyecto y estrategia de marketing.', 'auditoria', 70.00, 1, true),
  ('Curso de Marketing (3 meses)', 'Aprende a crear contenido desde cero. Incluye: fotografia y video, creacion y planificacion de contenido, estrategia de comunicacion, edicion de video en CapCut, edicion de fotografia en Photoshop, analisis de metricas en META ADS y TikTok ADS, creacion de contenido con IA.', 'capacitacion', 500.00, 3, true),
  ('Sesion Audiovisual / Video Presentacion', 'Video presentacion para profesionales que desean ejercer su carrera. Duracion: 0:45 seg - 1:25 min. Incluye: guion estructurado, guia de poses, equipo de luminaria, iPhone 15, microfonos DJI mini, Dron DJI NEO2. No incluye costos por cambio de fecha ni devolucion.', 'otro', 150.00, 1, true),
  ('Sesion Fotografica (1 hora)', 'Sesion para graduacion, retrato o boda civil privada. Entrega en 5 dias. Pago: 50% reserva + 50% el dia de la sesion. Incluye: 50 fotografias profesionales editadas, Camara Sony X600, equipo de luces y asistencia en poses. No incluye produccion audiovisual ni fotos sin edicion.', 'otro', 150.00, 1, true),
  ('Redes Sociales - Paquete Inicial', 'Incluye: planificacion estrategica de contenido, 1 produccion audiovisual (1min-1:30min), 4 horas de grabacion, 5 spots publicitarios (0:35-0:55 seg), iPhone 15, microfonos DJI mini, equipo de luz e informe basico de contenido. No incluye transporte, automatizacion de mensajeria ni sesion fotografica.', 'manejo_redes', 430.00, 1, true),
  ('Redes Sociales - Paquete Standard', 'Incluye: dos dias de produccion, planificacion estrategica, 2 producciones audiovisuales (1min30seg), 10 spots publicitarios, 5 fotografias profesionales editadas, 5 afiches publicitarios para Facebook e Instagram, Camara Sony X600, asistencia en poses, informe mensual y analisis de metricas. Precios no incluyen 15% IVA.', 'manejo_redes', 610.00, 1, true),
  ('Redes Sociales - Paquete Premium', 'Incluye: 2 dias de produccion, 2 producciones audiovisuales (1:30min-3:00min), 15 spots publicitarios, 20 fotografias profesionales editadas, 18 flyers publicitarios para Facebook e Instagram, planificacion estrategica, Dron DJI NEO2, Camara Sony X600, automatizacion de mensajeria y comentarios, informe mensual y analisis de metricas. Precios no incluyen 15% IVA.', 'manejo_redes', 850.00, 1, true),
  ('Modelo para Producciones Audiovisual', 'Modelo profesional de buena presentacion, diccion y desenvuelta frente a camara. Precio por hora. No incluye costos por transporte, movilizacion, snacks, bebidas ni alimentacion.', 'otro', 50.00, 1, true);


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
   (SELECT id FROM public.services WHERE name = 'Auditoria de Marca' LIMIT 1),
   now() - interval '5 days', now() + interval '25 days', 'active', false,
   now() - interval '5 days'),

  -- 2 pending (esperando pago)
  ('a7b8c9d0-e1f2-4a3b-4c5d-6e7f80910213',
   'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e',
   (SELECT id FROM public.services WHERE name = 'Sesion Fotografica (1 hora)' LIMIT 1),
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
   (SELECT id FROM public.services WHERE name = 'Sesion Audiovisual / Video Presentacion' LIMIT 1),
   now() - interval '60 days', now() - interval '30 days', 'expired', false,
   now() - interval '60 days'),

  -- 1 cancelled
  ('d0e1f2a3-b4c5-4d6e-7f80-910213243546',
   'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e',
   (SELECT id FROM public.services WHERE name = 'Modelo para Producciones Audiovisual' LIMIT 1),
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
   850.00, 'transfer', 'completed',
   'Pago Redes Premium - mayo', now() - interval '3 days'),

  ('b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e',
   'f6a7b8c9-d0e1-4f2a-3b4c-5d6e7f809102',
   70.00, 'cash', 'completed',
   'Pago Auditoria de Marca', now() - interval '5 days'),

  ('b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e',
   'a7b8c9d0-e1f2-4a3b-4c5d-6e7f80910213',
   150.00, 'pending', 'pending',
   'Pendiente de pago - Sesion Fotografica', now() - interval '1 day'),

  ('b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e',
   'b8c9d0e1-f2a3-4b4c-5d6e-7f8091021324',
   500.00, 'pending', 'pending',
   'Pendiente de pago - Curso Marketing', now()),

  -- ── Abril 2026 ── completed: 2
  ('b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e',
   'c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f',
   430.00, 'transfer', 'completed',
   'Pago Redes Inicial - abril', now() - interval '35 days'),

  ('b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e',
   'd4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f80',
   610.00, 'card', 'completed',
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
   50.00, 'transfer', 'failed',
   'Pago rechazado - modelo audiovisual', now() - interval '75 days'),

  -- ── Febrero 2026 ── completed: 1, pending: 1
  ('b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e',
   NULL,
   430.00, 'transfer', 'completed',
   'Pago Redes Inicial - febrero', now() - interval '95 days'),

  ('b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e',
   NULL,
   150.00, 'cash', 'pending',
   'Sesion Fotografica - pendiente antiguo', now() - interval '100 days'),

  -- ── Enero 2026 ── completed: 1, refunded: 1
  ('b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e',
   NULL,
   610.00, 'card', 'completed',
   'Pago Redes Standard - enero', now() - interval '130 days'),

  ('b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e',
   NULL,
   850.00, 'transfer', 'refunded',
   'Reembolso Redes Premium - cliente cambio de opinion', now() - interval '135 days'),

  -- ── Diciembre 2025 ── completed: 1
  ('b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e',
   NULL,
   150.00, 'cash', 'completed',
   'Sesion Audiovisual - pago diciembre', now() - interval '160 days');
