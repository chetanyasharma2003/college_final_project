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
    apiKeyEnvVar: `DATA_GOV_API_KEY_${envCode}`,
    resourceId: process.env[`DATA_GOV_RESOURCE_ID_${envCode}`] || null,
    fieldMapping,
  };
};

export const getDataGovApiKey = (schemeCode) => {
  const envCode = schemeCode.replace(/[^A-Z0-9]/gi, '_').toUpperCase();
  return process.env[`DATA_GOV_API_KEY_${envCode}`] || process.env.DATA_GOV_API_KEY || null;
};

export const SCHEME_CONFIGS = {
  'PMAY-G': {
    ...dataGovSource('PMAY-G'),
    name: 'Pradhan Mantri Awaas Yojana-Gramin',
    code: 'PMAY-G',
    ministry: 'Ministry of Rural Development',
    description: 'Historical Rajya Sabha snapshot; not a current progress feed.',
    resourceId: '5f5f34ec-379f-45a3-b61a-40a9e063d933',
    fieldMapping: {
      state: 'state_ut',
      metrics: {
        eligible_beneficiaries_availed_loan: 'number_of_eligible_beneficiaries_of_pmay_g_who_availed_loan_of_rs_70_000__',
      },
    },
    reportDate: new Date('2022-04-06T00:00:00.000Z'),
    publicationDate: new Date('2022-09-20T00:00:00.000Z'),
    sourceUrl: 'https://www.data.gov.in/resource/stateuts-wise-number-eligible-beneficiaries-pradhan-mantri-awaas-yojana-gramin-pmay-g-pmay',
    syncFrequency: null,
    dataPoints: [
      {
        id: 'eligible_beneficiaries_availed_loan',
        name: 'Eligible PMAY-G beneficiaries who availed a Rs. 70,000 loan',
        unit: 'beneficiaries',
        type: 'numeric',
        description: 'Historical snapshot from a Rajya Sabha answer dated 6 April 2022; exact underlying data cutoff is not stated.',
      },
    ],
  },

  'PMAY-U': {
    ...dataGovSource('PMAY-U'),
    name: 'Pradhan Mantri Awas Yojana-Urban',
    code: 'PMAY-U',
    ministry: 'Ministry of Housing and Urban Affairs',
    description: 'Historical Rajya Sabha snapshot; state/UT totals as of 22 January 2026.',
    resourceId: 'ec678e2e-d084-4625-a821-380a82d94970',
    fieldMapping: {
      state: 'state_ut',
      metrics: {
        houses_sanctioned: 'physical_progress_of_houses__nos_____sanctioned',
        houses_completed: 'physical_progress_of_houses__nos_____construction_completed',
        houses_occupied: 'physical_progress_of_houses__nos_____occupied',
      },
    },
    reportDate: new Date('2026-01-22T00:00:00.000Z'),
    publicationDate: new Date('2026-09-24T00:00:00.000Z'),
    sourceUrl: 'https://www.data.gov.in/resource/stateut-wise-number-houses-sanctioned-completed-and-occupied-under-pmay-u-and-pmay-u-20-22',
    excludeCategories: ['Sub-total (States)', 'Sub-total (NE States)', 'Sub-total (UTs)'],
    syncFrequency: null,
    dataPoints: [
      {
        id: 'houses_sanctioned',
        name: 'Houses Sanctioned',
        unit: 'houses',
        type: 'numeric',
        description: 'PMAY-U and PMAY-U 2.0 houses sanctioned as of 22 January 2026.',
      },
      {
        id: 'houses_completed',
        name: 'Houses Completed',
        unit: 'houses',
        type: 'numeric',
        description: 'Includes houses completed in the year that were sanctioned in preceding years.',
      },
      {
        id: 'houses_occupied',
        name: 'Houses Occupied',
        unit: 'houses',
        type: 'numeric',
        description: 'Includes houses occupied in the year that were completed in preceding years.',
      },
    ],
  },

  PMAY: {
    ...dataGovSource('PMAY'),
    name: 'Pradhan Mantri Awas Yojana',
    code: 'PMAY',
    ministry: 'Ministry of Housing & Urban Affairs',
    description: 'Unverified legacy aggregate. Official PMAY data is integrated separately as PMAY-G and PMAY-U.',
    resourceId: null,
    fieldMapping: null,
    dataPoints: [],
    syncFrequency: null,
  },

  MGNREGS: {
    ...dataGovSource('MGNREGS'),
    name: 'Mahatma Gandhi National Rural Employment Guarantee Scheme',
    code: 'MGNREGS',
    ministry: 'Ministry of Rural Development',
    description: 'Historical Karnataka district snapshot of cumulative job cards issued through 10 January 2022.',
    resourceId: '9f3d0c32-a54b-4859-bb60-0e26b7997a8b',
    defaultState: 'Karnataka',
    fieldMapping: {
      district: 'districts',
      metrics: {
        job_cards_issued: 'total_number_of__job_cards_issued',
      },
    },
    aggregateByDistrict: true,
    allowSourceDistrictCreation: true,
    reportDate: new Date('2022-01-10T00:00:00.000Z'),
    publicationDate: new Date('2022-01-10T00:00:00.000Z'),
    sourceUrl: 'https://www.data.gov.in/resource/job-cards-issued-under-mgnregs-inception-10th-jan-2022',
    districtAliases: {
      BENGALURU: 'Bengaluru Urban',
      DHARWAR: 'Dharwad',
    },
    excludeDistricts: ['NA'],
    dataPoints: [
      {
        id: 'job_cards_issued',
        name: 'Job Cards Issued (cumulative)',
        unit: 'job cards',
        type: 'numeric',
        description: 'Cumulative job cards issued under MGNREGS from inception through 10 January 2022; source covers Karnataka districts only.',
      },
    ],
    syncFrequency: null,
  },

  PMGSY: {
    ...dataGovSource('PMGSY'),
    name: 'Pradhan Mantri Gram Sadak Yojana',
    code: 'PMGSY',
    ministry: 'Ministry of Rural Development',
    description: 'District-wise PMGSY-I, II, and III physical and financial progress; the data.gov.in resource was updated on 2 November 2026, but the record-level reporting cutoff is not stated.',
    resourceId: 'd4361151-6d41-43c7-98cd-9a6cd90b5ca4',
    fieldMapping: {
      state: 'STATE_NAME',
      district: 'DISTRICT_NAME',
      category: 'PMGSY_SCHEME',
      metrics: {
        roads_sanctioned: 'NO_OF_ROAD_WORK_SANCTIONED',
        roads_completed: 'NO_OF_ROAD_WORKS_COMPLETED',
        roads_balance: 'NO_OF_ROAD_WORKS_BALANCE',
        road_length_sanctioned_km: 'LENGTH_OF_ROAD_WORK_SANCTIONED_KM',
        road_length_completed_km: 'LENGTH_OF_ROAD_WORK_COMPLETED_KM',
        road_length_balance_km: 'LENGTH_OF_ROAD_WORK_BALANCE_KM',
        bridges_sanctioned: 'NO_OF_BRIDGES_SANCTIONED',
        bridges_completed: 'NO_OF_BRIDGES_COMPLETED',
        bridges_balance: 'NO_OF_BRIDGES_BALANCE',
        works_cost_sanctioned_lakhs: 'COST_OF_WORKS_SANCTIONED_LAKHS',
        expenditure_occurred_lakhs: 'EXPENDITURE_OCCURED_LAKHS',
      },
    },
    includeCategories: ['PMGSY-I', 'PMGSY-II', 'PMGSY-III'],
    aggregateCategories: true,
    requireAllCategories: true,
    aggregateByDistrict: true,
    allowSourceDistrictCreation: true,
    reportDate: new Date('2026-11-02T00:00:00.000Z'),
    publicationDate: new Date('2024-08-28T00:00:00.000Z'),
    updatedDate: new Date('2026-11-02T00:00:00.000Z'),
    sourceUrl: 'https://www.data.gov.in/resource/physical-financial-progress-pradhan-mantri-gram-sadak-yojna-pmgsy-date',
    dataPoints: [
      { id: 'roads_sanctioned', name: 'Road Works Sanctioned', unit: 'works', type: 'numeric' },
      { id: 'roads_completed', name: 'Road Works Completed', unit: 'works', type: 'numeric' },
      { id: 'roads_balance', name: 'Road Works Balance', unit: 'works', type: 'numeric' },
      { id: 'road_length_sanctioned_km', name: 'Road Length Sanctioned', unit: 'km', type: 'numeric' },
      { id: 'road_length_completed_km', name: 'Road Length Completed', unit: 'km', type: 'numeric' },
      { id: 'road_length_balance_km', name: 'Road Length Balance', unit: 'km', type: 'numeric' },
      { id: 'bridges_sanctioned', name: 'Bridges Sanctioned', unit: 'bridges', type: 'numeric' },
      { id: 'bridges_completed', name: 'Bridges Completed', unit: 'bridges', type: 'numeric' },
      { id: 'bridges_balance', name: 'Bridges Balance', unit: 'bridges', type: 'numeric' },
      { id: 'works_cost_sanctioned_lakhs', name: 'Works Cost Sanctioned', unit: 'INR lakhs', type: 'currency' },
      { id: 'expenditure_occurred_lakhs', name: 'Expenditure Occurred', unit: 'INR lakhs', type: 'currency' },
    ],
    syncFrequency: null,
  },

  NRLM: {
    ...dataGovSource('NRLM'),
    name: 'National Rural Livelihoods Mission',
    code: 'NRLM',
    ministry: 'Ministry of Rural Development',
    description: 'Historical state/UT-wise NRLM funds allocation for financial years 2021-22 through 2023-24; source does not specify the monetary unit.',
    resourceId: '7cd757e2-94f5-4715-9cae-b9d6b7185582',
    fieldMapping: {
      state: 'state_ut',
      metrics: {
        funds_allocation_2021_22: '_2021_22',
        funds_allocation_2022_23: '_2022_23',
        funds_allocation_2023_24: '_2023_24',
      },
    },
    reportDate: new Date('2024-03-31T00:00:00.000Z'),
    publicationDate: new Date('2024-09-09T00:00:00.000Z'),
    updatedDate: new Date('2024-09-10T13:33:59.000Z'),
    sourceUrl: 'https://www.data.gov.in/resource/stateut-wise-details-funds-allocation-under-national-rural-livelihoods-mission-nrlm-2021',
    aggregateByStateSum: true,
    syncFrequency: null,
    dataPoints: [
      {
        id: 'funds_allocation_2021_22',
        name: 'Funds Allocation (2021-22)',
        unit: 'source unit unspecified',
        type: 'numeric',
        reportDate: new Date('2022-03-31T00:00:00.000Z'),
        description: 'State/UT NRLM funds allocation for FY 2021-22; data.gov.in does not specify the monetary unit.',
      },
      {
        id: 'funds_allocation_2022_23',
        name: 'Funds Allocation (2022-23)',
        unit: 'source unit unspecified',
        type: 'numeric',
        reportDate: new Date('2023-03-31T00:00:00.000Z'),
        description: 'State/UT NRLM funds allocation for FY 2022-23; data.gov.in does not specify the monetary unit.',
      },
      {
        id: 'funds_allocation_2023_24',
        name: 'Funds Allocation (2023-24)',
        unit: 'source unit unspecified',
        type: 'numeric',
        reportDate: new Date('2024-03-31T00:00:00.000Z'),
        description: 'State/UT NRLM funds allocation for FY 2023-24; data.gov.in does not specify the monetary unit.',
      },
    ],
  },

  'DDU-GKY': {
    ...dataGovSource('DDU-GKY'),
    name: 'Deen Dayal Upadhyaya Grameen Kaushalya Yojana',
    code: 'DDU-GKY',
    ministry: 'Ministry of Rural Development',
    description: 'Historical state-wise candidates trained and placed under DDU-GKY for financial years 2020-21 through 2023-24.',
    resourceId: '22f49a00-f3f2-47ca-b0bc-3f01f659b579',
    fieldMapping: {
      state: 'state_ut',
      metrics: {
        candidates_trained_2020_21: '_2020_21___trained',
        candidates_placed_2020_21: '_2020_21___placed',
        candidates_trained_2021_22: '_2021_22___trained',
        candidates_placed_2021_22: '_2021_22___placed',
        candidates_trained_2022_23: '_2022_23___trained',
        candidates_placed_2022_23: '_2022_23___placed',
        candidates_trained_2023_24: '_2023_24___trained',
        candidates_placed_2023_24: '_2023_24___placed',
      },
    },
    reportDate: new Date('2024-03-31T00:00:00.000Z'),
    publicationDate: new Date('2024-04-04T00:00:00.000Z'),
    updatedDate: new Date('2024-04-04T00:00:00.000Z'),
    sourceUrl: 'https://www.data.gov.in/resource/state-wise-details-candidates-trained-and-placed-under-ddu-gky-2020-21-2023-24',
    aggregateByStateSum: true,
    syncFrequency: null,
    dataPoints: [
      { id: 'candidates_trained_2020_21', name: 'Candidates Trained (2020-21)', unit: 'people', type: 'numeric', reportDate: new Date('2021-03-31T00:00:00.000Z'), description: 'Candidates trained under DDU-GKY during FY 2020-21.' },
      { id: 'candidates_placed_2020_21', name: 'Candidates Placed (2020-21)', unit: 'people', type: 'numeric', reportDate: new Date('2021-03-31T00:00:00.000Z'), description: 'Candidates placed under DDU-GKY during FY 2020-21.' },
      { id: 'candidates_trained_2021_22', name: 'Candidates Trained (2021-22)', unit: 'people', type: 'numeric', reportDate: new Date('2022-03-31T00:00:00.000Z'), description: 'Candidates trained under DDU-GKY during FY 2021-22.' },
      { id: 'candidates_placed_2021_22', name: 'Candidates Placed (2021-22)', unit: 'people', type: 'numeric', reportDate: new Date('2022-03-31T00:00:00.000Z'), description: 'Candidates placed under DDU-GKY during FY 2021-22.' },
      { id: 'candidates_trained_2022_23', name: 'Candidates Trained (2022-23)', unit: 'people', type: 'numeric', reportDate: new Date('2023-03-31T00:00:00.000Z'), description: 'Candidates trained under DDU-GKY during FY 2022-23.' },
      { id: 'candidates_placed_2022_23', name: 'Candidates Placed (2022-23)', unit: 'people', type: 'numeric', reportDate: new Date('2023-03-31T00:00:00.000Z'), description: 'Candidates placed under DDU-GKY during FY 2022-23.' },
      { id: 'candidates_trained_2023_24', name: 'Candidates Trained (2023-24)', unit: 'people', type: 'numeric', reportDate: new Date('2024-03-31T00:00:00.000Z'), description: 'Candidates trained under DDU-GKY during FY 2023-24.' },
      { id: 'candidates_placed_2023_24', name: 'Candidates Placed (2023-24)', unit: 'people', type: 'numeric', reportDate: new Date('2024-03-31T00:00:00.000Z'), description: 'Candidates placed under DDU-GKY during FY 2023-24.' },
    ],
  },

  SAGY: {
    ...dataGovSource('SAGY'),
    name: 'Sansad Adarsh Gram Yojana',
    code: 'SAGY',
    ministry: 'Ministry of Rural Development',
    description: 'Historical state/UT snapshot of Gram Panchayats identified under SAGY as of 3 March 2020.',
    resourceId: '3601558b-811b-4ba3-96dd-c3abd06fa169',
    fieldMapping: {
      state: 'state_ut',
      metrics: {
        gram_panchayats_identified_phase_i: 'phase_i',
        gram_panchayats_identified_phase_ii: 'phase_ii',
        gram_panchayats_identified_phase_iii: 'phase_iii',
        gram_panchayats_identified_phase_iv: 'phase_iv',
      },
    },
    reportDate: new Date('2020-03-03T00:00:00.000Z'),
    publicationDate: new Date('2021-02-18T00:00:00.000Z'),
    updatedDate: new Date('2021-09-08T00:00:00.000Z'),
    sourceUrl: 'https://www.data.gov.in/resource/stateut-wise-gram-panchayats-identified-under-saansad-adarsh-gram-yojana-sagy-sagy-website',
    aggregateByStateSum: true,
    dataPoints: [
      { id: 'gram_panchayats_identified_phase_i', name: 'Gram Panchayats Identified (Phase I)', unit: 'Gram Panchayats', type: 'numeric', description: 'Gram Panchayats identified under SAGY Phase I as of 3 March 2020.' },
      { id: 'gram_panchayats_identified_phase_ii', name: 'Gram Panchayats Identified (Phase II)', unit: 'Gram Panchayats', type: 'numeric', description: 'Gram Panchayats identified under SAGY Phase II as of 3 March 2020.' },
      { id: 'gram_panchayats_identified_phase_iii', name: 'Gram Panchayats Identified (Phase III)', unit: 'Gram Panchayats', type: 'numeric', description: 'Gram Panchayats identified under SAGY Phase III as of 3 March 2020.' },
      { id: 'gram_panchayats_identified_phase_iv', name: 'Gram Panchayats Identified (Phase IV)', unit: 'Gram Panchayats', type: 'numeric', description: 'Gram Panchayats identified under SAGY Phase IV as of 3 March 2020.' },
    ],
    syncFrequency: null,
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
    gram_panchayats_identified_phase_i: { type: 'number', min: 0 },
    gram_panchayats_identified_phase_ii: { type: 'number', min: 0 },
    gram_panchayats_identified_phase_iii: { type: 'number', min: 0 },
    gram_panchayats_identified_phase_iv: { type: 'number', min: 0 },
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
