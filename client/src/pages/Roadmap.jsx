import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useLang } from '../lang';
import {
  Clock, ArrowRight, MapPin, Building, Award, CheckCircle, AlertCircle,
  Phone, HelpCircle, ChevronDown, ChevronUp, Mic, FileText, Check,
  Briefcase, IndianRupee, ShieldCheck, Sparkles, Navigation, X, Info, BookOpen
} from 'lucide-react';
import { EnrollmentModal } from '../components.jsx';

const ROADMAP_CONTENT = {
  en: {
    loading: 'Building your personalized livelihood roadmap...',
    heading: 'Your Step-by-Step Livelihood Journey',
    subheading: 'Actionable plan based on your existing skills and local livelihood opportunities',
    targetPathway: 'TARGET LIVELIHOOD PATHWAY',
    sector: 'Sector',
    targetNsqf: 'Skill Level',
    readinessScore: 'Skill Readiness',
    estDuration: 'Estimated Journey',
    months: 'Months',
    month: 'Month',
    readinessExpl: 'Your current skills compared with the skills needed for this livelihood.',
    whatIsNsqf: 'What is NSQF?',
    nsqfModalTitle: 'Understanding NSQF (National Skills Qualifications Framework)',
    nsqfExplanation: "NSQF is India's framework that organizes qualifications into different levels based on the practical knowledge and skills required for a job. It is NOT an exam grade or school marks system. A higher level simply indicates more advanced technical competencies and operational responsibility.",
    closeBtn: 'Close',

    // Next Action Hero
    nextActionTitle: 'YOUR NEXT RECOMMENDED ACTION',
    nextActionBadge: 'Immediate Step',
    freeCourseBadge: '100% Free / Govt. Sponsored (PM-AJAY & PMKVY)',
    eligibleStatus: 'Eligible to Apply',
    enrollBtn: 'Apply for Training',
    viewAppBtn: 'View Application Status',
    callBtn: 'Call Center',
    directionsBtn: 'Get Directions',
    batchStarts: 'Next Batch Starts',
    courseDuration: 'Duration',
    trainingFee: 'Course Fee',
    freeFee: '₹0 (100% Free Govt. Grant)',
    provider: 'Provider',
    qualification: 'Qualification',
    locationLabel: 'Location',
    approxDistance: 'Approx. Distance',

    // Eligibility Check
    eligibilityTitle: 'Am I Eligible?',
    eligibilitySubtitle: 'Quick verification based on official program requirements',
    ageReq: 'Age 18 years or above',
    eduReq: 'Minimum education requirement met',
    locReq: 'Local resident of district/state',
    expReq: 'Prior trade familiarity / manual experience',
    docReq: 'Aadhaar and bank account ready',
    eligibleSummary: 'You meet the eligibility criteria to enroll in this pathway.',
    oneReqRemaining: '1 requirement remaining (Keep Aadhaar-linked bank passbook ready)',

    // Documents
    docsTitle: 'Documents Required for Enrollment',
    docsSubtitle: 'Keep original and 2 photocopies ready when visiting the center',
    whatAreDocs: 'Why are these documents needed?',
    docAadhaar: 'Aadhaar Card',
    docAadhaarWhy: 'For biometric identification and registration on the Skill India portal.',
    docPhone: 'Mobile Number Linked to Aadhaar',
    docPhoneWhy: 'To receive official batch confirmations, OTPs, and digital certificates.',
    docBank: 'Bank Account Passbook',
    docBankWhy: 'For direct DBT transfer of government stipends and travel allowances.',
    docEdu: 'School / Intermediate Certificate',
    docEduWhy: 'Proof of basic literacy or completed school education standard.',
    docPhoto: 'Passport Size Photographs (4)',
    docPhotoWhy: 'For official training center admission record and identity badge.',

    // 6-Step Journey
    journeyTitle: 'Your 6-Step Actionable Livelihood Journey',
    step1Title: 'Step 1: Understand Your Skill Gaps',
    step1Desc: 'You already have valuable practical experience. These are the specific technical skills to develop for this livelihood.',
    currentSkills: 'Current Skills You Have',
    skillsToDevelop: 'Skills You Will Learn',
    viewSkillGapsBtn: 'View Detailed Skill Gaps →',

    step2Title: 'Step 2: Complete Certified Training',
    step2Desc: 'Undergo practical hands-on training at an accredited district center with modern workshops.',
    goToTrainingBtn: 'View Certified Training Section →',
    nearestCenters: 'Accredited Training Centers in Your District',
    sortBy: 'Sort by:',
    sortDistance: 'Nearest Distance',
    sortBatch: 'Earliest Batch',
    sortMatch: 'Best Match',
    languagesSupported: 'Languages Supported',
    modeLabel: 'Training Mode',
    modeOffline: 'Classroom & Workshop Practical',

    step3Title: 'Step 3: Assessment and Certification',
    step3Desc: 'After completing the required training, you will complete a practical trade assessment. When you meet the qualification requirements, you receive an official skill certificate from the Sector Skill Council.',
    certNote: 'Note: The Sector Skill Council conducts the assessment and awards the qualification certificate aligned to the NSQF framework.',
    certChain: 'Training Course → Practical Assessment → Official Digital Certificate',

    step4Title: 'Step 4: Employment OR Self-Employment',
    step4Desc: 'Choose whether you want to take up a wage employment job or start your own micro-enterprise business.',
    pathA: 'PATH A — FIND A JOB (WAGE EMPLOYMENT)',
    pathADesc: 'Verified job openings with employers in your district and cluster:',
    viewJobBtn: 'Apply / Contact Employer',
    openingsCount: 'Openings Available',
    monthlyWage: 'Monthly Salary',

    pathB: 'PATH B — START YOUR OWN BUSINESS (SELF-EMPLOYMENT)',
    pathBDesc: 'Launch a local service or workshop unit with government support and equipment grants.',
    equipmentReq: 'Basic Tools Required',
    approxStartupCost: 'Approx. Startup Cost',
    targetCustomers: 'Target Customers',
    exploreSelfEmpBtn: 'Explore Micro-Enterprise Guide →',

    step5Title: 'Step 5: Possible Earnings',
    step5Desc: 'Realistic livelihood income range based on local market wage rates and trade benchmarks.',
    estEarningRange: 'Estimated Earning Range',
    incomeDisclaimer: 'Actual income may vary depending on location, experience, demand, working hours, employer/customer base and other local factors.',
    wageIncomeEst: 'Wage Employment Range',
    selfEmpIncomeEst: 'Self-Employment Potential',
    revenueLabel: 'Monthly Revenue',
    operatingCostLabel: 'Operating Costs',
    netIncomeLabel: 'Potential Net Take-Home',

    step6Title: 'Step 6: Track Your Milestones',
    step6Desc: 'Your real-time progress across each milestone of your PM-AJAY livelihood pathway.',
    overallProgress: 'Journey Completed',
    activeMilestones: 'Pathway Milestones',

    // Support Schemes
    schemesTitle: 'Potential Financial Support & Government Schemes',
    schemesSubtitle: 'Verified programs that can assist with training stipends, toolkits, and loan subsidies',
    schemeCaution: 'Potentially applicable • Subject to scheme rules & official verification',
    checkEligibilityBtn: 'Check Eligibility',

    // Voice Assistant
    askVoiceBtn: '🎙️ Ask JeevanPath',
    askVoiceTitle: 'Ask JeevanPath Voice Assistant',
    askVoiceSubtitle: 'Tap any common question below or ask in Telugu, Hindi, or English',
    qNearestCenter: 'Where is the nearest training center?',
    qCourseFee: 'How much does the course cost?',
    qDocuments: 'What documents do I need for enrollment?',
    qNextBatch: 'When does the next training batch start?',
    qJobs: 'What job can I get after completing this?',
    qBusiness: 'Can I start my own business with this trade?',
    assistantTyping: 'Checking verified project records...',

    backBtn: '← Back to Opportunities',
    progressBtn: 'Track Full Progress →',
    enrollSuccess: 'Enrollment initiated! The center coordinator will contact you with batch confirmation.'
  },
  hi: {
    loading: 'आपका व्यक्तिगत आजीविका रोडमैप तैयार हो रहा है...',
    heading: 'आपकी चरण-दर-चरण आजीविका यात्रा',
    subheading: 'आपके मौजूदा हुनर और स्थानीय अवसरों पर आधारित स्पष्ट कार्य योजना',
    targetPathway: 'लक्षित आजीविका मार्ग',
    sector: 'क्षेत्र',
    targetNsqf: 'कौशल स्तर',
    readinessScore: 'कौशल तैयारी',
    estDuration: 'अनुमानित अवधि',
    months: 'महीने',
    month: 'महीना',
    readinessExpl: 'इस आजीविका के लिए आवश्यक कौशल की तुलना में आपका वर्तमान हुनर।',
    whatIsNsqf: 'NSQF क्या है?',
    nsqfModalTitle: 'NSQF (राष्ट्रीय कौशल योग्यता ढांचा) को समझें',
    nsqfExplanation: 'NSQF भारत सरकार का एक ढांचा है जो किसी काम के लिए आवश्यक व्यावहारिक ज्ञान और कौशल के आधार पर योग्यताओं को स्तरों में व्यवस्थित करता है। यह कोई स्कूल की परीक्षा या अंकों की प्रणाली नहीं है। उच्च स्तर का सीधा अर्थ अधिक उन्नत व्यावहारिक कौशल और ज़िम्मेदारी है।',
    closeBtn: 'बंद करें',

    nextActionTitle: 'आपकी अगली अनुशंसित कार्रवाई',
    nextActionBadge: 'तत्काल कदम',
    freeCourseBadge: '100% निःशुल्क / सरकारी प्रायोजित (PM-AJAY एवं PMKVY)',
    eligibleStatus: 'आवेदन हेतु पात्र',
    enrollBtn: 'प्रशिक्षण हेतु आवेदन करें',
    viewAppBtn: 'आवेदन स्थिति देखें',
    callBtn: 'कॉल करें',
    directionsBtn: 'दिशा-निर्देश पाएं',
    batchStarts: 'अगला बैच प्रारंभ',
    courseDuration: 'अवधि',
    trainingFee: 'प्रशिक्षण शुल्क',
    freeFee: '₹0 (100% निःशुल्क सरकारी अनुदान)',
    provider: 'प्रदाता संस्था',
    qualification: 'योग्यता कोड',
    locationLabel: 'स्थान',
    approxDistance: 'अनुमानित दूरी',

    eligibilityTitle: 'क्या मैं पात्र हूँ?',
    eligibilitySubtitle: 'सरकारी योजना के नियमों के अनुसार त्वरित सत्यापन',
    ageReq: 'आयु 18 वर्ष या उससे अधिक',
    eduReq: 'न्यूनतम शैक्षणिक योग्यता पूर्ण',
    locReq: 'ज़िले/राज्य का स्थानीय निवासी',
    expReq: 'पूर्व कार्य अनुभव अथवा बुनियादी हुनर',
    docReq: 'आधार एवं बैंक खाता उपलब्ध',
    eligibleSummary: 'आप इस आजीविका मार्ग में प्रवेश के लिए पूरी तरह पात्र हैं।',
    oneReqRemaining: '1 आवश्यकता शेष (आधार से जुड़ा बैंक पासबुक तैयार रखें)',

    docsTitle: 'नामांकन हेतु आवश्यक दस्तावेज़',
    docsSubtitle: 'प्रशिक्षण केंद्र जाते समय मूल प्रति और 2 फोटोकॉपी साथ रखें',
    whatAreDocs: 'इन दस्तावेज़ों की आवश्यकता क्यों है?',
    docAadhaar: 'आधार कार्ड',
    docAadhaarWhy: 'बायोमेट्रिक पहचान एवं स्किल इंडिया पोर्टल पर सरकारी पंजीकरण हेतु।',
    docPhone: 'आधार से लिंक मोबाइल नंबर',
    docPhoneWhy: 'बैच सूचना, ओटीपी एवं डिजिटल प्रमाणपत्र प्राप्त करने हेतु।',
    docBank: 'बैंक खाता पासबुक',
    docBankWhy: 'सरकारी वजीफा (स्टाइपेंड) सीधे बैंक खाते में (DBT) पाने हेतु।',
    docEdu: 'स्कूल / इंटरमीडिएट प्रमाण पत्र',
    docEduWhy: 'न्यूनतम शैक्षणिक योग्यता के प्रमाण हेतु।',
    docPhoto: 'पासपोर्ट साइज़ फोटो (4)',
    docPhotoWhy: 'प्रशिक्षण केंद्र पहचान पत्र एवं आधिकारिक रिकॉर्ड हेतु।',

    journeyTitle: 'आपकी 6-चरणीय आजीविका यात्रा',
    step1Title: 'चरण 1: अपने कौशल अंतर को समझें',
    step1Desc: 'आपके पास पहले से उपयोगी हुनर है। इस आजीविका तक पहुंचने के लिए आपको ये तकनीकी कौशल सीखने होंगे।',
    currentSkills: 'मौजूदा हुनर जो आपके पास है',
    skillsToDevelop: 'नए कौशल जो आप सीखेंगे',
    viewSkillGapsBtn: 'विस्तृत कौशल अंतर देखें →',

    step2Title: 'चरण 2: प्रमाणित प्रशिक्षण पूरा करें',
    step2Desc: 'आधुनिक कार्यशालाओं से युक्त मान्यता प्राप्त ज़िला केंद्र पर व्यावहारिक प्रशिक्षण प्राप्त करें।',
    goToTrainingBtn: 'प्रमाणित प्रशिक्षण अनुभाग देखें →',
    nearestCenters: 'आपके ज़िले में मान्यता प्राप्त प्रशिक्षण केंद्र',
    sortBy: 'क्रमबद्ध करें:',
    sortDistance: 'नज़दीकी केंद्र',
    sortBatch: 'शीघ्रतम बैच',
    sortMatch: 'सर्वोत्तम सुमेल',
    languagesSupported: 'उपलब्ध भाषाएं',
    modeLabel: 'प्रशिक्षण मोड',
    modeOffline: 'कक्षा एवं कार्यशाला में व्यावहारिक प्रशिक्षण',

    step3Title: 'चरण 3: मूल्यांकन एवं प्रमाणन',
    step3Desc: 'प्रशिक्षण पूरा करने के बाद आपका व्यावहारिक मूल्यांकन होगा। योग्यता पूरी करने पर आपको सेक्टर स्किल काउंसिल द्वारा आधिकारिक कौशल प्रमाण पत्र प्राप्त होगा।',
    certNote: 'ध्यान दें: सेक्टर स्किल काउंसिल मूल्यांकन करती है और NSQF से जुड़ा आधिकारिक प्रमाण पत्र जारी करती है।',
    certChain: 'प्रशिक्षण कोर्स → व्यावहारिक मूल्यांकन → आधिकारिक डिजिटल प्रमाण पत्र',

    step4Title: 'चरण 4: नौकरी या स्वरोज़गार',
    step4Desc: 'चुनें कि आप किसी कंपनी में नौकरी करना चाहते हैं या अपना खुद का छोटा व्यवसाय शुरू करना चाहते हैं।',
    pathA: 'मार्ग A — नौकरी पाएं (वेतन रोज़गार)',
    pathADesc: 'आपके ज़िले में नियोक्ताओं के पास उपलब्ध सत्यापित नौकरियां:',
    viewJobBtn: 'आवेदन / नियोक्ता से संपर्क करें',
    openingsCount: 'उपलब्ध रिक्तियां',
    monthlyWage: 'मासिक वेतन',

    pathB: 'मार्ग B — अपना व्यवसाय शुरू करें (स्वरोज़गार)',
    pathBDesc: 'सरकारी सहायता, टूलकिट और ऋण सब्सिडी के साथ अपनी स्थानीय सेवा या दुकान शुरू करें।',
    equipmentReq: 'आवश्यक बुनियादी उपकरण',
    approxStartupCost: 'अनुमानित शुरुआती पूंजी',
    targetCustomers: 'लक्षित ग्राहक',
    exploreSelfEmpBtn: 'स्वरोज़गार मार्गदर्शिका देखें →',

    step5Title: 'चरण 5: संभावित कमाई',
    step5Desc: 'स्थानीय बाज़ार की दरों और कार्य अनुभव के आधार पर संभावित आय का दायरा।',
    estEarningRange: 'अनुमानित कमाई दायरा',
    incomeDisclaimer: 'वास्तविक आय स्थान, अनुभव, बाज़ार मांग, काम के घंटे और ग्राहक संख्या के आधार पर भिन्न हो सकती है।',
    wageIncomeEst: 'नौकरी से संभावित आय',
    selfEmpIncomeEst: 'स्वरोज़गार से संभावित आय',
    revenueLabel: 'मासिक कुल बिक्री/राजस्व',
    operatingCostLabel: 'अनुमानित संचालन खर्च',
    netIncomeLabel: 'संभावित शुद्ध बचत/आय',

    step6Title: 'चरण 6: अपनी प्रगति ट्रैक करें',
    step6Desc: 'PM-AJAY आजीविका मार्ग के हर चरण में आपकी वर्तमान स्थिति।',
    overallProgress: 'यात्रा पूर्णता',
    activeMilestones: 'मार्ग के मील के पत्थर',

    schemesTitle: 'संभावित सरकारी सहायता एवं योजनाएं',
    schemesSubtitle: 'वजीफा, टूलकिट और ऋण सब्सिडी प्रदान करने वाले सत्यापित कार्यक्रम',
    schemeCaution: 'संभावित रूप से लागू • योजना के नियमों एवं आधिकारिक सत्यापन के अधीन',
    checkEligibilityBtn: 'पात्रता जांचें',

    askVoiceBtn: '🎙️ जीवनपथ से पूछें',
    askVoiceTitle: 'जीवनपथ वॉयस असिस्टेंट से पूछें',
    askVoiceSubtitle: 'नीचे दिए गए प्रश्नों पर टैप करें या अपनी भाषा में पूछें',
    qNearestCenter: 'सबसे नज़दीकी प्रशिक्षण केंद्र कहाँ है?',
    qCourseFee: 'इस कोर्स की फीस कितनी है?',
    qDocuments: 'प्रवेश के लिए कौन से दस्तावेज़ चाहिए?',
    qNextBatch: 'अगला प्रशिक्षण बैच कब शुरू होगा?',
    qJobs: 'यह सीखने के बाद मुझे कौन सी नौकरी मिल सकती है?',
    qBusiness: 'क्या मैं इसमें अपना खुद का काम शुरू कर सकता हूँ?',
    assistantTyping: 'सत्यापित रिकॉर्ड की जांच हो रही है...',

    backBtn: '← अवसरों पर वापस जाएं',
    progressBtn: 'पूरी प्रगति ट्रैक करें →',
    enrollSuccess: 'नामांकन अनुरोध दर्ज हो गया है! प्रशिक्षण केंद्र समन्वयक जल्द ही आपसे संपर्क करेंगे।'
  },
  te: {
    loading: 'మీ వ్యక్తిగతీకరించిన జీవనోపాధి రోడ్‌మ్యాప్ రూపొందించబడుతోంది...',
    heading: 'మీ దశలవారీ జీవనోపాధి ప్రయాణం',
    subheading: 'మీ నైపుణ్యాలు మరియు స్థానిక ఉపాధి అవకాశాల ఆధారంగా రూపొందించిన స్పష్టమైన ప్రణాళిక',
    targetPathway: 'లక్ష్య జీవనోపాధి మార్గం',
    sector: 'రంగం',
    targetNsqf: 'నైపుణ్య స్థాయి',
    readinessScore: 'నైపుణ్య సన్నద్ధత',
    estDuration: 'అంచనా వ్యవధి',
    months: 'నెలలు',
    month: 'నెల',
    readinessExpl: 'ఈ జీవనోపాధికి అవసరమైన నైపుణ్యాలతో పోలిస్తే మీ ప్రస్తుత నైపుణ్యం.',
    whatIsNsqf: 'NSQF అంటే ఏమిటి?',
    nsqfModalTitle: 'NSQF (నేషనల్ స్కిల్స్ క్వాలిఫికేషన్స్ ఫ్రేమ్‌వర్క్) అవగాహన',
    nsqfExplanation: 'NSQF అనేది ఉద్యోగానికి అవసరమైన ఆచరణాత్మక జ్ఞానం మరియు నైపుణ్యాల ఆధారంగా అర్హతలను వివిధ స్థాయిలుగా నిర్వహించే భారత ప్రభుత్వ జాతీయ ఫ్రేమ్‌వర్క్. ఇది పాఠశాల మార్కులు లేదా గ్రేడ్ల పరీక్ష కాదు. అధిక స్థాయి అంటే ఆ పనిలో మరింత అధునాతన సాంకేతిక నైపుణ్యం మరియు బాధ్యత ఉన్నట్లు అర్థం.',
    closeBtn: 'మూసివేయి',

    nextActionTitle: 'మీ తదుపరి సిఫార్సు చేసిన చర్య',
    nextActionBadge: 'తక్షణ చర్య',
    freeCourseBadge: '100% ఉచితం / ప్రభుత్వ నిధులతో (PM-AJAY & PMKVY)',
    eligibleStatus: 'దరఖాస్తుకు అర్హులు',
    enrollBtn: 'శిక్షణ కొరకు దరఖాస్తు చేయండి',
    viewAppBtn: 'దరఖాస్తు స్థితిని చూడండి',
    callBtn: 'కేంద్రానికి కాల్ చేయండి',
    directionsBtn: 'రూట్ మ్యాప్ పొందండి',
    batchStarts: 'తదుపరి బ్యాచ్ ప్రారంభం',
    courseDuration: 'వ్యవధి',
    trainingFee: 'శిక్షణ రుసుము',
    freeFee: '₹0 (100% ఉచిత ప్రభుత్వ గ్రాంట్)',
    provider: 'శిక్షణ సంస్థ',
    qualification: 'అర్హత కోడ్',
    locationLabel: 'ప్రాంతం',
    approxDistance: 'సుమారు దూరం',

    eligibilityTitle: 'నేను అర్హుడినా?',
    eligibilitySubtitle: 'అధికారిక నిబంధనల ఆధారంగా శీఘ్ర అర్హత తనిఖీ',
    ageReq: 'వయస్సు 18 సంవత్సరాలు లేదా అంతకంటే ఎక్కువ',
    eduReq: 'కనీస విద్యా అర్హత పూర్తి',
    locReq: 'జిల్లా / రాష్ట్ర స్థానిక నివాసి',
    expReq: 'గత పని అనుభవం లేదా ప్రాథమిక అవగాహన',
    docReq: 'ఆధార్ మరియు బ్యాంకు ఖాతా సిద్ధంగా ఉన్నాయి',
    eligibleSummary: 'మీరు ఈ మార్గంలో శిక్షణకు దరఖాస్తు చేసుకోవడానికి అర్హులు.',
    oneReqRemaining: '1 అవసరం మిగిలి ఉంది (ఆధార్ లింక్ చేసిన బ్యాంకు పాస్‌బుక్ సిద్ధం చేసుకోండి)',

    docsTitle: 'చేరడానికి అవసరమైన పత్రాలు (డాక్యుమెంట్లు)',
    docsSubtitle: 'కేంద్రానికి వెళ్లేటప్పుడు అసలు పత్రాలు మరియు 2 జిరాక్స్ ప్రతులు వెంట ఉంచుకోండి',
    whatAreDocs: 'ఈ పత్రాలు ఎందుకు అవసరం?',
    docAadhaar: 'ఆధార్ కార్డు',
    docAadhaarWhy: 'బయోమెట్రిక్ గుర్తింపు మరియు స్కిల్ ఇండియా పోర్టల్ నమోదు కొరకు.',
    docPhone: 'ఆధార్ లింక్ అయిన మొబైల్ నంబర్',
    docPhoneWhy: 'బ్యాచ్ సమాచారం, OTPలు మరియు డిజిటల్ సర్టిఫికెట్ అందుకోవడానికి.',
    docBank: 'బ్యాంకు ఖాతా పాస్‌బుక్',
    docBankWhy: 'ప్రభుత్వ స్టైపెండ్ నేరుగా మీ ఖాతాలో (DBT) జమ కావడానికి.',
    docEdu: 'పాఠశాల / ఇంటర్ సర్టిఫికెట్',
    docEduWhy: 'కనీస విద్యా అర్హత రుజువు కొరకు.',
    docPhoto: 'పాస్‌పోర్ట్ సైజు ఫోటోలు (4)',
    docPhotoWhy: 'శిక్షణ కేంద్ర గుర్తింపు కార్డు మరియు రికార్డు కొరకు.',

    journeyTitle: 'మీ 6-దశల జీవనోపాధి ప్రయాణం',
    step1Title: 'దశ 1: మీ నైపుణ్య అంతరాలను తెలుసుకోండి',
    step1Desc: 'మీకు ఇప్పటికే ఉపయోగకరమైన పని అనుభవం ఉంది. ఈ జీవనోపాధిని సాధించడానికి మీరు ఈ క్రింది సాంకేతిక నైపుణ్యాలను నేర్చుకోవాలి.',
    currentSkills: 'మీకు ఇప్పటికే తెలిసిన నైపుణ్యాలు',
    skillsToDevelop: 'మీరు నేర్చుకోవలసిన కొత్త నైపుణ్యాలు',
    viewSkillGapsBtn: 'వివరణాత్మక నైపుణ్య అంతరాలు చూడండి →',

    step2Title: 'దశ 2: గుర్తింపు పొందిన శిక్షణ పొందండి',
    step2Desc: 'మీ జిల్లాలోని అధునాతన ల్యాబ్‌లు గల శిక్షణా కేంద్రంలో ప్రాక్టికల్ శిక్షణ తీసుకోండి.',
    goToTrainingBtn: 'సర్టిఫైడ్ శిక్షణ విభాగం చూడండి →',
    nearestCenters: 'మీ జిల్లాలోని గుర్తింపు పొందిన శిక్షణా కేంద్రాలు',
    sortBy: 'క్రమబద్ధీకరించండి:',
    sortDistance: 'దగ్గరి కేంద్రం',
    sortBatch: 'త్వరిత బ్యాచ్',
    sortMatch: 'ఉత్తమ సరిపోలిక',
    languagesSupported: 'బోధించే భాషలు',
    modeLabel: 'శిక్షణ విధానం',
    modeOffline: 'తరగతి గది & వర్క్‌షాప్ ప్రాక్టికల్స్',

    step3Title: 'దశ 3: అంచనా మరియు సర్టిఫికేషన్',
    step3Desc: 'శిక్షణ పూర్తయిన తర్వాత ఆచరణాత్మక పరీక్ష ఉంటుంది. అర్హత సాధించిన తర్వాత సెక్టార్ స్కిల్ కౌన్సిల్ నుండి అధికారిక స్కిల్ సర్టిఫికెట్ పొందుతారు.',
    certNote: 'గమనిక: సెక్టార్ స్కిల్ కౌన్సిల్ పరీక్ష నిర్వహించి NSQF ప్రమాణాల సర్టిఫికెట్ జారీ చేస్తుంది.',
    certChain: 'శిక్షణ కోర్సు → ప్రాక్టికల్ పరీక్ష → అధికారిక డిజిటల్ సర్టిఫికెట్',

    step4Title: 'దశ 4: ఉద్యోగం లేదా స్వయం ఉపాధి',
    step4Desc: 'మీరు ఉద్యోగంలో చేరాలనుకుంటున్నారా లేదా మీ స్వంత సూక్ష్మ వ్యాపారం ప్రారంభించాలనుకుంటున్నారా ఎంచుకోండి.',
    pathA: 'మార్గం A — ఉద్యోగం పొందండి (వేతన ఉపాధి)',
    pathADesc: 'మీ జిల్లాలోని కంపెనీలు మరియు యూనిట్లలో అందుబాటులో ఉన్న ఖాళీలు:',
    viewJobBtn: 'దరఖాస్తు / యజమానిని సంప్రదించండి',
    openingsCount: 'అందుబాటులో ఉన్న ఖాళీలు',
    monthlyWage: 'నెలవారీ వేతనం',

    pathB: 'మార్గం B — స్వంత వ్యాపారం ప్రారంభించండి (స్వయం ఉపాధి)',
    pathBDesc: 'ప్రభుత్వ గ్రాంట్లు, టూల్‌కిట్ సబ్సిడీ మరియు ముద్ర రుణాలతో మీ స్వంత వర్క్‌షాప్ ప్రారంభించండి.',
    equipmentReq: 'అవసరమైన ప్రాథమిక పరికరాలు',
    approxStartupCost: 'అంచనా ప్రారంభ పెట్టుబడి',
    targetCustomers: 'లక్ష్య వినియోగదారులు',
    exploreSelfEmpBtn: 'స్వయం ఉపాధి మార్గదర్శిని చూడండి →',

    step5Title: 'దశ 5: సంపాదించగల ఆదాయం',
    step5Desc: 'స్థానిక మార్కెట్ డిమాండ్ మరియు అనుభవం ఆధారంగా సాధ్యమయ్యే ఆదాయ అంచనా.',
    estEarningRange: 'అంచనా వేసిన సంపాదన పరిధి',
    incomeDisclaimer: 'ప్రాంతం, అనుభవం, మార్కెట్ డిమాండ్, పని గంటలు మరియు కస్టమర్ల ఆధారంగా వాస్తవ ఆదాయం మారవచ్చు.',
    wageIncomeEst: 'ఉద్యోగంలో నెలవారీ ఆదాయం',
    selfEmpIncomeEst: 'స్వయం ఉపాధిలో ఆదాయ సామర్థ్యం',
    revenueLabel: 'నెలవారీ మొత్తం వ్యాపార ఆదాయం',
    operatingCostLabel: 'నిర్వహణ ఖర్చులు',
    netIncomeLabel: 'నికర లాభం / మిగులు ఆదాయం',

    step6Title: 'దశ 6: మీ ప్రగతిని ట్రాక్ చేయండి',
    step6Desc: 'PM-AJAY పథకం కింద మీ కెరీర్ మైలురాళ్ల ప్రస్తుత స్థితి.',
    overallProgress: 'ప్రయాణ ప్రగతి',
    activeMilestones: 'జీవనోపాధి మైలురాళ్లు',

    schemesTitle: 'వర్తించే ప్రభుత్వ సహాయ పథకాలు',
    schemesSubtitle: 'శిక్షణ స్టైపెండ్, పరికరాల సబ్సిడీ మరియు తక్కువ వడ్డీ రుణాలు అందించే పథకాలు',
    schemeCaution: 'వర్తించే అవకాశం ఉంది • పథక నిబంధనలు మరియు అధికారిక ధృవీకరణకు లోబడి ఉంటుంది',
    checkEligibilityBtn: 'అర్హత తనిఖీ చేయండి',

    askVoiceBtn: '🎙️ జీవన్‌పథ్‌ను అడగండి',
    askVoiceTitle: 'జీవన్‌పథ్ వాయిస్ సహాయకుడిని అడగండి',
    askVoiceSubtitle: 'క్రింది ప్రశ్నలపై నొక్కండి లేదా మీ భాషలో నేరుగా మాట్లాడండి',
    qNearestCenter: 'నాకు దగ్గరలోని శిక్షణా కేంద్రం ఎక్కడ ఉంది?',
    qCourseFee: 'ఈ కోర్సుకు ఫీజు ఎంత?',
    qDocuments: 'కోర్సులో చేరడానికి ఏ డాక్యుమెంట్లు కావాలి?',
    qNextBatch: 'తదుపరి శిక్షణ బ్యాచ్ ఎప్పుడు ప్రారంభమవుతుంది?',
    qJobs: 'ఇది నేర్చుకున్న తర్వాత నాకు ఎలాంటి ఉద్యోగం వస్తుంది?',
    qBusiness: 'నేను స్వంతంగా వ్యాపారం ప్రారంభించవచ్చా?',
    assistantTyping: 'అధికారిక రికార్డులను పరిశీలిస్తోంది...',

    backBtn: '← అవకాశాలకు తిరిగి వెళ్లండి',
    progressBtn: 'పూర్తి ప్రగతిని ట్రాక్ చేయండి →',
    enrollSuccess: 'నమోదు అభ్యర్థన విజయవంతంగా నమోదైంది! శిక్షణా కేంద్రం కోఆర్డినేటర్ మిమ్మల్ని సంప్రదిస్తారు.'
  }
};

const OCCUPATION_TITLES = {
  tractor_operator: {
    en: 'Tractor and Farm Machinery Operator',
    hi: 'ट्रैक्टर एवं कृषि मशीन ऑपरेटर',
    te: 'ట్రాక్టర్ మరియు వ్యవసాయ యంత్రాల ఆపరేటర్'
  },
  self_employed_tailor: {
    en: 'Self Employed Tailor',
    hi: 'स्वरोजगार दर्जी (Self Employed Tailor)',
    te: 'స్వయం ఉపాధి టైలర్ (Self Employed Tailor)'
  },
  polyhouse_grower: {
    en: 'Polyhouse Vegetable Grower',
    hi: 'पॉलीहाउस सब्जी उत्पादक',
    te: 'పాలీహౌస్ కూరగాయల సాగుదారు'
  },
  medicinal_crops_cultivator: {
    en: 'Medicinal Plants Cultivator',
    hi: 'औषधीय पौध कृषक',
    te: 'ఔషధ మొక్కల సాగుదారు'
  },
  solar_pv_installer: {
    en: 'Solar Panel Installation Technician (Suryamitra)',
    hi: 'सोलर पैनल स्थापना तकनीशियन (सूर्यमित्र)',
    te: 'సోలార్ ప్యానెల్ ఇన్‌స్టాలేషన్ టెక్నీషియన్ (సూర్యమిత్ర)'
  },
  dairy_farmer_entrepreneur: {
    en: 'Commercial Dairy & Livestock Entrepreneur',
    hi: 'वाणिज्यिक डेयरी एवं पशुधन उद्यमी',
    te: 'వాణిజ్య డైరీ & పశుసంవర్ధక వ్యవస్థాపకుడు'
  },
  micro_irrigation_technician: {
    en: 'Micro Irrigation Maintenance Technician',
    hi: 'सूक्ष्म सिंचाई तकनीशियन',
    te: 'మైక్రో ఇరిగేషన్ టెక్నీషియన్'
  },
  general_mason: {
    en: 'General Mason & Construction Technician',
    hi: 'सामान्य राजमिस्त्री',
    te: 'భవన నిర్మాణ మేస్త్రీ'
  },
  organic_grower: {
    en: 'Organic Cultivator & Vermicompost Entrepreneur',
    hi: 'जैविक किसान एवं उद्यमी',
    te: 'సేంద్రీయ రైతు & ఎరువుల తయారీదారు'
  }
};

const SECTOR_TRANSLATIONS = {
  'Agriculture': { hi: 'कृषि', te: 'వ్యవసాయం' },
  'Apparel & Handloom': { hi: 'वस्त्र एवं हथकरघा', te: 'వస్త్రాలు మరియు చేనేత' },
  'Food Processing': { hi: 'खाद्य प्रसंस्करण', te: 'ఆహార శుద్ధి' },
  'Renewable Energy': { hi: 'नवीकरणीय ऊर्जा', te: 'పునరుత్పాదక ఇంధనం' },
  'Green Energy': { hi: 'हरित ऊर्जा', te: 'హరిత ఇంధనం' },
  'Dairy & Animal Husbandry': { hi: 'डेयरी एवं पशुपालन', te: 'పాడి & పశుసంవర్ధక శాఖ' },
  'Automotive': { hi: 'ऑटोमोटिव', te: 'ఆటోమోటివ్' },
  'Construction': { hi: 'निर्माण', te: 'భవన నిర్మాణం' }
};

const SKILL_TRANSLATIONS = {
  hi: {
    tractor_farm_machinery: 'ट्रैक्टर एवं कृषि यंत्र संचालन',
    sewing_machine_operation: 'सिलाई मशीन संचालन',
    garment_pattern_cutting: 'वस्त्र पैटर्न कटिंग',
    apparel_quality_checking: 'परिधान गुणवत्ता जांच',
    hand_embroidery: 'हाथ की कढ़ाई',
    organic_compost_vermicompost: 'जैविक कम्पोस्ट निर्माण',
    integrated_pest_management: 'एकीकृत कीट प्रबंधन',
    drip_irrigation_maintenance: 'ड्रिप सिंचाई रखरखाव',
    solar_panel_installation: 'सौर पैनल स्थापना',
    house_wiring_electrical: 'घरेलू वायरिंग विद्युत',
    hydraulic_systems: 'हाइड्रोलिक प्रणाली रखरखाव',
    equipment_safety: 'उपकरण सुरक्षा एवं निवारक उपाय',
    electrical_systems: 'कृषि विद्युत प्रणाली',
    advanced_troubleshooting: 'उन्नत मशीनरी मरम्मत'
  },
  te: {
    tractor_farm_machinery: 'ట్రాక్టర్ & వ్యవసాయ యంత్రాల నిర్వహణ',
    sewing_machine_operation: 'కుట్టు మిషన్ ఆపరేషన్',
    garment_pattern_cutting: 'దుస్తుల ప్యాటర్న్ కటింగ్',
    apparel_quality_checking: 'దుస్తుల నాణ్యత తనిఖీ',
    hand_embroidery: 'చేతి ఎంబ్రాయిడరీ',
    organic_compost_vermicompost: 'సేంద్రీయ వర్మీకంపోస్ట్ తయారీ',
    integrated_pest_management: 'సమీకృత తెగుళ్ల నివారణ',
    drip_irrigation_maintenance: 'డ్రిప్ ఇరిగేషన్ నిర్వహణ',
    solar_panel_installation: 'సోలార్ ప్యానెల్ ఇన్‌స్టాలేషన్',
    house_wiring_electrical: 'హౌస్ వైరింగ్ & ఎలక్ట్రికల్',
    hydraulic_systems: 'హైడ్రాలిక్ వ్యవస్థల నిర్వహణ',
    equipment_safety: 'యంత్రాల భద్రతా పద్ధతులు',
    electrical_systems: 'వ్యవసాయ ఎలక్ట్రికల్ వ్యవస్థలు',
    advanced_troubleshooting: 'యంత్రాల అధునాతన రిపేర్'
  }
};

const getLocalizedSkill = (skillKey, lang) => {
  if (lang === 'en' || !skillKey) return String(skillKey).replace(/^crs_/, '').replace(/_/g, ' ');
  const norm = String(skillKey).toLowerCase().trim();
  if (SKILL_TRANSLATIONS[lang]?.[norm]) return SKILL_TRANSLATIONS[lang][norm];
  if (SKILL_TRANSLATIONS[lang]?.[norm.replace(/_/g, ' ')]) return SKILL_TRANSLATIONS[lang][norm.replace(/_/g, ' ')];
  return String(skillKey).replace(/^crs_/, '').replace(/_/g, ' ');
};

export const Roadmap = () => {
  const { lang } = useLang();
  const t = ROADMAP_CONTENT[lang] || ROADMAP_CONTENT.en;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const urlOcc = searchParams.get('occ');
  const occKey = urlOcc || api.getSelectedOccupation() || 'tractor_operator';

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [journeyProgress, setJourneyProgress] = useState(null);

  // Modals & Drawers
  const [showNsqfModal, setShowNsqfModal] = useState(false);
  const [showDocsModal, setShowDocsModal] = useState(false);
  const [showVoiceDrawer, setShowVoiceDrawer] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [enrollModalMode, setEnrollModalMode] = useState('apply');
  const [activeApplication, setActiveApplication] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [voiceQuery, setVoiceQuery] = useState('');
  const [voiceAnswer, setVoiceAnswer] = useState(null);
  const [enrolledNotice, setEnrolledNotice] = useState(false);
  const [centerSort, setCenterSort] = useState('distance');

  useEffect(() => {
    if (urlOcc) {
      api.setSelectedOccupation(urlOcc);
    }
  }, [urlOcc]);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      api.getRoadmap(occKey).catch(() => null),
      api.getProgress().catch(() => ({ journey: null })),
      api.getMyEnrollments().catch(() => ({ applications: [], activeApplication: null })),
      api.getProfile().catch(() => null)
    ]).then(([roadRes, progRes, enrollRes, profRes]) => {
      setData(roadRes);
      setJourneyProgress(progRes?.journey || null);
      setUserProfile(profRes?.data || profRes || null);

      // Check if user has an application for this specific course or active application
      const apps = enrollRes?.applications || [];
      const appForCourse = apps.find(
        (a) => a.occupationKey === (roadRes?.resolvedKey || occKey) || a.courseKey === (roadRes?.resolvedKey || occKey)
      ) || enrollRes?.activeApplication || null;

      setActiveApplication(appForCourse);

      if (roadRes?.resolvedKey && !urlOcc) {
        api.setSelectedOccupation(roadRes.resolvedKey);
      }
      setLoading(false);
    });
  };

  useEffect(() => {
    loadData();
  }, [occKey, urlOcc]);

  if (loading) {
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '60px 20px' }}>
        <div style={{ display: 'inline-block', width: '36px', height: '36px', border: '3px solid var(--border-warm)', borderTopColor: 'var(--primary-600)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <p style={{ marginTop: '16px', color: 'var(--text-muted)', fontWeight: 600 }}>{t.loading}</p>
      </div>
    );
  }

  const occupation = data?.occupation || {};
  const activeOccKey = data?.resolvedKey || occKey;
  const displayTitle = OCCUPATION_TITLES[activeOccKey]?.[lang] || occupation.title || activeOccKey.replace(/_/g, ' ');
  const displaySector = SECTOR_TRANSLATIONS[occupation.sector]?.[lang] || occupation.sector || 'Agriculture';

  const skillsSummary = data?.skillsSummary || {};
  const acquiredSkills = skillsSummary.acquired || [];
  const missingSkills = skillsSummary.missing || [];
  const readiness = data?.readinessScore ?? (acquiredSkills.length > 0 ? 80 : 25);

  const rawCenters = data?.nearbyCenters || [];
  const sortedCenters = [...rawCenters].sort((a, b) => {
    if (centerSort === 'distance') return (a.distanceKm || 5) - (b.distanceKm || 5);
    return 0;
  });
  const primaryCenter = sortedCenters[0] || {
    name: 'District Rural Skill Development Center (ASCI Accredited)',
    district: occupation.district || 'Warangal',
    state: 'Telangana',
    contact: '+91 870 245 9811',
    distanceKm: 6.5
  };

  const recommendedCourse = data?.recommendedCourses?.[0] || {
    title: activeOccKey === 'tractor_operator' ? 'Tractor Mechanic and Operator Training' : (occupation.title + ' Certification'),
    nsqfLevel: occupation.nsqfLevel || 3,
    qpCode: occupation.ncoCode ? `AGR/Q${occupation.ncoCode.slice(0, 4)}` : 'AGR/Q1101',
    durationMonths: data?.roadmap?.steps?.[0]?.durationMonths || 3,
    mode: 'offline',
    costInr: 0
  };

  const jobs = data?.jobs || [];
  const schemes = data?.applicableSchemes || [
    { name: 'PM-AJAY GIA (Grant-in-Aid)', purpose: '100% skilling subsidy, toolkit allowance, and stipend for rural beneficiaries.' },
    { name: 'PMKVY 4.0 Skilling Grant', purpose: 'Government funded course fees and practical assessment coverage.' },
    { name: 'PMEGP / PM Vishwakarma', purpose: 'Collateral-free loan with up to 35% government subsidy for micro-enterprise setup.' }
  ];

  const handleEnrollClick = () => {
    if (activeApplication) {
      setEnrollModalMode('view');
    } else {
      setEnrollModalMode('apply');
    }
    setShowEnrollModal(true);
  };

  const handleQuickQuestion = (qKey) => {
    setVoiceQuery(qKey);
    if (qKey === t.qNearestCenter) {
      setVoiceAnswer(`${primaryCenter.name}, ${primaryCenter.district}, Telangana. Distance: ~${primaryCenter.distanceKm || 6.5} km from your mandal. Contact: ${primaryCenter.contact}.`);
    } else if (qKey === t.qCourseFee) {
      setVoiceAnswer("The course fee is ₹0 (100% Free under PM-AJAY GIA & PMKVY 4.0). You are not required to pay any training or exam fees.");
    } else if (qKey === t.qDocuments) {
      setVoiceAnswer("You need 5 documents: 1) Aadhaar Card, 2) Aadhaar-linked Mobile Number, 3) Bank Account Passbook, 4) School Certificate, and 5) 4 Passport size photos.");
    } else if (qKey === t.qNextBatch) {
      setVoiceAnswer("The next training batch begins on the 15th of next month at your nearest district center. Enroll now to reserve your seat.");
    } else if (qKey === t.qJobs) {
      setVoiceAnswer(jobs.length > 0
        ? `You can work as ${jobs[0].title} with ${jobs[0].employer} earning approximately ₹${jobs[0].wage?.toLocaleString()}/month in ${primaryCenter.district}.`
        : `Verified opportunities are available with district agro clusters and cooperatives with starting salary of ₹${occupation.incomeMin?.toLocaleString()} to ₹${occupation.incomeMax?.toLocaleString()}/month.`);
    } else if (qKey === t.qBusiness) {
      setVoiceAnswer(`Yes! You can start a local ${displayTitle} service or workshop. PM-AJAY GIA and PMEGP offer collateral-free loans with up to 35% subsidy and modern toolkit grants.`);
    } else {
      setVoiceAnswer("Based on verified project records for this trade, practical training is completely free and leads to an official Sector Skill Council certificate.");
    }
  };

  // Milestone Stages calculation
  const isEnrolledDone = ['ACCEPTED', 'TRAINING_STARTED', 'TRAINING_COMPLETED', 'CERTIFIED'].includes(activeApplication?.status);
  const isEnrolledActive = Boolean(activeApplication) && !isEnrolledDone;
  const isTrainingDone = ['TRAINING_COMPLETED', 'CERTIFIED'].includes(activeApplication?.status);
  const isTrainingActive = activeApplication?.status === 'TRAINING_STARTED';

  const milestoneList = [
    { title: lang === 'te' ? 'ప్రొఫైల్ సృష్టించబడింది' : lang === 'hi' ? 'प्रोफ़ाइल बनाई गई' : 'Profile Created', done: true },
    { title: lang === 'te' ? 'జీవనోపాధి మార్గం ఎంపికైంది' : lang === 'hi' ? 'आजीविका मार्ग चुना गया' : 'Career Identified', done: true },
    { title: lang === 'te' ? 'నైపుణ్య అంతరాలు గుర్తించబడ్డాయి' : lang === 'hi' ? 'कौशल अंतर पहचाने गए' : 'Skill Gaps Identified', done: true },
    {
      title: lang === 'te' ? 'శిక్షణలో నమోదు' : lang === 'hi' ? 'प्रशिक्षण में नामांकन' : 'Training Enrollment',
      done: isEnrolledDone,
      active: isEnrolledActive || !activeApplication
    },
    {
      title: lang === 'te' ? 'ఆచరణాత్మక శిక్షణ పూర్తి' : lang === 'hi' ? 'प्रशिक्षण पूर्णता' : 'Practical Training',
      done: isTrainingDone,
      active: isTrainingActive
    },
    { title: lang === 'te' ? 'పరీక్ష & సర్టిఫికేషన్' : lang === 'hi' ? 'मूल्यांकन एवं प्रमाणन' : 'Assessment & Certification', done: false },
    { title: lang === 'te' ? 'ఉద్యోగం / స్వంత వ్యాపారం' : lang === 'hi' ? 'रोज़गार / व्यवसाय स्थापना' : 'Employment / Enterprise Setup', done: false }
  ];
  const completedMilestones = milestoneList.filter((m) => m.done).length;
  const progressPct = Math.round((completedMilestones / milestoneList.length) * 100);

  return (
    <div className="page-container" style={{ maxWidth: '1080px', margin: '0 auto', paddingBottom: '60px' }}>

      {/* TOP HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="badge badge-amber" style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>
              PM-AJAY GIA Livelihood Plan
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>• {primaryCenter.district}, Telangana</span>
          </div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 6px 0' }}>
            {t.heading}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '680px', margin: 0 }}>
            {t.subheading}
          </p>
        </div>

        {/* VOICE ASSISTANT HERO TRIGGER */}
        <button
          onClick={() => setShowVoiceDrawer(!showVoiceDrawer)}
          className="btn btn-primary"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            fontSize: '14px',
            fontWeight: 700,
            boxShadow: '0 4px 12px rgba(202, 102, 3, 0.25)',
            borderRadius: 'var(--radius-full)'
          }}
        >
          <Mic size={18} /> {t.askVoiceBtn}
        </button>
      </div>

      {/* ENROLLMENT SUCCESS TOAST */}
      {enrolledNotice && (
        <div style={{ background: '#dcfce7', border: '1px solid #86efac', color: '#166534', padding: '12px 16px', borderRadius: 'var(--radius-md)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', fontWeight: 600 }}>
          <CheckCircle size={18} /> {t.enrollSuccess}
        </div>
      )}

      {/* A. TOP SUMMARY CARD */}
      <div className="card" style={{ background: 'var(--surface-card)', borderColor: 'var(--border-warm)', marginBottom: '24px', padding: '20px 22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ flex: 1, minWidth: '260px' }}>
            <div style={{ fontSize: '12px', color: 'var(--primary-600)', fontWeight: 700, letterSpacing: '0.5px' }}>
              {t.targetPathway}
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-main)', margin: '4px 0 8px 0' }}>
              {displayTitle}
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px', fontSize: '13px', color: 'var(--text-muted)' }}>
              <span><strong>{t.sector}:</strong> {displaySector}</span>
              <span>•</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <strong>{t.targetNsqf}:</strong> NSQF Level {occupation.nsqfLevel || 3}
                <button
                  onClick={() => setShowNsqfModal(true)}
                  style={{ background: 'none', border: 'none', color: 'var(--primary-600)', cursor: 'pointer', padding: 0, display: 'inline-flex', alignItems: 'center', gap: '2px', fontSize: '12px', fontWeight: 600 }}
                  title={t.whatIsNsqf}
                >
                  <HelpCircle size={14} /> {t.whatIsNsqf}
                </button>
              </span>
              <span>•</span>
              <span><strong>{t.estDuration}:</strong> {data?.roadmap?.totalEstimatedMonths || 5} {t.months}</span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px', fontStyle: 'italic' }}>
              "{t.readinessExpl}"
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', minWidth: '160px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>{t.readinessScore}:</span>
              <span className="badge badge-green" style={{ fontSize: '14px', padding: '6px 14px', fontWeight: 800 }}>
                {readiness}%
              </span>
            </div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {acquiredSkills.length} of {acquiredSkills.length + missingSkills.length} competencies ready
            </span>
          </div>
        </div>
      </div>

      {/* B. MOST IMPORTANT: "YOUR NEXT ACTION" HERO CARD */}
      <div className="card" style={{
        background: 'linear-gradient(135deg, #FEFCF6 0%, #F5F1EB 100%)',
        border: '2px solid var(--primary-600)',
        boxShadow: 'var(--shadow-md)',
        marginBottom: '28px',
        padding: '24px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge badge-amber" style={{ fontSize: '11px', fontWeight: 800 }}>
              {t.nextActionBadge}
            </span>
            <span className="badge badge-green" style={{ fontSize: '11px', fontWeight: 700 }}>
              {t.freeCourseBadge}
            </span>
          </div>
          <span className="badge badge-blue" style={{ fontSize: '11px', fontWeight: 700 }}>
            ✓ {t.eligibleStatus}
          </span>
        </div>

        {/* ACTIVE ENROLLMENT APPLICATION BANNER */}
        {activeApplication && (
          <div
            style={{
              background:
                activeApplication.status === 'ACCEPTED'
                  ? '#f0fdf4'
                  : activeApplication.status === 'ACTION_REQUIRED'
                  ? '#fffbeb'
                  : activeApplication.status === 'REJECTED'
                  ? '#fef2f2'
                  : 'var(--surface-subtle)',
              border:
                activeApplication.status === 'ACCEPTED'
                  ? '2px solid #86efac'
                  : activeApplication.status === 'ACTION_REQUIRED'
                  ? '2px solid #fde68a'
                  : activeApplication.status === 'REJECTED'
                  ? '2px solid #fca5a5'
                  : '1px solid var(--border-warm)',
              borderRadius: 'var(--radius-md)',
              padding: '14px 18px',
              marginBottom: '18px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span className="badge badge-amber" style={{ fontSize: '11px', fontWeight: 800 }}>
                  App ID: {activeApplication.applicationId}
                </span>
                <span className={activeApplication.status === 'ACCEPTED' ? 'badge badge-green' : activeApplication.status === 'ACTION_REQUIRED' ? 'badge badge-amber' : 'badge badge-blue'} style={{ fontSize: '11px', fontWeight: 800 }}>
                  {activeApplication.status === 'ACCEPTED' ? '🎉 Accepted' : activeApplication.status === 'ACTION_REQUIRED' ? '⚠ Action Required' : '🟠 Under Review'}
                </span>
              </div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>
                {activeApplication.nextAction}
              </div>
            </div>

            <button
              onClick={() => {
                setEnrollModalMode('view');
                setShowEnrollModal(true);
              }}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '12px', padding: '6px 14px', fontWeight: 700 }}
            >
              {t.viewAppBtn}
            </button>
          </div>
        )}

        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '13px', color: 'var(--primary-700)', fontWeight: 700 }}>
            {t.nextActionTitle}
          </div>
          <h3 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-main)', margin: '4px 0 8px 0' }}>
            {recommendedCourse.title}
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
            Practical hands-on training with NSQF Level {recommendedCourse.nsqfLevel} qualification at an accredited district training workshop in {primaryCenter.district}.
          </p>
        </div>

        {/* Training Provider & Batch Info Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px',
          background: 'var(--surface-subtle)',
          padding: '14px 16px',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-warm)',
          marginBottom: '20px',
          fontSize: '13px'
        }}>
          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px' }}>{t.provider}:</span>
            <strong>{primaryCenter.name}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px' }}>{t.locationLabel} & {t.approxDistance}:</span>
            <strong>{primaryCenter.district}, Telangana (~{primaryCenter.distanceKm || 6.5} km)</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px' }}>{t.batchStarts}:</span>
            <strong style={{ color: 'var(--primary-800)' }}>15th of next month (Enrolling)</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px' }}>{t.courseDuration}:</span>
            <strong>{recommendedCourse.durationMonths} {t.months} (360 Hours Practical)</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px' }}>{t.trainingFee}:</span>
            <strong style={{ color: 'var(--status-success)' }}>{t.freeFee}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px' }}>{t.qualification}:</span>
            <strong style={{ color: 'var(--text-main)' }}>{recommendedCourse.qpCode} (NSQF-3)</strong>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          <button
            onClick={handleEnrollClick}
            className="btn btn-primary"
            style={{ fontSize: '14px', padding: '10px 22px', fontWeight: 700 }}
          >
            <CheckCircle size={16} /> {activeApplication ? t.viewAppBtn : t.enrollBtn}
          </button>
          <a
            href={`tel:${primaryCenter.contact}`}
            className="btn btn-secondary"
            style={{ fontSize: '14px', padding: '10px 18px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <Phone size={15} /> {t.callBtn} ({primaryCenter.contact})
          </a>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(primaryCenter.name + ' ' + primaryCenter.district)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
            style={{ fontSize: '14px', padding: '10px 18px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <Navigation size={15} /> {t.directionsBtn}
          </a>
        </div>
      </div>

      {/* C & D: ELIGIBILITY & DOCUMENTS TWO-COLUMN LAYOUT */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '28px' }}>

        {/* C. ELIGIBILITY CHECKLIST */}
        <div className="card" style={{ background: 'var(--surface-card)', borderColor: 'var(--border-warm)' }}>
          <h3 style={{ fontSize: '17px', fontWeight: 800, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={18} color="var(--primary-600)" /> {t.eligibilityTitle}
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px' }}>
            {t.eligibilitySubtitle}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ color: 'var(--status-success)', fontWeight: 800 }}>✓</span>
              <span>{t.ageReq}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ color: 'var(--status-success)', fontWeight: 800 }}>✓</span>
              <span>{t.eduReq}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ color: 'var(--status-success)', fontWeight: 800 }}>✓</span>
              <span>{t.locReq} ({primaryCenter.district})</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ color: 'var(--status-success)', fontWeight: 800 }}>✓</span>
              <span>{t.expReq}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ color: '#d97706', fontWeight: 800 }}>⚠</span>
              <span style={{ color: 'var(--text-main)' }}>{t.docReq}</span>
            </div>
          </div>

          <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="badge badge-green" style={{ fontSize: '12px', fontWeight: 700 }}>
              {t.eligibleStatus}
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              {t.oneReqRemaining}
            </span>
          </div>
        </div>

        {/* D. DOCUMENTS REQUIRED */}
        <div className="card" style={{ background: 'var(--surface-card)', borderColor: 'var(--border-warm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <h3 style={{ fontSize: '17px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FileText size={18} color="var(--primary-600)" /> {t.docsTitle}
            </h3>
            <button
              onClick={() => setShowDocsModal(true)}
              style={{ background: 'none', border: 'none', color: 'var(--primary-600)', fontSize: '12px', fontWeight: 600, cursor: 'pointer', padding: 0 }}
            >
              {t.whatAreDocs}
            </button>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px' }}>
            {t.docsSubtitle}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Check size={15} color="var(--status-success)" />
              <strong>{t.docAadhaar}</strong>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Check size={15} color="var(--status-success)" />
              <strong>{t.docPhone}</strong>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Check size={15} color="var(--status-success)" />
              <strong>{t.docBank}</strong>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Check size={15} color="var(--status-success)" />
              <strong>{t.docEdu}</strong>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Check size={15} color="var(--status-success)" />
              <strong>{t.docPhoto}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* E. 6-STEP ACTIONABLE LIVELIHOOD JOURNEY */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '6px' }}>
          {t.journeyTitle}
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
          Follow this 6-stage roadmap from skill assessment to sustained income generation.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>

          {/* STEP 1: SKILL GAPS */}
          <div className="card" style={{ borderLeft: '4px solid var(--primary-600)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary-600)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '16px', flexShrink: 0 }}>
                1
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '4px' }}>{t.step1Title}</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '14px', lineHeight: 1.5 }}>
                  {t.step1Desc}
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginBottom: '14px' }}>
                  <div style={{ background: '#ecfdf5', padding: '12px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid #a7f3d0' }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#065f46', marginBottom: '6px' }}>
                      {t.currentSkills}
                    </div>
                    {acquiredSkills.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px' }}>
                        {acquiredSkills.map((sk, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Check size={13} color="#059669" />
                            <span>{getLocalizedSkill(sk, lang)}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>General practical trade background</div>
                    )}
                  </div>

                  <div style={{ background: '#fffbeb', padding: '12px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid #fde68a' }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#92400e', marginBottom: '6px' }}>
                      {t.skillsToDevelop}
                    </div>
                    {missingSkills.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px' }}>
                        {missingSkills.map((sk, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#d97706' }}></span>
                            <span>{getLocalizedSkill(sk, lang)}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>All core trade competencies acquired</div>
                    )}
                  </div>
                </div>

                <Link to={`/skill-gaps?occ=${activeOccKey}`} className="btn btn-secondary" style={{ fontSize: '12px', padding: '6px 14px', fontWeight: 600 }}>
                  {t.viewSkillGapsBtn}
                </Link>
              </div>
            </div>
          </div>

          {/* STEP 2: GET TRAINING */}
          <div className="card" style={{ borderLeft: '4px solid var(--primary-600)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary-600)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '16px', flexShrink: 0 }}>
                2
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '4px' }}>{t.step2Title}</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '14px', lineHeight: 1.5 }}>
                  {t.step2Desc}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
                  <div style={{ fontWeight: 700, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <span>{t.nearestCenters} ({sortedCenters.length})</span>
                    <Link
                      to={`/training?occ=${activeOccKey}`}
                      className="btn btn-primary btn-sm"
                      style={{ fontSize: '11px', padding: '4px 12px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                      <BookOpen size={13} /> {t.goToTrainingBtn}
                    </Link>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                    <span>{t.sortBy}</span>
                    <select
                      value={centerSort}
                      onChange={(e) => setCenterSort(e.target.value)}
                      style={{ padding: '4px 8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-warm)', background: '#fff', fontSize: '12px' }}
                    >
                      <option value="distance">{t.sortDistance}</option>
                      <option value="batch">{t.sortBatch}</option>
                    </select>
                  </div>
                </div>

                {sortedCenters.length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px', marginBottom: '14px' }}>
                    {sortedCenters.slice(0, 3).map((c, i) => (
                      <div key={i} style={{ background: 'var(--surface-subtle)', padding: '12px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-warm)' }}>
                        <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '4px' }}>{c.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                          <MapPin size={12} style={{ display: 'inline', marginRight: '4px' }} />
                          {c.district}, Telangana • ~{c.distanceKm || (5 + i * 4)} km
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--primary-700)', fontWeight: 600, marginBottom: '10px' }}>
                          Next batch: 15th next month • Fee: ₹0 Free Subsidy
                        </div>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button onClick={handleEnrollClick} className="btn btn-primary btn-sm" style={{ fontSize: '11px', padding: '4px 10px' }}>
                            {t.enrollBtn}
                          </button>
                          <a href={`tel:${c.contact}`} className="btn btn-secondary btn-sm" style={{ fontSize: '11px', padding: '4px 8px' }}>
                            <Phone size={11} /> Call
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ background: 'var(--surface-subtle)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-warm)', marginBottom: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-main)' }}>
                        Government Certified Training Programs
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        Browse all certified NSQF skilling courses, accredited district training centers, and batch details.
                      </div>
                    </div>
                    <Link
                      to={`/training?occ=${activeOccKey}`}
                      className="btn btn-primary btn-sm"
                      style={{ fontSize: '12px', padding: '6px 16px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      <BookOpen size={14} /> {t.goToTrainingBtn}
                    </Link>
                  </div>
                )}

                <div style={{ marginTop: '12px' }}>
                  <Link
                    to={`/training?occ=${activeOccKey}`}
                    className="btn btn-secondary"
                    style={{ fontSize: '12px', padding: '8px 16px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px', borderColor: 'var(--primary-600)', color: 'var(--primary-700)' }}
                  >
                    <BookOpen size={14} color="var(--primary-600)" /> {t.goToTrainingBtn}
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* STEP 3: ASSESSMENT & CERTIFICATION */}
          <div className="card" style={{ borderLeft: '4px solid var(--primary-600)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary-600)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '16px', flexShrink: 0 }}>
                3
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '4px' }}>{t.step3Title}</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-main)', lineHeight: 1.5, marginBottom: '12px' }}>
                  {t.step3Desc}
                </p>

                <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)', marginBottom: '12px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary-700)', marginBottom: '6px' }}>
                    {t.certChain}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {t.certNote}
                  </div>
                </div>

                <button
                  onClick={() => setShowNsqfModal(true)}
                  className="btn btn-ghost"
                  style={{ fontSize: '12px', padding: '4px 0', color: 'var(--primary-600)', fontWeight: 600 }}
                >
                  <HelpCircle size={14} style={{ display: 'inline', marginRight: '4px' }} /> {t.whatIsNsqf}
                </button>
              </div>
            </div>
          </div>

          {/* STEP 4: EMPLOYMENT OR SELF-EMPLOYMENT */}
          <div className="card" style={{ borderLeft: '4px solid var(--primary-600)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary-600)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '16px', flexShrink: 0 }}>
                4
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '4px' }}>{t.step4Title}</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
                  {t.step4Desc}
                </p>

                {/* PATH A & PATH B SPLIT GRID */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>

                  {/* PATH A: WAGE EMPLOYMENT */}
                  <div style={{ background: 'var(--surface-subtle)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-warm)' }}>
                    <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--primary-800)', marginBottom: '4px' }}>
                      {t.pathA}
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                      {t.pathADesc}
                    </p>

                    {jobs.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {jobs.slice(0, 2).map((j, i) => (
                          <div key={i} style={{ background: '#fff', padding: '10px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
                            <div style={{ fontWeight: 700, fontSize: '13px' }}>{j.title}</div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{j.employer} • {j.district}</div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', fontSize: '12px' }}>
                              <strong style={{ color: 'var(--status-success)' }}>₹{j.wage?.toLocaleString()}/mo</strong>
                              <span className="badge badge-blue" style={{ fontSize: '10px' }}>{j.openings} Openings</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ background: '#fff', padding: '10px 12px', borderRadius: 'var(--radius-sm)', fontSize: '12px', color: 'var(--text-muted)' }}>
                        Verified openings with agro machinery clusters and cooperative service units in {primaryCenter.district}.
                      </div>
                    )}

                    <Link to="/opportunities" className="btn btn-secondary btn-sm" style={{ marginTop: '12px', width: '100%', textAlign: 'center', display: 'block' }}>
                      {t.viewJobBtn}
                    </Link>
                  </div>

                  {/* PATH B: SELF-EMPLOYMENT */}
                  <div style={{ background: 'var(--surface-subtle)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-warm)' }}>
                    <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--accent-gold)', marginBottom: '4px' }}>
                      {t.pathB}
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                      {t.pathBDesc}
                    </p>

                    <div style={{ background: '#fff', padding: '12px', borderRadius: 'var(--radius-sm)', fontSize: '12px', marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div>
                        <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px' }}>{t.equipmentReq}:</span>
                        <strong>{activeOccKey === 'tractor_operator' ? 'Standard tool set, diagnostic gauge, hydraulic jack, compressor' : 'Sewing machine, overlock machine, scissors, cutting table'}</strong>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px' }}>{t.approxStartupCost}:</span>
                        <strong>₹50,000 – ₹1,20,000 (Eligible for 35% PMEGP / Vishwakarma grant)</strong>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px' }}>{t.targetCustomers}:</span>
                        <strong>Local farmers, village custom hiring centers, nearby rural markets</strong>
                      </div>
                    </div>

                    <Link to={`/self-employment?occ=${activeOccKey}`} className="btn btn-secondary btn-sm" style={{ width: '100%', textAlign: 'center', display: 'block', borderColor: 'var(--accent-gold)', color: 'var(--accent-gold)' }}>
                      {t.exploreSelfEmpBtn}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* STEP 5: BUILD INCOME */}
          <div className="card" style={{ borderLeft: '4px solid var(--primary-600)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary-600)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '16px', flexShrink: 0 }}>
                5
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '4px' }}>{t.step5Title}</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '14px' }}>
                  {t.step5Desc}
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginBottom: '12px' }}>
                  <div style={{ background: '#f0fdf4', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid #bbf7d0' }}>
                    <div style={{ fontSize: '11px', color: '#166534', fontWeight: 700 }}>{t.wageIncomeEst}</div>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: '#15803d', margin: '4px 0' }}>
                      ₹{occupation.incomeMin?.toLocaleString() || '16,000'} – ₹{occupation.incomeMax?.toLocaleString() || '36,000'}{t.perMonth}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Verified wage rates in {primaryCenter.district}</div>
                  </div>

                  <div style={{ background: '#fffbeb', padding: '14px', borderRadius: 'var(--radius-md)', border: '1px solid #fde68a' }}>
                    <div style={{ fontSize: '11px', color: '#92400e', fontWeight: 700 }}>{t.selfEmpIncomeEst}</div>
                    <div style={{ fontSize: '12px', marginTop: '4px' }}>
                      <div>{t.revenueLabel}: <strong>₹30,000 – ₹55,000/mo</strong></div>
                      <div>{t.operatingCostLabel}: <strong>~₹10,000 – ₹15,000/mo</strong></div>
                      <div style={{ marginTop: '2px', color: '#b45309' }}>{t.netIncomeLabel}: <strong>₹20,000 – ₹40,000/mo</strong></div>
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic', background: 'var(--surface-subtle)', padding: '8px 12px', borderRadius: 'var(--radius-sm)' }}>
                  ⚠️ {t.incomeDisclaimer}
                </div>
              </div>
            </div>
          </div>

          {/* STEP 6: TRACK PROGRESS */}
          <div className="card" style={{ borderLeft: '4px solid var(--primary-600)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary-600)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '16px', flexShrink: 0 }}>
                6
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '4px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 800 }}>{t.step6Title}</h3>
                  <span className="badge badge-blue" style={{ fontSize: '12px', fontWeight: 700 }}>
                    {progressPct}% {t.overallProgress}
                  </span>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '14px' }}>
                  {t.step6Desc}
                </p>

                {/* Milestone Checklist */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px', marginBottom: '14px' }}>
                  {milestoneList.map((m, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-sm)',
                        background: m.done ? '#ecfdf5' : m.active ? '#eff6ff' : 'var(--surface-subtle)',
                        border: m.done ? '1px solid #a7f3d0' : m.active ? '1px solid #bfdbfe' : '1px solid var(--border-warm)',
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      {m.done ? (
                        <CheckCircle size={14} color="#059669" />
                      ) : m.active ? (
                        <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#2563eb' }}></span>
                      ) : (
                        <span style={{ width: '10px', height: '10px', borderRadius: '50%', border: '1px solid #94a3b8' }}></span>
                      )}
                      <span style={{ fontWeight: m.active || m.done ? 700 : 400, color: m.done ? '#065f46' : m.active ? '#1e40af' : 'var(--text-muted)' }}>
                        {m.title}
                      </span>
                    </div>
                  ))}
                </div>

                <Link to="/progress" className="btn btn-secondary" style={{ fontSize: '12px', padding: '6px 14px', fontWeight: 600 }}>
                  {t.progressBtn}
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* F. FINANCIAL / GOVERNMENT SUPPORT SCHEMES */}
      <div className="card" style={{ marginBottom: '28px', background: 'var(--surface-card)', borderColor: 'var(--border-warm)' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Award size={18} color="var(--accent-gold)" /> {t.schemesTitle}
        </h3>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px' }}>
          {t.schemesSubtitle} • <span style={{ fontStyle: 'italic' }}>{t.schemeCaution}</span>
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
          {schemes.map((s, i) => (
            <div key={i} style={{ background: 'var(--surface-subtle)', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-warm)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <strong style={{ fontSize: '13px', color: 'var(--primary-800)' }}>{s.name}</strong>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', lineHeight: 1.4 }}>
                  {s.purpose}
                </p>
              </div>
              <button
                onClick={() => alert(`Eligibility check initiated for ${s.name}. Please confirm your Aadhaar and bank details at the block livelihood office.`)}
                className="btn btn-ghost"
                style={{ fontSize: '11px', padding: '4px 0', alignSelf: 'flex-start', color: 'var(--primary-600)', fontWeight: 700, marginTop: '8px' }}
              >
                {t.checkEligibilityBtn} →
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* BOTTOM ACTIONS */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <Link to="/opportunities" className="btn btn-secondary">
          {t.backBtn}
        </Link>
        <Link to="/progress" className="btn btn-primary">
          {t.progressBtn}
        </Link>
      </div>

      {/* NSQF EXPLANATION MODAL */}
      {showNsqfModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.55)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 'var(--radius-md)',
            maxWidth: '520px',
            width: '100%',
            padding: '24px',
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid var(--border-warm)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: 'var(--primary-800)' }}>
                {t.nsqfModalTitle}
              </h3>
              <button onClick={() => setShowNsqfModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                <X size={18} />
              </button>
            </div>
            <p style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--text-main)', marginBottom: '16px' }}>
              {t.nsqfExplanation}
            </p>
            <div style={{ background: 'var(--surface-subtle)', padding: '12px 14px', borderRadius: 'var(--radius-sm)', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '18px' }}>
              ✓ <strong>Level 1 - 2:</strong> Basic preparatory manual tasks.<br />
              ✓ <strong>Level 3 - 4:</strong> Skilled operator / technician (e.g. Tractor & Farm Machinery Operator).<br />
              ✓ <strong>Level 5 - 6:</strong> Supervisor and specialized micro-entrepreneur.
            </div>
            <button onClick={() => setShowNsqfModal(false)} className="btn btn-primary" style={{ width: '100%' }}>
              {t.closeBtn}
            </button>
          </div>
        </div>
      )}

      {/* DOCUMENTS EXPLANATION MODAL */}
      {showDocsModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.55)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 'var(--radius-md)',
            maxWidth: '540px',
            width: '100%',
            padding: '24px',
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid var(--border-warm)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0, color: 'var(--primary-800)' }}>
                {t.whatAreDocs}
              </h3>
              <button onClick={() => setShowDocsModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                <X size={18} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px', marginBottom: '20px' }}>
              <div>
                <strong>1. {t.docAadhaar}:</strong>
                <p style={{ margin: '2px 0 0 0', color: 'var(--text-muted)' }}>{t.docAadhaarWhy}</p>
              </div>
              <div>
                <strong>2. {t.docPhone}:</strong>
                <p style={{ margin: '2px 0 0 0', color: 'var(--text-muted)' }}>{t.docPhoneWhy}</p>
              </div>
              <div>
                <strong>3. {t.docBank}:</strong>
                <p style={{ margin: '2px 0 0 0', color: 'var(--text-muted)' }}>{t.docBankWhy}</p>
              </div>
              <div>
                <strong>4. {t.docEdu}:</strong>
                <p style={{ margin: '2px 0 0 0', color: 'var(--text-muted)' }}>{t.docEduWhy}</p>
              </div>
              <div>
                <strong>5. {t.docPhoto}:</strong>
                <p style={{ margin: '2px 0 0 0', color: 'var(--text-muted)' }}>{t.docPhotoWhy}</p>
              </div>
            </div>
            <button onClick={() => setShowDocsModal(false)} className="btn btn-primary" style={{ width: '100%' }}>
              {t.closeBtn}
            </button>
          </div>
        </div>
      )}

      {/* G. VOICE ASSISTANT INTERACTIVE DRAWER */}
      {showVoiceDrawer && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          right: 0,
          maxWidth: '460px',
          width: '100%',
          background: '#fff',
          boxShadow: '0 -4px 24px rgba(0, 0, 0, 0.18)',
          borderTopLeftRadius: 'var(--radius-lg)',
          borderTopRightRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-warm)',
          zIndex: 9998,
          padding: '20px',
          maxHeight: '85vh',
          overflowY: 'auto'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary-600)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Mic size={16} />
              </div>
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: 800, margin: 0 }}>{t.askVoiceTitle}</h4>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Grounded in verified project catalog</div>
              </div>
            </div>
            <button onClick={() => setShowVoiceDrawer(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
              <X size={18} />
            </button>
          </div>

          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
            {t.askVoiceSubtitle}
          </p>

          {/* Quick Questions Chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
            {[t.qNearestCenter, t.qCourseFee, t.qDocuments, t.qNextBatch, t.qJobs, t.qBusiness].map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickQuestion(q)}
                style={{
                  padding: '6px 10px',
                  borderRadius: 'var(--radius-full)',
                  background: voiceQuery === q ? 'var(--primary-600)' : 'var(--surface-subtle)',
                  color: voiceQuery === q ? '#fff' : 'var(--text-main)',
                  border: '1px solid var(--border-warm)',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                {q}
              </button>
            ))}
          </div>

          {/* Answer Box */}
          {voiceAnswer && (
            <div style={{ background: '#ecfdf5', padding: '12px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid #a7f3d0', marginBottom: '14px', fontSize: '13px', lineHeight: 1.5, color: '#065f46' }}>
              <div style={{ fontWeight: 700, fontSize: '11px', color: '#047857', marginBottom: '4px' }}>
                JeevanPath Verified Response:
              </div>
              {voiceAnswer}
            </div>
          )}

          <div style={{ display: 'flex', gap: '6px' }}>
            <Link to="/assistant" className="btn btn-secondary" style={{ flex: 1, fontSize: '12px', textAlign: 'center' }}>
              Full Voice Assistant →
            </Link>
          </div>
        </div>
      )}

      {/* ENROLLMENT MODAL */}
      <EnrollmentModal
        isOpen={showEnrollModal}
        onClose={() => setShowEnrollModal(false)}
        initialMode={enrollModalMode}
        courseInfo={{
          ...recommendedCourse,
          occupationKey: activeOccKey,
          occupationTitle: displayTitle,
          key: recommendedCourse.title?.toLowerCase().replace(/[^a-z0-9]+/g, '_')
        }}
        trainingCenter={primaryCenter}
        beneficiaryProfile={userProfile}
        existingApplication={activeApplication}
        onApplicationCreated={(newApp) => {
          setActiveApplication(newApp);
          loadData();
        }}
        onApplicationUpdated={(updatedApp) => {
          setActiveApplication(updatedApp);
          loadData();
        }}
      />

    </div>
  );
};

export default Roadmap;
