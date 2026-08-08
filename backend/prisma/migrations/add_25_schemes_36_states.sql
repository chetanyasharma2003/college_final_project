-- Migration: Add 25 schemes and 36 states/UTs
-- This migration expands the database to support comprehensive government scheme tracking

-- ============= INSERT ALL 36 STATES/UTs =============
INSERT INTO "State" (name, code, region, population) VALUES
-- North Region (7)
('Jammu and Kashmir', 'JK', 'North', 12267000),
('Himachal Pradesh', 'HP', 'North', 6856509),
('Punjab', 'PB', 'North', 27704236),
('Haryana', 'HR', 'North', 25353081),
('Uttar Pradesh', 'UP', 'North', 199812341),
('Uttarakhand', 'UK', 'North', 10086292),
('Delhi', 'DL', 'North', 16753235),

-- South Region (7)
('Tamil Nadu', 'TN', 'South', 72147030),
('Telangana', 'TG', 'South', 35193978),
('Andhra Pradesh', 'AP', 'South', 49506014),
('Karnataka', 'KA', 'South', 61130704),
('Kerala', 'KL', 'South', 34558567),
('Puducherry', 'PY', 'South', 1244464),
('Lakshadweep', 'LD', 'South', 64473),

-- East Region (5)
('West Bengal', 'WB', 'East', 91276115),
('Bihar', 'BR', 'East', 103804637),
('Jharkhand', 'JH', 'East', 32966134),
('Odisha', 'OD', 'East', 42009143),
('Sikkim', 'SK', 'East', 610577),

-- Central Region (3)
('Madhya Pradesh', 'MP', 'Central', 72597565),
('Chhattisgarh', 'CG', 'Central', 25545198),
('Telecom', 'TL', 'Central', 3671173),

-- West Region (7)
('Maharashtra', 'MH', 'West', 112374333),
('Gujarat', 'GJ', 'West', 60439692),
('Goa', 'GA', 'West', 1457723),
('Rajasthan', 'RJ', 'West', 68548437),
('Dadra and Nagar Haveli', 'DH', 'West', 864254),
('Daman and Diu', 'DD', 'West', 147397),
('Andaman and Nicobar', 'AN', 'West', 380581)
ON CONFLICT (name) DO NOTHING;

-- ============= INSERT ALL 25 SCHEMES =============
INSERT INTO "Scheme" (name, code, description, ministry, launch_date, budget) VALUES
-- Existing 6 schemes
('Pradhan Mantri Awas Yojana', 'PMAY', 'Housing for All - Urban & Rural housing scheme', 'Ministry of Housing & Urban Affairs', '2015-06-25', 500000000000),
('Mahatma Gandhi National Rural Employment Guarantee', 'MGNREGS', 'Rural employment guarantee program', 'Ministry of Rural Development', '2006-02-02', 300000000000),
('Pradhan Mantri Gram Sadak Yojana', 'PMGSY', 'Rural road connectivity program', 'Ministry of Rural Development & Panchayati Raj', '2000-12-25', 250000000000),
('National Rural Livelihood Mission', 'NRLM', 'Rural livelihood and women empowerment', 'Ministry of Rural Development', '2011-06-01', 200000000000),
('Deen Dayal Upadhyaya Gram Jyoti Yojana', 'DDU-GKY', 'Skill development and youth training', 'Ministry of Skill Development', '2014-07-25', 100000000000),
('Sansad Adarsh Gram Yojana', 'SAGY', 'Model villages development program', 'Ministry of Rural Development', '2014-10-11', 50000000000),

-- New 19 schemes (Agriculture & Food Security - 6)
('PM-KISAN Samman Nidhi', 'PMKISAN', 'Farmer income support scheme - Rs 6000/year per farmer', 'Ministry of Agriculture & Farmers Welfare', '2019-02-01', 750000000000),
('Pradhan Mantri Fasal Bima Yojana', 'PMFBY', 'Crop insurance scheme protecting farmers against yield loss', 'Ministry of Agriculture & Farmers Welfare', '2016-01-13', 15000000000),
('Paramparagat Krishi Vikas Yojana', 'PKVY', 'Organic farming and sustainable agriculture', 'Ministry of Agriculture & Farmers Welfare', '2015-07-01', 5000000000),
('Rashtriya Krishi Vikas Yojana', 'RKVY', 'Agricultural infrastructure and technology', 'Ministry of Agriculture & Farmers Welfare', '2007-08-01', 100000000000),
('Integrated Child Development Services', 'ICDS', 'Nutrition and health for children', 'Ministry of Women & Child Development', '1975-10-02', 350000000000),
('Public Distribution System', 'PDS', 'Food security through ration distribution', 'Ministry of Consumer Affairs', '1939-07-15', 450000000000),

-- Health & Nutrition (4)
('Ayushman Bharat', 'AB', 'Health insurance scheme providing Rs 5 lakh coverage', 'Ministry of Health & Family Welfare', '2018-01-01', 300000000000),
('National Health Mission', 'NHM', 'Health service delivery and maternal health', 'Ministry of Health & Family Welfare', '2013-05-12', 250000000000),
('National Nutrition Mission', 'NMNF', 'Nutrition security across states', 'Ministry of Women & Child Development', '2017-03-08', 100000000000),
('Reproductive and Child Health Program', 'RCH', 'Maternal and child health services', 'Ministry of Health & Family Welfare', '1997-01-01', 80000000000),

-- Education (3)
('Mid Day Scheme', 'MDS', 'School meal program for nutrition', 'Ministry of Education', '1995-08-15', 120000000000),
('Rashtriya Madhyamik Shiksha Abhiyan', 'RMSA', 'Secondary education infrastructure', 'Ministry of Education', '2009-04-30', 150000000000),
('Rashtriya Uchchatar Shiksha Abhiyan', 'RUSA', 'Higher education infrastructure and quality', 'Ministry of Education', '2013-04-04', 200000000000),

-- Social Security & Pensions (3)
('Atal Pension Yojana', 'APY', 'Pension scheme for unorganized workers', 'Ministry of Labour & Employment', '2015-05-09', 50000000000),
('Widow and Disability Pension Scheme', 'WBCIS', 'Social security for vulnerable groups', 'Ministry of Social Justice', '2010-01-01', 30000000000),
('Indira Gandhi National Disability Pension', 'IGNDP', 'Disability allowance scheme', 'Ministry of Social Justice', '1995-11-20', 20000000000),

-- Urban Development (2)
('Swachh Bharat Abhiyan', 'SBM', 'Sanitation and waste management', 'Ministry of Housing & Urban Affairs', '2014-10-02', 200000000000),
('Smart Cities Mission', 'SCM', 'Urban infrastructure development', 'Ministry of Housing & Urban Affairs', '2015-06-25', 500000000000)

ON CONFLICT (code) DO NOTHING;

-- ============= CREATE GENERIC SCHEME DATA TABLE =============
-- For schemes that don't have specific models yet
CREATE TABLE IF NOT EXISTS "SchemeDataGeneric" (
  id SERIAL PRIMARY KEY,
  scheme_id INT NOT NULL,
  state_id INT,
  district_id INT,
  data JSONB,
  date TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (scheme_id) REFERENCES "Scheme"(id) ON DELETE CASCADE,
  FOREIGN KEY (state_id) REFERENCES "State"(id) ON DELETE SET NULL,
  FOREIGN KEY (district_id) REFERENCES "District"(id) ON DELETE SET NULL,
  UNIQUE(scheme_id, state_id, district_id, date)
);

CREATE INDEX IF NOT EXISTS idx_scheme_generic_state_date ON "SchemeDataGeneric"(state_id, date);
CREATE INDEX IF NOT EXISTS idx_scheme_generic_scheme_date ON "SchemeDataGeneric"(scheme_id, date);

-- ============= CREATE DATA SOURCE TRACKING =============
CREATE TABLE IF NOT EXISTS "DataSource" (
  id SERIAL PRIMARY KEY,
  scheme_id INT NOT NULL,
  name VARCHAR(255),
  api_endpoint VARCHAR(500),
  api_key_env_var VARCHAR(100),
  data_format VARCHAR(20),
  frequency VARCHAR(20),
  last_sync TIMESTAMP,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (scheme_id) REFERENCES "Scheme"(id) ON DELETE CASCADE,
  UNIQUE(scheme_id, name)
);

CREATE INDEX IF NOT EXISTS idx_datasource_scheme ON "DataSource"(scheme_id);
CREATE INDEX IF NOT EXISTS idx_datasource_status ON "DataSource"(status);
