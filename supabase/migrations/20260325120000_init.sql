-- =============================================================
-- RGL Estudio: Migracion inicial
-- Sistema integral de ventas, reservas y control financiero
-- =============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- =============================================================
-- 1. PROFILES (extiende auth.users)
-- =============================================================
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  full_name text,
  avatar_url text,
  role text not null default 'client' check (role in ('admin', 'client')),
  data_consent_at timestamptz, -- LOPDP: fecha en que el usuario acepto el tratamiento de datos
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Admins can view all profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Trigger: auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Trigger: auto-update updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_profiles_updated
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

-- =============================================================
-- 2. SERVICES (catalogo de servicios/paquetes)
-- =============================================================
create table public.services (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  type text not null check (type in ('manejo_redes', 'auditoria', 'capacitacion', 'otro')),
  price numeric(10, 2) not null check (price >= 0),
  duration_months int not null default 1 check (duration_months > 0),
  is_active boolean not null default true,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.services enable row level security;

-- Servicios activos son visibles para todos los usuarios autenticados
create policy "Anyone can view active services"
  on public.services for select
  using (is_active = true);

-- Solo admins pueden ver todos (incluyendo inactivos)
create policy "Admins can view all services"
  on public.services for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Solo admins pueden insertar/actualizar/eliminar
create policy "Admins can insert services"
  on public.services for insert
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can update services"
  on public.services for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can delete services"
  on public.services for delete
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create trigger on_services_updated
  before update on public.services
  for each row execute procedure public.handle_updated_at();

-- =============================================================
-- 3. RESERVATIONS (reservas de capacitaciones)
-- =============================================================
create table public.reservations (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete set null,
  full_name text not null,
  email text not null,
  phone text,
  preferred_date timestamptz not null,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'cancelled', 'completed')),
  notes text,
  data_consent boolean not null default false, -- LOPDP
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.reservations enable row level security;

-- Clientes ven sus propias reservas
create policy "Users can view their own reservations"
  on public.reservations for select
  using (auth.uid() = user_id);

-- Admins ven todas
create policy "Admins can view all reservations"
  on public.reservations for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Cualquier usuario autenticado puede crear una reserva
create policy "Authenticated users can create reservations"
  on public.reservations for insert
  with check (auth.uid() is not null);

-- Admins pueden actualizar cualquier reserva
create policy "Admins can update reservations"
  on public.reservations for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create trigger on_reservations_updated
  before update on public.reservations
  for each row execute procedure public.handle_updated_at();

-- =============================================================
-- 4. SUBSCRIPTIONS (suscripciones activas)
-- =============================================================
create table public.subscriptions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  service_id uuid references public.services on delete restrict not null,
  starts_at timestamptz not null default now(),
  ends_at timestamptz not null,
  status text not null default 'active' check (status in ('active', 'expired', 'cancelled', 'pending')),
  auto_renew boolean not null default false,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.subscriptions enable row level security;

create policy "Users can view their own subscriptions"
  on public.subscriptions for select
  using (auth.uid() = user_id);

create policy "Admins can view all subscriptions"
  on public.subscriptions for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Authenticated users can create subscriptions"
  on public.subscriptions for insert
  with check (auth.uid() = user_id);

create policy "Admins can update subscriptions"
  on public.subscriptions for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create trigger on_subscriptions_updated
  before update on public.subscriptions
  for each row execute procedure public.handle_updated_at();

-- =============================================================
-- 5. TRANSACTIONS (registro de ventas/pagos)
-- =============================================================
create table public.transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete set null,
  subscription_id uuid references public.subscriptions on delete set null,
  amount numeric(10, 2) not null check (amount >= 0),
  payment_method text not null default 'pending' check (payment_method in ('cash', 'transfer', 'card', 'pending')),
  status text not null default 'pending' check (status in ('pending', 'completed', 'failed', 'refunded')),
  notes text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

alter table public.transactions enable row level security;

create policy "Users can view their own transactions"
  on public.transactions for select
  using (auth.uid() = user_id);

create policy "Admins can view all transactions"
  on public.transactions for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can insert transactions"
  on public.transactions for insert
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can update transactions"
  on public.transactions for update
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create trigger on_transactions_updated
  before update on public.transactions
  for each row execute procedure public.handle_updated_at();
