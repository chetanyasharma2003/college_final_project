// Data source configurations for government schemes
// Maps schemes to their real APIs and transformation logic

export const DATA_SOURCES = {
  // PMAY - Data from PMAY-Urban MIS API
  PMAY: {
    name: 'PMAY-Urban MIS',
    apiEndpoint: 'https://pmay-urban.gov.in/api/v1/houses',
    resourceId: 'pmay_data', // data.gov.in resource ID
    method: 'GET',
    frequency: 'monthly',
    mapping: {
      state: 'state_name',
      district: 'district_name',
      date: 'data_month',
      metrics: [
        { name: 'houses_sanctioned', field: 'sanctioned' },
        { name: 'houses_completed', field: 'completed' },
        { name: 'houses_occupied', field: 'occupied' },
        { name: 'completion_rate', field: 'completion_rate' },
        { name: 'budget_allocated', field: 'budget_allocated' },
        { name: 'budget_spent', field: 'budget_spent' },
      ],
    },
    kpiFormulas: {
      'Houses Sanctioned': (data) => data.houses_sanctioned || 0,
      'Houses Completed': (data) => data.houses_completed || 0,
      'Completion Rate': (data) => data.completion_rate || 0,
    },
  },

  // MGNREGS - NREGA.nic.in API
  MGNREGS: {
    name: 'NREGA.nic.in',
    apiEndpoint: 'https://nrega.nic.in/api/v1/employment',
    resourceId: 'mgnregs_employment',
    method: 'GET',
    frequency: 'daily',
    mapping: {
      state: 'state_name',
      district: 'district_name',
      date: 'report_date',
      metrics: [
        { name: 'person_days_created', field: 'person_days_created' },
        { name: 'person_days_completed', field: 'person_days_completed' },
        { name: 'avg_wage', field: 'avg_wage_paid' },
        { name: 'work_completion_rate', field: 'work_completion_rate' },
      ],
    },
    kpiFormulas: {
      'Person Days Created': (data) => data.person_days_created || 0,
      'Average Wage': (data) => data.avg_wage || 0,
      'Work Completion Rate': (data) => data.work_completion_rate || 0,
    },
  },

  // PMGSY - Rural Roads Data
  PMGSY: {
    name: 'PMGSY Portal',
    apiEndpoint: 'https://pmgsy.dord.gov.in/api/v1/roads',
    resourceId: 'pmgsy_roads',
    method: 'GET',
    frequency: 'monthly',
    mapping: {
      state: 'state_name',
      district: 'district_name',
      date: 'report_month',
      metrics: [
        { name: 'road_length_planned', field: 'road_length_planned' },
        { name: 'road_length_constructed', field: 'road_length_constructed' },
        { name: 'habitations_connected', field: 'habitations_connected' },
        { name: 'completion_rate', field: 'completion_rate' },
      ],
    },
    kpiFormulas: {
      'Road Length Constructed': (data) => data.road_length_constructed || 0,
      'Habitations Connected': (data) => data.habitations_connected || 0,
      'Completion Rate': (data) => data.completion_rate || 0,
    },
  },

  // PM-KISAN - Farmer Income Support
  PMKISAN: {
    name: 'PM-KISAN Portal',
    apiEndpoint: 'https://pmkisan.gov.in/api/v1/farmers',
    resourceId: 'pmkisan_beneficiaries',
    method: 'GET',
    frequency: 'monthly',
    mapping: {
      state: 'state_name',
      district: 'district_name',
      date: 'month',
      metrics: [
        { name: 'beneficiaries', field: 'total_beneficiaries' },
        { name: 'payments_released', field: 'payments_released' },
        { name: 'average_payment', field: 'avg_payment' },
      ],
    },
    kpiFormulas: {
      'Farmers Benefited': (data) => data.beneficiaries || 0,
      'Payments Released': (data) => data.payments_released || 0,
      'Average Benefit': (data) => data.average_payment || 0,
    },
  },

  // Ayushman Bharat - Health Insurance
  AB: {
    name: 'Ayushman Bharat Portal',
    apiEndpoint: 'https://ayushman.gov.in/api/v1/claims',
    resourceId: 'ayushman_bharat',
    method: 'GET',
    frequency: 'weekly',
    mapping: {
      state: 'state_name',
      district: 'district_name',
      date: 'claim_month',
      metrics: [
        { name: 'total_beneficiaries', field: 'unique_beneficiaries' },
        { name: 'claims_approved', field: 'approved_claims' },
        { name: 'claim_value', field: 'total_claim_value' },
      ],
    },
    kpiFormulas: {
      'Beneficiaries Registered': (data) => data.total_beneficiaries || 0,
      'Claims Approved': (data) => data.claims_approved || 0,
      'Average Claim Value': (data) => data.claim_value || 0,
    },
  },

  // Swachh Bharat - Sanitation
  SBM: {
    name: 'Swachh Bharat Portal',
    apiEndpoint: 'https://sbm.gov.in/api/v1/sanitation',
    resourceId: 'swachh_bharat',
    method: 'GET',
    frequency: 'monthly',
    mapping: {
      state: 'state_name',
      district: 'district_name',
      date: 'report_month',
      metrics: [
        { name: 'toilets_constructed', field: 'toilets_constructed' },
        { name: 'coverage_percentage', field: 'sanitation_coverage' },
        { name: 'waste_management', field: 'waste_management_score' },
      ],
    },
    kpiFormulas: {
      'Toilets Constructed': (data) => data.toilets_constructed || 0,
      'Sanitation Coverage': (data) => data.coverage_percentage || 0,
      'Waste Management Score': (data) => data.waste_management || 0,
    },
  },

  // Data.gov.in general datasets (for multiple schemes)
  DATA_GOV: {
    name: 'data.gov.in',
    apiEndpoint: 'https://api.data.gov.in/resource',
    method: 'GET',
    frequency: 'weekly',
    requiresApiKey: true,
    datasetMappings: {
      // Add more dataset configurations as needed
    },
  },
};

// Cron schedule configuration
export const SYNC_SCHEDULES = {
  PMAY: '0 2 * * *', // 2 AM daily
  MGNREGS: '0 */6 * * *', // Every 6 hours
  PMGSY: '0 3 * * 0', // 3 AM every Sunday
  PMKISAN: '0 1 * * *', // 1 AM daily
  AB: '0 */12 * * *', // Every 12 hours
  SBM: '0 4 * * *', // 4 AM daily
};

// API retry configuration
export const RETRY_CONFIG = {
  maxAttempts: 3,
  delayMs: 5000,
  backoffMultiplier: 2,
  timeoutMs: 30000,
};

// Data validation rules
export const VALIDATION_RULES = {
  state_name: { type: 'string', required: true },
  district_name: { type: 'string', required: false },
  date: { type: 'date', required: true },
  value: { type: 'number', required: true, min: 0 },
  completion_rate: { type: 'number', min: 0, max: 100 },
};

export default DATA_SOURCES;
