INSERT INTO raw.status_crosswalk (status_alias, canonical_status, status_group) values
    ('APPR', 'approved', 'terminal'),
    ('approved', 'approved', 'terminal'),
    ('adj-denied', 'denied', 'terminal'),
    ('DENY', 'denied', 'terminal'),
    ('pending info', 'pending', 'in_progress'),
    ('in review', 'in_review', 'in_progress'),
    ('paid', 'paid', 'terminal'),
    ('resubmitted', 'resubmitted', 'rework')
ON conflict (status_alias) do UPDATE
SET canonical_status = excluded.canonical_status,
    status_group = excluded.status_group;