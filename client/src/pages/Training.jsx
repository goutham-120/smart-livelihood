import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../api';
import { useLang } from '../lang';
import { BookOpen, Award, Filter } from 'lucide-react';

const TRAINING_CONTENT = {
  en: {
    loading: 'Loading certified training details...',
    titlePrefix: 'Certified Training Programs',
    subtitle: 'Free government funded skilling with NSQF certification under PMKVY and PM-AJAY GIA',
    filterTitle: 'Filter Course Modules',
    cost: 'Cost',
    allCosts: 'All Costs',
    freeCost: '100% Free / Subsidized',
    mode: 'Mode',
    allModes: 'All Modes',
    offline: 'Offline / Workshop',
    hybrid: 'Hybrid',
    online: 'Online',
    duration: 'Duration',
    allDurations: 'All Durations',
    shortDuration: '1 to 3 Months',
    longDuration: '3 to 6 Months',
    language: 'Language',
    allLanguages: 'All Languages',
    nsqfLevel: 'NSQF Level',
    freeSubsidy: '100% Free Subsidy (PM-AJAY GIA)',
    provider: 'Provider',
    qpCode: 'QP Code',
    months: 'Months',
    skillsGained: 'Required Trade Skills & Competencies Gained:',
    officialListing: 'Official Skill India Digital Listing →',
    enrollBtn: 'Enroll in Career Roadmap',
    noCourses: 'No courses match the selected filter criteria.'
  },
  hi: {
    loading: 'प्रमाणित प्रशिक्षण विवरण लोड हो रहे हैं...',
    titlePrefix: 'प्रमाणित प्रशिक्षण कार्यक्रम',
    subtitle: 'PMKVY और PM-AJAY GIA के तहत NSQF प्रमाणन के साथ निःशुल्क सरकारी कौशल प्रशिक्षण',
    filterTitle: 'पाठ्यक्रम मॉड्यूल फ़िल्टर करें',
    cost: 'लागत',
    allCosts: 'सभी लागत',
    freeCost: '100% निःशुल्क / सब्सिडी',
    mode: 'प्रशिक्षण मोड',
    allModes: 'सभी मोड',
    offline: 'ऑफ़लाइन / कार्यशाला',
    hybrid: 'हाइब्रिड',
    online: 'ऑनलाइन',
    duration: 'अवधि',
    allDurations: 'सभी अवधियां',
    shortDuration: '1 से 3 माह',
    longDuration: '3 से 6 माह',
    language: 'भाषा',
    allLanguages: 'सभी भाषाएं',
    nsqfLevel: 'NSQF स्तर',
    freeSubsidy: '100% निःशुल्क सब्सिडी (PM-AJAY GIA)',
    provider: 'प्रदाता',
    qpCode: 'QP कोड',
    months: 'माह',
    skillsGained: 'प्राप्त किए जाने वाले कौशल एवं क्षमताएं:',
    officialListing: 'आधिकारिक स्किल इंडिया डिजिटल लिस्टिंग →',
    enrollBtn: 'करियर रोडमैप में नामांकन करें',
    noCourses: 'चयनित फ़िल्टर के अनुसार कोई पाठ्यक्रम नहीं मिला।'
  },
  te: {
    loading: 'ప్రమాణిత శిక్షణా వివరాలను లోడ్ చేస్తోంది...',
    titlePrefix: 'ప్రమాణిత శిక్షణా కార్యక్రమాలు',
    subtitle: 'PMKVY మరియు PM-AJAY GIA కింద NSQF ధృవీకరణతో ఉచిత ప్రభుత్వ నైపుణ్య శిక్షణ',
    filterTitle: 'కోర్సు మాడ్యూల్స్ ఫిల్టర్ చేయండి',
    cost: 'ఖర్చు',
    allCosts: 'అన్ని కోర్సులు',
    freeCost: '100% ఉచితం / సబ్సిడీ',
    mode: 'శిక్షణా విధానం',
    allModes: 'అన్ని విధానాలు',
    offline: 'ఆఫ్‌లైన్ / వర్క్‌షాప్',
    hybrid: 'హైబ్రిడ్',
    online: 'ఆన్‌లైన్',
    duration: 'కాలవ్యవధి',
    allDurations: 'అన్ని కాలవ్యవధులు',
    shortDuration: '1 నుండి 3 నెలలు',
    longDuration: '3 నుండి 6 నెలలు',
    language: 'బోధనా భాష',
    allLanguages: 'అన్ని భాషలు',
    nsqfLevel: 'NSQF స్థాయి',
    freeSubsidy: '100% ఉచిత సబ్సిడీ (PM-AJAY GIA)',
    provider: 'సంస్థ',
    qpCode: 'QP కోడ్',
    months: 'నెలలు',
    skillsGained: 'పొందే నైపుణ్యాలు & సాధించే సామర్థ్యాలు:',
    officialListing: 'అధికారిక స్కిల్ ఇండియా డిజిటల్ లింక్ →',
    enrollBtn: 'కెరీర్ రోడ్‌మ్యాప్‌లో నమోదు చేసుకోండి',
    noCourses: 'ఎంచుకున్న ఫిల్టర్‌కు తగిన కోర్సులు కనుగొనబడలేదు.'
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
    'sewing_machine_operation': 'सिलाई मशीन संचालन',
    'garment_pattern_cutting': 'वस्त्र पैटर्न कटिंग',
    'apparel_quality_checking': 'परिधान गुणवत्ता जांच',
    'hand_embroidery': 'हाथ की कढ़ाई',
    'organic_compost_vermicompost': 'जैविक कम्पोस्ट निर्माण',
    'integrated_pest_management': 'एकीकृत कीट प्रबंधन',
    'drip_irrigation_maintenance': 'ड्रिप सिंचाई रखरखाव',
    'solar_panel_installation': 'सौर पैनल स्थापना',
    'house_wiring_electrical': 'घरेलू वायरिंग विद्युत'
  },
  te: {
    'tractor_farm_machinery': 'ట్రాక్టర్ వ్యవసాయ యంత్రాల నిర్వహణ',
    'sewing_machine_operation': 'కుట్టు మిషన్ ఆపరేషన్',
    'garment_pattern_cutting': 'దుస్తుల ప్యాటర్న్ కటింగ్',
    'apparel_quality_checking': 'దుస్తుల నాణ్యత తనిఖీ',
    'hand_embroidery': 'చేతి ఎంబ్రాయిడరీ',
    'organic_compost_vermicompost': 'సేంద్రీయ వర్మీకంపోస్ట్ తయారీ',
    'integrated_pest_management': 'సమీకృత తెగుళ్ల నివారణ',
    'drip_irrigation_maintenance': 'డ్రిప్ ఇరిగేషన్ నిర్వహణ',
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

export const Training = () => {
  const { lang } = useLang();
  const tTr = TRAINING_CONTENT[lang] || TRAINING_CONTENT.en;
  const [searchParams] = useSearchParams();
  const occKey = searchParams.get('occ') || 'self_employed_tailor';
  const [trainingData, setTrainingData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [costFilter, setCostFilter] = useState('all');
  const [modeFilter, setModeFilter] = useState('all');
  const [durationFilter, setDurationFilter] = useState('all');
  const [languageFilter, setLanguageFilter] = useState('all');

  useEffect(() => {
    api.getTraining(occKey).then((res) => {
      setTrainingData(res);
      setLoading(false);
    });
  }, [occKey]);

  if (loading) return <div className="container" style={{ textAlign: 'center', padding: '40px' }}>{tTr.loading}</div>;

  const rawCourses = trainingData.courses || [];
  const filteredCourses = rawCourses.filter((course) => {
    if (costFilter === 'free' && course.costInr > 0) return false;
    if (modeFilter !== 'all' && course.mode !== modeFilter) return false;
    if (languageFilter !== 'all' && course.language !== languageFilter) return false;
    if (durationFilter === 'short' && course.durationMonths > 3) return false;
    if (durationFilter === 'long' && course.durationMonths <= 3) return false;
    return true;
  });

  const localizedOccTitle = getLocalizedTitle(trainingData.occupation, occKey, lang);

  return (
    <div className="page-container">
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800 }}>
          {tTr.titlePrefix}: {localizedOccTitle}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
          {tTr.subtitle}
        </p>
      </div>

      <div className="card" style={{ marginBottom: '20px', background: 'var(--bg-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, marginBottom: '12px', fontSize: '14px' }}>
          <Filter size={16} /> {tTr.filterTitle}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>{tTr.cost}</label>
            <select value={costFilter} onChange={(e) => setCostFilter(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)' }}>
              <option value="all">{tTr.allCosts}</option>
              <option value="free">{tTr.freeCost}</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>{tTr.mode}</label>
            <select value={modeFilter} onChange={(e) => setModeFilter(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)' }}>
              <option value="all">{tTr.allModes}</option>
              <option value="offline">{tTr.offline}</option>
              <option value="hybrid">{tTr.hybrid}</option>
              <option value="online">{tTr.online}</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>{tTr.duration}</label>
            <select value={durationFilter} onChange={(e) => setDurationFilter(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)' }}>
              <option value="all">{tTr.allDurations}</option>
              <option value="short">{tTr.shortDuration}</option>
              <option value="long">{tTr.longDuration}</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>{tTr.language}</label>
            <select value={languageFilter} onChange={(e) => setLanguageFilter(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)' }}>
              <option value="all">{tTr.allLanguages}</option>
              <option value="en">English</option>
              <option value="te">తెలుగు</option>
              <option value="hi">हिंदी</option>
            </select>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredCourses.length > 0 ? (
          filteredCourses.map((course) => (
            <div key={course.key} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                <span className="badge badge-blue">{tTr.nsqfLevel} {course.nsqfLevel}</span>
                <span className="badge badge-green">
                  {course.costInr === 0 ? tTr.freeSubsidy : `₹${course.costInr.toLocaleString()}`}
                </span>
              </div>

              <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '6px 0' }}>{course.title}</h3>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                {tTr.provider}: {course.provider} | {tTr.qpCode}: {course.qpCode} | {tTr.duration}: {course.durationMonths} {tTr.months} | {tTr.mode}: {course.mode}
              </div>

              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>{tTr.skillsGained}</div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {course.skillsGained?.map((sk, i) => (
                    <span key={i} className="badge badge-blue" style={{ fontSize: '11px' }}>
                      {getLocalizedSkill(sk, lang)}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-light)', paddingTop: '12px', marginTop: '12px', flexWrap: 'wrap', gap: '8px' }}>
                <a href={course.source || 'https://www.skillindiadigital.gov.in'} target="_blank" rel="noreferrer" style={{ fontSize: '13px', color: 'var(--primary-600)', fontWeight: 600 }}>
                  {tTr.officialListing}
                </a>
                <Link to={`/roadmap?occ=${occKey}`} className="btn btn-primary" style={{ fontSize: '13px' }}>
                  {tTr.enrollBtn}
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="card" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
            {tTr.noCourses}
          </div>
        )}
      </div>
    </div>
  );
};
export default Training;

