import React, { useState } from 'react';
import { api } from '../api';
import { Compass, TrendingUp, Sparkles, ArrowRight, Lock, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLang } from '../lang';

const WHATIF_CONTENT = {
  en: {
    heading: 'What-If Career and Skilling Simulator',
    subheading: 'Simulate acquiring new trade skills or adjusting employment preferences to unlock higher income livelihood pathways.',
    adjustLevers: 'Adjust Simulation Levers',
    targetDistrict: 'Target District Location',
    districts: {
      Warangal: 'Warangal, Telangana',
      Adilabad: 'Adilabad, Telangana',
      Nalgonda: 'Nalgonda, Telangana'
    },
    empTrack: 'Employment Track Preference',
    empOptions: {
      either: 'Either Track (Wage or Micro Enterprise)',
      self: 'Micro Enterprise (Self Employment)',
      wage: 'Wage Placement'
    },
    targetIncome: 'Target Monthly Income:',
    mobility: 'Travel & Geographic Mobility',
    mobilityOptions: {
      yes: 'Open to Travel / Relocation in District',
      no: 'Strictly Home Village / Local Block Only'
    },
    selectSkills: 'Select Hypothesized Trade Skills to Test',
    simulatingBtn: 'Simulating Impact...',
    runBtn: 'Run What-If Simulation',
    comparisonTitle: 'Baseline vs Simulated Opportunity Score Comparison',
    baselineAvg: 'Baseline Average Alignment Fit',
    simulatedAvg: 'Simulated Average Alignment Fit',
    netGain: (pct) => `Net Opportunity Fit Gain: +${pct}% across district trade pathways.`,
    unlockedHeading: (count) => `Newly Unlocked Career Pathways (${count})`,
    unlockedBadge: 'Unlocked Pathway',
    simulatedFit: (curr, base) => `Simulated Fit: ${curr}% (was ${base}%)`,
    exploreRoadmap: 'Explore Roadmap',
    topMatchesHeading: 'Top Simulated Career Matches',
    projectedIncome: 'Projected Income:',
    perMonth: '/mo',
    matchBadge: (score) => `${score}% Match`,
    exploreBtn: 'Explore →',
    selfEmp: 'Self Employment',
    wageEmp: 'Wage Placement',
    sector: 'Sector',
    nsqfLevel: 'NSQF Level'
  },
  hi: {
    heading: 'व्हाट-इफ़ करियर एवं कौशल सिम्युलेटर',
    subheading: 'नए व्यावसायिक कौशल सीखने या रोजगार प्राथमिकताओं को बदलकर उच्च आय वाले आजीविका अवसरों का सिमुलेशन करें।',
    adjustLevers: 'सिमुलेशन पैरामीटर समायोजित करें',
    targetDistrict: 'लक्ष्य ज़िला स्थान',
    districts: {
      Warangal: 'वारंगल, तेलंगाना',
      Adilabad: 'आदिलाबाद, तेलंगाना',
      Nalgonda: 'नलगोंडा, तेलंगाना'
    },
    empTrack: 'रोजगार श्रेणी प्राथमिकता',
    empOptions: {
      either: 'दोनों विकल्प (मजदूरी रोजगार या सूक्ष्म उद्यम)',
      self: 'सूक्ष्म उद्यम (स्वरोजगार)',
      wage: 'वेतन रोजगार (Wage Placement)'
    },
    targetIncome: 'लक्षित मासिक आय:',
    mobility: 'यात्रा एवं भौगोलिक गतिशीलता',
    mobilityOptions: {
      yes: 'ज़िले में यात्रा / स्थानांतरण हेतु तैयार',
      no: 'केवल गृह ग्राम / स्थानीय ब्लॉक तक सीमित'
    },
    selectSkills: 'परीक्षण हेतु संभावित व्यावसायिक कौशल चुनें',
    simulatingBtn: 'प्रभाव का सिमुलेशन हो रहा है...',
    runBtn: 'व्हाट-इफ़ सिमुलेशन चलाएं',
    comparisonTitle: 'प्रारंभिक बनाम सिमुलेटेड अवसर स्कोर तुलना',
    baselineAvg: 'प्रारंभिक औसत संरेखण स्कोर',
    simulatedAvg: 'सिमुलेटेड औसत संरेखण स्कोर',
    netGain: (pct) => `कुल अवसर संरेखण वृद्धि: ज़िला व्यापार मार्गों में +${pct}%।`,
    unlockedHeading: (count) => `नए अनलॉक किए गए करियर मार्ग (${count})`,
    unlockedBadge: 'अनलॉक किया गया मार्ग',
    simulatedFit: (curr, base) => `सिमुलेटेड संरेखण: ${curr}% (पहले ${base}% था)`,
    exploreRoadmap: 'रोडमैप देखें',
    topMatchesHeading: 'शीर्ष सिमुलेटेड करियर मैच',
    projectedIncome: 'अनुमानित आय:',
    perMonth: '/माह',
    matchBadge: (score) => `${score}% मैच`,
    exploreBtn: 'देखें →',
    selfEmp: 'स्वरोजगार',
    wageEmp: 'वेतन रोजगार',
    sector: 'क्षेत्र',
    nsqfLevel: 'NSQF स्तर'
  },
  te: {
    heading: 'వాట్-ఇఫ్ కెరీర్ మరియు నైపుణ్యాల సిమ్యులేటర్',
    subheading: 'కొత్త నైపుణ్యాలను నేర్చుకోవడం లేదా ఉపాధి ప్రాధాన్యతలను సర్దుబాటు చేయడం ద్వారా అధిక ఆదాయ జీవనోపాధి మార్గాలను పరీక్షించండి.',
    adjustLevers: 'సిమ్యులేషన్ పారామితులను సర్దుబాటు చేయండి',
    targetDistrict: 'లక్ష్య జిల్లా స్థానం',
    districts: {
      Warangal: 'వరంగల్, తెలంగాణ',
      Adilabad: 'ఆదిలాబాద్, తెలంగాణ',
      Nalgonda: 'నల్గొండ, తెలంగాణ'
    },
    empTrack: 'ఉపాధి విభాగ ప్రాధాన్యత',
    empOptions: {
      either: 'ఏదైనా మార్గం (వేతన ఉపాధి లేదా మైక్రో ఎంటర్‌ప్రైజ్)',
      self: 'మైక్రో ఎంటర్‌ప్రైజ్ (స్వయం ఉపాధి)',
      wage: 'వేతన ఉద్యోగం (Wage Placement)'
    },
    targetIncome: 'లక్ష్య నెలవారీ ఆదాయం:',
    mobility: 'ప్రయాణ సౌలభ్యం & మొబిలిటీ',
    mobilityOptions: {
      yes: 'జిల్లాలో ప్రయాణించడానికి లేదా మారడానికి సిద్ధం',
      no: 'సొంత గ్రామం / స్థానిక మండలం మాత్రమే'
    },
    selectSkills: 'పరీక్షించడానికి ఊహాత్మక నైపుణ్యాలను ఎంచుకోండి',
    simulatingBtn: 'ప్రభావం అంచనా వేయబడుతోంది...',
    runBtn: 'వాట్-ఇఫ్ సిమ్యులేషన్ ప్రారంభించండి',
    comparisonTitle: 'ప్రారంభ స్థాయి vs సిమ్యులేటెడ్ అవకాశాల స్కోరు పోలిక',
    baselineAvg: 'ప్రారంభ సగటు అమరిక సరిపోలిక',
    simulatedAvg: 'సిమ్యులేటెడ్ సగటు అమరిక సరిపోలిక',
    netGain: (pct) => `మొత్తం అవకాశాల పెరుగుదల: జిల్లా వ్యాపార మార్గాలలో +${pct}%.`,
    unlockedHeading: (count) => `కొత్తగా అన్‌లాక్ చేయబడిన కెరీర్ మార్గాలు (${count})`,
    unlockedBadge: 'అన్‌లాక్ చేయబడిన మార్గం',
    simulatedFit: (curr, base) => `సిమ్యులేటెడ్ సరిపోలిక: ${curr}% (గతంలో ${base}%)`,
    exploreRoadmap: 'రోడ్‌మ్యాప్ పరిశీలించండి',
    topMatchesHeading: 'అత్యుత్తమ సిమ్యులేటెడ్ కెరీర్ సరిపోలికలు',
    projectedIncome: 'అంచనా వేసిన ఆదాయం:',
    perMonth: '/నెల',
    matchBadge: (score) => `${score}% సరిపోలింది`,
    exploreBtn: 'పరిశీలించండి →',
    selfEmp: 'స్వయం ఉపాధి',
    wageEmp: 'వేతన ఉద్యోగం',
    sector: 'రంగం',
    nsqfLevel: 'NSQF స్థాయి'
  }
};

const SKILL_NAMES = {
  sewing_machine_operation: {
    en: 'Sewing Machine Operation',
    hi: 'सिलाई मशीन संचालन (Sewing Machine)',
    te: 'కుట్టు యంత్రం ఆపరేషన్ (Sewing Machine)'
  },
  garment_pattern_cutting: {
    en: 'Garment Pattern Cutting',
    hi: 'वस्त्र पैटर्न कटिंग (Pattern Cutting)',
    te: 'వస్త్రాల ప్యాటర్న్ కటింగ్ (Pattern Cutting)'
  },
  solar_panel_installation: {
    en: 'Solar PV Installation',
    hi: 'सोलर पीवी स्थापना (Solar PV)',
    te: 'సోలార్ పివి ఇన్‌స్టాలేషన్ (Solar PV)'
  },
  house_wiring_electrical: {
    en: 'House Wiring & Electrical',
    hi: 'हाउस वायरिंग एवं इलेक्ट्रिकल',
    te: 'హౌస్ వైరింగ్ & ఎలక్ట్రికల్'
  },
  milking_machine_handling: {
    en: 'Dairy & Milking Machine',
    hi: 'डेयरी एवं मिल्किंग मशीन',
    te: 'డైరీ & మిల్కింగ్ మెషిన్'
  },
  cattle_feed_nutrition: {
    en: 'Cattle Feed & Nutrition',
    hi: 'पशु आहार एवं पोषण प्रबंधन',
    te: 'పశువుల దాణా & పోషణ'
  },
  pickle_jam_preservation: {
    en: 'Food & Pickle Processing',
    hi: 'खाद्य एवं अचार प्रसंस्करण',
    te: 'ఆహారం & పచ్చళ్ల తయారీ'
  },
  retail_sales_customer_service: {
    en: 'Retail Sales & POS',
    hi: 'रिटेल बिक्री एवं पीओएस संचालन',
    te: 'రిటైల్ అమ్మకాలు & పిఒఎస్'
  },
  data_entry_vernacular_typing: {
    en: 'Data Entry & Digital Services',
    hi: 'डेटा एंट्री एवं डिजिटल सेवाएं',
    te: 'డేటా ఎంట్రీ & డిజిటల్ సేవలు'
  },
  general_duty_hospital_assistance: {
    en: 'Healthcare & Patient Care',
    hi: 'स्वास्थ्य देखभाल एवं रोगी सहायता',
    te: 'ఆరోగ్య సంరక్షణ & రోగి సేవ'
  }
};

const OCCUPATION_TITLES = {
  self_employed_tailor: {
    en: 'Self Employed Tailor',
    hi: 'स्वरोजगार दर्जी',
    te: 'స్వయం ఉపాధి టైలర్'
  },
  tractor_operator: {
    en: 'Tractor and Farm Machinery Operator',
    hi: 'ट्रैक्टर एवं कृषि मशीनरी ऑपरेटर',
    te: 'ట్రాక్టర్ మరియు వ్యవసాయ యంత్రాల ఆపరేటర్'
  },
  polyhouse_grower: {
    en: 'Polyhouse Vegetable Grower',
    hi: 'पॉलीहाउस सब्जी उत्पादक',
    te: 'పాలీహౌస్ కూరగాయల సాగుదారు'
  },
  medicinal_crops_cultivator: {
    en: 'Medicinal and Aromatic Crops Cultivator',
    hi: 'औषधीय एवं सुगंधित फसल कृषक',
    te: 'ఔషధ మరియు సుగంధ పంటల సాగుదారు'
  },
  solar_technician: {
    en: 'Solar Panel Installation Technician',
    hi: 'सोलर पैनल स्थापना तकनीशियन',
    te: 'సోలార్ ప్యానెల్ ఇన్‌స్టాలేషన్ టెక్నీషియన్'
  },
  dairy_farmer: {
    en: 'Commercial Dairy & Livestock Entrepreneur',
    hi: 'वाणिज्यिक डेयरी एवं पशुधन उद्यमी',
    te: 'వాణిజ్య డైరీ & పశుసంవర్ధక వ్యవస్థాపకుడు'
  }
};

const SECTOR_TRANSLATIONS = {
  'Agriculture': { hi: 'कृषि', te: 'వ్యవసాయం' },
  'Apparel & Handloom': { hi: 'వస్త్రం మరియు చేనేత (वस्त्र एवं हथकरघा)', te: 'వస్త్రాలు మరియు చేనేత' },
  'Food Processing': { hi: 'खाद्य प्रसंस्करण', te: 'ఆహార శుద్ధి' },
  'Renewable Energy': { hi: 'नवीकरणीय ऊर्जा', te: 'పునరుత్పాదక ఇంధనం' },
  'Dairy & Animal Husbandry': { hi: 'डेयरी एवं पशुपालन', te: 'పాడి & పశుసంవర్ధక శాఖ' },
  'Automotive': { hi: 'ऑटोमोटिव', te: 'ఆటోమోటివ్' }
};

export const WhatIf = () => {
  const { lang } = useLang();
  const t = WHATIF_CONTENT[lang] || WHATIF_CONTENT.en;

  const [selectedSkills, setSelectedSkills] = useState(['sewing_machine_operation']);
  const [district, setDistrict] = useState('Warangal');
  const [employmentPreference, setEmploymentPreference] = useState('either');
  const [incomeGoal, setIncomeGoal] = useState(15000);
  const [travelRequired, setTravelRequired] = useState(true);

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const availableSkills = [
    { key: 'sewing_machine_operation', name: SKILL_NAMES.sewing_machine_operation[lang] || 'Sewing Machine Operation' },
    { key: 'garment_pattern_cutting', name: SKILL_NAMES.garment_pattern_cutting[lang] || 'Garment Pattern Cutting' },
    { key: 'solar_panel_installation', name: SKILL_NAMES.solar_panel_installation[lang] || 'Solar PV Installation' },
    { key: 'house_wiring_electrical', name: SKILL_NAMES.house_wiring_electrical[lang] || 'House Wiring & Electrical' },
    { key: 'milking_machine_handling', name: SKILL_NAMES.milking_machine_handling[lang] || 'Dairy & Milking Machine' },
    { key: 'cattle_feed_nutrition', name: SKILL_NAMES.cattle_feed_nutrition[lang] || 'Cattle Feed & Nutrition' },
    { key: 'pickle_jam_preservation', name: SKILL_NAMES.pickle_jam_preservation[lang] || 'Food & Pickle Processing' },
    { key: 'retail_sales_customer_service', name: SKILL_NAMES.retail_sales_customer_service[lang] || 'Retail Sales & POS' },
    { key: 'data_entry_vernacular_typing', name: SKILL_NAMES.data_entry_vernacular_typing[lang] || 'Data Entry & Digital Services' },
    { key: 'general_duty_hospital_assistance', name: SKILL_NAMES.general_duty_hospital_assistance[lang] || 'Healthcare & Patient Care' }
  ];

  const toggleSkill = (key) => {
    if (selectedSkills.includes(key)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== key));
    } else {
      setSelectedSkills([...selectedSkills, key]);
    }
  };

  const handleSimulate = async () => {
    setLoading(true);
    try {
      const res = await api.runWhatIf({
        skills: selectedSkills,
        district,
        employmentPreference,
        incomeGoal,
        travelRequired
      });
      setResults(res);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Compass size={24} color="var(--primary-600)" /> {t.heading}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
          {t.subheading}
        </p>
      </div>

      <div className="card" style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '14px' }}>{t.adjustLevers}</h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>{t.targetDistrict}</label>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)' }}
            >
              <option value="Warangal">{t.districts.Warangal}</option>
              <option value="Adilabad">{t.districts.Adilabad}</option>
              <option value="Nalgonda">{t.districts.Nalgonda}</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>{t.empTrack}</label>
            <select
              value={employmentPreference}
              onChange={(e) => setEmploymentPreference(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)' }}
            >
              <option value="either">{t.empOptions.either}</option>
              <option value="self">{t.empOptions.self}</option>
              <option value="wage">{t.empOptions.wage}</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>{t.targetIncome} ₹{incomeGoal.toLocaleString()}</label>
            <input
              type="range"
              min="8000"
              max="35000"
              step="1000"
              value={incomeGoal}
              onChange={(e) => setIncomeGoal(Number(e.target.value))}
              style={{ width: '100%', marginTop: '6px' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>{t.mobility}</label>
            <select
              value={travelRequired ? 'yes' : 'no'}
              onChange={(e) => setTravelRequired(e.target.value === 'yes')}
              style={{ width: '100%', padding: '10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)' }}
            >
              <option value="yes">{t.mobilityOptions.yes}</option>
              <option value="no">{t.mobilityOptions.no}</option>
            </select>
          </div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '8px' }}>{t.selectSkills}</label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {availableSkills.map((sk) => {
              const active = selectedSkills.includes(sk.key);
              return (
                <button
                  key={sk.key}
                  type="button"
                  onClick={() => toggleSkill(sk.key)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '20px',
                    border: active ? '1px solid var(--primary-600)' : '1px solid var(--border-medium)',
                    background: active ? 'var(--primary-50)' : '#fff',
                    color: active ? 'var(--primary-600)' : 'var(--text-main)',
                    fontSize: '13px',
                    cursor: 'pointer',
                    fontWeight: active ? 600 : 400
                  }}
                >
                  {active && '✓ '} {sk.name}
                </button>
              );
            })}
          </div>
        </div>

        <button onClick={handleSimulate} className="btn btn-primary" disabled={loading}>
          {loading ? t.simulatingBtn : t.runBtn}
        </button>
      </div>

      {results && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {results.comparison && (
            <div className="card" style={{ background: '#f8fafc' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <TrendingUp size={18} color="var(--accent-green)" /> {t.comparisonTitle}
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '12px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>{t.baselineAvg}</div>
                  <div style={{ background: '#e2e8f0', borderRadius: 'var(--radius-sm)', height: '24px', overflow: 'hidden' }}>
                    <div style={{ width: `${results.comparison.beforeAvgScore}%`, background: 'var(--text-muted)', height: '100%', display: 'flex', alignItems: 'center', paddingLeft: '8px', color: '#fff', fontSize: '12px', fontWeight: 700 }}>
                      {results.comparison.beforeAvgScore}%
                    </div>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>{t.simulatedAvg}</div>
                  <div style={{ background: '#e2e8f0', borderRadius: 'var(--radius-sm)', height: '24px', overflow: 'hidden' }}>
                    <div style={{ width: `${results.comparison.afterAvgScore}%`, background: 'var(--primary-600)', height: '100%', display: 'flex', alignItems: 'center', paddingLeft: '8px', color: '#fff', fontSize: '12px', fontWeight: 700 }}>
                      {results.comparison.afterAvgScore}%
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ fontSize: '13px', color: 'var(--accent-green)', fontWeight: 600 }}>
                {t.netGain(results.comparison.impactGainPct)}
              </div>
            </div>
          )}

          {results.unlockedOptions && results.unlockedOptions.length > 0 && (
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-gold)' }}>
                <Sparkles size={18} /> {t.unlockedHeading(results.unlockedOptions.length)}
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
                {results.unlockedOptions.map((unlocked, idx) => {
                  const title = OCCUPATION_TITLES[unlocked.occupationKey]?.[lang] || unlocked.title;
                  const sector = SECTOR_TRANSLATIONS[unlocked.sector]?.[lang] || unlocked.sector;
                  return (
                    <div key={idx} className="card" style={{ borderColor: 'var(--accent-gold)', background: '#fffbeb' }}>
                      <span className="badge badge-amber" style={{ marginBottom: '6px' }}>{t.unlockedBadge}</span>
                      <h4 style={{ fontSize: '15px', fontWeight: 700 }}>{title}</h4>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {t.sector}: {sector} | {t.nsqfLevel} {unlocked.nsqfLevel}
                      </div>
                      <div style={{ marginTop: '8px', fontSize: '13px', color: 'var(--accent-green)', fontWeight: 700 }}>
                        {t.simulatedFit(unlocked.matchScore, unlocked.baselineScore)}
                      </div>
                      <Link to={`/roadmap?occ=${unlocked.occupationKey}`} className="btn btn-primary" style={{ fontSize: '11px', marginTop: '10px', width: '100%' }}>
                        {t.exploreRoadmap}
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px' }}>{t.topMatchesHeading}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {(results.topMatches || []).map((r, idx) => {
                const title = OCCUPATION_TITLES[r.occupationKey]?.[lang] || r.title;
                const sector = SECTOR_TRANSLATIONS[r.sector]?.[lang] || r.sector;
                return (
                  <div key={idx} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <h4 style={{ fontSize: '16px', fontWeight: 700 }}>{title}</h4>
                        <span className="badge badge-blue">{t.nsqfLevel} {r.nsqfLevel}</span>
                        <span className={`badge ${r.track === 'self' ? 'badge-amber' : 'badge-green'}`}>
                          {r.track === 'self' ? t.selfEmp : t.wageEmp}
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{sector}</div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t.projectedIncome}</div>
                        <strong style={{ color: 'var(--accent-green)', fontSize: '15px' }}>₹{r.potentialMonthlyIncome?.toLocaleString()}{t.perMonth}</strong>
                      </div>
                      <span className="badge badge-green" style={{ fontSize: '13px', padding: '6px 10px' }}>
                        {t.matchBadge(r.matchScore)}
                      </span>
                      <Link to={`/roadmap?occ=${r.occupationKey}`} className="btn btn-secondary" style={{ fontSize: '12px', padding: '6px 10px' }}>
                        {t.exploreBtn}
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
