import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../api';
import { useLang } from '../lang';
import { CheckCircle, AlertCircle, BookOpen, Building, ArrowRight, Star, ExternalLink } from 'lucide-react';

const SKILLGAPS_CONTENT = {
  en: {
    analyzing: 'Analyzing competency gaps...',
    notFound: 'Occupation data not found.',
    nsqfLevel: 'NSQF Level',
    pageTitle: (occ) => `Competency Gap Analysis: ${occ}`,
    subtitle: 'Comparison between your identified skills and certified industry standards',
    learnFirstTitle: 'Priority Prerequisites: Learn First List',
    learnFirstDesc: 'These foundational skills form the essential base graph required before advanced trade modules:',
    step: 'Step',
    acquiredTitle: (cnt) => `Your Skills: Acquired Competencies (${cnt})`,
    noAcquired: 'No verified prior matches recorded.',
    gapsTitle: (cnt) => `Required Skills: Competency Gaps (${cnt})`,
    allFulfilled: 'All core competencies fulfilled!',
    recommendedCourses: 'Recommended Skilling Courses',
    provider: 'Provider',
    qpCode: 'QP Code',
    duration: 'Duration',
    months: 'Months',
    freeGrant: '100% Free PM-AJAY Grant',
    officialListing: 'Official Skill India Digital Listing →',
    centersTitle: 'Accredited District Training Centers',
    district: 'District',
    contact: 'Contact',
    backBtn: 'Back to Opportunities',
    viewRoadmapBtn: 'View Detailed Roadmap'
  },
  hi: {
    analyzing: 'कौशल अंतर का विश्लेषण किया जा रहा है...',
    notFound: 'व्यवसाय डेटा नहीं मिला।',
    nsqfLevel: 'NSQF स्तर',
    pageTitle: (occ) => `कौशल अंतर और क्षमता विश्लेषण: ${occ}`,
    subtitle: 'आपके पहचाने गए कौशल और प्रमाणित उद्योग मानकों के बीच तुलना',
    learnFirstTitle: 'प्राथमिकता पूर्वापेक्षाएँ: पहले सीखने योग्य सूची',
    learnFirstDesc: 'ये बुनियादी कौशल उन्नत व्यापार मॉड्यूल से पहले आवश्यक आधार बनाते हैं:',
    step: 'चरण',
    acquiredTitle: (cnt) => `आपके कौशल: अर्जित क्षमताएं (${cnt})`,
    noAcquired: 'कोई सत्यापित पूर्व कौशल दर्ज नहीं है।',
    gapsTitle: (cnt) => `आवश्यक कौशल: क्षमता अंतराल (${cnt})`,
    allFulfilled: 'सभी आवश्यक क्षमताएं पूरी हो चुकी हैं!',
    recommendedCourses: 'अनुशंसित कौशल विकास पाठ्यक्रम',
    provider: 'प्रदाता',
    qpCode: 'QP कोड',
    duration: 'अवधि',
    months: 'माह',
    freeGrant: '100% निःशुल्क पीएम-अजय अनुदान',
    officialListing: 'आधिकारिक स्किल इंडिया डिजिटल लिस्टिंग →',
    centersTitle: 'मान्यता प्राप्त जिला प्रशिक्षण केंद्र',
    district: 'ज़िला',
    contact: 'संपर्क',
    backBtn: 'अवसरों पर वापस जाएं',
    viewRoadmapBtn: 'विस्तृत रोडमैप देखें'
  },
  te: {
    analyzing: 'నైపుణ్య లోపాలను విశ్లేషిస్తోంది...',
    notFound: 'ఉపాధి సమాచారం కనుగొనబడలేదు.',
    nsqfLevel: 'NSQF స్థాయి',
    pageTitle: (occ) => `నైపుణ్య లోపాల విశ్లేషణ: ${occ}`,
    subtitle: 'మీ నైపుణ్యాలు మరియు సర్టిఫైడ్ పరిశ్రమ ప్రమాణాల మధ్య పోలిక',
    learnFirstTitle: 'ప్రాధాన్యతా నైపుణ్యాలు: ముందుగా నేర్చుకోవాల్సినవి',
    learnFirstDesc: 'ఉన్నత శిక్షణా మాడ్యూల్స్ ప్రారంభించే ముందు ఈ ప్రాథమిక నైపుణ్యాలు చాలా అవసరం:',
    step: 'దశ',
    acquiredTitle: (cnt) => `మీ నైపుణ్యాలు: సాధించిన సామర్థ్యాలు (${cnt})`,
    noAcquired: 'ఇంతకు ముందు సరిపోలిన నైపుణ్యాలు నమోదు కాలేదు.',
    gapsTitle: (cnt) => `అవసరమైన నైపుణ్యాలు: నేర్చుకోవాల్సిన లోపాలు (${cnt})`,
    allFulfilled: 'అన్ని ప్రధాన సామర్థ్యాలు సమకూరాయి!',
    recommendedCourses: 'సిఫార్సు చేయబడిన శిక్షణా కోర్సులు',
    provider: 'సంస్థ',
    qpCode: 'QP కోడ్',
    duration: 'వ్యవధి',
    months: 'నెలలు',
    freeGrant: '100% ఉచిత PM-AJAY గ్రాంట్',
    officialListing: 'అధికారిక స్కిల్ ఇండియా డిజిటల్ లిస్టింగ్ →',
    centersTitle: 'అధీకృత జిల్లా శిక్షణా కేంద్రాలు',
    district: 'జిల్లా',
    contact: 'సంప్రదించండి',
    backBtn: 'అవకాశాలకు తిరిగి వెళ్ళండి',
    viewRoadmapBtn: 'వివరణాత్మక రోడ్‌మ్యాప్ చూడండి'
  }
};

const OCCUPATION_TITLES = {
  hi: {
    self_employed_tailor: 'स्वरोजगार दर्जी',
    hand_embroiderer: 'हाथ का कढ़ाईकार',
    apparel_sewing_operator: 'सिलाई मशीन संचालक',
    pickle_making_technician: 'अचार और चटनी निर्माता',
    baking_technician: 'शिल्प बेकर और हलवाई',
    spice_processing_technician: 'मसाला प्रसंस्करण तकनीशियन',
    organic_grower: 'जैविक किसान',
    micro_irrigation_technician: 'सूक्ष्म सिंचाई तकनीशियन',
    polyhouse_grower: 'पॉलीहाउस सब्जी उत्पादक',
    tractor_operator: 'ट्रैक्टर एवं कृषि मशीन ऑपरेटर',
    medicinal_crops_cultivator: 'औषधीय पौध कृषक',
    dairy_farmer_entrepreneur: 'लघु डेयरी किसान',
    ai_veterinary_assistant: 'कृत्रिम गर्भाधान तकनीशियन',
    goat_sheep_farmer: 'वाणिज्यिक बकरी पालक',
    solar_pv_installer: 'सोलर पीवी इंस्टॉलर (सूर्यमित्र)',
    mobile_phone_repair_technician: 'स्मार्टफोन हार्डवेयर मरम्मत तकनीशियन',
    'Self Employed Tailor': 'स्वरोजगार दर्जी',
    'Tractor and Farm Machinery Operator': 'ट्रैक्टर एवं कृषि मशीन ऑपरेटर',
    'Polyhouse Vegetable Grower': 'पॉलीहाउस सब्जी उत्पादक',
    'Medicinal Plants Cultivator': 'औषधीय पौध कृषक'
  },
  te: {
    self_employed_tailor: 'స్వయం ఉపాధి టైలర్',
    hand_embroiderer: 'చేతి ఎంబ్రాయిడరీ నిపుణుడు',
    apparel_sewing_operator: 'కుట్టు మిషన్ ఆపరేటర్',
    pickle_making_technician: 'ఊరగాయల తయారీదారు',
    baking_technician: 'క్రాఫ్ట్ బేకర్ మరియు మిఠాయి నిపుణుడు',
    spice_processing_technician: 'మసాలా ప్రాసెసింగ్ టెక్నీషియన్',
    organic_grower: 'సేంద్రీయ రైతు',
    micro_irrigation_technician: 'మైక్రో ఇరిగేషన్ టెక్నీషియన్',
    polyhouse_grower: 'పాలీహౌస్ కూరగాయల సాగుదారు',
    tractor_operator: 'ట్రాక్టర్ మరియు వ్యవసాయ యంత్రాల ఆపరేటర్',
    medicinal_crops_cultivator: 'ఔషధ మొక్కల సాగుదారు',
    dairy_farmer_entrepreneur: 'చిన్న పాడి రైతు',
    ai_veterinary_assistant: 'కృత్రిమ గర్భధారణ టెక్నీషియన్',
    goat_sheep_farmer: 'వాణిజ్య మేకల పెంపకందారు',
    solar_pv_installer: 'సోలార్ పివి ఇన్స్టాలర్ (సూర్యమిత్ర)',
    mobile_phone_repair_technician: 'స్మార్ట్‌ఫోన్ హార్డ్‌వేర్ రిపేర్ టెక్నీషియన్',
    'Self Employed Tailor': 'స్వయం ఉపాధి టైలర్',
    'Tractor and Farm Machinery Operator': 'ట్రాక్టర్ మరియు వ్యవసాయ యంత్రాల ఆపరేటర్',
    'Polyhouse Vegetable Grower': 'పాలీహౌస్ కూరగాయల సాగుదారు',
    'Medicinal Plants Cultivator': 'ఔషధ మొక్కల సాగుదారు'
  }
};

const SKILL_TRANSLATIONS = {
  hi: {
    'tractor_farm_machinery': 'ट्रैक्टर और कृषि यंत्र संचालन',
    'tractor farm machinery': 'ट्रैक्टर और कृषि यंत्र संचालन',
    'sewing_machine_operation': 'सिलाई मशीन संचालन',
    'garment_pattern_cutting': 'वस्त्र पैटर्न कटिंग',
    'apparel_quality_checking': 'परिधान गुणवत्ता जांच',
    'hand_embroidery': 'हाथ की कढ़ाई',
    'fashion_accessory_making': 'फैशन सहायक उपकरण निर्माण',
    'industrial_sewing': 'औद्योगिक सिलाई',
    'organic_compost_vermicompost': 'जैविक कम्पोस्ट निर्माण',
    'integrated_pest_management': 'एकीकृत कीट प्रबंधन',
    'drip_irrigation_maintenance': 'ड्रिप सिंचाई रखरखाव',
    'polyhouse_nursery_management': 'पॉलीहाउस नर्सरी प्रबंधन',
    'medicinal_plant_cultivation': 'औषधीय पौध खेती',
    'solar_panel_installation': 'सौर पैनल स्थापना',
    'house_wiring_electrical': 'घरेलू वायरिंग विद्युत'
  },
  te: {
    'tractor_farm_machinery': 'ట్రాక్టర్ వ్యవసాయ యంత్రాల నిర్వహణ',
    'tractor farm machinery': 'ట్రాక్టర్ వ్యవసాయ యంత్రాల నిర్వహణ',
    'sewing_machine_operation': 'కుట్టు మిషన్ ఆపరేషన్',
    'garment_pattern_cutting': 'దుస్తుల ప్యాటర్న్ కటింగ్',
    'apparel_quality_checking': 'దుస్తుల నాణ్యత తనిఖీ',
    'hand_embroidery': 'చేతి ఎంబ్రాయిడరీ',
    'fashion_accessory_making': 'ఫ్యాషన్ వస్తువుల తయారీ',
    'industrial_sewing': 'పారిశ్రామిక కుట్టు పని',
    'organic_compost_vermicompost': 'సేంద్రీయ వర్మీకంపోస్ట్ తయారీ',
    'integrated_pest_management': 'సమీకృత తెగుళ్ల నివారణ',
    'drip_irrigation_maintenance': 'డ్రిప్ ఇరిగేషన్ నిర్వహణ',
    'polyhouse_nursery_management': 'పాలీహౌస్ నర్సరీ నిర్వహణ',
    'medicinal_plant_cultivation': 'ఔషధ మొక్కల సాగు',
    'solar_panel_installation': 'సోలార్ ప్యానెల్ ఇన్‌స్టాలేషన్',
    'house_wiring_electrical': 'హౌస్ వైరింగ్ & ఎలక్ట్రికల్'
  }
};

const getLocalizedSkill = (sk, lang) => {
  if (lang === 'en' || !sk) return String(sk || '').replace(/_/g, ' ');
  const norm = String(sk).toLowerCase().trim();
  if (SKILL_TRANSLATIONS[lang]?.[norm]) return SKILL_TRANSLATIONS[lang][norm];
  if (SKILL_TRANSLATIONS[lang]?.[norm.replace(/_/g, ' ')]) return SKILL_TRANSLATIONS[lang][norm.replace(/_/g, ' ')];
  return String(sk).replace(/_/g, ' ');
};

const getLocalizedTitle = (occ, key, lang) => {
  if (lang === 'en' || !occ) return occ?.title || key || '';
  if (occ?.titles && occ.titles[lang]) return occ.titles[lang];
  if (OCCUPATION_TITLES[lang]?.[key]) return OCCUPATION_TITLES[lang][key];
  if (OCCUPATION_TITLES[lang]?.[occ?.title]) return OCCUPATION_TITLES[lang][occ.title];
  return occ?.title || key || '';
};

export const SkillGaps = () => {
  const { lang } = useLang();
  const tG = SKILLGAPS_CONTENT[lang] || SKILLGAPS_CONTENT.en;
  const [searchParams] = useSearchParams();
  const occKey = searchParams.get('occ') || 'self_employed_tailor';
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getSkillGaps(occKey).then((res) => {
      setData(res);
      setLoading(false);
    });
  }, [occKey]);

  if (loading) return <div className="container" style={{ textAlign: 'center', padding: '40px' }}>{tG.analyzing}</div>;
  if (!data) return <div className="container" style={{ textAlign: 'center', padding: '40px' }}>{tG.notFound}</div>;

  const acquired = data.skillsSummary?.acquired || [];
  const missing = data.skillsSummary?.missing || [];
  const learnFirst = data.skillsSummary?.learnFirst || missing.slice(0, 3);
  const localizedOccTitle = getLocalizedTitle(data.occupation, occKey, lang);

  return (
    <div className="page-container">
      <div style={{ marginBottom: '20px' }}>
        <span className="badge badge-blue" style={{ marginBottom: '8px' }}>
          {tG.nsqfLevel} {data.occupation?.nsqfLevel}
        </span>
        <h1 style={{ fontSize: '24px', fontWeight: 800 }}>
          {tG.pageTitle(localizedOccTitle)}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
          {tG.subtitle}
        </p>
      </div>

      {learnFirst.length > 0 && (
        <div className="card" style={{ marginBottom: '20px', background: '#eef2ff', borderColor: '#c7d2fe' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--primary-700)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <Star size={18} color="var(--primary-600)" /> {tG.learnFirstTitle}
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '10px' }}>
            {tG.learnFirstDesc}
          </p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {learnFirst.map((sk, idx) => (
              <span key={idx} className="badge badge-blue" style={{ fontSize: '12px', padding: '6px 12px' }}>
                {tG.step} {idx + 1}: {getLocalizedSkill(sk, lang)}
              </span>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
        <div className="card" style={{ background: '#f0fdf4', borderColor: '#bbf7d0' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#15803d', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
            <CheckCircle size={18} /> {tG.acquiredTitle(acquired.length)}
          </h3>
          {acquired.length > 0 ? (
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {acquired.map((s, idx) => (
                <li key={idx} style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle size={14} color="#16a34a" /> {getLocalizedSkill(s, lang)}
                </li>
              ))}
            </ul>
          ) : (
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{tG.noAcquired}</div>
          )}
        </div>

        <div className="card" style={{ background: '#fffbeb', borderColor: '#fde68a' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#b45309', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
            <AlertCircle size={18} /> {tG.gapsTitle(missing.length)}
          </h3>
          {missing.length > 0 ? (
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {missing.map((s, idx) => (
                <li key={idx} style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertCircle size={14} color="#d97706" /> {getLocalizedSkill(s, lang)}
                </li>
              ))}
            </ul>
          ) : (
            <div style={{ fontSize: '13px', color: '#16a34a' }}>{tG.allFulfilled}</div>
          )}
        </div>
      </div>

      <div className="card" style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BookOpen size={18} color="var(--primary-600)" /> {tG.recommendedCourses}
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {data.recommendedCourses?.map((c) => {
            const courseUrl = c.source || (c.qpCode ? `https://www.skillindiadigital.gov.in/courses/detail/${c.qpCode.replace(':', '/')}` : 'https://www.skillindiadigital.gov.in/courses');
            return (
              <div key={c.key || c.qpCode || c._id} style={{ padding: '14px', background: 'var(--bg-main)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '15px' }}>{c.title}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {tG.provider}: {c.provider} • {tG.qpCode}: {c.qpCode} • {tG.duration}: {c.durationMonths} {tG.months}
                    </div>
                  </div>
                  <span className="badge badge-green">{tG.freeGrant}</span>
                </div>
                <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '10px', display: 'flex', justifyContent: 'flex-start' }}>
                  <a
                    href={courseUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: '12px',
                      color: 'var(--primary-600)',
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      textDecoration: 'none'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                    onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
                  >
                    <ExternalLink size={13} /> {tG.officialListing}
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {data.nearbyCenters && data.nearbyCenters.length > 0 && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building size={18} color="var(--primary-600)" /> {tG.centersTitle}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '10px' }}>
            {data.nearbyCenters.map((center, idx) => (
              <div key={idx} style={{ padding: '10px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', fontSize: '12px' }}>
                <strong style={{ display: 'block', marginBottom: '2px' }}>{center.name}</strong>
                <div style={{ color: 'var(--text-muted)' }}>{tG.district}: {center.district}, {center.state}</div>
                <div style={{ color: 'var(--text-muted)' }}>{tG.contact}: {center.contact || 'N/A'}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
        <Link to="/opportunities" className="btn btn-secondary">{tG.backBtn}</Link>
        <Link to={`/roadmap?occ=${occKey}`} className="btn btn-primary">
          {tG.viewRoadmapBtn} <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
};

