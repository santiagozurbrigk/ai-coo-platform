-- Add per-event fixed commission support for team compensation
-- Use case: setter gets $50 per booked call (commission_basis = 'per_booking')

ALTER TABLE public.team_compensation
  ADD COLUMN IF NOT EXISTS commission_fixed_per_event numeric;

COMMENT ON COLUMN public.team_compensation.commission_fixed_per_event IS
  'Fixed amount per event (e.g. $50 per booked call). Used when commission_basis = ''per_booking''.';
