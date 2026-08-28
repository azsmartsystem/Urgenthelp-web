-- Adds a description column so a dispute's original complaint is
-- stored separately from the admin's resolution notes.

alter table disputes add column description text;
