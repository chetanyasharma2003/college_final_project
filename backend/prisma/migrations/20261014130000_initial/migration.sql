-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'ANALYST', 'OFFICIAL', 'VIEWER');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'VIEWER',
    "state_access" INTEGER,
    "last_login" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "State" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" VARCHAR(2) NOT NULL,
    "region" TEXT,
    "population" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "State_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "District" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "state_id" INTEGER NOT NULL,
    "population" INTEGER,
    "area_km2" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "District_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Block" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "district_id" INTEGER NOT NULL,
    "population" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Block_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Village" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "block_id" INTEGER NOT NULL,
    "population" INTEGER,
    "latitude" DECIMAL(11,8) NOT NULL,
    "longitude" DECIMAL(11,8) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Village_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Scheme" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "ministry" TEXT,
    "launch_date" TIMESTAMP(3),
    "budget" DECIMAL(15,2),
    "target_beneficiaries" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Scheme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KPIDefinition" (
    "id" SERIAL NOT NULL,
    "scheme_id" INTEGER NOT NULL,
    "kpi_name" VARCHAR(150) NOT NULL,
    "description" TEXT,
    "unit" VARCHAR(50),
    "data_type" VARCHAR(20) NOT NULL,
    "formula" TEXT,
    "target_value" DECIMAL(15,2),
    "frequency" VARCHAR(20) NOT NULL DEFAULT 'monthly',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KPIDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KPIValue" (
    "id" SERIAL NOT NULL,
    "kpi_id" INTEGER NOT NULL,
    "state_id" INTEGER,
    "district_id" INTEGER,
    "block_id" INTEGER,
    "village_id" INTEGER,
    "value" DECIMAL(15,4) NOT NULL,
    "target_value" DECIMAL(15,4),
    "date" TIMESTAMP(3) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'on_track',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KPIValue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PMAYData" (
    "id" SERIAL NOT NULL,
    "state_id" INTEGER NOT NULL,
    "district_id" INTEGER NOT NULL,
    "houses_sanctioned" INTEGER,
    "houses_completed" INTEGER,
    "houses_occupied" INTEGER,
    "budget_allocated" DECIMAL(15,2),
    "budget_spent" DECIMAL(15,2),
    "avg_cost_per_unit" DECIMAL(12,2),
    "date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PMAYData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MGNREGSData" (
    "id" SERIAL NOT NULL,
    "state_id" INTEGER NOT NULL,
    "district_id" INTEGER NOT NULL,
    "person_days_created" DECIMAL(12,2),
    "person_days_completed" DECIMAL(12,2),
    "avg_wage" DECIMAL(10,2),
    "work_completion_rate" DECIMAL(5,2),
    "date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MGNREGSData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PMGSYData" (
    "id" SERIAL NOT NULL,
    "state_id" INTEGER NOT NULL,
    "district_id" INTEGER NOT NULL,
    "road_length_planned" DECIMAL(10,2),
    "road_length_constructed" DECIMAL(10,2),
    "habitations_connected" INTEGER,
    "completion_rate" DECIMAL(5,2),
    "date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PMGSYData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NRLMData" (
    "id" SERIAL NOT NULL,
    "state_id" INTEGER NOT NULL,
    "district_id" INTEGER NOT NULL,
    "shgs_formed" INTEGER,
    "members_registered" INTEGER,
    "loan_disbursed" DECIMAL(15,2),
    "women_empowerment_index" DECIMAL(5,2),
    "date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NRLMData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DDUGKYData" (
    "id" SERIAL NOT NULL,
    "state_id" INTEGER NOT NULL,
    "district_id" INTEGER NOT NULL,
    "candidates_trained" INTEGER,
    "placement_count" INTEGER,
    "avg_salary" DECIMAL(10,2),
    "date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DDUGKYData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SAGYData" (
    "id" SERIAL NOT NULL,
    "district_id" INTEGER NOT NULL,
    "village_id" INTEGER NOT NULL,
    "development_index" DECIMAL(5,2),
    "infrastructure_score" DECIMAL(5,2),
    "community_satisfaction" DECIMAL(5,2),
    "date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SAGYData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prediction" (
    "id" SERIAL NOT NULL,
    "kpi_id" INTEGER NOT NULL,
    "location_type" VARCHAR(20) NOT NULL,
    "location_id" INTEGER,
    "predicted_value" DECIMAL(15,4) NOT NULL,
    "confidence_score" DECIMAL(5,2),
    "prediction_date" TIMESTAMP(3) NOT NULL,
    "forecast_period" VARCHAR(20) NOT NULL,
    "model_type" TEXT DEFAULT 'arima',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Prediction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "report_type" VARCHAR(50) NOT NULL,
    "filters" JSONB,
    "file_path" VARCHAR(255),
    "file_format" VARCHAR(10) NOT NULL DEFAULT 'pdf',
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiry_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DataImport" (
    "id" SERIAL NOT NULL,
    "scheme_id" INTEGER NOT NULL,
    "source" VARCHAR(255) NOT NULL,
    "import_type" VARCHAR(20) NOT NULL,
    "file_name" VARCHAR(255),
    "records_imported" INTEGER,
    "records_failed" INTEGER,
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "error_message" TEXT,
    "imported_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DataImport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "action" VARCHAR(100) NOT NULL,
    "table_name" VARCHAR(100) NOT NULL,
    "record_id" INTEGER,
    "changes" JSONB,
    "ip_address" VARCHAR(45),
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatbotQuery" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "query_text" TEXT NOT NULL,
    "response_text" TEXT,
    "query_type" VARCHAR(50),
    "confidence_score" DECIMAL(5,2),
    "user_rating" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChatbotQuery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SchemeDataGeneric" (
    "id" SERIAL NOT NULL,
    "scheme_id" INTEGER NOT NULL,
    "state_id" INTEGER,
    "district_id" INTEGER,
    "data" JSONB NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SchemeDataGeneric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DataSource" (
    "id" SERIAL NOT NULL,
    "scheme_id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "api_endpoint" VARCHAR(500),
    "api_key_env_var" VARCHAR(100),
    "data_format" VARCHAR(20),
    "frequency" VARCHAR(20) NOT NULL DEFAULT 'monthly',
    "last_sync" TIMESTAMP(3),
    "status" VARCHAR(20) NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DataSource_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE UNIQUE INDEX "State_name_key" ON "State"("name");

-- CreateIndex
CREATE UNIQUE INDEX "State_code_key" ON "State"("code");

-- CreateIndex
CREATE INDEX "State_code_idx" ON "State"("code");

-- CreateIndex
CREATE INDEX "District_state_id_idx" ON "District"("state_id");

-- CreateIndex
CREATE UNIQUE INDEX "District_state_id_name_key" ON "District"("state_id", "name");

-- CreateIndex
CREATE INDEX "Block_district_id_idx" ON "Block"("district_id");

-- CreateIndex
CREATE UNIQUE INDEX "Block_district_id_name_key" ON "Block"("district_id", "name");

-- CreateIndex
CREATE INDEX "Village_block_id_idx" ON "Village"("block_id");

-- CreateIndex
CREATE INDEX "Village_latitude_longitude_idx" ON "Village"("latitude", "longitude");

-- CreateIndex
CREATE UNIQUE INDEX "Village_block_id_name_key" ON "Village"("block_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Scheme_name_key" ON "Scheme"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Scheme_code_key" ON "Scheme"("code");

-- CreateIndex
CREATE INDEX "Scheme_code_idx" ON "Scheme"("code");

-- CreateIndex
CREATE INDEX "KPIDefinition_scheme_id_idx" ON "KPIDefinition"("scheme_id");

-- CreateIndex
CREATE UNIQUE INDEX "KPIDefinition_scheme_id_kpi_name_key" ON "KPIDefinition"("scheme_id", "kpi_name");

-- CreateIndex
CREATE INDEX "KPIValue_kpi_id_date_idx" ON "KPIValue"("kpi_id", "date");

-- CreateIndex
CREATE INDEX "KPIValue_state_id_date_idx" ON "KPIValue"("state_id", "date");

-- CreateIndex
CREATE INDEX "KPIValue_district_id_date_idx" ON "KPIValue"("district_id", "date");

-- CreateIndex
CREATE INDEX "KPIValue_created_at_idx" ON "KPIValue"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "KPIValue_kpi_id_state_id_district_id_block_id_village_id_da_key" ON "KPIValue"("kpi_id", "state_id", "district_id", "block_id", "village_id", "date");

-- CreateIndex
CREATE INDEX "PMAYData_state_id_date_idx" ON "PMAYData"("state_id", "date");

-- CreateIndex
CREATE INDEX "PMAYData_district_id_date_idx" ON "PMAYData"("district_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "PMAYData_state_id_district_id_date_key" ON "PMAYData"("state_id", "district_id", "date");

-- CreateIndex
CREATE INDEX "MGNREGSData_state_id_date_idx" ON "MGNREGSData"("state_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "MGNREGSData_state_id_district_id_date_key" ON "MGNREGSData"("state_id", "district_id", "date");

-- CreateIndex
CREATE INDEX "PMGSYData_state_id_date_idx" ON "PMGSYData"("state_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "PMGSYData_state_id_district_id_date_key" ON "PMGSYData"("state_id", "district_id", "date");

-- CreateIndex
CREATE INDEX "NRLMData_state_id_date_idx" ON "NRLMData"("state_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "NRLMData_state_id_district_id_date_key" ON "NRLMData"("state_id", "district_id", "date");

-- CreateIndex
CREATE INDEX "DDUGKYData_state_id_date_idx" ON "DDUGKYData"("state_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "DDUGKYData_state_id_district_id_date_key" ON "DDUGKYData"("state_id", "district_id", "date");

-- CreateIndex
CREATE INDEX "SAGYData_district_id_date_idx" ON "SAGYData"("district_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "SAGYData_district_id_village_id_date_key" ON "SAGYData"("district_id", "village_id", "date");

-- CreateIndex
CREATE INDEX "Prediction_kpi_id_prediction_date_idx" ON "Prediction"("kpi_id", "prediction_date");

-- CreateIndex
CREATE INDEX "Prediction_forecast_period_idx" ON "Prediction"("forecast_period");

-- CreateIndex
CREATE INDEX "Report_user_id_idx" ON "Report"("user_id");

-- CreateIndex
CREATE INDEX "Report_generated_at_idx" ON "Report"("generated_at");

-- CreateIndex
CREATE INDEX "DataImport_scheme_id_imported_at_idx" ON "DataImport"("scheme_id", "imported_at");

-- CreateIndex
CREATE INDEX "DataImport_status_idx" ON "DataImport"("status");

-- CreateIndex
CREATE INDEX "DataImport_created_at_idx" ON "DataImport"("created_at");

-- CreateIndex
CREATE INDEX "AuditLog_user_id_timestamp_idx" ON "AuditLog"("user_id", "timestamp");

-- CreateIndex
CREATE INDEX "AuditLog_table_name_timestamp_idx" ON "AuditLog"("table_name", "timestamp");

-- CreateIndex
CREATE INDEX "AuditLog_timestamp_idx" ON "AuditLog"("timestamp");

-- CreateIndex
CREATE INDEX "ChatbotQuery_user_id_idx" ON "ChatbotQuery"("user_id");

-- CreateIndex
CREATE INDEX "ChatbotQuery_created_at_idx" ON "ChatbotQuery"("created_at");

-- CreateIndex
CREATE INDEX "ChatbotQuery_query_type_idx" ON "ChatbotQuery"("query_type");

-- CreateIndex
CREATE INDEX "SchemeDataGeneric_scheme_id_date_idx" ON "SchemeDataGeneric"("scheme_id", "date");

-- CreateIndex
CREATE INDEX "SchemeDataGeneric_state_id_date_idx" ON "SchemeDataGeneric"("state_id", "date");

-- CreateIndex
CREATE INDEX "SchemeDataGeneric_district_id_date_idx" ON "SchemeDataGeneric"("district_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "SchemeDataGeneric_scheme_id_state_id_district_id_date_key" ON "SchemeDataGeneric"("scheme_id", "state_id", "district_id", "date");

-- CreateIndex
CREATE INDEX "DataSource_scheme_id_idx" ON "DataSource"("scheme_id");

-- CreateIndex
CREATE INDEX "DataSource_status_idx" ON "DataSource"("status");

-- CreateIndex
CREATE UNIQUE INDEX "DataSource_scheme_id_name_key" ON "DataSource"("scheme_id", "name");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_state_access_fkey" FOREIGN KEY ("state_access") REFERENCES "State"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "District" ADD CONSTRAINT "District_state_id_fkey" FOREIGN KEY ("state_id") REFERENCES "State"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Block" ADD CONSTRAINT "Block_district_id_fkey" FOREIGN KEY ("district_id") REFERENCES "District"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Village" ADD CONSTRAINT "Village_block_id_fkey" FOREIGN KEY ("block_id") REFERENCES "Block"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KPIDefinition" ADD CONSTRAINT "KPIDefinition_scheme_id_fkey" FOREIGN KEY ("scheme_id") REFERENCES "Scheme"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KPIValue" ADD CONSTRAINT "KPIValue_kpi_id_fkey" FOREIGN KEY ("kpi_id") REFERENCES "KPIDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KPIValue" ADD CONSTRAINT "KPIValue_state_id_fkey" FOREIGN KEY ("state_id") REFERENCES "State"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KPIValue" ADD CONSTRAINT "KPIValue_district_id_fkey" FOREIGN KEY ("district_id") REFERENCES "District"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KPIValue" ADD CONSTRAINT "KPIValue_block_id_fkey" FOREIGN KEY ("block_id") REFERENCES "Block"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KPIValue" ADD CONSTRAINT "KPIValue_village_id_fkey" FOREIGN KEY ("village_id") REFERENCES "Village"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PMAYData" ADD CONSTRAINT "PMAYData_state_id_fkey" FOREIGN KEY ("state_id") REFERENCES "State"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PMAYData" ADD CONSTRAINT "PMAYData_district_id_fkey" FOREIGN KEY ("district_id") REFERENCES "District"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MGNREGSData" ADD CONSTRAINT "MGNREGSData_state_id_fkey" FOREIGN KEY ("state_id") REFERENCES "State"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MGNREGSData" ADD CONSTRAINT "MGNREGSData_district_id_fkey" FOREIGN KEY ("district_id") REFERENCES "District"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PMGSYData" ADD CONSTRAINT "PMGSYData_state_id_fkey" FOREIGN KEY ("state_id") REFERENCES "State"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PMGSYData" ADD CONSTRAINT "PMGSYData_district_id_fkey" FOREIGN KEY ("district_id") REFERENCES "District"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NRLMData" ADD CONSTRAINT "NRLMData_state_id_fkey" FOREIGN KEY ("state_id") REFERENCES "State"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NRLMData" ADD CONSTRAINT "NRLMData_district_id_fkey" FOREIGN KEY ("district_id") REFERENCES "District"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DDUGKYData" ADD CONSTRAINT "DDUGKYData_state_id_fkey" FOREIGN KEY ("state_id") REFERENCES "State"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DDUGKYData" ADD CONSTRAINT "DDUGKYData_district_id_fkey" FOREIGN KEY ("district_id") REFERENCES "District"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SAGYData" ADD CONSTRAINT "SAGYData_district_id_fkey" FOREIGN KEY ("district_id") REFERENCES "District"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SAGYData" ADD CONSTRAINT "SAGYData_village_id_fkey" FOREIGN KEY ("village_id") REFERENCES "Village"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prediction" ADD CONSTRAINT "Prediction_kpi_id_fkey" FOREIGN KEY ("kpi_id") REFERENCES "KPIDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataImport" ADD CONSTRAINT "DataImport_scheme_id_fkey" FOREIGN KEY ("scheme_id") REFERENCES "Scheme"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchemeDataGeneric" ADD CONSTRAINT "SchemeDataGeneric_scheme_id_fkey" FOREIGN KEY ("scheme_id") REFERENCES "Scheme"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchemeDataGeneric" ADD CONSTRAINT "SchemeDataGeneric_state_id_fkey" FOREIGN KEY ("state_id") REFERENCES "State"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchemeDataGeneric" ADD CONSTRAINT "SchemeDataGeneric_district_id_fkey" FOREIGN KEY ("district_id") REFERENCES "District"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataSource" ADD CONSTRAINT "DataSource_scheme_id_fkey" FOREIGN KEY ("scheme_id") REFERENCES "Scheme"("id") ON DELETE CASCADE ON UPDATE CASCADE;

