create or replace function public.admin_financial_summary(
  p_from timestamptz default null,
  p_to_exclusive timestamptz default null
)
returns table (
  payment_record_count text,
  verified_payment_count text,
  gross_paise text,
  average_paise text,
  pending_payment_count text,
  failed_payment_count text,
  successful_refund_count text,
  refund_paise text,
  net_contribution_paise text,
  settlement_row_count text,
  settlement_fee_paise text,
  settlement_net_paise text,
  undated_successful_refund_count text,
  unverified_refunded_payment_count text,
  incomplete_settlement_count text,
  undated_settlement_count text,
  unreconciled_payment_count text
)
language plpgsql
stable
security invoker
set search_path = ''
as $$
begin
  if auth.uid() is null or not public.is_admin() then
    raise exception 'administrator access required' using errcode = '42501';
  end if;

  if p_from is not null and p_to_exclusive is not null and p_from >= p_to_exclusive then
    raise exception 'invalid reporting period' using errcode = '22023';
  end if;

  return query
  with payment_records as (
    select c.id, c.status, c.amount_paise, c.verified_paid_at, c.created_at
    from public.contributions c
    where c.is_demo = false
      and (
        (c.verified_paid_at is not null
          and (p_from is null or c.verified_paid_at >= p_from)
          and (p_to_exclusive is null or c.verified_paid_at < p_to_exclusive))
        or
        (c.verified_paid_at is null
          and (p_from is null or c.created_at >= p_from)
          and (p_to_exclusive is null or c.created_at < p_to_exclusive))
      )
  ),
  paid as (
    select c.id, c.amount_paise
    from public.contributions c
    where c.is_demo = false
      and c.verified_paid_at is not null
      and (p_from is null or c.verified_paid_at >= p_from)
      and (p_to_exclusive is null or c.verified_paid_at < p_to_exclusive)
  ),
  payment_totals as (
    select count(*) as payment_record_count,
      count(*) filter (where verified_paid_at is not null) as verified_payment_count,
      coalesce(sum(amount_paise) filter (where verified_paid_at is not null), 0)::numeric as gross_paise,
      case when count(*) filter (where verified_paid_at is not null) > 0
        then round(
          coalesce(sum(amount_paise) filter (where verified_paid_at is not null), 0)::numeric
          / (count(*) filter (where verified_paid_at is not null))
        )::text
        else '0'
      end as average_paise
    from payment_records
  ),
  operational_totals as (
    select
      count(*) filter (where c.status = 'pending') as pending_payment_count,
      count(*) filter (where c.status = 'failed') as failed_payment_count
    from public.contributions c
    where c.is_demo = false
      and (p_from is null or c.created_at >= p_from)
      and (p_to_exclusive is null or c.created_at < p_to_exclusive)
  ),
  refund_rows as (
    select r.amount_paise
    from public.refunds r
    join public.contributions c on c.id = r.contribution_id
    where r.status = 'successful'
      and c.is_demo = false
      and c.verified_paid_at is not null
      and (
        (p_from is null and p_to_exclusive is null)
        or (
          r.completed_at is not null
          and (p_from is null or r.completed_at >= p_from)
          and (p_to_exclusive is null or r.completed_at < p_to_exclusive)
        )
      )
  ),
  refund_totals as (
    select count(*) as successful_refund_count,
      coalesce(sum(amount_paise), 0)::numeric as refund_paise
    from refund_rows
  ),
  refund_quality as (
    select count(*) as undated_successful_refund_count
    from public.refunds r
    join public.contributions c on c.id = r.contribution_id
    where r.status = 'successful'
      and r.completed_at is null
      and c.is_demo = false
      and c.verified_paid_at is not null
  ),
  settlement_rows as (
    select s.contribution_id, s.fee_paise, s.net_paise, s.settled_at, s.reconciled_at
    from public.settlement_records s
    join public.contributions c on c.id = s.contribution_id
    where c.is_demo = false
      and c.verified_paid_at is not null
      and (
        (p_from is null and p_to_exclusive is null)
        or (
          s.settled_at is not null
          and (p_from is null or s.settled_at >= p_from)
          and (p_to_exclusive is null or s.settled_at < p_to_exclusive)
        )
      )
  ),
  settlement_totals as (
    select count(*) as settlement_row_count,
      count(*) filter (
        where reconciled_at is null or settled_at is null or net_paise is null or fee_paise is null
      ) as incomplete_settlement_count,
      case
        when count(*) > 0
          and count(*) filter (where reconciled_at is not null and fee_paise is not null) =
              count(*) filter (where reconciled_at is not null)
          and count(*) filter (where reconciled_at is not null) = count(*)
          then sum(fee_paise)::numeric
        else null
      end as settlement_fee_paise,
      case
        when count(*) > 0
          and count(*) filter (where reconciled_at is not null and settled_at is not null and net_paise is not null) = count(*)
          then sum(net_paise)::numeric
        else null
      end as settlement_net_paise
    from settlement_rows
  ),
  settlement_quality as (
    select count(*) as undated_settlement_count
    from public.settlement_records s
    join public.contributions c on c.id = s.contribution_id
    where s.settled_at is null
      and c.is_demo = false
      and c.verified_paid_at is not null
  ),
  refund_status_quality as (
    select count(*) as unverified_refunded_payment_count
    from public.contributions c
    where c.is_demo = false
      and c.status in ('refunded', 'partially_refunded')
      and c.verified_paid_at is null
  ),
  reconciliation_quality as (
    select count(*) as unreconciled_payment_count
    from paid p
    where not exists (
      select 1
      from public.settlement_records s
      where s.contribution_id = p.id
        and s.reconciled_at is not null
        and s.net_paise is not null
    )
  )
  select
    pt.payment_record_count::text,
    pt.verified_payment_count::text,
    pt.gross_paise::text,
    pt.average_paise,
    ot.pending_payment_count::text,
    ot.failed_payment_count::text,
    rt.successful_refund_count::text,
    rt.refund_paise::text,
    (pt.gross_paise - rt.refund_paise)::text,
    st.settlement_row_count::text,
    st.settlement_fee_paise::text,
    st.settlement_net_paise::text,
    rq.undated_successful_refund_count::text,
    rsq.unverified_refunded_payment_count::text,
    st.incomplete_settlement_count::text,
    sq.undated_settlement_count::text,
    reconq.unreconciled_payment_count::text
  from payment_totals pt
  cross join operational_totals ot
  cross join refund_totals rt
  cross join refund_quality rq
  cross join settlement_totals st
  cross join settlement_quality sq
  cross join refund_status_quality rsq
  cross join reconciliation_quality reconq;
end;
$$;

revoke all on function public.admin_financial_summary(timestamptz, timestamptz) from public, anon;
grant execute on function public.admin_financial_summary(timestamptz, timestamptz) to authenticated;
