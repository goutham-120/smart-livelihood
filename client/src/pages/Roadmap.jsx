import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../api';
import { Clock, ArrowRight, MapPin, Building, IndianRupee, Award, Layers } from 'lucide-react';
import { useLang } from '../lang';

const ROADMAP_CONTENT = {
  en: {
    loading: 'Building personalized career roadmap...',
    heading: 'Livelihood and Skilling Roadmap',
    subheading: 'Step by step milestone plan ordered by prerequisite graph and local market linkages',
    targetPathway: 'Target Pathway',
    sector: 'Sector',
    targetNsqf: 'Target NSQF Level',
    readinessScore: 'Readiness Score',
    estDuration: 'Est. Duration',
    months: 'Months',
    month: 'Month',
    nsqfProgression: 'NSQF Level Progression',
    projectedIncome: 'Projected Stage Income',
    perMonth: '/mo',
    recommendedCourse: 'Recommended Skilling Course',
    accreditedCenters: 'Accredited Centers for this Pathway',
    backBtn: '← Back to Opportunities',
    trackBtn: 'Track My Active Milestones →'
  },
  hi: {
    loading: 'व्यक्तिगत आजीविका रोडमैप तैयार हो रहा है...',
    heading: 'आजीविका एवं कौशल विकास रोडमैप',
    subheading: 'पूर्वापेक्षा कौशल और स्थानीय बाज़ार सम्बद्धता के आधार पर चरणबद्ध मील का पत्थर योजना',
    targetPathway: 'लक्षित आजीविका मार्ग',
    sector: 'क्षेत्र',
    targetNsqf: 'लक्षित NSQF स्तर',
    readinessScore: 'तैयारी स्कोर',
    estDuration: 'अनुमानित अवधि',
    months: 'महीने',
    month: 'महीना',
    nsqfProgression: 'NSQF स्तर प्रगति',
    projectedIncome: 'अनुमानित चरण आय',
    perMonth: '/माह',
    recommendedCourse: 'अनुशंसित कौशल पाठ्यक्रम',
    accreditedCenters: 'इस मार्ग के लिए मान्यता प्राप्त प्रशिक्षण केंद्र',
    backBtn: '← अवसरों पर वापस जाएं',
    trackBtn: 'सक्रिय मील के पत्थर ट्रैक करें →'
  },
  te: {
    loading: 'వ్యక్తిగత కెరీర్ రోడ్‌మ్యాప్ రూపొందించబడుతోంది...',
    heading: 'జీవనోపాధి మరియు నైపుణ్యాల రోడ్‌మ్యాప్',
    subheading: 'ముందస్తు నైపుణ్యాలు మరియు స్థానిక మార్కెట్ అనుసంధానాల ఆధారంగా దశలవారీ మైలురాయి ప్రణాళిక',
    targetPathway: 'లక్ష్య మార్గం',
    sector: 'రంగం',
    targetNsqf: 'లక్ష్య NSQF స్థాయి',
    readinessScore: 'సన్నద్ధత స్కోరు',
    estDuration: 'అంచనా వేసిన వ్యవధి',
    months: 'నెలలు',
    month: 'నెల',
    nsqfProgression: 'NSQF స్థాయి పురోగతి',
    projectedIncome: 'ఈ దశలో అంచనా వేసిన ఆదాయం',
    perMonth: '/నెల',
    recommendedCourse: 'సిఫార్సు చేయబడిన నైపుణ్య శిక్షణ కోర్సు',
    accreditedCenters: 'ఈ మార్గానికి గుర్తింపు పొందిన శిక్షణా కేంద్రాలు',
    backBtn: '← అవకాశాలకు తిరిగి వెళ్లండి',
    trackBtn: 'క్రియాశీల మైలురాళ్లను ట్రాక్ చేయండి →'
  }
};

const OCCUPATION_TITLES = {
  self_employed_tailor: {
    en: 'Self Employed Tailor',
    hi: 'स्वरोजगार दर्जी (Self Employed Tailor)',
    te: 'స్వయం ఉపాధి టైలర్ (Self Employed Tailor)'
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

const cleanText = (text) => {
  if (!text) return '';
  return text.replace(/\b([a-z0-9]+(?:_[a-z0-9]+)+)\b/gi, (match) => {
    return match.replace(/^crs_/, '').replace(/_/g, ' ');
  });
};

export const Roadmap = () => {
  const { lang } = useLang();
  const t = ROADMAP_CONTENT[lang] || ROADMAP_CONTENT.en;
  const [searchParams] = useSearchParams();
  const occKey = searchParams.get('occ') || 'self_employed_tailor';
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getRoadmap(occKey).then((res) => {
      setData(res);
      setLoading(false);
    });
  }, [occKey]);

  if (loading) return <div className="container" style={{ textAlign: 'center', padding: '40px' }}>{t.loading}</div>;

  const steps = data?.roadmap?.steps || [];
  const occupation = data?.occupation || {};
  const centers = data?.nearbyCenters || [];

  const displayTitle = OCCUPATION_TITLES[occKey]?.[lang] || occupation.title || occKey.replace(/_/g, ' ').toUpperCase();
  const displaySector = SECTOR_TRANSLATIONS[occupation.sector]?.[lang] || occupation.sector;

  return (
    <div className="page-container">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800 }}>{t.heading}</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{t.subheading}</p>
      </div>

      <div className="card" style={{ marginBottom: '24px', background: '#eef2ff', borderColor: '#c7d2fe' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ fontSize: '13px', color: 'var(--primary-600)', fontWeight: 600 }}>{t.targetPathway}</div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--primary-900)' }}>{displayTitle}</h2>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
              {t.sector}: {displaySector} | {t.targetNsqf} {occupation.nsqfLevel}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
            <span className="badge badge-green" style={{ fontSize: '13px', padding: '6px 12px' }}>
              {t.readinessScore}: {data?.readinessScore}%
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {t.estDuration}: {data?.roadmap?.totalEstimatedMonths || 5} {t.months}
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '24px' }}>
        {steps.map((step) => (
          <div key={step.step} className="card" style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', position: 'relative' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary-600)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0, fontSize: '16px' }}>
              {step.step}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '6px' }}>
                <h3 style={{ fontSize: '17px', fontWeight: 700 }}>{step.title}</h3>
                <span className="badge badge-blue" style={{ fontSize: '11px' }}>
                  <Clock size={12} /> {step.durationMonths} {step.durationMonths > 1 ? t.months : t.month}
                </span>
              </div>

              <p style={{ color: 'var(--text-main)', fontSize: '13px', lineHeight: '1.5', marginBottom: '10px' }}>{cleanText(step.description)}</p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px', background: 'var(--bg-subtle)', padding: '10px', borderRadius: 'var(--radius-sm)', fontSize: '12px' }}>
                {step.nsqfProgression && (
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block' }}>{t.nsqfProgression}:</span>
                    <strong style={{ color: 'var(--primary-600)' }}>{cleanText(step.nsqfProgression)}</strong>
                  </div>
                )}

                {step.estimatedIncomeInr !== undefined && (
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block' }}>{t.projectedIncome}:</span>
                    <strong style={{ color: 'var(--accent-green)' }}>₹{step.estimatedIncomeInr.toLocaleString()}{t.perMonth}</strong>
                  </div>
                )}

                {step.recommendedCourse && (
                  <div style={{ gridColumn: '1 / -1' }}>
                    <span style={{ color: 'var(--text-muted)', display: 'block' }}>{t.recommendedCourse}:</span>
                    <strong style={{ color: 'var(--primary-700)' }}>{cleanText(step.recommendedCourse)}</strong>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {centers.length > 0 && (
        <div className="card" style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Building size={18} color="var(--primary-600)" /> {t.accreditedCenters}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '10px' }}>
            {centers.slice(0, 3).map((c, i) => (
              <div key={i} style={{ padding: '10px', background: 'var(--bg-main)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', fontSize: '12px' }}>
                <strong>{c.name}</strong>
                <div style={{ color: 'var(--text-muted)' }}>{c.district}, {c.state}</div>
                <div style={{ color: 'var(--primary-600)', fontWeight: 600, marginTop: '2px' }}>{c.contact}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/opportunities" className="btn btn-secondary">{t.backBtn}</Link>
        <Link to="/progress" className="btn btn-primary">{t.trackBtn}</Link>
      </div>
    </div>
  );
};
