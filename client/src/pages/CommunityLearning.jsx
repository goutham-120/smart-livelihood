import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../api.js';
import { useLang } from '../lang.js';
import {
  Search, ExternalLink, Sparkles, Video, Globe, Building2, Newspaper, Share2,
  GraduationCap, CheckCircle, ArrowRight, Compass, Briefcase, FileText, X, Filter
} from 'lucide-react';

const UI_TEXT = {
  en: {
    badge: 'PM-AJAY External Resource Hub',
    title: 'Community & Learning Gateway',
    subtitle: 'Your gateway from the platform into the real world. Access verified external learning platforms, social channels, official government portals, and live search engines in a new browser tab.',
    personalBannerTitle: 'Personalized External Learning Resources for You',
    knownSkill: 'Known Skill',
    targetRole: 'Target Role',
    searchTitle: 'What are you looking for in the real world?',
    searchPlaceholder: 'Type a skill, job, course, or scheme to search across Google, YouTube, & News...',
    quickSearches: 'Quick Searches:',
    searchGoogle: 'Search on Google',
    searchYouTube: 'Watch Tutorials on YouTube',
    searchNews: 'Read News on Google News',
    filterAll: 'All Resources',
    filterSocial: 'Learn & Connect (Social & Video)',
    filterPersonalized: 'Personalized Skill Learning',
    filterDiscovery: 'Discover Opportunities (Search)',
    filterGovt: 'Official Government Portals',
    secSocialTitle: 'Learn & Connect',
    secSocialSub: 'Real video and social media platforms for practical skill learning and community discussions.',
    secPersonalizedTitle: 'Personalized Skill Learning Destinations',
    secPersonalizedSub: 'External learning searches dynamically tailored to your identified skills and target role.',
    secDiscoveryTitle: 'Discover Opportunities',
    secDiscoverySub: 'One-click live search engines to find real local training, job vacancies, and scheme updates.',
    secGovtTitle: 'Government & Official Resources',
    secGovtSub: 'Verified official portals for PM-AJAY schemes, skill certifications, and national job desks.',
    visitButton: 'Explore Platform',
    openButton: 'Open Resource',
    searchButton: 'Launch External Search',
    officialBadge: 'Official Portal',
    externalNote: 'Opens in a new browser tab'
  },
  hi: {
    badge: 'PM-AJAY बाहरी संसाधन केंद्र',
    title: 'समुदाय और शिक्षा गेटवे',
    subtitle: 'प्लेटफ़ॉर्म से वास्तविक दुनिया में आपका प्रवेश द्वार। नए ब्राउज़र टैब में सत्यापित बाहरी शिक्षण प्लेटफ़ॉर्म, सामाजिक चैनल, आधिकारिक सरकारी पोर्टल और लाइव खोज उपकरण एक्सेस करें।',
    personalBannerTitle: 'आपके लिए व्यक्तिगत बाहरी शिक्षण संसाधन',
    knownSkill: 'ज्ञात कौशल',
    targetRole: 'लक्षित भूमिका',
    searchTitle: 'आप वास्तविक दुनिया में क्या खोज रहे हैं?',
    searchPlaceholder: 'Google, YouTube और News पर खोजने के लिए कोई कौशल, नौकरी, पाठ्यक्रम या योजना लिखें...',
    quickSearches: 'त्वरित खोजें:',
    searchGoogle: 'Google पर खोजें',
    searchYouTube: 'YouTube पर ट्यूटोरियल देखें',
    searchNews: 'Google समाचार पर खबरें पढ़ें',
    filterAll: 'सभी संसाधन',
    filterSocial: 'सीखें और जुड़ें (सोशल और वीडियो)',
    filterPersonalized: 'व्यक्तिगत कौशल शिक्षा',
    filterDiscovery: 'अवसर खोजें (सर्च)',
    filterGovt: 'आधिकारिक सरकारी पोर्टल',
    secSocialTitle: 'सीखें और जुड़ें',
    secSocialSub: 'व्यवहारिक कौशल सीखने और सामुदायिक चर्चाओं के लिए वास्तविक वीडियो और सोशल मीडिया प्लेटफ़ॉर्म।',
    secPersonalizedTitle: 'व्यक्तिगत कौशल शिक्षण स्थल',
    secPersonalizedSub: 'आपके पहचाने गए कौशल और लक्षित भूमिका के अनुसार गतिशील रूप से तैयार की गई बाहरी खोजें।',
    secDiscoveryTitle: 'अवसर खोजें',
    secDiscoverySub: 'स्थानीय प्रशिक्षण, नौकरी की रिक्तियों और योजना अपडेट खोजने के लिए एक-क्लिक लाइव सर्च इंजन।',
    secGovtTitle: 'सरकारी एवं आधिकारिक संसाधन',
    secGovtSub: 'PM-AJAY योजनाओं, कौशल प्रमाणन और राष्ट्रीय रोजगार डेस्क के लिए सत्यापित आधिकारिक पोर्टल।',
    visitButton: 'प्लेटफ़ॉर्म देखें',
    openButton: 'संसाधन खोलें',
    searchButton: 'बाहरी खोज शुरू करें',
    officialBadge: 'आधिकारिक पोर्टल',
    externalNote: 'नए ब्राउज़र टैब में खुलता है'
  },
  te: {
    badge: 'PM-AJAY బాహ్య వనరుల కేంద్రం',
    title: 'సముదాయం & అభ్యాస ద్వారము',
    subtitle: 'ఈ వేదిక నుండి నిజ ప్రపంచానికి మీ ద్వారము. కొత్త బ్రౌజర్ ట్యాబ్‌లో ధృవీకరించబడిన బాహ్య అభ్యాస వేదికలు, సామాజిక ఛానెల్‌లు, అధికారిక ప్రభుత్వ పోర్టల్స్ మరియు ప్రత్యక్ష శోధన పరికరాలను పొందండి.',
    personalBannerTitle: 'మీ కోసం వ్యక్తిగతీకరించిన బాహ్య అభ్యాస వనరులు',
    knownSkill: 'గుర్తించిన నైపుణ్యం',
    targetRole: 'లక్ష్య ఉద్యోగం',
    searchTitle: 'మీరు నిజ ప్రపంచంలో ఏమి వెతుకుతున్నారు?',
    searchPlaceholder: 'Google, YouTube, News లలో వెతకడానికి నైపుణ్యం, ఉద్యోగం, కోర్సు లేదా పథకం టైప్ చేయండి...',
    quickSearches: 'త్వరిత శోధనలు:',
    searchGoogle: 'Google లో వెతకండి',
    searchYouTube: 'YouTube లో వీడియోలు చూడండి',
    searchNews: 'Google వార్తలలో చదవండి',
    filterAll: 'అన్ని వనరులు',
    filterSocial: 'నేర్చుకోండి & అనుసంధానమవ్వండి (సోషల్ & వీడియో)',
    filterPersonalized: 'వ్యక్తిగతీకరించిన నైపుణ్య అభ్యాసం',
    filterDiscovery: 'అవకాశాలను అన్వేషించండి (సెర్చ్)',
    filterGovt: 'అధికారిక ప్రభుత్వ పోర్టల్స్',
    secSocialTitle: 'నేర్చుకోండి & అనుసంధానమవ్వండి',
    secSocialSub: 'ప్రాయోగిక నైపుణ్యాల అభ్యాసం మరియు సమాజ చర్చల కోసం నిజమైన వీడియో మరియు సోషల్ మీడియా వేదికలు.',
    secPersonalizedTitle: 'వ్యక్తిగతీకరించిన అభ్యాస గమ్యస్థానాలు',
    secPersonalizedSub: 'మీ నైపుణ్యాలు మరియు లక్ష్యాలకు అనుగుణంగా రూపొందించబడిన ప్రత్యక్ష శోధనలు.',
    secDiscoveryTitle: 'అవకాశాలను అన్వేషించండి',
    secDiscoverySub: 'స్థానిక శిక్షణ, ఉద్యోగావకాశాలు మరియు ప్రభుత్వ పథకాల సమాచారం కోసం శోధన యంత్రాలు.',
    secGovtTitle: 'ప్రభుత్వ & అధికారిక వనరులు',
    secGovtSub: 'PM-AJAY పథకాలు, నైపుణ్య ధృవీకరణ మరియు జాతీయ ఉద్యోగ పోర్టల్‌ల అధికారిక వెబ్‌సైట్‌లు.',
    visitButton: 'ప్లాట్‌ఫారమ్‌ను చూడండి',
    openButton: 'వనరు తెరువు',
    searchButton: 'బాహ్య శోధన ప్రారంభించు',
    officialBadge: 'అధికారిక పోర్టల్',
    externalNote: 'కొత్త బ్రౌజర్ ట్యాబ్‌లో తెరుచుకుంటుంది'
  }
};

export function CommunityLearning() {
  const { lang } = useLang();
  const tUI = UI_TEXT[lang] || UI_TEXT.en;

  const [profile, setProfile] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    let mounted = true;
    api.getProfile()
      .then((res) => {
        if (!mounted) return;
        const p = res?.profile || res?.data?.profile || res?.data || {};
        setProfile(p);
      })
      .catch(() => {});
    return () => { mounted = false; };
  }, []);

  const userSkills = useMemo(() => {
    if (profile && Array.isArray(profile.skills) && profile.skills.length > 0) {
      return profile.skills;
    }
    return ['sewing_machine_operation', 'tractor_farm_machinery'];
  }, [profile]);

  const userRole = useMemo(() => {
    return profile?.currentLivelihood || profile?.familyOccupation || 'Tailoring & Garment Work';
  }, [profile]);

  // Section 1: Social & Video Resources ("Learn & Connect")
  const socialResources = [
    {
      id: 'soc-yt',
      name: 'YouTube',
      category: 'social',
      badge: 'Video & Tutorials',
      url: 'https://www.youtube.com/',
      description: 'Explore millions of practical skill tutorials, machinery operation walkthroughs, trade demonstrations, and vocational guides.',
      iconColor: '#FF0000',
      actionText: tUI.visitButton
    },
    {
      id: 'soc-ig',
      name: 'Instagram',
      category: 'social',
      badge: 'Artisans & Community',
      url: 'https://www.instagram.com/',
      description: 'Follow micro-entrepreneurs, artisan success stories, local self-help group showcases, and creative trade reels.',
      iconColor: '#E4405F',
      actionText: tUI.visitButton
    },
    {
      id: 'soc-x',
      name: 'X (formerly Twitter)',
      category: 'social',
      badge: 'Official Updates',
      url: 'https://x.com/',
      description: 'Follow ministry announcements, skill development notifications, apprenticeship alerts, and livelihood policy discussions.',
      iconColor: '#000000',
      actionText: tUI.visitButton
    },
    {
      id: 'soc-goog',
      name: 'Google',
      category: 'social',
      badge: 'World Search Engine',
      url: 'https://www.google.com/',
      description: 'Search for local vocational institutes, nearby workshops, skill requirements, and business opportunities.',
      iconColor: '#4285F4',
      actionText: tUI.visitButton
    },
    {
      id: 'soc-news',
      name: 'Google News',
      category: 'social',
      badge: 'News & Schemes',
      url: 'https://news.google.com/',
      description: 'Stay informed with live news coverage on government skilling initiatives, welfare grants, and employment trends.',
      iconColor: '#34A853',
      actionText: tUI.visitButton
    }
  ];

  // Section 2: Personalized Learning Destinations
  const personalizedResources = useMemo(() => {
    const list = [];
    const skillList = userSkills;

    if (skillList.some(s => String(s).includes('tailor') || String(s).includes('sewing') || String(s).includes('garment'))) {
      list.push({
        id: 'pers-tailor-yt',
        name: 'Tailoring & Pattern Cutting Tutorials',
        platform: 'YouTube',
        category: 'personalized',
        badge: 'Skill Tutorial Search',
        url: 'https://www.youtube.com/results?search_query=tailoring+garment+pattern+cutting+tutorials',
        description: 'Step-by-step practical video guides on garment drafting, neck cuts, blouse stitching, and industrial machine operation.'
      });
    }

    if (skillList.some(s => String(s).includes('electric') || String(s).includes('solar') || String(s).includes('wiring') || String(s).includes('motor'))) {
      list.push({
        id: 'pers-elec-yt',
        name: 'Solar Panel & Electrical Repair Guides',
        platform: 'YouTube',
        category: 'personalized',
        badge: 'Technical Video Search',
        url: 'https://www.youtube.com/results?search_query=solar+panel+installation+electrician+repair+guide',
        description: 'Hands-on practical walkthroughs covering inverter wiring, multimeter diagnostics, motor rewinding, and solar rooftop setups.'
      });
    }

    if (skillList.some(s => String(s).includes('tractor') || String(s).includes('farm') || String(s).includes('irrigation') || String(s).includes('compost'))) {
      list.push({
        id: 'pers-farm-yt',
        name: 'Farm Machinery & Agriculture Maintenance',
        platform: 'YouTube',
        category: 'personalized',
        badge: 'Agriculture Search',
        url: 'https://www.youtube.com/results?search_query=farm+machinery+tractor+maintenance+organic+compost',
        description: 'Practical guides on tractor rotavator servicing, drip irrigation repair, vermicompost production, and modern farming.'
      });
    }

    if (skillList.some(s => String(s).includes('mobile') || String(s).includes('smartphone') || String(s).includes('appliance'))) {
      list.push({
        id: 'pers-mobile-yt',
        name: 'Smartphone Hardware & Appliance Repair',
        platform: 'YouTube',
        category: 'personalized',
        badge: 'Electronics Search',
        url: 'https://www.youtube.com/results?search_query=smartphone+hardware+repair+course+appliance+servicing',
        description: 'Video tutorials covering mobile display replacement, charging jack soldering, mixer repair, and basic electronics.'
      });
    }

    // Default fallback personalized searches
    list.push({
      id: 'pers-govt-schemes',
      name: 'Government Grants & Schemes for Your Skill',
      platform: 'Google Search',
      category: 'personalized',
      badge: 'Scheme Search',
      url: `https://www.google.com/search?q=government+PM+AJAY+skilling+and+subsidy+schemes+for+${encodeURIComponent(userRole)}`,
      description: `Direct search for official government capital grants, training stipends, and toolkits for ${userRole}.`
    });

    list.push({
      id: 'pers-local-training',
      name: 'Certified Training Programs Near You',
      platform: 'Google Search',
      category: 'personalized',
      badge: 'Local Training Search',
      url: `https://www.google.com/search?q=free+certified+vocational+skill+training+centers+for+${encodeURIComponent(userRole)}`,
      description: 'Discover nearby accredited Skill India and PM-AJAY vocational training drives.'
    });

    return list;
  }, [userSkills, userRole]);

  // Section 3: Discover Opportunities (Direct Google / News Search Actions)
  const discoveryResources = [
    {
      id: 'disc-local-training',
      name: 'Search Local Skill Training Centers',
      platform: 'Google Search',
      category: 'discovery',
      badge: 'Live Search',
      url: 'https://www.google.com/search?q=skill+development+training+centers+near+me',
      description: 'Find government-accredited district skill hubs, PMKK centers, and free vocational workshops in your region.'
    },
    {
      id: 'disc-jobs-near-me',
      name: 'Find Entry-Level Jobs Near Me',
      platform: 'Google Search',
      category: 'discovery',
      badge: 'Employment Search',
      url: 'https://www.google.com/search?q=entry+level+jobs+and+vacancies+near+me',
      description: 'Discover real job openings, retail helper roles, technician apprenticeships, and local workplace vacancies.'
    },
    {
      id: 'disc-free-courses',
      name: 'Find Free Certified Skill Courses',
      platform: 'Google Search',
      category: 'discovery',
      badge: 'Free Skilling',
      url: 'https://www.google.com/search?q=free+certified+vocational+training+courses+india',
      description: 'Search for short-term certified courses offering free course materials, stipends, and NSDC credentials.'
    },
    {
      id: 'disc-schemes-search',
      name: 'Find Government Livelihood Schemes',
      platform: 'Google Search',
      category: 'discovery',
      badge: 'Welfare Search',
      url: 'https://www.google.com/search?q=government+livelihood+schemes+PM+AJAY+social+justice',
      description: 'Search for capital subsidies, micro-enterprise loans, SHG grants, and SC welfare schemes.'
    },
    {
      id: 'disc-news-search',
      name: 'Latest Livelihood & Skilling News',
      platform: 'Google News',
      category: 'discovery',
      badge: 'Live News Search',
      url: 'https://news.google.com/search?q=livelihood+skills+employment+india',
      description: 'Read recent news articles on employment drives, government scheme launches, and skill development announcements.'
    }
  ];

  // Section 4: Verified Government & Official Resources
  const officialGovtResources = [
    {
      id: 'govt-pmajay',
      name: 'PM-AJAY Official Portal',
      agency: 'Ministry of Social Justice & Empowerment',
      category: 'government',
      badge: tUI.officialBadge,
      url: 'https://pmajay.dosje.gov.in/',
      description: 'Official portal for Pradhan Mantri Anusuchit Jaati Abhyuday Yojana. Access scheme guidelines, district perspective plans, and grant details.'
    },
    {
      id: 'govt-dosje',
      name: 'Ministry of Social Justice and Empowerment',
      agency: 'Government of India',
      category: 'government',
      badge: tUI.officialBadge,
      url: 'https://socialjustice.gov.in/',
      description: 'Apex ministry website for Scheduled Caste development, educational scholarships, and welfare programs.'
    },
    {
      id: 'govt-skill-india',
      name: 'Skill India Digital Hub',
      agency: 'Ministry of Skill Development & Entrepreneurship',
      category: 'government',
      badge: tUI.officialBadge,
      url: 'https://www.skillindiadigital.gov.in/',
      description: 'Official national digital hub to search certified skilling courses, digital Skill India passports, and training centers.'
    },
    {
      id: 'govt-ncs',
      name: 'National Career Service (NCS Portal)',
      agency: 'Ministry of Labour & Employment',
      category: 'government',
      badge: tUI.officialBadge,
      url: 'https://www.ncs.gov.in/',
      description: 'Government of India national job desk connecting jobseekers with registered employers, job fairs, and career counseling.'
    },
    {
      id: 'govt-nsdc',
      name: 'National Skill Development Corp (NSDC)',
      agency: 'NSDC India',
      category: 'government',
      badge: tUI.officialBadge,
      url: 'https://nsdcindia.org/',
      description: 'Official portal for sector skill councils, occupational standards (QP-NOS), and accredited vocational partners.'
    },
    {
      id: 'govt-pmkvy',
      name: 'PMKVY Official Portal',
      agency: 'Pradhan Mantri Kaushal Vikas Yojana',
      category: 'government',
      badge: tUI.officialBadge,
      url: 'https://www.pmkvyofficial.org/',
      description: 'Official portal for flagship short-term skill training, Recognition of Prior Learning (RPL), and certified assessment centers.'
    },
    {
      id: 'govt-india',
      name: 'National Portal of India',
      agency: 'Government of India',
      category: 'government',
      badge: tUI.officialBadge,
      url: 'https://www.india.gov.in/',
      description: 'Single-window access to all Indian government services, citizen schemes, application forms, and official department directories.'
    }
  ];

  // Dynamic Search URLs when user types in search box
  const dynamicSearches = useMemo(() => {
    const query = searchQuery.trim();
    if (!query) return null;
    const encoded = encodeURIComponent(query);
    return {
      google: `https://www.google.com/search?q=${encoded}`,
      youtube: `https://www.youtube.com/results?search_query=${encoded}`,
      news: `https://news.google.com/search?q=${encoded}`
    };
  }, [searchQuery]);

  // Combined resources for filtering
  const allResources = useMemo(() => {
    return [
      ...socialResources,
      ...personalizedResources,
      ...discoveryResources,
      ...officialGovtResources
    ];
  }, [personalizedResources]);

  const filteredResources = useMemo(() => {
    return allResources.filter((item) => {
      if (activeTab !== 'all' && item.category !== activeTab) {
        return false;
      }
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchName = item.name.toLowerCase().includes(q);
        const matchDesc = item.description.toLowerCase().includes(q);
        const matchBadge = (item.badge || '').toLowerCase().includes(q);
        if (!matchName && !matchDesc && !matchBadge) return false;
      }
      return true;
    });
  }, [allResources, activeTab, searchQuery]);

  return (
    <div className="community-learning-page" style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 16px' }}>
      
      {/* HEADER TITLE BANNER */}
      <div style={{
        background: 'linear-gradient(135deg, #FEFCF6 0%, #F5F1EB 100%)',
        border: '1px solid #E1D7C8',
        borderRadius: '16px',
        padding: '28px 24px',
        marginBottom: '24px',
        boxShadow: '0 4px 12px rgba(79, 55, 40, 0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
          <span style={{
            background: '#CA6603',
            color: '#FFFFFF',
            fontSize: '11.5px',
            fontWeight: '800',
            padding: '4px 10px',
            borderRadius: '9999px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            {tUI.badge}
          </span>
          <span style={{ fontSize: '13px', color: '#6b5240', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Globe size={14} color="#CA6603" /> Real External Platforms & Search Engines
          </span>
        </div>

        <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#4F3728', margin: '0 0 8px 0', lineHeight: '1.2' }}>
          {tUI.title}
        </h1>
        
        <p style={{ fontSize: '15px', color: '#4F3728', opacity: 0.9, maxWidth: '880px', margin: 0, lineHeight: '1.6' }}>
          {tUI.subtitle}
        </p>
      </div>

      {/* PERSONALIZED USER PROFILE BANNER */}
      <div style={{
        background: '#EEE0CC',
        border: '1.5px solid #CA6603',
        borderRadius: '14px',
        padding: '20px 24px',
        marginBottom: '28px',
        boxShadow: '0 4px 12px rgba(202, 102, 3, 0.08)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: '#CA6603',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Sparkles size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '16.5px', fontWeight: '800', color: '#4F3728', margin: 0 }}>
                {tUI.personalBannerTitle}
              </h2>
              <div style={{ fontSize: '13px', color: '#4F3728', opacity: 0.9, marginTop: '2px' }}>
                {tUI.targetRole}: <strong>{userRole}</strong>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{
              background: '#FEFCF6',
              border: '1px solid #CA6603',
              color: '#CA6603',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '12.5px',
              fontWeight: '800',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <CheckCircle size={14} color="#CA6603" /> {tUI.knownSkill}: {userSkills[0].replace(/_/g, ' ')}
            </span>
          </div>
        </div>
      </div>

      {/* LIVE INTERACTIVE SEARCH BAR ("What are you looking for in the real world?") */}
      <div style={{
        background: '#FEFCF6',
        border: '1.5px solid #CA6603',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '32px',
        boxShadow: '0 6px 16px rgba(79, 55, 40, 0.06)'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#4F3728', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Search size={20} color="#CA6603" /> {tUI.searchTitle}
        </h3>

        <div style={{ position: 'relative', marginBottom: '16px' }}>
          <input
            type="text"
            placeholder={tUI.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '14px 44px 14px 16px',
              borderRadius: '10px',
              border: '1.5px solid #E1D7C8',
              background: '#FFFFFF',
              fontSize: '14.5px',
              color: '#4F3728',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#6b5240'
              }}
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* DYNAMIC REAL EXTERNAL SEARCH BUTTONS */}
        {dynamicSearches && (
          <div style={{
            background: '#F5F1EB',
            border: '1px solid #E1D7C8',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '16px'
          }}>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#CA6603', marginBottom: '10px' }}>
              Launch Real External Search for "{searchQuery}":
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <a
                href={dynamicSearches.google}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
                style={{
                  background: '#4285F4',
                  borderColor: '#4285F4',
                  color: '#FFFFFF',
                  padding: '9px 16px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '700',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Search size={15} /> {tUI.searchGoogle} <ExternalLink size={14} />
              </a>

              <a
                href={dynamicSearches.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
                style={{
                  background: '#FF0000',
                  borderColor: '#FF0000',
                  color: '#FFFFFF',
                  padding: '9px 16px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '700',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Video size={15} /> {tUI.searchYouTube} <ExternalLink size={14} />
              </a>

              <a
                href={dynamicSearches.news}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
                style={{
                  background: '#34A853',
                  borderColor: '#34A853',
                  color: '#FFFFFF',
                  padding: '9px 16px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '700',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <Newspaper size={15} /> {tUI.searchNews} <ExternalLink size={14} />
              </a>
            </div>
          </div>
        )}

        {/* QUICK SUGGESTED SEARCHES */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '12.5px', fontWeight: '700', color: '#6b5240' }}>
            {tUI.quickSearches}
          </span>
          {[
            'Tailoring tutorials',
            'Solar installation course',
            'Tractor repair maintenance',
            'PM-AJAY grant eligibility',
            'Jobs near me'
          ].map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => setSearchQuery(prompt)}
              style={{
                background: '#F5F1EB',
                border: '1px solid #E1D7C8',
                color: '#4F3728',
                padding: '4px 10px',
                borderRadius: '9999px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              + {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* CATEGORY FILTER TABS */}
      <div style={{
        display: 'flex',
        gap: '8px',
        flexWrap: 'wrap',
        marginBottom: '28px',
        paddingBottom: '4px'
      }}>
        {[
          { id: 'all', label: tUI.filterAll },
          { id: 'social', label: tUI.filterSocial },
          { id: 'personalized', label: tUI.filterPersonalized },
          { id: 'discovery', label: tUI.filterDiscovery },
          { id: 'government', label: tUI.filterGovt }
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '9px 16px',
                borderRadius: '8px',
                border: isActive ? '1.5px solid #CA6603' : '1px solid #E1D7C8',
                background: isActive ? '#CA6603' : '#FEFCF6',
                color: isActive ? '#FFFFFF' : '#4F3728',
                fontSize: '13.5px',
                fontWeight: isActive ? '700' : '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* SECTION 1: LEARN & CONNECT (SOCIAL & VIDEO) */}
      {(activeTab === 'all' || activeTab === 'social') && (
        <div style={{ marginBottom: '36px' }}>
          <div style={{ marginBottom: '16px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#4F3728', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Video size={22} color="#CA6603" /> {tUI.secSocialTitle}
            </h2>
            <p style={{ fontSize: '13.5px', color: '#6b5240', margin: '4px 0 0 0' }}>
              {tUI.secSocialSub}
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '16px'
          }}>
            {socialResources.map((item) => (
              <div
                key={item.id}
                style={{
                  background: '#F5F1EB',
                  border: '1px solid #E1D7C8',
                  borderRadius: '12px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 2px 6px rgba(79, 55, 40, 0.04)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ fontSize: '11px', fontWeight: '800', color: '#CA6603', background: '#FEFCF6', border: '1px solid #E1D7C8', padding: '3px 8px', borderRadius: '4px' }}>
                      {item.badge}
                    </span>
                    <span style={{ fontSize: '11px', color: '#6b5240', fontWeight: '600' }}>
                      {tUI.externalNote}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#4F3728', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {item.name}
                  </h3>

                  <p style={{ fontSize: '13px', color: '#4F3728', opacity: 0.9, lineHeight: '1.5', margin: '0 0 16px 0' }}>
                    {item.description}
                  </p>
                </div>

                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    width: '100%',
                    background: '#FEFCF6',
                    border: '1.5px solid #CA6603',
                    color: '#CA6603',
                    padding: '9px 14px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '700',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    boxSizing: 'border-box'
                  }}
                >
                  {item.actionText} <ExternalLink size={14} />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 2: PERSONALIZED SKILL LEARNING */}
      {(activeTab === 'all' || activeTab === 'personalized') && (
        <div style={{ marginBottom: '36px' }}>
          <div style={{ marginBottom: '16px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#4F3728', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <GraduationCap size={22} color="#CA6603" /> {tUI.secPersonalizedTitle}
            </h2>
            <p style={{ fontSize: '13.5px', color: '#6b5240', margin: '4px 0 0 0' }}>
              {tUI.secPersonalizedSub}
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '16px'
          }}>
            {personalizedResources.map((item) => (
              <div
                key={item.id}
                style={{
                  background: '#F5F1EB',
                  border: '1px solid #E1D7C8',
                  borderRadius: '12px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 2px 6px rgba(79, 55, 40, 0.04)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ fontSize: '11px', fontWeight: '800', color: '#4F3728', background: '#EEE7D9', padding: '3px 8px', borderRadius: '4px' }}>
                      {item.platform}
                    </span>
                    <span style={{ fontSize: '11.5px', fontWeight: '700', color: '#16a34a', background: '#dcfce7', padding: '2px 8px', borderRadius: '4px' }}>
                      {item.badge}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '16.5px', fontWeight: '800', color: '#4F3728', margin: '0 0 8px 0', lineHeight: '1.3' }}>
                    {item.name}
                  </h3>

                  <p style={{ fontSize: '13px', color: '#4F3728', opacity: 0.9, lineHeight: '1.5', margin: '0 0 16px 0' }}>
                    {item.description}
                  </p>
                </div>

                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    width: '100%',
                    background: '#CA6603',
                    border: '1px solid #CA6603',
                    color: '#FFFFFF',
                    padding: '9px 14px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '700',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    boxSizing: 'border-box'
                  }}
                >
                  {tUI.searchButton} <ExternalLink size={14} />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 3: DISCOVER OPPORTUNITIES (SEARCH ACTIONS) */}
      {(activeTab === 'all' || activeTab === 'discovery') && (
        <div style={{ marginBottom: '36px' }}>
          <div style={{ marginBottom: '16px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#4F3728', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Compass size={22} color="#CA6603" /> {tUI.secDiscoveryTitle}
            </h2>
            <p style={{ fontSize: '13.5px', color: '#6b5240', margin: '4px 0 0 0' }}>
              {tUI.secDiscoverySub}
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '16px'
          }}>
            {discoveryResources.map((item) => (
              <div
                key={item.id}
                style={{
                  background: '#F5F1EB',
                  border: '1px solid #E1D7C8',
                  borderRadius: '12px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 2px 6px rgba(79, 55, 40, 0.04)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ fontSize: '11px', fontWeight: '800', color: '#CA6603', background: '#FEFCF6', border: '1px solid #E1D7C8', padding: '3px 8px', borderRadius: '4px' }}>
                      {item.platform}
                    </span>
                    <span style={{ fontSize: '11.5px', fontWeight: '700', color: '#1d4ed8', background: '#dbeafe', padding: '2px 8px', borderRadius: '4px' }}>
                      {item.badge}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '16.5px', fontWeight: '800', color: '#4F3728', margin: '0 0 8px 0', lineHeight: '1.3' }}>
                    {item.name}
                  </h3>

                  <p style={{ fontSize: '13px', color: '#4F3728', opacity: 0.9, lineHeight: '1.5', margin: '0 0 16px 0' }}>
                    {item.description}
                  </p>
                </div>

                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    width: '100%',
                    background: '#FEFCF6',
                    border: '1.5px solid #CA6603',
                    color: '#CA6603',
                    padding: '9px 14px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '700',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    boxSizing: 'border-box'
                  }}
                >
                  {tUI.searchButton} <ExternalLink size={14} />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 4: GOVERNMENT & OFFICIAL RESOURCES */}
      {(activeTab === 'all' || activeTab === 'government') && (
        <div style={{ marginBottom: '36px' }}>
          <div style={{ marginBottom: '16px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#4F3728', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Building2 size={22} color="#CA6603" /> {tUI.secGovtTitle}
            </h2>
            <p style={{ fontSize: '13.5px', color: '#6b5240', margin: '4px 0 0 0' }}>
              {tUI.secGovtSub}
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '16px'
          }}>
            {officialGovtResources.map((item) => (
              <div
                key={item.id}
                style={{
                  background: '#F5F1EB',
                  border: '1px solid #E1D7C8',
                  borderRadius: '12px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 2px 6px rgba(79, 55, 40, 0.04)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ fontSize: '11px', fontWeight: '800', color: '#4F3728', background: '#EEE7D9', padding: '3px 8px', borderRadius: '4px' }}>
                      {item.agency}
                    </span>
                    <span style={{ fontSize: '11.5px', fontWeight: '700', color: '#ca6603', background: '#fef3c7', padding: '2px 8px', borderRadius: '4px' }}>
                      {item.badge}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '16.5px', fontWeight: '800', color: '#4F3728', margin: '0 0 8px 0', lineHeight: '1.3' }}>
                    {item.name}
                  </h3>

                  <p style={{ fontSize: '13px', color: '#4F3728', opacity: 0.9, lineHeight: '1.5', margin: '0 0 16px 0' }}>
                    {item.description}
                  </p>
                </div>

                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    width: '100%',
                    background: '#CA6603',
                    border: '1px solid #CA6603',
                    color: '#FFFFFF',
                    padding: '9px 14px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '700',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    boxSizing: 'border-box'
                  }}
                >
                  {tUI.openButton} <ExternalLink size={14} />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

export default CommunityLearning;
