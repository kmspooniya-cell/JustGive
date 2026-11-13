alter table public.contributions
  add column cause_preference text
  check (cause_preference is null or cause_preference in ('education', 'healthcare', 'animalWelfare', 'other', 'none'));

comment on column public.contributions.cause_preference is
  'Optional personal preference only; it does not allocate, restrict, or guarantee use of contribution funds.';
