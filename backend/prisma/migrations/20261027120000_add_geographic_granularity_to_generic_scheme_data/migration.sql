ALTER TABLE "SchemeDataGeneric"
  ADD COLUMN "block_id" INTEGER,
  ADD COLUMN "village_id" INTEGER;

DROP INDEX IF EXISTS "SchemeDataGeneric_scheme_id_state_id_district_id_date_key";
CREATE UNIQUE INDEX "SchemeDataGeneric_scheme_id_state_id_district_id_block_id_village_id_date_key"
  ON "SchemeDataGeneric"("scheme_id", "state_id", "district_id", "block_id", "village_id", "date");

CREATE INDEX "SchemeDataGeneric_block_id_date_idx" ON "SchemeDataGeneric"("block_id", "date");
CREATE INDEX "SchemeDataGeneric_village_id_date_idx" ON "SchemeDataGeneric"("village_id", "date");

ALTER TABLE "SchemeDataGeneric"
  ADD CONSTRAINT "SchemeDataGeneric_block_id_fkey"
    FOREIGN KEY ("block_id") REFERENCES "Block"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT "SchemeDataGeneric_village_id_fkey"
    FOREIGN KEY ("village_id") REFERENCES "Village"("id") ON DELETE SET NULL ON UPDATE CASCADE;

UPDATE "Scheme"
SET "name" = 'Deen Dayal Upadhyaya Grameen Kaushalya Yojana',
    "ministry" = 'Ministry of Rural Development'
WHERE "code" = 'DDU-GKY';
