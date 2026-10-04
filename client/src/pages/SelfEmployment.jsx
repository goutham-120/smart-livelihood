import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../api';
import { Briefcase, Award, Phone, CheckCircle, ArrowRight, ShieldCheck, DollarSign, Building } from 'lucide-react';
import { useLang } from '../lang';

const SELFEMP_CONTENT = {
  en: {
    loading: 'Loading micro enterprise business guide...',
    unavailable: 'Self employment guide unavailable.',
    trackBadge: 'Micro Enterprise Track',
    headingPrefix: 'Business Startup Guide:',
    subheading: 'PM-AJAY GIA micro enterprise launch roadmap, collateral free financing, and district counselor support',
    capitalReq: 'Estimated Capital Requirement',
    capitalNote: 'Includes equipment toolkit, working capital, and PM Vishwakarma / PMEGP grant eligibility',
    revenueTitle: 'Projected Monthly Business Revenue',
    breakeven: (months) => `Target breakeven period: ${months} Months`,
    perMonth: '/mo',
    operationalSteps: 'Micro Enterprise Operational Steps',
    schemesTitle: 'Applicable Government Support Schemes',
    grantBadge: 'Government Grant',
    officialPortal: 'Official Portal Link →',
    counselorsTitle: 'Verified District Financial Counselors',
    counselorSubtitle: 'Local mentors available for business plan formulation and loan paperwork',
    talkBtn: 'Talk to a Financial Counselor',
    submittingBtn: 'Submitting Request...',
    districtLabel: 'District:',
    languagesLabel: 'Languages:',
    contactLabel: 'Contact:',
    requestSuccess: 'Consultation request submitted! A financial counselor will contact you.',
    requestFail: 'Failed to submit consultation request.',
    backBtn: '← Back to Opportunities',
    roadmapBtn: 'View Skilling Roadmap →'
  },
  hi: {
    loading: 'सूक्ष्म उद्यम व्यवसाय मार्गदर्शिका लोड हो रही है...',
    unavailable: 'स्वरोजगार मार्गदर्शिका उपलब्ध नहीं है।',
    trackBadge: 'सूक्ष्म उद्यम श्रेणी',
    headingPrefix: 'व्यवसाय प्रारंभ मार्गदर्शिका:',
    subheading: 'PM-AJAY GIA सूक्ष्म उद्यम प्रारंभ रोडमैप, संपार्श्विक-मुक्त ऋण एवं ज़िला परामर्शदाता सहायता',
    capitalReq: 'अनुमानित पूंजी आवश्यकता',
    capitalNote: 'उपकरण टूलकिट, कार्यशील पूंजी एवं पीएम विश्वकर्मा / PMEGP अनुदान पात्रता शामिल',
    revenueTitle: 'अनुमानित मासिक व्यावसायिक राजस्व',
    breakeven: (months) => `लक्ष्य ब्रेक-इवन अवधि: ${months} महीने`,
    perMonth: '/माह',
    operationalSteps: 'सूक्ष्म उद्यम परिचालन चरण',
    schemesTitle: 'लागू सरकारी सहायता योजनाएं',
    grantBadge: 'सरकारी अनुदान',
    officialPortal: 'आधिकारिक पोर्टल लिंक →',
    counselorsTitle: 'सत्यापित ज़िला वित्तीय परामर्शदाता',
    counselorSubtitle: 'व्यवसाय योजना एवं ऋण कागजी कार्रवाई हेतु उपलब्ध स्थानीय मार्गदर्शक',
    talkBtn: 'वित्तीय परामर्शदाता से बात करें',
    submittingBtn: 'अनुरोध भेजा जा रहा है...',
    districtLabel: 'ज़िला:',
    languagesLabel: 'भाषाएं:',
    contactLabel: 'संपर्क:',
    requestSuccess: 'परामर्श अनुरोध सफलतापूर्वक दर्ज किया गया! वित्तीय परामर्शदाता शीघ्र संपर्क करेंगे।',
    requestFail: 'परामर्श अनुरोध भेजने में विफल।',
    backBtn: '← अवसरों पर वापस जाएं',
    roadmapBtn: 'कौशल रोडमैप देखें →'
  },
  te: {
    loading: 'మైక్రో ఎంటర్‌ప్రైజ్ వ్యాపార మార్గదర్శిని లోడ్ అవుతోంది...',
    unavailable: 'స్వయం ఉపాధి మార్గదర్శి అందుబాటులో లేదు.',
    trackBadge: 'మైక్రో ఎంటర్‌ప్రైజ్ విభాగం',
    headingPrefix: 'వ్యాపార ప్రారంభ మార్గదర్శి:',
    subheading: 'PM-AJAY GIA మైక్రో ఎంటర్‌ప్రైజ్ ప్రారంభ రోడ్‌మ్యాప్, తాకట్టు లేని రుణాలు మరియు జిల్లా కౌన్సెలర్ మద్దతు',
    capitalReq: 'అంచనా వేసిన మూలధన అవసరం',
    capitalNote: 'పరికరాల టూల్‌కిట్, వర్కింగ్ క్యాపిటల్ మరియు PM విశ్వకర్మ / PMEGP గ్రాంట్ అర్హత కలిగి ఉంది',
    revenueTitle: 'అంచనా వేసిన నెలవారీ వ్యాపార ఆదాయం',
    breakeven: (months) => `లక్ష్య బ్రేక్-ఈవెన్ వ్యవధి: ${months} నెలలు`,
    perMonth: '/నెల',
    operationalSteps: 'మైక్రో ఎంటర్‌ప్రైజ్ కార్యాచరణ దశలు',
    schemesTitle: 'వర్తించే ప్రభుత్వ సహాయ పథకాలు',
    grantBadge: 'ప్రభుత్వ గ్రాంట్',
    officialPortal: 'అధికారిక పోర్టల్ లింక్ →',
    counselorsTitle: 'ధృవీకరించబడిన జిల్లా ఆర్థిక సలహాదారులు',
    counselorSubtitle: 'వ్యాపార ప్రణాళిక మరియు రుణ పత్రాల తయారీకి అందుబాటులో ఉన్న స్థానిక మార్గదర్శకులు',
    talkBtn: 'ఆర్థిక సలహాదారునితో మాట్లాడండి',
    submittingBtn: 'అభ్యర్థన పంపబడుతోంది...',
    districtLabel: 'జిల్లా:',
    languagesLabel: 'భాషలు:',
    contactLabel: 'సంప్రదించండి:',
    requestSuccess: 'కౌన్సెలింగ్ అభ్యర్థన సమర్పించబడింది! త్వరలో ఆర్థిక సలహాదారు మిమ్మల్ని సంప్రదిస్తారు.',
    requestFail: 'కౌన్సెలింగ్ అభ్యర్థన సమర్పించడం విఫలమైంది.',
    backBtn: '← అవకాశాలకు తిరిగి వెళ్లండి',
    roadmapBtn: 'నైపుణ్య రోడ్‌మ్యాప్ చూడండి →'
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

export const SelfEmployment = () => {
  const { lang } = useLang();
  const t = SELFEMP_CONTENT[lang] || SELFEMP_CONTENT.en;

  const [searchParams] = useSearchParams();
  const urlOcc = searchParams.get('occ');
  const occKey = urlOcc || api.getSelectedOccupation() || 'tractor_operator';

  useEffect(() => {
    if (urlOcc) {
      api.setSelectedOccupation(urlOcc);
    }
  }, [urlOcc]);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requestStatus, setRequestStatus] = useState(null);
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.getSelfEmployment(occKey);
        const payload = res?.data || res;
        setData(payload);
        if (payload?.occupationKey && !urlOcc) {
          api.setSelectedOccupation(payload.occupationKey);
        }
      } catch (err) {
        console.error('Failed to load self employment guide:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [occKey, urlOcc]);

  const handleTalkToCounselor = async () => {
    setRequesting(true);
    try {
      const res = await fetch('/api/opportunities/counselor-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('pmajay_token') ? { Authorization: `Bearer ${localStorage.getItem('pmajay_token')}` } : {})
        },
        body: JSON.stringify({
          district: data?.district || 'Warangal',
          titleNote: data?.title || occKey
        })
      });
      const body = await res.json();
      if (res.ok) {
        setRequestStatus(t.requestSuccess);
      } else {
        setRequestStatus(body.error || t.requestFail);
      }
    } catch (err) {
      setRequestStatus(t.requestFail);
    } finally {
      setRequesting(false);
    }
  };

  if (loading) return <div className="container" style={{ textAlign: 'center', padding: '40px' }}>{t.loading}</div>;
  if (!data) return <div className="container" style={{ textAlign: 'center', padding: '40px' }}>{t.unavailable}</div>;

  const plan = data.businessPlan || {};
  const displayTitle = OCCUPATION_TITLES[occKey]?.[lang] || data.title;

  return (
    <div className="page-container">
      <div style={{ marginBottom: '20px' }}>
        <span className="badge badge-amber" style={{ marginBottom: '8px' }}>{t.trackBadge}</span>
        <h1 style={{ fontSize: '24px', fontWeight: 800 }}>{t.headingPrefix} {displayTitle}</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
          {t.subheading}
        </p>
      </div>

      {requestStatus && (
        <div className="card" style={{ marginBottom: '20px', background: '#f0fdf4', borderColor: '#bbf7d0', color: '#15803d', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle size={18} /> {requestStatus}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
        <div className="card" style={{ background: 'var(--primary-50)', borderColor: '#c7d2fe' }}>
          <div style={{ fontSize: '12px', color: 'var(--primary-600)', fontWeight: 600 }}>{t.capitalReq}</div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--primary-900)', margin: '4px 0' }}>
            ₹{data.startupCostInr?.toLocaleString()}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            {t.capitalNote}
          </div>
        </div>

        <div className="card" style={{ background: '#f0fdf4', borderColor: '#bbf7d0' }}>
          <div style={{ fontSize: '12px', color: '#15803d', fontWeight: 600 }}>{t.revenueTitle}</div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#14532d', margin: '4px 0' }}>
            ₹{plan.estimatedMonthlyRevenue?.toLocaleString()}{t.perMonth}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            {t.breakeven(plan.breakevenMonths || 3)}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Briefcase size={18} color="var(--primary-600)" /> {t.operationalSteps}
        </h3>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {(plan.keySteps || []).map((step, idx) => (
            <li key={idx} style={{ fontSize: '13px', display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
              <div style={{ background: 'var(--primary-600)', color: '#fff', width: '22px', height: '22px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, flexShrink: 0 }}>
                {idx + 1}
              </div>
              <span style={{ paddingTop: '2px' }}>{step}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="card" style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Award size={18} color="var(--accent-gold)" /> {t.schemesTitle}
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
          {(data.schemes || []).map((scheme, idx) => (
            <div key={idx} style={{ padding: '12px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
              <span className="badge badge-amber" style={{ fontSize: '10px', marginBottom: '4px' }}>{scheme.type || t.grantBadge}</span>
              <h4 style={{ fontSize: '14px', fontWeight: 700, margin: '2px 0' }}>{scheme.name}</h4>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>{scheme.benefit || scheme.eligibilitySummary}</p>
              {scheme.link && (
                <a href={scheme.link} target="_blank" rel="noreferrer" style={{ fontSize: '11px', color: 'var(--primary-600)', fontWeight: 600 }}>
                  {t.officialPortal}
                </a>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
          <div>
            <h3 style={{ fontSize: '17px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Phone size={18} color="var(--accent-green)" /> {t.counselorsTitle}
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t.counselorSubtitle}</p>
          </div>
          <button onClick={handleTalkToCounselor} className="btn btn-primary" disabled={requesting}>
            {requesting ? t.submittingBtn : t.talkBtn}
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px' }}>
          {(data.counselors || []).map((counselor, idx) => (
            <div key={idx} style={{ padding: '12px', background: 'var(--bg-main)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
              <strong style={{ fontSize: '14px', display: 'block' }}>{counselor.name}</strong>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t.districtLabel} {counselor.district}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{t.languagesLabel} {(counselor.languages || []).join(', ')}</div>
              <div style={{ fontSize: '12px', color: 'var(--primary-600)', fontWeight: 600, marginTop: '4px' }}>{t.contactLabel} {counselor.contact}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link to="/opportunities" className="btn btn-secondary">{t.backBtn}</Link>
        <Link to={`/roadmap?occ=${occKey}`} className="btn btn-primary">{t.roadmapBtn}</Link>
      </div>
    </div>
  );
};
