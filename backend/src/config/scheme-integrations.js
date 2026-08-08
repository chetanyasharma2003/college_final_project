// Scheme-specific data source configurations
// Only the 6 core schemes from project specification

export const SCHEME_CONFIGS = {
  PMAY: {
    name: 'Pradhan Mantri Awas Yojana',
    code: 'PMAY',
    ministry: 'Ministry of Housing & Urban Affairs',
    apiKey: process.env.PMAY_API_KEY || '579b464db66ec23bdd00000137315bca8f43477a5aff96ccc41e4d52',
    apiEndpoint: 'https://pmay-urban.gov.in/api/v1',
    endpoints: {
      houses: '/houses/state-wise',
      sanctioned: '/houses/sanctioned',
      completed: '/houses/completed',
      performance: '/performance/state'
    },
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
    name: 'Mahatma Gandhi National Rural Employment Guarantee',
    code: 'MGNREGS',
    ministry: 'Ministry of Rural Development',
    apiEndpoint: 'https://nrega.nic.in/api/v1',
    endpoints: {
      employment: '/employment/state-wise',
      personDays: '/person-days/state',
      wages: '/wages/state'
    },
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
    name: 'Pradhan Mantri Gram Sadak Yojana',
    code: 'PMGSY',
    ministry: 'Ministry of Rural Development',
    apiEndpoint: 'https://pmgsy.dord.gov.in/api/v1',
    endpoints: {
      roads: '/roads/state-wise',
      connectivity: '/connectivity/state',
      progress: '/progress/state'
    },
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
    name: 'National Rural Livelihood Mission',
    code: 'NRLM',
    ministry: 'Ministry of Rural Development',
    apiEndpoint: 'https://nrlm.gov.in/api/v1',
    endpoints: {
      shgs: '/shgs/state-wise',
      loans: '/loans/state',
      empowerment: '/empowerment/state'
    },
    dataPoints: [
      { id: 'shgs_formed', name: 'SHGs Formed', unit: 'groups', type: 'numeric' },
      { id: 'members_registered', name: 'Members Registered', unit: 'people', type: 'numeric' },
      { id: 'loan_disbursed', name: 'Loan Disbursed', unit: 'INR', type: 'currency' },
      { id: 'loan_recovery', name: 'Loan Recovery Rate', unit: '%', type: 'percentage' },
      { id: 'women_empowerment_index', name: 'Women Empowerment Index', unit: 'score', type: 'numeric' },
    ],
    syncFrequency: '0 1 * * *', // 1 AM daily
  },

  DDUGKY: {
    name: 'Deen Dayal Upadhyaya Gram Jyoti Yojana',
    code: 'DDU-GKY',
    ministry: 'Ministry of Skill Development',
    apiEndpoint: 'https://ddusky.nic.in/api/v1',
    endpoints: {
      training: '/training/state-wise',
      placements: '/placements/state',
      performance: '/performance/state'
    },
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
    name: 'Sansad Adarsh Gram Yojana',
    code: 'SAGY',
    ministry: 'Ministry of Rural Development',
    apiEndpoint: 'https://sagy.gov.in/api/v1',
    endpoints: {
      villages: '/villages/state-wise',
      development: '/development-index/village',
      progress: '/progress/village'
    },
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
  DDUGKY: {
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
  DDUGKY: {
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
