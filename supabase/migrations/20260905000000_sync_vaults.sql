-- 端末間同期のための保管庫。
-- テーブルへは anon / authenticated から直接アクセスできず、
-- 同期キーを引数に取る SECURITY DEFINER 関数経由でのみ読み書きできる。

create table if not exists public.sync_vaults (
  id text primary key,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.sync_vaults enable row level security;
revoke all on table public.sync_vaults from anon, authenticated;

create or replace function public.vault_pull(p_key text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_payload jsonb;
  v_updated timestamptz;
begin
  if p_key is null or p_key !~ '^[a-z0-9-]{16,64}$' then
    raise exception 'invalid key format';
  end if;
  select payload, updated_at into v_payload, v_updated from public.sync_vaults where id = p_key;
  if v_payload is null then
    return jsonb_build_object('found', false);
  end if;
  return jsonb_build_object('found', true, 'payload', v_payload, 'updatedAt', v_updated);
end;
$$;

create or replace function public.vault_push(p_key text, p_payload jsonb, p_expected timestamptz default null)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_current timestamptz;
  v_updated timestamptz;
begin
  if p_key is null or p_key !~ '^[a-z0-9-]{16,64}$' then
    raise exception 'invalid key format';
  end if;
  if pg_column_size(p_payload) > 4000000 then
    raise exception 'payload too large';
  end if;

  select updated_at into v_current from public.sync_vaults where id = p_key for update;

  if v_current is not null and p_expected is not null and v_current <> p_expected then
    return jsonb_build_object('ok', false, 'conflict', true, 'updatedAt', v_current);
  end if;

  insert into public.sync_vaults as v (id, payload)
  values (p_key, p_payload)
  on conflict (id) do update set payload = excluded.payload, updated_at = now()
  returning v.updated_at into v_updated;

  return jsonb_build_object('ok', true, 'updatedAt', v_updated);
end;
$$;

revoke all on function public.vault_pull(text) from public;
revoke all on function public.vault_push(text, jsonb, timestamptz) from public;
grant execute on function public.vault_pull(text) to anon, authenticated;
grant execute on function public.vault_push(text, jsonb, timestamptz) to anon, authenticated;
