INSERT INTO "State" (name, code, region)
VALUES
  ('Dadra and Nagar Haveli and Daman and Diu', 'DN', 'West'),
  ('Lakshadweep', 'LD', 'Islands')
ON CONFLICT (name) DO NOTHING;
