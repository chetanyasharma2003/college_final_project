// Scheme-specific data source configurations
// Source records use the OGD API only after a resource ID and field mapping are
// supplied from verified dataset metadata. Never guess a source endpoint/schema.
import dotenv from 'dotenv';

dotenv.config();

const DATA_GOV_RESOURCE_ROOT = 'https://api.data.gov.in/resource';
const dataGovSource = (schemeCode) => {
  const envCode = schemeCode.replace(/[^A-Z0-9]/gi, '_').toUpperCase();
  let fieldMapping = null;
  const configuredMapping = process.env[`DATA_GOV_FIELD_MAP_${envCode}`];
  if (configuredMapping) {
    try { fieldMapping = JSON.parse(configuredMapping); } catch {
      console.error(`Invalid DATA_GOV_FIELD_MAP_${envCode}; source sync is disabled for ${schemeCode}.`);
    }
  }
  return {
    name: 'Open Government Data Platform India',
    apiEndpoint: DATA_GOV_RESOURCE_ROOT,
    resourceId: process.env[`DATA_GOV_RESOURCE_ID_${envCode}`] || null,
    fieldMapping,
  };
};

export const SCHEME_CONFIGS = {
  PMAY: {
    ...dataGovSource('PMAY'),
    name: 'Pradhan Mantri Awas Yojana',
    code: 'PMAY',
    ministry: 'Ministry of Housing & Urban Affairs',
    dataPoints: [
      { id: 'houses_sanctioned', name: 'Houses Sanctioned', unit: 'units', type: 'numeric' },
      { id: 'houses_completed', name: 'Houses Completed', unit: 'units', type: 'numeric' },
      { id: 'houses_occupied', name: 'Houses Occupied', unit: 'units', type: 'numeric' },
      { id: 'completion_rate', name: 'Completion Rate', unit: '%', type: 'percentage' },
      { id: 'budget_allocated', name: 'Budget Allocated', unit: 'INR', type: 'currency' },
      { id: 'budget_spent', name: 'Budget Spent', unit: 'INR', type: 'currency' },
    ],
    syncFrequency: '0 2 * * *', // 2 AM daily
  },

  MGNREGS: {
    ...dataGovSource('MGNREGS'),
    name: 'Mahatma Gandhi National Rural Employment Guarantee',
    code: 'MGNREGS',
    ministry: 'Ministry of Rural Development',
    dataPoints: [
      { id: 'person_days_created', name: 'Person Days Created', unit: 'days', type: 'numeric' },
      { id: 'person_days_completed', name: 'Person Days Completed', unit: 'days', type: 'numeric' },
      { id: 'avg_wage', name: 'Average Wage', unit: 'INR', type: 'currency' },
      { id: 'work_completion_rate', name: 'Work Completion Rate', unit: '%', type: 'percentage' },
      { id: 'worker_participation', name: 'Worker Participation', unit: '%', type: 'percentage' },
    ],
    syncFrequency: '0 */6 * * *', // Every 6 hours
  },

  PMGSY: {
    ...dataGovSource('PMGSY'),
    name: 'Pradhan Mantri Gram Sadak Yojana',
    code: 'PMGSY',
    ministry: 'Ministry of Rural Development',
    dataPoints: [
      { id: 'road_length_planned', name: 'Road Length Planned', unit: 'km', type: 'numeric' },
      { id: 'road_length_constructed', name: 'Road Length Constructed', unit: 'km', type: 'numeric' },
      { id: 'habitations_connected', name: 'Habitations Connected', unit: 'units', type: 'numeric' },
      { id: 'completion_rate', name: 'Completion Rate', unit: '%', type: 'percentage' },
      { id: 'quality_score', name: 'Quality Score', unit: 'points', type: 'numeric' },
    ],
    syncFrequency: '0 3 * * 0', // 3 AM Sundays
  },

  NRLM: {
    ...dataGovSource('NRLM'),
    name: 'National Rural Livelihood Mission',
    code: 'NRLM',
    ministry: 'Ministry of Rural Development',
    dataPoints: [
      { id: 'shgs_formed', name: 'SHGs Formed', unit: 'groups', type: 'numeric' },
      { id: 'members_registered', name: 'Members Registered', unit: 'people', type: 'numeric' },
      { id: 'loan_disbursed', name: 'Loan Disbursed', unit: 'INR', type: 'currency' },
      { id: 'loan_recovery', name: 'Loan Recovery Rate', unit: '%', type: 'percentage' },
      { id: 'women_empowerment_index', name: 'Women Empowerment Index', unit: 'score', type: 'numeric' },
    ],
    syncFrequency: '0 1 * * *', // 1 AM daily
  },

  'DDU-GKY': {
    ...dataGovSource('DDU-GKY'),
    name: 'Deen Dayal Upadhyaya Grameen Kaushalya Yojana',
    code: 'DDU-GKY',
    ministry: 'Ministry of Rural Development',
    dataPoints: [
      { id: 'candidates_trained', name: 'Candidates Trained', unit: 'people', type: 'numeric' },
      { id: 'placement_count', name: 'Placements Done', unit: 'people', type: 'numeric' },
      { id: 'placement_rate', name: 'Placement Rate', unit: '%', type: 'percentage' },
      { id: 'avg_salary', name: 'Average Salary', unit: 'INR', type: 'currency' },
      { id: 'retention_rate', name: 'Retention Rate (6 months)', unit: '%', type: 'percentage' },
    ],
    syncFrequency: '0 4 * * *', // 4 AM daily
  },

  SAGY: {
    ...dataGovSource('SAGY'),
    name: 'Sansad Adarsh Gram Yojana',
    code: 'SAGY',
    ministry: 'Ministry of Rural Development',
    dataPoints: [
      { id: 'villages_adopted', name: 'Villages Adopted', unit: 'villages', type: 'numeric' },
      { id: 'development_index', name: 'Development Index', unit: 'score', type: 'numeric' },
      { id: 'infrastructure_score', name: 'Infrastructure Score', unit: 'score', type: 'numeric' },
      { id: 'community_satisfaction', name: 'Community Satisfaction', unit: '%', type: 'percentage' },
      { id: 'livelihood_improvement', name: 'Livelihood Improvement', unit: '%', type: 'percentage' },
    ],
    syncFrequency: '0 5 * * *', // 5 AM daily
  },
};

// Data validation templates for each scheme
export const DATA_VALIDATION_RULES = {
  PMAY: {
    houses_sanctioned: { type: 'number', min: 0, max: 1000000 },
    houses_completed: { type: 'number', min: 0, max: 1000000 },
    completion_rate: { type: 'number', min: 0, max: 100 },
    budget_allocated: { type: 'number', min: 0, max: 100000000000 },
  },
  MGNREGS: {
    person_days_created: { type: 'number', min: 0 },
    avg_wage: { type: 'number', min: 100, max: 1000 },
    work_completion_rate: { type: 'number', min: 0, max: 100 },
  },
  PMGSY: {
    road_length_constructed: { type: 'number', min: 0 },
    habitations_connected: { type: 'number', min: 0 },
    completion_rate: { type: 'number', min: 0, max: 100 },
  },
  NRLM: {
    shgs_formed: { type: 'number', min: 0 },
    loan_disbursed: { type: 'number', min: 0 },
    women_empowerment_index: { type: 'number', min: 0, max: 100 },
  },
  'DDU-GKY': {
    candidates_trained: { type: 'number', min: 0 },
    placement_count: { type: 'number', min: 0 },
    placement_rate: { type: 'number', min: 0, max: 100 },
    avg_salary: { type: 'number', min: 0, max: 10000000 },
  },
  SAGY: {
    villages_adopted: { type: 'number', min: 0, max: 10000 },
    development_index: { type: 'number', min: 0, max: 100 },
    community_satisfaction: { type: 'number', min: 0, max: 100 },
  },
};

// Schema mapping for each scheme's data format
export const DATA_SCHEMAS = {
  PMAY: {
    state: 'state_name',
    district: 'district_name',
    timestamp: 'last_updated',
    metrics: 'performance_metrics'
  },
  MGNREGS: {
    state: 'state',
    district: 'district',
    timestamp: 'report_date',
    metrics: 'employment_data'
  },
  PMGSY: {
    state: 'state',
    district: 'district',
    timestamp: 'data_date',
    metrics: 'road_data'
  },
  NRLM: {
    state: 'state_name',
    district: 'district_name',
    timestamp: 'data_month',
    metrics: 'livelihood_data'
  },
  'DDU-GKY': {
    state: 'state',
    district: 'district',
    timestamp: 'month',
    metrics: 'training_data'
  },
  SAGY: {
    state: 'state',
    village: 'village_name',
    timestamp: 'report_date',
    metrics: 'development_data'
  },
};

export default SCHEME_CONFIGS;
