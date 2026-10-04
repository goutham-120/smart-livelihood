import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { useLang } from '../lang';
import { ArrowRight, ChevronDown, ChevronUp, MapPin, Award, Building, Sparkles } from 'lucide-react';


const OPP_CONTENT = {
  en: {
    title: 'Tailored Livelihood Pathways',
    subtitle: 'NSQF aligned opportunities matched with verified district market demand',
    allTracks: 'All Tracks',
    microEnterprise: 'Micro Enterprise (Self)',
    wageEmployment: 'Wage Employment',
    calculating: 'Calculating personalized opportunity matches...',
    noFound: 'No opportunities found for this filter',
    noFoundSub: 'Try switching to "All Tracks" or refresh the opportunities list.',
    showAll: 'Show All Opportunities',
    selfTrack: 'Self Employment Track',
    wageTrack: 'Wage Placement Track',
    matchFit: 'Match Fit',
    estIncome: 'Est. Income',
    to: 'to',
    sectorLabel: 'Sector',
    nsqfLabel: 'NSQF Level',
    districtDemandLevel: 'District Demand Level:',
    level: 'Level',
    whyMatchScore: 'Why this match score?',
    nearbyCenters: (count) => `Nearby Training Centers (${count})`,
    applicableSchemes: 'Applicable PM Support Schemes',
    skillGaps: 'Skill Gaps',
    roadmap: 'Roadmap',
    selfEmployment: 'Self Employment'
  },
  hi: {
    title: 'अनुकूलित आजीविका के अवसर',
    subtitle: 'जिला बाजार मांग से मेल खाते NSQF संरेखित अवसर',
    allTracks: 'सभी ट्रैक',
    microEnterprise: 'सूक्ष्म उद्यम (स्वरोज़गार)',
    wageEmployment: 'वेतन रोज़गार',
    calculating: 'व्यक्तिगत अवसरों की गणना की जा रही है...',
    noFound: 'इस फ़िल्टर के लिए कोई अवसर नहीं मिला',
    noFoundSub: '"सभी ट्रैक" पर स्विच करने या सूची को रीफ़्रेश करने का प्रयास करें।',
    showAll: 'सभी अवसर दिखाएं',
    selfTrack: 'स्वरोज़गार ट्रैक',
    wageTrack: 'वेतन रोज़गार ट्रैक',
    matchFit: 'मैच फिट',
    estIncome: 'अनुमानित आय',
    to: 'से',
    sectorLabel: 'क्षेत्र',
    nsqfLabel: 'NSQF स्तर',
    districtDemandLevel: 'ज़िला मांग स्तर:',
    level: 'स्तर',
    whyMatchScore: 'यह मैच स्कोर क्यों?',
    nearbyCenters: (count) => `निकटतम प्रशिक्षण केंद्र (${count})`,
    applicableSchemes: 'लागू पीएम सहायता योजनाएं',
    skillGaps: 'कौशल अंतर',
    roadmap: 'रोडमैप',
    selfEmployment: 'स्वरोज़गार'
  },
  te: {
    title: 'వ్యక్తిగతీకరించిన ఉపాధి మార్గాలు',
    subtitle: 'జిల్లా మార్కెట్ డిమాండ్‌తో సరిపోలిన NSQF అధీకృత అవకాశాలు',
    allTracks: 'అన్ని రంగాలు',
    microEnterprise: 'సూక్ష్మ పరిశ్రమ (స్వయం ఉపాధి)',
    wageEmployment: 'వేతన ఉపాధి (ఉద్యోగం)',
    calculating: 'వ్యక్తిగతీకరించిన అవకాశాలను లెక్కిస్తోంది...',
    noFound: 'ఈ ఫిల్టర్‌కి సరిపోలే అవకాశాలు కనుగొనబడలేదు',
    noFoundSub: '"అన్ని రంగాలు" ఎంచుకోండి లేదా జాబితాను రీఫ్రెష్ చేయండి.',
    showAll: 'అన్ని అవకాశాలను చూపించండి',
    selfTrack: 'స్వయం ఉపాధి విభాగం',
    wageTrack: 'వేతన ఉద్యోగ విభాగం',
    matchFit: 'సరిపోలిక',
    estIncome: 'అంచనా ఆదాయం',
    to: 'నుండి',
    sectorLabel: 'రంగం',
    nsqfLabel: 'NSQF స్థాయి',
    districtDemandLevel: 'జిల్లా డిమాండ్ స్థాయి:',
    level: 'స్థాయి',
    whyMatchScore: 'ఈ మ్యాచ్ స్కోర్ ఎందుకు?',
    nearbyCenters: (count) => `సమీప శిక్షణా కేంద్రాలు (${count})`,
    applicableSchemes: 'వర్తించే పీఎం సహాయ పథకాలు',
    skillGaps: 'నైపుణ్య అంతరాలు',
    roadmap: 'రోడ్‌మ్యాప్',
    selfEmployment: 'స్వయం ఉపాధి'
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
    'Logistics': 'लॉजिस्टिक्स एवं आपूर्ति'
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
    'Logistics': 'లాజిస్టిక్స్ & రవాణా'
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

const CENTER_TRANSLATIONS = {
  hi: {
    'Government ITI Warangal (Boys & Girls)': 'राजकीय आईटीआई वारंगल (छात्र एवं छात्राएं)',
    'Pradhan Mantri Kaushal Kendra (PMKK) Hanamkonda': 'प्रधानमंत्री कौशल केंद्र (PMKK) हनमकोंडा',
    'Warangal District Rural Development Society (DRDA) Skilling Center': 'वारंगल जिला ग्रामीण विकास समिति (DRDA) कौशल केंद्र',
    'SETWAR Youth Training & Skilling Academy Kazipet': 'सेटवार युवा प्रशिक्षण एवं कौशल अकादमी काजीपेट',
    'Krishi Vigyan Kendra (KVK) Malyal Warangal': 'कृषि विज्ञान केंद्र (KVK) माल्याल वारंगल',
    'Telangana State Dairy Training Center Narsampet': 'तेलंगाना राज्य डेयरी प्रशिक्षण केंद्र नरसंपेट',
    'National Institute of Technology (NIT) Community Outreach & Skilling Cell': 'राष्ट्रीय प्रौद्योगिकी संस्थान (NIT) सामुदायिक कौशल प्रकोष्ठ',
    'Kakatiya Mahila Rural Livelihood Center Parkal': 'काकतीय महिला ग्रामीण आजीविका केंद्र परकल',
    'TSCOST Regional Science & Renewable Energy Center Hanamkonda': 'टीएससीओएसटी क्षेत्रीय विज्ञान एवं नवीकरणीय ऊर्जा केंद्र हनमकोंडा',
    'Apollo MedSkills Healthcare Training Academy Warangal': 'अपोलो मेडस्किल्स स्वास्थ्य सेवा प्रशिक्षण अकादमी वारंगल',
    'Jan Shikshan Sansthan (JSS) Warangal': 'जन शिक्षण संस्थान (JSS) वारंगल',
    'Warangal Construction Trades Training Center Hasanparthy': 'वारंगल निर्माण व्यवसाय प्रशिक्षण केंद्र हसनपर्थी',
    'Telangana Handloom Weavers Cooperative (TSCO) Center Shayampet': 'तेलंगाना हथकरघा बुनकर सहकारी (TSCO) केंद्र श्यामपेटा',
    'District Agro Processing & Spices Hub Geesugonda': 'जिला कृषि प्रसंस्करण एवं मसाला केंद्र गीसुगोंडा',
    'Rural Retail & Logistics Skill Hub Wardhannapet': 'ग्रामीण खुदरा एवं लॉजिस्टिक्स कौशल केंद्र वर्धन्नापेट',
    'Warangal Electronics Repair & IT Hub Subedari': 'वारंगल इलेक्ट्रॉनिक्स मरम्मत एवं आईटी हब सुबेदारी',
    'Horticulture Research & Polyhouse Training Center Mulugu Road': 'बागवानी अनुसंधान एवं पॉलीहाउस प्रशिक्षण केंद्र मुलुगु रोड',
    'Animal Husbandry Poly Clinic & Training Center Pochamma Maidan': 'पशुपालन पॉली क्लिनिक एवं प्रशिक्षण केंद्र पोचम्मा मैदान',
    'Warangal District Cooperative Central Bank Training Institute (DCCB)': 'वारंगल जिला सहकारी केंद्रीय बैंक प्रशिक्षण संस्थान (DCCB)',
    'Mamnoor Aviation & Electrical Vocational Training Wing': 'मामनूर विमानन एवं विद्युत व्यावसायिक प्रशिक्षण विंग',
    'Government ITI Adilabad': 'राजकीय आईटीआई आदिलाबाद',
    'Pradhan Mantri Kaushal Kendra (PMKK) Adilabad Town': 'प्रधानमंत्री कौशल केंद्र (PMKK) आदिलाबाद शहर',
    'Adilabad District Tribal Welfare & Livelihoods Center Utnoor': 'आदिलाबाद जिला जनजातीय कल्याण एवं आजीविका केंद्र उत्नूर',
    'Krishi Vigyan Kendra (KVK) Adilabad': 'कृषि विज्ञान केंद्र (KVK) आदिलाबाद',
    'Jan Shikshan Sansthan (JSS) Adilabad': 'जन शिक्षण संस्थान (JSS) आदिलाबाद',
    'RSETI (Rural Self Employment Training Institute) Adilabad': 'ग्रामीण स्वरोज़गार प्रशिक्षण संस्थान (RSETI) आदिलाबाद',
    'Adilabad Cotton & Ginning Skills Institute Mavala': 'आदिलाबाद कपास एवं जिनिंग कौशल संस्थान मावला',
    'Bela Block Agro & Dairy Skilling Center': 'बेला ब्लॉक कृषि एवं डेयरी कौशल केंद्र',
    'Indervelly Tribal Artisan & Weaving Hub': 'इंदरवेल्ली जनजातीय कारीगर एवं बुनकर केंद्र',
    'Boath Horticulture & Nursery Training Center': 'बोथ बागवानी एवं नर्सरी प्रशिक्षण केंद्र',
    'Adilabad District Area Hospital Paramedical Training Wing': 'आदिलाबाद जिला क्षेत्र अस्पताल पैरामेडिकल प्रशिक्षण विंग',
    'Gudur Solar & Renewable Energy Training Center': 'गुडूर सौर एवं नवीकरणीय ऊर्जा प्रशिक्षण केंद्र',
    'Narnoor Community Skilling Hub': 'नारनूर सामुदायिक कौशल केंद्र',
    'Tamsi Organic Bio-Fertilizer Training Unit': 'तामसी जैविक जैव-उर्वरक प्रशिक्षण इकाई',
    'Jainath Farm Equipment Service Training Center': 'जैनथ कृषि उपकरण सेवा प्रशिक्षण केंद्र',
    'Adilabad CSC Academy & Digital Service Center': 'आदिलाबाद सीएससी अकादमी एवं डिजिटल सेवा केंद्र',
    'Bazarhathnoor Forest Produce Processing Center': 'बाजारहाथनूर वनोपज प्रसंस्करण केंद्र',
    'Adilabad Construction & Masonry Training Yard Dasnapur': 'आदिलाबाद निर्माण एवं चिनाई प्रशिक्षण यार्ड दसनापुर',
    'Sirikonda Animal Husbandry & Sheep Breeding Station': 'सिरिकोंडा पशुपालन एवं भेड़ प्रजनन केंद्र',
    'Adilabad Multi-Skill Women Development Center Collectorate Road': 'आदिलाबाद बहु-कौशल महिला विकास केंद्र कलेक्टरेट रोड',
    'Government ITI Nalgonda': 'राजकीय आईटीआई नलगोंडा',
    'Pradhan Mantri Kaushal Kendra (PMKK) Nalgonda Clock Tower': 'प्रधानमंत्री कौशल केंद्र (PMKK) नलगोंडा क्लॉक टॉवर',
    'RSETI State Bank of India Nalgonda': 'आरसेटी भारतीय स्टेट बैंक नलगोंडा',
    'Krishi Vigyan Kendra (KVK) Kampasagar Nalgonda': 'कृषि विज्ञान केंद्र (KVK) कंपासागर नलगोंडा',
    'Pochampally Handloom Park & Skill Center (Near Choutuppal)': 'पोचमपल्ली हथकरघा पार्क एवं कौशल केंद्र (चौटुप्पल के पास)',
    'Miryalaguda Rice Mill & Industrial Equipment Training Center': 'मिर्यालगुडा राइस मिल एवं औद्योगिक उपकरण प्रशिक्षण केंद्र',
    'Nalgonda District Dairy Cooperative Training Unit Tipparthy': 'नलगोंडा जिला डेयरी सहकारी प्रशिक्षण इकाई तिपार्थी',
    'Devarakonda Tribal Livelihood & Skilling Center': 'देवराकोंडा जनजातीय आजीविका एवं कौशल केंद्र',
    'Nagarjuna Sagar Solar Training & Demonstration Center': 'नागार्जुन सागर सौर प्रशिक्षण एवं प्रदर्शन केंद्र',
    'Nalgonda Government General Hospital Skill Center': 'नलगोंडा राजकीय सामान्य अस्पताल कौशल केंद्र'
  },
  te: {
    'Government ITI Warangal (Boys & Girls)': 'ప్రభుత్వ ITI వరంగల్ (బాలురు & బాలికలు)',
    'Pradhan Mantri Kaushal Kendra (PMKK) Hanamkonda': 'ప్రధాన మంత్రి కౌశల్ కేంద్రం (PMKK) హనుమకొండ',
    'Warangal District Rural Development Society (DRDA) Skilling Center': 'వరంగల్ జిల్లా గ్రామీణాభివృద్ధి సంస్థ (DRDA) శిక్షణా కేంద్రం',
    'SETWAR Youth Training & Skilling Academy Kazipet': 'సెట్వార్ (SETWAR) యువజన శిక్షణా అకాడమీ కాజీపేట',
    'Krishi Vigyan Kendra (KVK) Malyal Warangal': 'కృషి విజ్ఞాన కేంద్రం (KVK) మాల్యాల్ వరంగల్',
    'Telangana State Dairy Training Center Narsampet': 'తెలంగాణ రాష్ట్ర పాడి పరిశ్రమ శిక్షణా కేంద్రం నర్సంపేట',
    'National Institute of Technology (NIT) Community Outreach & Skilling Cell': 'నేషనల్ ఇన్‌స్టిట్యూట్ ఆఫ్ టెక్నాలజీ (NIT) కమ్యూనిటీ స్కిల్లింగ్ విభాగం',
    'Kakatiya Mahila Rural Livelihood Center Parkal': 'కాకతీయ మహిళా గ్రామీణ జీవనోపాధి కేంద్రం పరకాల',
    'TSCOST Regional Science & Renewable Energy Center Hanamkonda': 'టీఎస్‌కాస్ట్ రీజినల్ సైన్స్ & రెన్యూవబుల్ ఎనర్జీ సెంటర్ హనుమకొండ',
    'Apollo MedSkills Healthcare Training Academy Warangal': 'అపోలో మెడ్‌స్కిల్స్ హెల్త్‌కేర్ ట్రైనింగ్ అకాడమీ వరంగల్',
    'Jan Shikshan Sansthan (JSS) Warangal': 'జన్ శిక్షణ్ సంస్థాన్ (JSS) వరంగల్',
    'Warangal Construction Trades Training Center Hasanparthy': 'వరంగల్ నిర్మాణ రంగ శిక్షణా కేంద్రం హసన్‌పర్తి',
    'Telangana Handloom Weavers Cooperative (TSCO) Center Shayampet': 'తెలంగాణ చేనేత కార్మికుల సహకార సంఘం (TSCO) కేంద్రం శాయంపేట',
    'District Agro Processing & Spices Hub Geesugonda': 'జిల్లా వ్యవసాయ శుద్ధి & సుగంధ ద్రవ్యాల కేంద్రం గీసుగొండ',
    'Rural Retail & Logistics Skill Hub Wardhannapet': 'గ్రామీణ రిటైల్ & లాజిస్టిక్స్ స్కిల్ హబ్ వర్ధన్నపేట',
    'Warangal Electronics Repair & IT Hub Subedari': 'వరంగల్ ఎలక్ట్రానిక్స్ రిపేర్ & ఐటీ హబ్ సుబేదారి',
    'Horticulture Research & Polyhouse Training Center Mulugu Road': 'ఉద్యానవన పరిశోధన & పాలీహౌస్ శిక్షణా కేంద్రం ములుగు రోడ్',
    'Animal Husbandry Poly Clinic & Training Center Pochamma Maidan': 'పశుసంవర్ధక పాలీ క్లినిక్ & శిక్షణా కేంద్రం పోచమ్మ మైదాన్',
    'Warangal District Cooperative Central Bank Training Institute (DCCB)': 'వరంగల్ జిల్లా సహకార కేంద్ర బ్యాంకు శిక్షణా సంస్థ (DCCB)',
    'Mamnoor Aviation & Electrical Vocational Training Wing': 'మామ్నూర్ ఏవియేషన్ & ఎలక్ట్రికల్ వృత్తి విద్యా విభాగం',
    'Government ITI Adilabad': 'ప్రభుత్వ ITI ఆదిలాబాద్',
    'Pradhan Mantri Kaushal Kendra (PMKK) Adilabad Town': 'ప్రధాన మంత్రి కౌశల్ కేంద్రం (PMKK) ఆదిలాబాద్ టౌన్',
    'Adilabad District Tribal Welfare & Livelihoods Center Utnoor': 'ఆదిలాబాద్ జిల్లా గిరిజన సంక్షేమ & జీవనోపాధి కేంద్రం ఉట్నూర్',
    'Krishi Vigyan Kendra (KVK) Adilabad': 'కృషి విజ్ఞాన కేంద్రం (KVK) ఆదిలాబాద్',
    'Jan Shikshan Sansthan (JSS) Adilabad': 'జన్ శిక్షణ్ సంస్థాన్ (JSS) ఆదిలాబాద్',
    'RSETI (Rural Self Employment Training Institute) Adilabad': 'గ్రామీణ స్వయం ఉపాధి శిక్షణా సంస్థ (RSETI) ఆదిలాబాద్',
    'Adilabad Cotton & Ginning Skills Institute Mavala': 'ఆదిలాబాద్ కాటన్ & జిన్నింగ్ స్కిల్స్ ఇన్స్టిట్యూట్ మావల',
    'Bela Block Agro & Dairy Skilling Center': 'బేలా బ్లాక్ వ్యవసాయ & పాడి శిక్షణా కేంద్రం',
    'Indervelly Tribal Artisan & Weaving Hub': 'ఇంద్రవెల్లి గిరిజన కళాకారుల & చేనేత కేంద్రం',
    'Boath Horticulture & Nursery Training Center': 'బోథ్ ఉద్యానవన & నర్సరీ శిక్షణా కేంద్రం',
    'Adilabad District Area Hospital Paramedical Training Wing': 'ఆదిలాబాద్ జిల్లా ఆసుపత్రి పారామెడికల్ శిక్షణా విభాగం',
    'Gudur Solar & Renewable Energy Training Center': 'గూడూర్ సోలార్ & పునరుత్పాదక ఇంధన శిక్షణా కేంద్రం',
    'Narnoor Community Skilling Hub': 'నార్నూర్ కమ్యూనిటీ స్కిల్లింగ్ హబ్',
    'Tamsi Organic Bio-Fertilizer Training Unit': 'తాంసి సేంద్రీయ బయో-ఎరువుల శిక్షణా విభాగం',
    'Jainath Farm Equipment Service Training Center': 'జైనథ్ వ్యవసాయ పరికరాల సర్వీస్ శిక్షణా కేంద్రం',
    'Adilabad CSC Academy & Digital Service Center': 'ఆదిలాబాద్ CSC అకాడమీ & డిజిటల్ సర్వీస్ సెంటర్',
    'Bazarhathnoor Forest Produce Processing Center': 'బజార్‌హత్నూర్ అటవీ ఉత్పత్తుల శుద్ధి కేంద్రం',
    'Adilabad Construction & Masonry Training Yard Dasnapur': 'ఆదిలాబాద్ నిర్మాణ & మేస్త్రీ శిక్షణా యార్డ్ దాస్నాపూర్',
    'Sirikonda Animal Husbandry & Sheep Breeding Station': 'సిరికొండ పశుసంవర్ధక & గొర్రెల పెంపకం కేంద్రం',
    'Adilabad Multi-Skill Women Development Center Collectorate Road': 'ఆదిలాబాద్ బహుళ-నైపుణ్య మహిళా అభివృద్ధి కేంద్రం కలెక్టరేట్ రోడ్',
    'Government ITI Nalgonda': 'ప్రభుత్వ ITI నల్గొండ',
    'Pradhan Mantri Kaushal Kendra (PMKK) Nalgonda Clock Tower': 'ప్రధాన మంత్రి కౌశల్ కేంద్రం (PMKK) నల్గొండ క్లాక్ టవర్',
    'RSETI State Bank of India Nalgonda': 'స్టేట్ బ్యాంక్ ఆఫ్ ఇండియా RSETI నల్గొండ',
    'Krishi Vigyan Kendra (KVK) Kampasagar Nalgonda': 'కృషి విజ్ఞాన కేంద్రం (KVK) కంపసాగర్ నల్గొండ',
    'Pochampally Handloom Park & Skill Center (Near Choutuppal)': 'పోచంపల్లి చేనేత పార్క్ & స్కిల్ సెంటర్ (చౌటుప్పల్ వద్ద)',
    'Miryalaguda Rice Mill & Industrial Equipment Training Center': 'మిర్యాలగూడ రైస్ మిల్ & పారిశ్రామిక పరికరాల శిక్షణా కేంద్రం',
    'Nalgonda District Dairy Cooperative Training Unit Tipparthy': 'నల్గొండ జిల్లా పాల సహకార శిక్షణా విభాగం తిప్పర్తి',
    'Devarakonda Tribal Livelihood & Skilling Center': 'దేవరకొండ గిరిజన జీవనోపాధి & నైపుణ్య కేంద్రం',
    'Nagarjuna Sagar Solar Training & Demonstration Center': 'నాగార్జున సాగర్ సోలార్ ట్రైనింగ్ & ప్రదర్శన కేంద్రం',
    'Nalgonda Government General Hospital Skill Center': 'నల్గొండ ప్రభుత్వ సాధారణ ఆసుపత్రి స్కిల్ సెంటర్'
  }
};

const BREAKDOWN_FACTORS = {
  hi: {
    'Skill Overlap': 'कौशल समानता',
    'District Demand': 'जिला मांग',
    'Educational Fit': 'शैक्षणिक योग्यता',
    'Self Employment Feasibility': 'स्वरोज़गार व्यवहार्यता',
    'Work Mode Preference': 'कार्य प्रणाली वरीयता'
  },
  te: {
    'Skill Overlap': 'నైపుణ్యాల సరిపోలిక',
    'District Demand': 'జిల్లా డిమాండ్',
    'Educational Fit': 'విద్యార్హత సరిపోలిక',
    'Self Employment Feasibility': 'స్వయం ఉపాధి సాధ్యత',
    'Work Mode Preference': 'పని ప్రాధాన్యత'
  }
};

const getLocalizedTitle = (op, lang) => {
  if (lang === 'en') return op.title;
  if (op.titles && op.titles[lang]) return op.titles[lang];
  const occKey = op.occupationKey || op.key || op.id;
  if (OCCUPATION_TITLES[lang]?.[occKey]) return OCCUPATION_TITLES[lang][occKey];
  if (OCCUPATION_TITLES[lang]?.[op.title]) return OCCUPATION_TITLES[lang][op.title];
  return op.title;
};

const getLocalizedSector = (sector, lang) => {
  if (lang === 'en' || !sector) return sector;
  return SECTOR_TRANSLATIONS[lang]?.[sector] || sector;
};

const getLocalizedCenterName = (name, lang) => {
  if (lang === 'en' || !name) return name;
  return CENTER_TRANSLATIONS[lang]?.[name] || name;
};

const getLocalizedDistrict = (district, lang) => {
  if (lang === 'en' || !district) return district;
  return DISTRICT_TRANSLATIONS[lang]?.[district] || district;
};

const getLocalizedFactor = (factor, lang) => {
  if (lang === 'en' || !factor) return factor;
  return BREAKDOWN_FACTORS[lang]?.[factor] || factor;
};

export const Opportunities = () => {
  const { lang } = useLang();
  const tOpp = OPP_CONTENT[lang] || OPP_CONTENT.en;
  const [opportunities, setOpportunities] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [expandedBreakdown, setExpandedBreakdown] = useState({});

  useEffect(() => {
    (async () => {
      try {
        const res = await api.getOpportunities();
        const payload = res?.data || res;
        setOpportunities(payload?.opportunities || (Array.isArray(payload) ? payload : []));
      } catch (err) {
        console.error('Failed to load opportunities:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const toggleBreakdown = (key) => {
    setExpandedBreakdown((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const filtered = opportunities.filter((op) => {
    if (filter === 'wage') return op.track === 'wage';
    if (filter === 'self') return op.track === 'self';
    return true;
  });

  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800 }}>{tOpp.title}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            {tOpp.subtitle}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => setFilter('all')} className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}>{tOpp.allTracks}</button>
          <button onClick={() => setFilter('self')} className={`btn ${filter === 'self' ? 'btn-primary' : 'btn-secondary'}`}>{tOpp.microEnterprise}</button>
          <button onClick={() => setFilter('wage')} className={`btn ${filter === 'wage' ? 'btn-primary' : 'btn-secondary'}`}>{tOpp.wageEmployment}</button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>{tOpp.calculating}</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--surface-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>{tOpp.noFound}</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '16px' }}>{tOpp.noFoundSub}</p>
          <button onClick={() => setFilter('all')} className="btn btn-primary">{tOpp.showAll}</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {filtered.map((op) => {
            const occKey = op.occupationKey || op.id;
            const isExpanded = !!expandedBreakdown[occKey];

            return (
              <div key={occKey} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: 0 }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                    <span className={`badge ${op.track === 'self' ? 'badge-amber' : 'badge-green'}`}>
                      {op.track === 'self' ? tOpp.selfTrack : tOpp.wageTrack}
                    </span>
                    <span className="badge badge-blue">{tOpp.nsqfLabel} {op.nsqfLevel}</span>
                  </div>

                  <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '8px 0 4px 0' }}>{getLocalizedTitle(op, lang)}</h3>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                    {tOpp.sectorLabel}: {getLocalizedSector(op.sector, lang)} • NCO Code: {op.ncoCode || '7531'}
                  </div>

                  <div style={{ background: 'var(--surface-subtle)', padding: '12px 14px', borderRadius: 'var(--radius-md)', marginBottom: '14px', border: '1px solid var(--border-light)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>{tOpp.matchFit}:</span>
                      <strong style={{ color: 'var(--primary-600)', fontSize: '15px' }}>{op.matchScore}%</strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>{tOpp.estIncome}:</span>
                      <strong>₹{op.incomeRange?.min?.toLocaleString()} {tOpp.to} ₹{op.incomeRange?.max?.toLocaleString()}</strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                      <span style={{ color: 'var(--text-muted)' }}>{tOpp.districtDemandLevel}</span>
                      <span className="badge badge-green" style={{ fontSize: '11px', padding: '2px 6px' }}>
                        {tOpp.level} {op.demand?.level} / 5
                      </span>
                    </div>

                    <button
                      onClick={() => toggleBreakdown(occKey)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--primary-600)',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        marginTop: '10px',
                        padding: 0
                      }}
                    >
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />} {tOpp.whyMatchScore}
                    </button>

                    {isExpanded && (
                      <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {op.breakdown?.map((item, idx) => (
                          <div key={idx} style={{ fontSize: '11px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                              <span>{getLocalizedFactor(item.factor, lang)} ({item.weight}):</span>
                              <span style={{ color: 'var(--primary-600)' }}>{item.score}%</span>
                            </div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '10px' }}>{item.note}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {op.centers && op.centers.length > 0 && (
                    <div style={{ marginBottom: '12px', fontSize: '12px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                        <Building size={14} color="var(--primary-600)" /> {tOpp.nearbyCenters(op.centers.length)}
                      </div>
                      <ul style={{ listStyle: 'none', paddingLeft: '18px', color: 'var(--text-muted)' }}>
                        {op.centers.map((c, i) => (
                          <li key={i} style={{ marginBottom: '2px' }}>
                            • {getLocalizedCenterName(c.name, lang)} ({getLocalizedDistrict(c.district, lang)})
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {op.schemes && op.schemes.length > 0 && (
                    <div style={{ marginBottom: '14px', fontSize: '12px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                        <Award size={14} color="var(--accent-gold)" /> {tOpp.applicableSchemes}
                      </div>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {op.schemes.map((s, i) => (
                          <span key={i} className="badge badge-amber" style={{ fontSize: '10px' }}>
                            {s.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: op.track === 'self' ? '1fr 1fr 1fr' : '1fr 1fr', gap: '6px', marginTop: '12px' }}>
                  <Link to={`/skill-gaps?occ=${occKey}`} className="btn btn-secondary" style={{ fontSize: '11px', padding: '6px 8px' }}>
                    {tOpp.skillGaps}
                  </Link>
                  <Link to={`/roadmap?occ=${occKey}`} className="btn btn-primary" style={{ fontSize: '11px', padding: '6px 8px' }}>
                    {tOpp.roadmap} <ArrowRight size={12} />
                  </Link>
                  {op.track === 'self' && (
                    <Link to={`/self-employment?occ=${occKey}`} className="btn btn-secondary" style={{ fontSize: '11px', padding: '6px 8px', borderColor: 'var(--accent-gold)', color: 'var(--accent-gold)' }}>
                      {tOpp.selfEmployment}
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

