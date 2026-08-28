-- Enable Supabase Realtime for live chat delivery (components/Chat.tsx
-- subscribes to postgres_changes on `messages`). Without this, the table
-- exists and RLS is correct, but INSERT events are never broadcast —
-- messages would only ever appear after a manual refetch, silently
-- breaking the "real-time" part of the messaging spec (§14).
alter publication supabase_realtime add table messages;

-- REPLICA IDENTITY FULL so the realtime payload includes full row data
-- (not just the primary key) on UPDATE/DELETE — not strictly required for
-- our INSERT-only subscription today, but cheap correctness insurance if
-- read-receipt UPDATEs are ever broadcast too.
alter table messages replica identity full;
