-- Migracion: separar full_name en first_name + last_name

-- =============================================
-- 1. PROFILES
-- =============================================
alter table public.profiles
  add column first_name text,
  add column last_name text;

-- Migrar datos existentes (si los hay)
update public.profiles
set
  first_name = split_part(full_name, ' ', 1),
  last_name = trim(
    case
      when position(' ' in full_name) > 0 then substring(full_name from position(' ' in full_name) + 1)
      else ''
    end
  )
where full_name is not null;

alter table public.profiles
  drop column full_name;

-- =============================================
-- 2. RESERVATIONS
-- =============================================
alter table public.reservations
  add column first_name text,
  add column last_name text;

update public.reservations
set
  first_name = split_part(full_name, ' ', 1),
  last_name = trim(
    case
      when position(' ' in full_name) > 0 then substring(full_name from position(' ' in full_name) + 1)
      else ''
    end
  )
where full_name is not null;

alter table public.reservations
  drop column full_name,
  alter column first_name set not null,
  alter column last_name set not null;

-- =============================================
-- 3. TRIGGER handle_new_user
-- =============================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, first_name, last_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;
