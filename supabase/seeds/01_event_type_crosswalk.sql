INSERT into raw.event_type_crosswalk (event_type_alias, canonical_event_type, event_family) values
    ('SUBMIT', 'submitted', 'intake'),
    ('submitted', 'submitted', 'intake'),
    ('DENY', 'denied', 'adjudication'),
    ('adj-denied', 'denied', 'adjudication'),
    ('APPR', 'approved', 'adjudication'),
    ('approved', 'approved', 'adjudication'),
    ('PEND', 'pended', 'adjudication'),
    ('RESUB', 'resubmitted', 'rework'),
    ('resubmitted', 'resubmitted', 'rework'),
    ('check_issued', 'paid', 'payment'),
    ('paid', 'paid', 'payment')
on conflict (event_type_alias) do update
set canonical_event_type = excluded.canonical_event_type,
    event_family = excluded.event_family;
