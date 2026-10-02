export const schemesData = [
  {
    key: 'pmajay_gia',
    name: 'PM-AJAY (Grant-in-Aid Component)',
    type: 'composite',
    eligibilitySummary: 'Targeted livelihood projects, skill development, and self-employment capital subsidy for eligible beneficiaries in identified villages.',
    benefit: '100% grant for skilling, toolkit subsidy up to ₹50,000, and institutional micro-credit linkage.',
    link: 'https://pmajay.dosje.gov.in',
    targetTrades: ['self_employed_tailor', 'pickle_making_technician', 'organic_grower', 'dairy_farmer_entrepreneur', 'general_mason', 'csc_village_level_entrepreneur'],
    source: 'https://pmajay.dosje.gov.in/guidelines'
  },
  {
    key: 'pm_vishwakarma',
    name: 'PM Vishwakarma Scheme',
    type: 'composite',
    eligibilitySummary: 'Traditional artisans and craftspeople working with hands and tools across 18 family trades (tailors, carpenters, cobblers, masons, etc.).',
    benefit: 'Skill verification, ₹15,000 modern toolkit incentive, and collateral-free enterprise loan up to ₹3,00,000 at concessional 5% interest.',
    link: 'https://pmvishwakarma.gov.in',
    targetTrades: ['self_employed_tailor', 'hand_embroiderer', 'general_mason', 'welder_structural', 'plumber_general'],
    source: 'https://pmvishwakarma.gov.in/Home/Guidelines'
  },
  {
    key: 'pmkvy_4_0',
    name: 'Pradhan Mantri Kaushal Vikas Yojana (PMKVY 4.0)',
    type: 'training',
    eligibilitySummary: 'Unemployed youth, school dropouts, and rural workforce seeking market-relevant certified vocational skills.',
    benefit: 'Free NSQF-aligned training, government certification, assessment, and placement/apprenticeship support.',
    link: 'https://www.pmkvyofficial.org',
    targetTrades: [],
    source: 'https://www.msde.gov.in/en/schemes-initiatives/schemes-and-programmes/pmkvy'
  },
  {
    key: 'ddu_gky',
    name: 'Deen Dayal Upadhyaya Grameen Kaushalya Yojana (DDU-GKY)',
    type: 'training',
    eligibilitySummary: 'Rural youth aged 15 to 35 from poor families with placement-linked skilling mandate.',
    benefit: 'Residential/non-residential free skilling with minimum 70% guaranteed wage placement and post-placement stipend.',
    link: 'http://ddugky.gov.in',
    targetTrades: ['apparel_sewing_operator', 'retail_sales_associate', 'domestic_data_entry_operator', 'crm_voice_associate'],
    source: 'http://ddugky.gov.in/guidelines'
  },
  {
    key: 'pmegp',
    name: 'Prime Minister Employment Generation Programme (PMEGP)',
    type: 'subsidy',
    eligibilitySummary: 'Individuals above 18 years setting up new micro-enterprises in manufacturing (up to ₹50 Lakhs) or service (up to ₹20 Lakhs).',
    benefit: 'Government margin money subsidy of 25% (urban) to 35% (rural) on project cost through nationalized banks.',
    link: 'https://www.kviconline.gov.in/pmegpeportal',
    targetTrades: ['baking_technician', 'spice_processing_technician', 'dairy_farmer_entrepreneur', 'welder_structural', 'micro_retailer_kirana_owner'],
    source: 'https://www.kviconline.gov.in/pmegp/pmegpweb/index.jsp'
  },
  {
    key: 'pm_mudra_yojana',
    name: 'Pradhan Mantri MUDRA Yojana (PMMY)',
    type: 'loan',
    eligibilitySummary: 'Non-farm micro and small enterprises seeking collateral-free operational or asset expansion capital.',
    benefit: 'Shishu (up to ₹50,000), Kishore (up to ₹5,00,000), and Tarun (up to ₹10,00,000) collateral-free bank loans with Mudra debit card.',
    link: 'https://www.mudra.org.in',
    targetTrades: ['self_employed_tailor', 'pickle_making_technician', 'field_technician_home_appliances', 'mobile_phone_repair_technician', 'micro_retailer_kirana_owner'],
    source: 'https://www.mudra.org.in/Offerings'
  },
  {
    key: 'standup_india',
    name: 'Stand-Up India Scheme',
    type: 'loan',
    eligibilitySummary: 'SC, ST, and women entrepreneurs setting up greenfield enterprises in manufacturing, services, or trading.',
    benefit: 'Composite bank loan between ₹10 Lakhs and ₹1 Crore covering up to 85% of project cost.',
    link: 'https://www.standupmitra.in',
    targetTrades: ['dairy_farmer_entrepreneur', 'baking_technician', 'solar_pv_installer', 'micro_retailer_kirana_owner'],
    source: 'https://www.standupmitra.in/Home/SchemeGuidelines'
  },
  {
    key: 'nsfdc_term_loan',
    name: 'National Scheduled Castes Finance & Development Corporation (NSFDC) Term Loan',
    type: 'loan',
    eligibilitySummary: 'Targeted community individuals living below double the poverty line setting up viable income generating projects.',
    benefit: 'Term loans up to 90% of project cost at subsidized interest rate (4% to 8% per annum) with up to 5-year repayment tenure.',
    link: 'https://nsfdc.nic.in',
    targetTrades: ['self_employed_tailor', 'goat_sheep_farmer', 'dairy_farmer_entrepreneur', 'field_technician_home_appliances'],
    source: 'https://nsfdc.nic.in/en/term-loan-scheme'
  },
  {
    key: 'pm_svanidhi',
    name: 'PM Street Vendor AtmaNirbhar Nidhi (PM SVANidhi)',
    type: 'loan',
    eligibilitySummary: 'Urban and peri-urban street vendors and micro-traders engaged in vending prior to scheme cut-off.',
    benefit: 'Working capital loan starting at ₹10,000 (tranche 1), escalating to ₹20,000 (tranche 2) and ₹50,000 (tranche 3) with 7% interest subsidy.',
    link: 'https://pmsvanidhi.mohua.gov.in',
    targetTrades: ['rural_market_vending', 'micro_retailer_kirana_owner'],
    source: 'https://pmsvanidhi.mohua.gov.in/Home/SchemeDetail'
  },
  {
    key: 'pmksy_micro_irrigation',
    name: 'Pradhan Mantri Krishi Sinchayee Yojana (Per Drop More Crop)',
    type: 'subsidy',
    eligibilitySummary: 'Small, marginal, and tenant farmers adopting micro-irrigation (drip/sprinkler) technology.',
    benefit: 'Financial assistance and subsidy ranging from 45% to 55% for drip and sprinkler irrigation installations.',
    link: 'https://pmksy.gov.in',
    targetTrades: ['organic_grower', 'micro_irrigation_technician', 'polyhouse_grower'],
    source: 'https://pmksy.gov.in/AboutPMKSY.aspx'
  },
  {
    key: 'pm_suryaghar_muft_bijli',
    name: 'PM Surya Ghar: Muft Bijli Yojana',
    type: 'subsidy',
    eligibilitySummary: 'Residential households and village communities installing rooftop solar photovoltaic systems.',
    benefit: 'Central capital subsidy up to ₹78,000 for 3kW rooftop solar installations along with local Suryamitra installation skilling.',
    link: 'https://pmsuryaghar.gov.in',
    targetTrades: ['solar_pv_installer'],
    source: 'https://pmsuryaghar.gov.in/guidelines'
  }
];
