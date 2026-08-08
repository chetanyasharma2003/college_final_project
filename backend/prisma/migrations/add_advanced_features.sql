-- Migration: Add advanced features (generic data, data sources)
-- This migration adds support for flexible scheme data and data source tracking

-- Add generic scheme data table
CREATE TABLE IF NOT EXISTS "SchemeDataGeneric" (
  id SERIAL PRIMARY KEY,
  scheme_id INTEGER NOT NULL,
  state_id INTEGER,
  district_id INTEGER,
  data JSONB NOT NULL,
  date TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (scheme_id) REFERENCES "Scheme"(id) ON DELETE CASCADE,
  FOREIGN KEY (state_id) REFERENCES "State"(id) ON DELETE SET NULL,
  FOREIGN KEY (district_id) REFERENCES "District"(id) ON DELETE SET NULL,
  UNIQUE(scheme_id, state_id, district_id, date)
);

CREATE INDEX idx_scheme_generic_state_date ON "SchemeDataGeneric"(state_id, date);
CREATE INDEX idx_scheme_generic_scheme_date ON "SchemeDataGeneric"(scheme_id, date);
CREATE INDEX idx_scheme_generic_district_date ON "SchemeDataGeneric"(district_id, date);

-- Add data source table
CREATE TABLE IF NOT EXISTS "DataSource" (
  id SERIAL PRIMARY KEY,
  scheme_id INTEGER NOT NULL,
  name VARCHAR(255) NOT NULL,
  api_endpoint VARCHAR(500),
  api_key_env_var VARCHAR(100),
  data_format VARCHAR(20),
  frequency VARCHAR(20) NOT NULL DEFAULT 'monthly',
  last_sync TIMESTAMP,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (scheme_id) REFERENCES "Scheme"(id) ON DELETE CASCADE,
  UNIQUE(scheme_id, name)
);

CREATE INDEX idx_datasource_scheme ON "DataSource"(scheme_id);
CREATE INDEX idx_datasource_status ON "DataSource"(status);
CREATE INDEX idx_datasource_last_sync ON "DataSource"(last_sync);

-- Verify Scheme table has foreign key relations
-- (These should already exist but added for completeness)
ALTER TABLE "SchemeDataGeneric"
ADD CONSTRAINT fk_scheme_data_scheme FOREIGN KEY (scheme_id) REFERENCES "Scheme"(id) ON DELETE CASCADE;

ALTER TABLE "DataSource"
ADD CONSTRAINT fk_data_source_scheme FOREIGN KEY (scheme_id) REFERENCES "Scheme"(id) ON DELETE CASCADE;
