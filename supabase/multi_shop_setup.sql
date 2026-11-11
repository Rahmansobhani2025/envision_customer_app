-- =====================================================================
-- ENVISION EYEWEAR: multi-shop setup (run once in Supabase SQL Editor)
-- Safe to re-run. It only creates/replaces functions and updates tier flags.
-- It does NOT drop or change any of your existing tables, columns or policies.
-- =====================================================================

-- 1) Virtual try-on flags per tier -------------------------------------
--    Gold + Platinum: try-on image.  Platinum only: try-on video.
update public.tiers set has_vto_image = false, has_vto_video = false where lower(name) in ('bronze','silver');
update public.tiers set has_vto_image = true,  has_vto_video = false where lower(name) = 'gold';
update public.tiers set has_vto_image = true,  has_vto_video = true  where lower(name) = 'platinum';

-- 2) Helpful indexes ---------------------------------------------------
create index if not exists inventory_shop_id_idx        on public.inventory (shop_id);
create index if not exists inventory_media_inventory_idx on public.inventory_media (inventory_id);
create index if not exists profiles_shop_id_idx          on public.profiles (shop_id);

-- 3) Public shop lookup by slug ---------------------------------------
--    Returns ONLY storefront-safe fields (no owner email, no pricing/ledger).
create or replace function public.get_public_shop(p_slug text)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'id',                   s.id,
    'slug',                 c.subdomain_slug,
    'name',                 s.shop_name,
    'location',             s.location,
    'phone',                s.owner_phone,
    'country_code',         s.country_code,
    'tier',                 s.tier,
    'logo_url',             nullif(c.logo_url, ''),
    'primary_color',        c.primary_color,
    'secondary_color',      c.secondary_color,
    'background_image_url', nullif(c.background_image_url, ''),
    'currency_code',        s.currency_code,
    'currency_symbol',      s.currency_symbol,
    -- optional extras (address / hours / phone) if your shop_configs has a config_json column
    'config',               coalesce(to_jsonb(c) -> 'config_json', '{}'::jsonb),
    'status', case
        when coalesce(s.is_active, true) = false or coalesce(c.is_active, true) = false then 'suspended'
        when s.status in ('suspended', 'on_hold', 'maintenance')                           then s.status
        when s.subscription_status in ('suspended', 'maintenance')                         then s.subscription_status
        else 'active'
      end,
    'has_face_analysis',    coalesce(t.has_face_analysis, true),
    'has_vto_image',        coalesce(t.has_vto_image, s.tier in ('gold', 'platinum')),
    'has_vto_video',        coalesce(t.has_vto_video, s.tier = 'platinum')
  )
  from public.shop_configs c
  join public.shops s on s.id = c.shop_id
  left join public.tiers t on lower(t.name) = lower(s.tier)
  where lower(c.subdomain_slug) = lower(trim(p_slug))
  limit 1;
$$;

-- 4) A shop's inventory + media (embedding vectors are NOT sent to the browser)
create or replace function public.get_shop_inventory(p_shop_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    jsonb_agg(
      (to_jsonb(i) - 'embedding')
      || jsonb_build_object(
           'media',
           coalesce(
             (select jsonb_agg(to_jsonb(m) order by m.is_primary desc, m.display_order, m.created_at)
                from public.inventory_media m
               where m.inventory_id = i.id),
             '[]'::jsonb)
         )
      order by i.created_at desc
    ),
    '[]'::jsonb
  )
  from public.inventory i
  where i.shop_id = p_shop_id
    and exists (select 1 from public.shops s
                 where s.id = i.shop_id and coalesce(s.is_active, true));
$$;

-- 5) Vector matching, restricted to ONE shop ---------------------------
--    Pass the embedding of the face analysis; returns best frames of THAT shop only.
create or replace function public.match_shop_inventory(
  p_shop_id   uuid,
  p_embedding vector,
  p_limit     int  default 8,
  p_gender    text default null      -- 'Men' | 'Women' | null (Unisex always allowed)
)
returns table (id bigint, similarity double precision)
language sql
stable
security definer
set search_path = public, extensions
as $$
  select i.id, 1 - (i.embedding <=> p_embedding) as similarity
  from public.inventory i
  where i.shop_id = p_shop_id
    and i.embedding is not null
    and (p_gender is null or i.target_gender is null
         or i.target_gender = 'Unisex' or i.target_gender = p_gender)
  order by i.embedding <=> p_embedding
  limit greatest(p_limit, 1);
$$;

-- 6) Attach a signed-in customer to the shop whose link they used ------
--    One shop only: it is set ONCE and never overwritten. Staff/agents are untouched.
create or replace function public.claim_customer_shop(p_slug text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid     uuid := auth.uid();
  v_shop_id uuid;
  v_current uuid;
begin
  if v_uid is null then
    return jsonb_build_object('shop_id', null, 'error', 'not_authenticated');
  end if;

  select c.shop_id into v_shop_id
    from public.shop_configs c
   where lower(c.subdomain_slug) = lower(trim(p_slug))
   limit 1;

  if v_shop_id is null then
    return jsonb_build_object('shop_id', null, 'error', 'unknown_shop');
  end if;

  insert into public.profiles (id, role, shop_id)
  values (v_uid, 'customer', v_shop_id)
  on conflict (id) do update
     set shop_id = coalesce(public.profiles.shop_id, excluded.shop_id)
   where coalesce(public.profiles.role, 'customer') = 'customer';

  select shop_id into v_current from public.profiles where id = v_uid;
  return jsonb_build_object('shop_id', v_current, 'matches', v_current = v_shop_id);
end;
$$;

-- 7) Permissions -------------------------------------------------------
revoke all on function public.get_public_shop(text)                         from public;
revoke all on function public.get_shop_inventory(uuid)                      from public;
revoke all on function public.match_shop_inventory(uuid, vector, int, text) from public;
revoke all on function public.claim_customer_shop(text)                     from public;

grant execute on function public.get_public_shop(text)                         to anon, authenticated;
grant execute on function public.get_shop_inventory(uuid)                      to anon, authenticated;
grant execute on function public.match_shop_inventory(uuid, vector, int, text) to anon, authenticated;
grant execute on function public.claim_customer_shop(text)                     to authenticated;

-- =====================================================================
-- DIAGNOSTICS (run these separately and check the results)
-- =====================================================================
-- A) Triggers on auth.users. If one treats a missing role as 'agent', customers
--    would become agents. (The customer app now always sends role = 'customer'.)
--   select tgname, pg_get_triggerdef(oid) from pg_trigger
--    where tgrelid = 'auth.users'::regclass and not tgisinternal;
--
-- B) Row-level-security policies. Any policy using (true) for anon on shops,
--    profiles, shop_staff_credentials or the ledger tables is readable/writable
--    by anyone holding the public anon key.
--   select tablename, policyname, roles, cmd, qual, with_check
--     from pg_policies where schemaname = 'public' order by tablename, policyname;
