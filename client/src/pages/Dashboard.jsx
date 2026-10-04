import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { useLang } from '../lang.js';
import { Card, Badge, Spinner, EnrollmentModal } from '../components.jsx';
import { TrendingUp, Award, AlertTriangle, ArrowRight, Sparkles, CheckCircle, Briefcase, MapPin, Lock, FileText } from 'lucide-react';

const DASHBOARD_CONTENT = {
  en: {
    greeting: (name) => `Namaste, ${name || 'Friend'}!`,
    heroTitle: "Let's continue your livelihood journey",
    talkAi: 'Talk to AI Voice Assistant →',
    location: 'Location',
    education: 'Education',
    nextAction: 'Next Recommended Action',
    nextActionDesc: 'Bridge your missing competencies by enrolling in prerequisite skilling modules.',
    matchFit: 'Match Fit',
    matchFitScore: 'Match Fit Score',
    exploreOpportunities: 'Explore Tailored Opportunities',
    competenciesTitle: 'Your Identified Profile Competencies',
    unlockPrompt: 'Unlocks when you complete the 2-minute voice conversation',
    unlockDesc: 'Speak with our AI Assistant to map your trade skills and past experience.',
    startVoice: 'Start Voice Assessment →',
    skillsIdentified: 'Skills identified from your voice assessment and background',
    noSkills: 'No competencies recorded yet. Click below to begin voice assessment.',
    estimatedIncome: 'Est. Income',
    topPathways: 'Top Matched Livelihood Pathways',
    viewAll: (count) => `View All (${count}) →`,
    selfEmployment: 'Self-Employment',
    wagePlacement: 'Wage Placement',
    nsqfLevel: 'NSQF Level',
    to: 'to',
    perMonth: '/mo',
    skillGaps: 'Skill Gaps',
    roadmap: 'Roadmap →',
    empPreference: 'Employment Preference',
    targetIncome: 'Target Monthly Income',
    prefSelf: 'Micro-Enterprise / Self-Employment',
    prefWage: 'Wage Placement',
    prefEither: 'Either Track',
    unlockedVoicePrompt: 'Complete the 2-minute conversation with our AI Assistant to generate personalized match scores tailored to your trade skills.',
    currentAppTitle: 'CURRENT APPLICATION',
    appId: 'Application',
    viewApp: 'View Application',
    noAppTitle: 'No Active Training Applications',
    noAppDesc: 'Apply for a training program to start your livelihood journey.',
    exploreTraining: 'Explore Training'
  },
  hi: {
    greeting: (name) => `नमस्ते, ${name || 'मित्र'}!`,
    heroTitle: 'अपनी आजीविका यात्रा जारी रखें',
    talkAi: 'एआई वॉयस असिस्टेंट से बात करें →',
    location: 'स्थान',
    education: 'शिक्षा',
    nextAction: 'अगली अनुशंसित कार्रवाई',
    nextActionDesc: 'कौशल विकास मॉड्यूल में नामांकन करके अपनी कमियों को दूर करें।',
    matchFit: 'मैच फिट',
    matchFitScore: 'मैच फिट स्कोर',
    exploreOpportunities: 'अवसरों को खोजें',
    competenciesTitle: 'पहचाने गए आपके कौशल एवं योग्यताएं',
    unlockPrompt: '2 मिनट की वॉयस बातचीत पूरी करने के बाद अनलॉक होगा',
    unlockDesc: 'अपने हुनर और अनुभव को साझा करने के लिए हमारे एआई सहायक से बात करें।',
    startVoice: 'वॉयस मूल्यांकन शुरू करें →',
    skillsIdentified: 'आपके वॉयस मूल्यांकन और पृष्ठभूमि से पहचाने गए कौशल',
    noSkills: 'अभी तक कोई क्षमता दर्ज नहीं की गई। वॉयस मूल्यांकन शुरू करें।',
    estimatedIncome: 'अनुमानित आय',
    topPathways: 'शीर्ष सुमेलित आजीविका के अवसर',
    viewAll: (count) => `सभी देखें (${count}) →`,
    selfEmployment: 'स्वरोज़गार',
    wagePlacement: 'वेतन रोज़गार',
    nsqfLevel: 'NSQF स्तर',
    to: 'से',
    perMonth: '/माह',
    skillGaps: 'कौशल अंतर',
    roadmap: 'रोडमैप →',
    empPreference: 'रोज़गार प्राथमिकता',
    targetIncome: 'लक्षित मासिक आय',
    prefSelf: 'सूक्ष्म उद्यम / स्वरोज़गार',
    prefWage: 'वेतन रोज़गार',
    prefEither: 'दोनों में से कोई भी',
    unlockedVoicePrompt: 'अपने व्यापार कौशल के अनुरूप व्यक्तिगत मैच स्कोर प्राप्त करने के लिए हमारे एआई सहायक के साथ 2 मिनट की बातचीत पूरी करें।',
    currentAppTitle: 'वर्तमान प्रशिक्षण आवेदन',
    appId: 'आवेदन संख्या',
    viewApp: 'आवेदन देखें',
    noAppTitle: 'कोई सक्रिय प्रशिक्षण आवेदन नहीं',
    noAppDesc: 'अपनी आजीविका यात्रा शुरू करने के लिए किसी प्रशिक्षण कार्यक्रम में आवेदन करें।',
    exploreTraining: 'प्रशिक्षण खोजें'
  },
  te: {
    greeting: (name) => `నమస్కారం, ${name || 'మిత్రమా'}!`,
    heroTitle: 'మీ జీవనోపాధి ప్రయాణాన్ని కొనసాగించండి',
    talkAi: 'AI వాయిస్ అసిస్టెంట్‌తో మాట్లాడండి →',
    location: 'ప్రాంతం',
    education: 'విద్యార్హత',
    nextAction: 'తదుపరి సిఫార్సు చేసిన చర్య',
    nextActionDesc: 'నైపుణ్య శిక్షణ మాడ్యూల్స్‌లో చేరడం ద్వారా మీ లోపాలను సరిదిద్దుకోండి.',
    matchFit: 'సరిపోలిక',
    matchFitScore: 'సరిపోలిక స్కోరు',
    exploreOpportunities: 'అవకాశాలను అన్వేషించండి',
    competenciesTitle: 'గుర్తించబడిన మీ నైపుణ్య సామర్థ్యాలు',
    unlockPrompt: '2 నిమిషాల వాయిస్ సంభాషణ పూర్తి చేసిన తర్వాత అన్‌లాక్ అవుతుంది',
    unlockDesc: 'మీ నైపుణ్యాలు మరియు గత అనుభవాన్ని తెలపడానికి AI అసిస్టెంట్‌తో మాట్లాడండి.',
    startVoice: 'వాయిస్ అసెస్‌మెంట్ ప్రారంభించండి →',
    skillsIdentified: 'మీ వాయిస్ సంభాషణ ద్వారా గుర్తించబడిన నైపుణ్యాలు',
    noSkills: 'ఇంకా నైపుణ్యాలు నమోదు కాలేదు. వాయిస్ అసెస్‌మెంట్ ప్రారంభించండి.',
    estimatedIncome: 'అంచనా ఆదాయం',
    topPathways: 'అగ్ర సరిపోలిన ఉపాధి మార్గాలు',
    viewAll: (count) => `అన్నీ చూడండి (${count}) →`,
    selfEmployment: 'స్వయం ఉపాధి',
    wagePlacement: 'వేతన ఉపాధి',
    nsqfLevel: 'NSQF స్థాయి',
    to: 'నుండి',
    perMonth: '/నెల',
    skillGaps: 'నైపుణ్య అంతరాలు',
    roadmap: 'రోడ్‌మ్యాప్ →',
    empPreference: 'ఉపాధి ప్రాధాన్యత',
    targetIncome: 'లక్ష్య నెలవారీ ఆదాయం',
    prefSelf: 'సూక్ష్మ పరిశ్రమ / స్వయం ఉపాధి',
    prefWage: 'వేతన ఉపాధి (ఉద్యోగం)',
    prefEither: 'ఏదైనా',
    unlockedVoicePrompt: 'మీ వృత్తి నైపుణ్యాలకు అనుగుణంగా మ్యాచ్ స్కోర్‌లను రూపొందించడానికి మా AI అసిస్టెంట్‌తో 2 నిమిషాల సంభాషణను పూర్తి చేయండి.',
    currentAppTitle: 'ప్రస్తుత శిక్షణా దరఖాస్తు',
    appId: 'దరఖాస్తు సంఖ్య',
    viewApp: 'దరఖాస్తు చూడండి',
    noAppTitle: 'సక్రియ శిక్షణా దరఖాస్తులు లేవు',
    noAppDesc: 'మీ జీవనోపాధి ప్రయాణాన్ని ప్రారంభించడానికి శిక్షణా కార్యక్రమంలో దరఖాస్తు చేసుకోండి.',
    exploreTraining: 'శిక్షణను అన్వేషించండి'
  }
};

const SECTOR_TRANSLATIONS = {
  hi: {
    'Agriculture': 'कृषि',
    'Apparel & Handloom': 'वस्त्र एवं हथकरघा',
    'Food Processing': 'खाद्य प्रसंस्करण',
    'Green Energy': 'हरित ऊर्जा',
    'Healthcare': 'स्वास्थ्य सेवा',
    'Construction': 'निर्माण',
    'Automotive': 'ऑटोमोटिव',
    'Electronics': 'इलेक्ट्रॉनिक्स',
    'Electronics & Hardware': 'इलेक्ट्रॉनिक्स एवं हार्डवेयर',
    'Beauty & Wellness': 'सौंदर्य एवं कल्याण',
    'Dairy & Animal Husbandry': 'डेयरी एवं पशुपालन',
    'Retail': 'खुदरा व्यापार',
    'IT-ITeS': 'आईटी एवं आईटी सेवाएं',
    'Handicrafts & Carpet': 'हस्तशिल्प एवं कालीन',
    'Logistics': 'लॉजिस्टिक्स एवं आपूर्ति',
    'Skilling': 'कौशल विकास'
  },
  te: {
    'Agriculture': 'వ్యవసాయం',
    'Apparel & Handloom': 'దుస్తులు & చేనేత',
    'Food Processing': 'ఆహార శుద్ధి',
    'Green Energy': 'హరిత ఇంధనం',
    'Healthcare': 'ఆరోగ్య సంరక్షణ',
    'Construction': 'భవన నిర్మాణం',
    'Automotive': 'ఆటోమోటివ్',
    'Electronics': 'ఎలక్ట్రానిక్స్',
    'Electronics & Hardware': 'ఎలక్ట్రానిక్స్ & హార్డ్‌వేర్',
    'Beauty & Wellness': 'సౌందర్యం & సంరక్షణ',
    'Dairy & Animal Husbandry': 'పాడి & పశుసంవర్ధక శాఖ',
    'Retail': 'రిటైల్ వ్యాపారం',
    'IT-ITeS': 'ఐటీ & ఐటీ సేవలు',
    'Handicrafts & Carpet': 'హస్తకళలు & తివాచీలు',
    'Logistics': 'లాజిస్టిక్స్ & రవాణా',
    'Skilling': 'నైపుణ్యాభివృద్ధి'
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
    field_technician_home_appliances: 'घरेलू उपकरण तकनीशियन',
    welder_structural: 'संरचनात्मक वेल्डर',
    general_mason: 'सामान्य राजमिस्त्री',
    general_plumber: 'सामान्य प्लंबर',
    retail_sales_associate: 'खुदरा बिक्री सहयोगी',
    micro_retailer_kirana_owner: 'किराना स्टोर उद्यमी',
    domestic_data_entry_operator: 'घरेलू डेटा एंट्री ऑपरेटर',
    csc_village_level_entrepreneur: 'सीएससी ग्राम स्तरीय उद्यमी (वीएलई)',
    general_duty_assistant: 'सामान्य ड्यूटी स्वास्थ्य सहायक',
    home_health_aide: 'गृह स्वास्थ्य सहायक',
    food_packaging_hygiene: 'खाद्य पैकेजिंग और स्वच्छता ऑपरेटर',
    cctv_security_installation: 'सीसीटीवी और सुरक्षा प्रणाली तकनीशियन',
    motor_rewinding: 'मोटर रिवाइंडिंग और पंप मरम्मत तकनीशियन',
    basic_computer_troubleshooting: 'कंप्यूटर हार्डवेयर और नेटवर्क सहायक',
    crm_voice_associate: 'ग्राहक सेवा वॉयस कार्यकारी',
    'Tractor and Farm Machinery Operator': 'ट्रैक्टर एवं कृषि मशीन ऑपरेटर',
    'Polyhouse Vegetable Grower': 'पॉलीहाउस सब्जी उत्पादक',
    'Medicinal Plants Cultivator': 'औषधीय पौध कृषक',
    'Self Employed Tailor': 'स्वरोजगार दर्जी',
    'Organic Grower': 'जैविक किसान',
    'Micro Irrigation Technician': 'सूक्ष्म सिंचाई तकनीशियन',
    'Small Dairy Farmer': 'लघु डेयरी किसान',
    'Commercial Goat Farmer': 'वाणिज्यिक बकरी पालक',
    'Solar PV System Installer (Suryamitra)': 'सोलर पीवी इंस्टॉलर (सूर्यमित्र)'
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
    field_technician_home_appliances: 'గృహోపకరణాల సాంకేతిక నిపుణుడు',
    welder_structural: 'స్ట్రక్చరల్ వెల్డర్',
    general_mason: 'జనరల్ మేస్త్రీ',
    general_plumber: 'జనరల్ ప్లంబర్',
    retail_sales_associate: 'రిటైల్ సేల్స్ అసోసియేట్',
    micro_retailer_kirana_owner: 'కిరాణా దుకాణం వ్యాపారి',
    domestic_data_entry_operator: 'డేటా ఎంట్రీ ఆపరేటర్',
    csc_village_level_entrepreneur: 'గ్రామ స్థాయి డిజిటల్ సేవా వ్యవస్థాపకుడు (వి.ఎల్.ఇ)',
    general_duty_assistant: 'జనరల్ డ్యూటీ హెల్త్‌కేర్ అసిస్టెంట్',
    home_health_aide: 'గృహ ఆరోగ్య సహాయకుడు',
    food_packaging_hygiene: 'ఆహార ప్యాకేజింగ్ మరియు పరిశుభ్రత ఆపరేటర్',
    cctv_security_installation: 'సిసిటివి మరియు భద్రతా వ్యవస్థల టెక్నీషియన్',
    motor_rewinding: 'మోటార్ రివైండింగ్ మరియు పంప్ రిపేర్ టెక్నీషియన్',
    basic_computer_troubleshooting: 'కంప్యూటర్ హార్డ్‌వేర్ మరియు నెట్‌వర్క్ అసిస్టెంట్',
    crm_voice_associate: 'కస్టమర్ కేర్ వాయిస్ ఎగ్జిక్యూటివ్',
    'Tractor and Farm Machinery Operator': 'ట్రాక్టర్ మరియు వ్యవసాయ యంత్రాల ఆపరేటర్',
    'Polyhouse Vegetable Grower': 'పాలీహౌస్ కూరగాయల సాగుదారు',
    'Medicinal Plants Cultivator': 'ఔషధ మొక్కల సాగుదారు',
    'Self Employed Tailor': 'స్వయం ఉపాధి టైలర్',
    'Organic Grower': 'సేంద్రీయ రైతు',
    'Micro Irrigation Technician': 'మైక్రో ఇరిగేషన్ టెక్నీషియన్',
    'Small Dairy Farmer': 'చిన్న పాడి రైతు',
    'Commercial Goat Farmer': 'వాణిజ్య మేకల పెంపకందారు',
    'Solar PV System Installer (Suryamitra)': 'సోలార్ పివి ఇన్స్టాలర్ (సూర్యమిత్ర)'
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
    'hand embroidery': 'हाथ की कढ़ाई',
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
    'hand embroidery': 'చేతి ఎంబ్రాయిడరీ',
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

const EDUCATION_TRANSLATIONS = {
  hi: {
    'Higher Secondary (12th)': 'उच्चतर माध्यमिक (12वीं)',
    'High School': 'हाई स्कूल (10वीं)',
    'High School (10th)': 'हाई स्कूल (10वीं)',
    'Middle School': 'मिडिल स्कूल (8वीं)',
    'Primary School': 'प्राथमिक विद्यालय (5वीं)',
    'Graduate / Degree': 'स्नातक / डिग्री',
    'Diploma / ITI': 'डिप्लोमा / आईटीआई'
  },
  te: {
    'Higher Secondary (12th)': 'హయ్యర్ సెకండరీ (12వ తరగతి)',
    'High School': 'హై స్కూల్ (10వ తరగతి)',
    'High School (10th)': 'హై స్కూల్ (10వ తరగతి)',
    'Middle School': 'మిడిల్ స్కూల్ (8వ తరగతి)',
    'Primary School': 'ప్రాథమిక పాఠశాల (5వ తరగతి)',
    'Graduate / Degree': 'డిగ్రీ / గ్రాడ్యుయేట్',
    'Diploma / ITI': 'డిప్లొమా / ITI'
  }
};

const DISTRICT_TRANSLATIONS = {
  hi: {
    'Warangal': 'वारंगल',
    'Adilabad': 'आदिलाबाद',
    'Nalgonda': 'नलगोंडा'
  },
  te: {
    'Warangal': 'వరంగల్',
    'Adilabad': 'ఆదిలాబాద్',
    'Nalgonda': 'నల్గొండ'
  }
};

const getLocalizedSkill = (skill, lang) => {
  if (lang === 'en' || !skill) return String(skill || '').replace(/_/g, ' ');
  const normalized = String(skill).toLowerCase().trim();
  if (SKILL_TRANSLATIONS[lang]?.[normalized]) return SKILL_TRANSLATIONS[lang][normalized];
  if (SKILL_TRANSLATIONS[lang]?.[normalized.replace(/_/g, ' ')]) return SKILL_TRANSLATIONS[lang][normalized.replace(/_/g, ' ')];
  return String(skill).replace(/_/g, ' ');
};

const getLocalizedEducation = (edu, lang) => {
  if (lang === 'en' || !edu) return edu || 'High School';
  return EDUCATION_TRANSLATIONS[lang]?.[edu] || edu;
};

const getLocalizedDistrict = (dist, lang) => {
  if (lang === 'en' || !dist) return dist || 'Warangal';
  return DISTRICT_TRANSLATIONS[lang]?.[dist] || dist;
};

const getLocalizedTitle = (op, lang) => {
  if (!op) return '';
  if (lang === 'en') return op.title || 'Livelihood Pathway';
  if (op.titles && op.titles[lang]) return op.titles[lang];
  const occKey = op.occupationKey || op.key || op.id;
  if (OCCUPATION_TITLES[lang]?.[occKey]) return OCCUPATION_TITLES[lang][occKey];
  if (OCCUPATION_TITLES[lang]?.[op.title]) return OCCUPATION_TITLES[lang][op.title];
  return op.title || 'Livelihood Pathway';
};

const getLocalizedSector = (sector, lang) => {
  if (lang === 'en' || !sector) return sector || 'Skilling';
  return SECTOR_TRANSLATIONS[lang]?.[sector] || sector;
};

export const Dashboard = ({ user }) => {
  const { lang } = useLang();
  const tDash = DASHBOARD_CONTENT[lang] || DASHBOARD_CONTENT.en;
  const [district, setDistrict] = useState(user?.district || 'Warangal');
  const [analytics, setAnalytics] = useState(null);
  const [opportunities, setOpportunities] = useState([]);
  const [profile, setProfile] = useState(null);
  const [activeApplication, setActiveApplication] = useState(null);
  const [showAppModal, setShowAppModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const isOfficer = user?.role === 'officer' || user?.role === 'admin';

  useEffect(() => {
    setLoading(true);
    if (isOfficer) {
      api.getOfficerAnalytics(district).then((res) => {
        setAnalytics(res);
        setLoading(false);
      }).catch((err) => {
        console.error('Analytics load error:', err);
        setLoading(false);
      });
    } else {
      Promise.all([
        api.getProfile().catch(() => ({ profile: null })),
        api.getOpportunities().catch(() => ({ opportunities: [] })),
        api.getMyEnrollments().catch(() => ({ applications: [], activeApplication: null }))
      ]).then(([profRes, oppRes, enrollRes]) => {
        const p = profRes?.profile || null;
        setProfile(p);
        setActiveApplication(enrollRes?.activeApplication || null);
        if (p?.voiceCompleted || (p?.skills && p.skills.length > 0 && localStorage.getItem('pmajay_voice_unlocked') === 'true')) {
          localStorage.setItem('pmajay_voice_unlocked', 'true');
          window.dispatchEvent(new Event('pmajay_voice_unlocked'));
        }
        const oppList = Array.isArray(oppRes?.opportunities) ? oppRes.opportunities : [];
        oppList.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
        setOpportunities(oppList);
        if (oppList.length > 0 && !api.getSelectedOccupation()) {
          const topKey = oppList[0]?.occupationKey || oppList[0]?.id;
          if (topKey) api.setSelectedOccupation(topKey);
        }
        setLoading(false);
      }).catch((err) => {
        console.error('Beneficiary load error:', err);
        setLoading(false);
      });
    }
  }, [district, isOfficer]);

  const isUnlocked = isOfficer ||
    Boolean(profile?.voiceCompleted) ||
    (Boolean(profile?.skills && profile?.skills.length > 0) && localStorage.getItem('pmajay_voice_unlocked') === 'true');

  if (loading) return <div style={{ textAlign: 'center', padding: '60px' }}><Spinner size={32} /></div>;

  if (isOfficer) {
    return (
      <div className="page-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: 800 }}>District Officer Command Cockpit</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>PM-AJAY GIA Skilling, Placement, and Dropout Governance</p>
          </div>

          {user?.role === 'admin' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600 }}>Filter District:</span>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-medium)' }}
              >
                <option value="Warangal">Warangal</option>
                <option value="Adilabad">Adilabad</option>
                <option value="Nalgonda">Nalgonda</option>
              </select>
            </div>
          )}
        </div>

        {/* 5-Stage Funnel */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <Card style={{ borderLeft: '4px solid var(--primary-600)' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>1. REGISTERED</div>
            <div style={{ fontSize: '24px', fontWeight: 800, margin: '4px 0' }}>{analytics?.funnel?.registered ?? 100}</div>
            <div style={{ fontSize: '12px', color: 'var(--primary-600)' }}>Beneficiaries Mobilized</div>
          </Card>

          <Card style={{ borderLeft: '4px solid var(--accent-sky)' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>2. SKILLS IDENTIFIED</div>
            <div style={{ fontSize: '24px', fontWeight: 800, margin: '4px 0' }}>{analytics?.funnel?.skillsIdentified ?? 95}</div>
            <div style={{ fontSize: '12px', color: 'var(--accent-sky)' }}>Assessed via Voice AI</div>
          </Card>

          <Card style={{ borderLeft: '4px solid var(--accent-gold)' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>3. ENROLLED IN NSQF</div>
            <div style={{ fontSize: '24px', fontWeight: 800, margin: '4px 0' }}>{analytics?.funnel?.trainingEnrolled ?? 78}</div>
            <div style={{ fontSize: '12px', color: 'var(--accent-gold)' }}>Active in Training</div>
          </Card>

          <Card style={{ borderLeft: '4px solid var(--status-success)' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>4. PLACED / ENTERPRISE</div>
            <div style={{ fontSize: '24px', fontWeight: 800, margin: '4px 0' }}>{analytics?.funnel?.placedOrSelfEmployed ?? 33}</div>
            <div style={{ fontSize: '12px', color: 'var(--status-success)' }}>Placement Rate: {analytics?.placementRate ?? 0}%</div>
          </Card>

          <Card style={{ borderLeft: '4px solid var(--status-danger)' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>5. DROPOUTS FLAGGED</div>
            <div style={{ fontSize: '24px', fontWeight: 800, margin: '4px 0' }}>{analytics?.funnel?.dropouts ?? 14}</div>
            <div style={{ fontSize: '12px', color: 'var(--status-danger)' }}>Requires Intervention</div>
          </Card>
        </div>

        {/* Dropout Risk & Demand */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <Card title="Early Candidate Dropout Risk Distribution">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#fee2e2', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontWeight: 600, color: '#b91c1c', fontSize: '13px' }}>High Risk (Mobility/Education Gaps):</span>
                <strong>{analytics?.dropoutRisk?.high ?? 18} candidates</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#fef3c7', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontWeight: 600, color: '#b45309', fontSize: '13px' }}>Medium Risk:</span>
                <strong>{analytics?.dropoutRisk?.medium ?? 34} candidates</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: '#dcfce7', borderRadius: 'var(--radius-sm)' }}>
                <span style={{ fontWeight: 600, color: '#15803d', fontSize: '13px' }}>Low Risk:</span>
                <strong>{analytics?.dropoutRisk?.low ?? 48} candidates</strong>
              </div>
            </div>
          </Card>

          <Card title="Top Sector Trade Demand">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
              {(analytics?.byTrade || []).slice(0, 4).map((t, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '8px 0', borderBottom: '1px solid var(--border-light)' }}>
                  <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>{String(t?.trade || '').replace(/_/g, ' ')}</span>
                  <Badge type="blue">{t?.count ?? 0} candidates</Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Beneficiary Dashboard View
  const topOpportunity = (opportunities || [])[0];
  const userSkills = profile?.skills || [];

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Greeting Banner */}
      <Card style={{ background: 'linear-gradient(135deg, #1e40af, #2563eb)', color: '#fff', border: 'none', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ flex: '1 1 280px', minWidth: 0 }}>
            <div style={{ fontSize: '13px', color: '#93c5fd', fontWeight: 600, marginBottom: '4px' }}>
              {tDash.greeting(user?.name)}
            </div>
            <h2 style={{ fontSize: '24px', fontWeight: 800, lineHeight: '1.25' }}>{tDash.heroTitle}</h2>
            <p style={{ color: '#dbeafe', fontSize: '14px', marginTop: '6px' }}>
              {tDash.location}: <strong>{getLocalizedDistrict(profile?.district, lang)}, Telangana</strong> | {tDash.education}: <strong>{getLocalizedEducation(profile?.education, lang)}</strong>
            </p>
          </div>
          <Link
            to="/assistant"
            className="btn"
            style={{
              background: '#fff',
              color: 'var(--primary-700)',
              fontWeight: 700,
              flexShrink: 0,
              whiteSpace: 'nowrap',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}
          >
            {tDash.talkAi}
          </Link>
        </div>
      </Card>

      {/* Current Application Card (Phase 16) */}
      <Card style={{ marginBottom: '20px', background: 'var(--surface-card)', borderColor: 'var(--border-warm)' }}>
        {activeApplication ? (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
            <div style={{ flex: 1, minWidth: '240px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary-700)', letterSpacing: '0.5px' }}>
                  {tDash.currentAppTitle}
                </span>
                <span className="badge badge-amber" style={{ fontSize: '11px', fontWeight: 800 }}>
                  {activeApplication.applicationId}
                </span>
                <span className={activeApplication.status === 'ACCEPTED' ? 'badge badge-green' : activeApplication.status === 'ACTION_REQUIRED' ? 'badge badge-amber' : 'badge badge-blue'} style={{ fontSize: '11px', fontWeight: 800 }}>
                  {activeApplication.status === 'ACCEPTED' ? '🎉 Accepted' : activeApplication.status === 'ACTION_REQUIRED' ? '⚠ Action Required' : '🟠 Pending Review'}
                </span>
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: 800, margin: '2px 0 4px 0', color: 'var(--text-main)' }}>
                {activeApplication.courseTitle}
              </h3>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                <strong>Next Action:</strong> {activeApplication.nextAction}
              </div>
            </div>

            <button
              onClick={() => setShowAppModal(true)}
              className="btn btn-primary"
              style={{ fontSize: '13px', padding: '8px 18px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <FileText size={15} /> {tDash.viewApp}
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.5px', marginBottom: '2px' }}>
                {tDash.currentAppTitle}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                {tDash.noAppDesc}
              </div>
            </div>
            <Link to="/training" className="btn btn-secondary btn-sm" style={{ fontSize: '12px', padding: '6px 14px' }}>
              {tDash.exploreTraining} →
            </Link>
          </div>
        )}
      </Card>

      {/* Primary Action & Active Pathway */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        {/* Left: Next Recommended Action */}
        <Card title={tDash.nextAction} style={{ minWidth: 0, position: 'relative' }}>
          {!isUnlocked ? (
            <div style={{ marginTop: '6px', position: 'relative', minHeight: '190px' }}>
              {/* Blurred preview content */}
              <div
                style={{
                  filter: 'blur(5px)',
                  opacity: 0.7,
                  userSelect: 'none',
                  pointerEvents: 'none',
                  padding: '8px 0'
                }}
                aria-hidden="true"
              >
                <div style={{ background: 'var(--surface-subtle)', padding: '14px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span className="badge badge-green">85% {tDash.matchFit}</span>
                    <span className="badge badge-blue">{tDash.nsqfLevel} 3</span>
                  </div>
                  <h4 style={{ fontSize: '16px', fontWeight: 700 }}>{getLocalizedTitle(topOpportunity, lang) || 'Personalized Livelihood Pathway'}</h4>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {getLocalizedSector(topOpportunity?.sector, lang) || 'High-Demand Trade'} • {tDash.estimatedIncome}: ₹15,000 {tDash.to} ₹35,000{tDash.perMonth}
                  </div>
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  {tDash.nextActionDesc}
                </div>
              </div>

              {/* Consistent Lock Overlay */}
              <div style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                padding: '16px',
                background: 'rgba(255, 255, 255, 0.45)',
                backdropFilter: 'blur(3px)',
                WebkitBackdropFilter: 'blur(3px)',
                borderRadius: 'var(--radius-md)'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'rgba(254, 243, 199, 0.95)',
                  color: '#b45309',
                  border: '1px solid rgba(245, 158, 11, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '8px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
                }}>
                  <Lock size={18} />
                </div>
                <div style={{ fontWeight: 800, fontSize: '14px', color: '#1c1917', marginBottom: '4px', maxWidth: '300px' }}>
                  {tDash.unlockPrompt}
                </div>
                <p style={{ fontSize: '12px', color: '#44403c', maxWidth: '290px', marginBottom: '12px', fontWeight: 500, lineHeight: '1.4' }}>
                  {tDash.unlockDesc}
                </p>
                <Link to="/assistant" className="btn btn-primary" style={{ fontSize: '12px', padding: '6px 16px', fontWeight: 700 }}>
                  {tDash.startVoice}
                </Link>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '6px' }}>
              <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                {tDash.nextActionDesc}
              </div>

              {topOpportunity ? (
                <div style={{ background: 'var(--surface-subtle)', padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', flexWrap: 'wrap', gap: '6px' }}>
                    <span className="badge badge-green">{topOpportunity.matchScore || 85}% {tDash.matchFit}</span>
                    <span className="badge badge-blue">{tDash.nsqfLevel} {topOpportunity.nsqfLevel || 3}</span>
                  </div>
                  <h4 style={{ fontSize: '16px', fontWeight: 700 }}>{getLocalizedTitle(topOpportunity, lang)}</h4>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {tDash.estimatedIncome}: ₹{topOpportunity?.incomeRange?.min != null ? topOpportunity.incomeRange.min.toLocaleString() : '10,000'} {tDash.to} ₹{topOpportunity?.incomeRange?.max != null ? topOpportunity.incomeRange.max.toLocaleString() : '18,000'}{tDash.perMonth}
                  </div>
                </div>
              ) : null}

              <Link
                to="/opportunities"
                className="btn btn-primary"
                style={{ alignSelf: 'flex-start', marginTop: '4px' }}
              >
                {tDash.exploreOpportunities} <ArrowRight size={16} />
              </Link>
            </div>
          )}
        </Card>

        {/* Right: Your Identified Profile Competencies */}
        <Card title={tDash.competenciesTitle} style={{ minWidth: 0, position: 'relative' }}>
          <div style={{ marginTop: '6px', position: 'relative', minHeight: '190px' }}>
            {!isUnlocked ? (
              <>
                {/* Blurred card contents */}
                <div
                  style={{
                    filter: 'blur(5px)',
                    opacity: 0.7,
                    userSelect: 'none',
                    pointerEvents: 'none',
                    padding: '8px 0'
                  }}
                  aria-hidden="true"
                >
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
                    <Badge type="blue">{getLocalizedSkill('tractor_farm_machinery', lang)}</Badge>
                    <Badge type="blue">{lang === 'te' ? 'యంత్రాల నిర్వహణ & భద్రత' : lang === 'hi' ? 'मशीनरी संचालन एवं सुरक्षा' : 'Machinery Operation & Safety'}</Badge>
                    <Badge type="blue">{lang === 'te' ? 'సోలార్ పంప్ ఇన్‌స్టాలేషన్' : lang === 'hi' ? 'सोलर पंप स्थापना' : 'Solar Pump Installation'}</Badge>
                    <Badge type="blue">{lang === 'te' ? 'సేంద్రీయ వ్యవసాయం' : lang === 'hi' ? 'जैविक खेती' : 'Organic Cultivation'}</Badge>
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                    {tDash.empPreference}: <strong>{tDash.prefSelf}</strong>
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {tDash.targetIncome}: <strong>₹25,000{tDash.perMonth}</strong>
                  </div>
                </div>

                {/* Consistent Lock Overlay */}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  padding: '16px',
                  background: 'rgba(255, 255, 255, 0.45)',
                  backdropFilter: 'blur(3px)',
                  WebkitBackdropFilter: 'blur(3px)',
                  borderRadius: 'var(--radius-md)'
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'rgba(254, 243, 199, 0.95)',
                    color: '#b45309',
                    border: '1px solid rgba(245, 158, 11, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '8px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
                  }}>
                    <Lock size={18} />
                  </div>
                  <div style={{ fontWeight: 800, fontSize: '14px', color: '#1c1917', marginBottom: '4px', maxWidth: '300px' }}>
                    {tDash.unlockPrompt}
                  </div>
                  <p style={{ fontSize: '12px', color: '#44403c', maxWidth: '290px', marginBottom: '12px', fontWeight: 500, lineHeight: '1.4' }}>
                    {tDash.unlockDesc}
                  </p>
                  <Link to="/assistant" className="btn btn-primary" style={{ fontSize: '12px', padding: '6px 16px', fontWeight: 700 }}>
                    {tDash.startVoice}
                  </Link>
                </div>
              </>
            ) : userSkills.length > 0 ? (
              <div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
                  {userSkills.map((s, idx) => (
                    <Badge key={idx} type="blue">{getLocalizedSkill(s, lang)}</Badge>
                  ))}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  {tDash.empPreference}: <strong>{profile?.employmentPreference === 'self' ? tDash.prefSelf : profile?.employmentPreference === 'wage' ? tDash.prefWage : tDash.prefEither}</strong>
                </div>
                {profile?.incomeGoal && (
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {tDash.targetIncome}: <strong>₹{profile.incomeGoal.toLocaleString()}{tDash.perMonth}</strong>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ color: 'var(--text-muted)', fontSize: '14px', padding: '12px 0' }}>
                {tDash.noSkills}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Top Matched Pathways */}
      {(opportunities || []).length > 0 && (
        <div style={{ minWidth: 0, position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800 }}>{tDash.topPathways}</h3>
            {isUnlocked && (
              <Link to="/opportunities" style={{ color: 'var(--primary-600)', fontWeight: 600, fontSize: '13px' }}>
                {tDash.viewAll(opportunities.length)}
              </Link>
            )}
          </div>

          {!isUnlocked ? (
            /* Blurred Pathways with Lock Overlay */
            <div style={{
              position: 'relative',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-light)',
              boxShadow: 'var(--shadow-sm)',
              background: 'var(--surface-card)',
              overflow: 'hidden',
              padding: '16px'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', filter: 'blur(5px)', opacity: 0.7, pointerEvents: 'none', userSelect: 'none' }}>
                {opportunities.slice(0, 3).map((op, idx) => (
                  <Card key={idx} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: 0, border: '1px solid var(--border-light)' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <Badge type="amber">{tDash.selfEmployment}</Badge>
                        <Badge type="blue">{tDash.nsqfLevel} {op.nsqfLevel || 3}</Badge>
                      </div>
                      <h4 style={{ fontSize: '16px', fontWeight: 700, margin: '4px 0' }}>{getLocalizedTitle(op, lang)}</h4>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px' }}>{getLocalizedSector(op.sector, lang)}</div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary-600)' }}>85% {tDash.matchFitScore}</div>
                    </div>
                  </Card>
                ))}
              </div>

              <div style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(255, 255, 255, 0.45)',
                backdropFilter: 'blur(3px)',
                WebkitBackdropFilter: 'blur(3px)',
                padding: '24px',
                textAlign: 'center'
              }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  background: 'rgba(254, 243, 199, 0.95)',
                  color: '#b45309',
                  border: '1px solid rgba(245, 158, 11, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '10px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
                }}>
                  <Lock size={20} />
                </div>
                <div style={{ fontWeight: 800, fontSize: '16px', color: '#1c1917', marginBottom: '4px' }}>
                  {tDash.unlockPrompt}
                </div>
                <p style={{ fontSize: '13px', color: '#44403c', maxWidth: '440px', margin: 0, fontWeight: 500, lineHeight: '1.5' }}>
                  {tDash.unlockedVoicePrompt}
                </p>
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              {opportunities.slice(0, 3).map((op, idx) => (
                <Card key={op.occupationKey || op.id || idx} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: 0 }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                      <Badge type={op.track === 'self' ? 'amber' : 'green'}>{op.track === 'self' ? tDash.selfEmployment : tDash.wagePlacement}</Badge>
                      <Badge type="blue">{tDash.nsqfLevel} {op.nsqfLevel || 3}</Badge>
                    </div>
                    <h4 style={{ fontSize: '16px', fontWeight: 700, margin: '4px 0' }}>{getLocalizedTitle(op, lang)}</h4>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '10px' }}>{getLocalizedSector(op.sector, lang)}</div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary-600)' }}>{op.matchScore || 85}% {tDash.matchFitScore}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '14px', flexWrap: 'wrap' }}>
                    <Link
                      to={`/skill-gaps?occ=${op.occupationKey || ''}`}
                      onClick={() => op.occupationKey && api.setSelectedOccupation(op.occupationKey)}
                      className="btn btn-secondary"
                      style={{ fontSize: '12px', padding: '6px 10px', flex: 1, minWidth: '100px', textAlign: 'center' }}
                    >
                      {tDash.skillGaps}
                    </Link>
                    <Link
                      to={`/roadmap?occ=${op.occupationKey || ''}`}
                      onClick={() => op.occupationKey && api.setSelectedOccupation(op.occupationKey)}
                      className="btn btn-primary"
                      style={{ fontSize: '12px', padding: '6px 10px', flex: 1, minWidth: '100px', textAlign: 'center' }}
                    >
                      {tDash.roadmap}
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {showAppModal && activeApplication && (
        <EnrollmentModal
          isOpen={showAppModal}
          onClose={() => setShowAppModal(false)}
          initialMode="view"
          existingApplication={activeApplication}
          onApplicationUpdated={(upApp) => setActiveApplication(upApp)}
        />
      )}
    </div>
  );
};
export default Dashboard;
