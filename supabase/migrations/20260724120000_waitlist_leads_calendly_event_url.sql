alter table waitlist_leads
  add column if not exists calendly_event_url text;
