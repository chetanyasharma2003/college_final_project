INSERT INTO "State" (name, code, region)
VALUES
  ('Chandigarh', 'CH', 'North'),
  ('Ladakh', 'LA', 'North')
ON CONFLICT (name) DO NOTHING;
