-- =============================================================
-- Gestor Personal - Esquema de base de datos (Supabase/Postgres)
-- Ejecutar completo en el SQL Editor de Supabase.
-- Es idempotente: se puede volver a ejecutar sin romper datos.
-- =============================================================

create extension if not exists "pgcrypto";

-- ---------- Esquema propio ----------
-- Nombre con mayúsculas: siempre entre comillas dobles ("GestorGastos").
create schema if not exists "GestorGastos";
grant usage on schema "GestorGastos" to service_role;

-- ---------- Configuración ----------
create table if not exists "GestorGastos".categories (
  id   bigint generated always as identity primary key,
  name text not null unique
);

create table if not exists "GestorGastos".payment_methods (
  id   bigint generated always as identity primary key,
  name text not null unique
);

-- ---------- Movimientos ----------
create table if not exists "GestorGastos".transactions (
  id             uuid primary key default gen_random_uuid(),
  type           text not null check (type in ('income', 'expense')),
  date           date not null,
  title          text not null,
  amount         numeric(14,2) not null check (amount > 0),
  payment_method text not null,
  category       text not null,
  location       text,
  obs            text,
  installments   integer check (installments is null or installments >= 1),
  expiration     date,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index if not exists transactions_date_idx on "GestorGastos".transactions (date);

create or replace function "GestorGastos".set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists transactions_set_updated_at on "GestorGastos".transactions;
create trigger transactions_set_updated_at
  before update on "GestorGastos".transactions
  for each row execute function "GestorGastos".set_updated_at();

-- Saldo acumulado de todos los movimientos anteriores a una fecha
create or replace function "GestorGastos".balance_before(p_date date)
returns numeric language sql stable as $$
  select coalesce(sum(case when type = 'income' then amount else -amount end), 0)
  from "GestorGastos".transactions
  where date < p_date;
$$;

-- ---------- Agenda ----------
create table if not exists "GestorGastos".agenda_items (
  id         uuid primary key default gen_random_uuid(),
  title      text not null,
  date       date not null,
  start_time time not null,
  end_time   time not null,
  notes      text,
  created_at timestamptz not null default now(),
  constraint agenda_items_time_order check (start_time < end_time)
);
create index if not exists agenda_items_date_idx on "GestorGastos".agenda_items (date);

-- ---------- Auditoría ----------
create table if not exists "GestorGastos".audit_logs (
  id         bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  action     text not null check (action in ('CREATE', 'UPDATE', 'DELETE')),
  module     text not null,
  details    text not null
);
create index if not exists audit_logs_created_at_idx on "GestorGastos".audit_logs (created_at desc);

-- ---------- Seguridad: RLS sin políticas ----------
-- La service role key (usada solo por el backend) ignora RLS.
-- Las claves anon/authenticated no pueden leer ni escribir nada.
alter table "GestorGastos".categories      enable row level security;
alter table "GestorGastos".payment_methods enable row level security;
alter table "GestorGastos".transactions    enable row level security;
alter table "GestorGastos".agenda_items    enable row level security;
alter table "GestorGastos".audit_logs      enable row level security;

revoke execute on function "GestorGastos".balance_before(date) from public, anon, authenticated;
grant execute on function "GestorGastos".balance_before(date) to service_role;

-- Permisos de la service role sobre el esquema (incluye objetos futuros)
grant all on all tables    in schema "GestorGastos" to service_role;
grant all on all sequences in schema "GestorGastos" to service_role;
alter default privileges in schema "GestorGastos" grant all on tables    to service_role;
alter default privileges in schema "GestorGastos" grant all on sequences to service_role;

-- ---------- Datos iniciales ----------
insert into "GestorGastos".categories (name) values
  ('Alimentación'), ('Transporte'), ('Servicios'), ('Deportes'),
  ('Mascotas'), ('Trabajo'), ('Otros')
on conflict (name) do nothing;

insert into "GestorGastos".payment_methods (name) values
  ('Efectivo'), ('Tarjeta de Débito'), ('Tarjeta de Crédito'),
  ('Transferencia'), ('Mercado Pago')
on conflict (name) do nothing;
