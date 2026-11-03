UPDATE "State"
SET code = 'AP'
WHERE name = 'Andhra Pradesh'
  AND code = 'AN';

INSERT INTO "State" (name, code, region)
VALUES ('Andaman and Nicobar Islands', 'AN', 'Islands')
ON CONFLICT (name) DO NOTHING;
