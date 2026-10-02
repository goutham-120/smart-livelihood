/**
 * Benchmark Evaluation Dataset: 50 Multilingual Utterances
 * Real world vernacular and code mixed utterances spanning Telugu, Hindi, English, and regional dialects.
 * Mapped to canonical NSQF skills and profile fields for automated accuracy scoring.
 */

export const BENCHMARK_UTTERANCES = [
  // 1 to 15: Telugu and Telangana Dialect
  {
    id: 1,
    lang: 'te',
    dialect: 'telangana',
    text: 'నేను పదేళ్లుగా ఇంట్లో కుట్టు మిషన్ నడుపుతున్నాను, బ్లౌజులు ఫ్రాకులు కుడతాను',
    expectedSkills: ['sewing_machine_operation'],
    expectedPreference: null
  },
  {
    id: 2,
    lang: 'te',
    dialect: 'telangana',
    text: 'చేనేత మగ్గం మరియు కాటన్ చీరల నేత పని నాకు బాగా వచ్చు',
    expectedSkills: ['handloom_weaving'],
    expectedPreference: null
  },
  {
    id: 3,
    lang: 'te',
    dialect: 'telangana',
    text: 'నాకు సొంతంగా ఒక చిన్న టైలరింగ్ షాప్ పెట్టుకోవాలని ఉంది, ఉద్యోగం వద్దు',
    expectedSkills: ['sewing_machine_operation'],
    expectedPreference: 'self'
  },
  {
    id: 4,
    lang: 'te',
    dialect: 'telangana',
    text: 'పశువుల పెంపకం మరియు పాల డెయిరీ పని చేశాను, మిల్కింగ్ మెషిన్ తెలుసు',
    expectedSkills: ['milking_machine_handling', 'cattle_feed_nutrition'],
    expectedPreference: null
  },
  {
    id: 5,
    lang: 'te',
    dialect: 'telangana',
    text: 'మా ఊరిలో సోలార్ ప్యానెల్ ఇన్స్టాలేషన్ మరియు కరెంట్ వైరింగ్ పని నేర్చుకున్నా',
    expectedSkills: ['solar_panel_installation', 'house_wiring_electrical'],
    expectedPreference: null
  },
  {
    id: 6,
    lang: 'te',
    dialect: 'telangana',
    text: 'మొబైల్ ఫోన్లు రిపేర్ చేయడం డిస్ప్లే మార్చడం తెలుసు',
    expectedSkills: ['smartphone_hardware_repair'],
    expectedPreference: null
  },
  {
    id: 7,
    lang: 'te',
    dialect: 'telangana',
    text: 'మేము ఊరగాయలు మరియు జామ్ తయారు చేసి ప్యాకింగ్ చేస్తాము',
    expectedSkills: ['pickle_jam_preservation', 'food_packaging_hygiene'],
    expectedPreference: null
  },
  {
    id: 8,
    lang: 'te',
    dialect: 'telangana',
    text: 'మేస్త్రీ పని మరియు గోడల నిర్మాణం పైపు లైన్ ప్లంబింగ్ వచ్చు',
    expectedSkills: ['masonry_bricklaying', 'sanitary_plumbing'],
    expectedPreference: null
  },
  {
    id: 9,
    lang: 'te',
    dialect: 'telangana',
    text: 'నేను టెన్త్ క్లాస్ పాస్ అయ్యాను, కంప్యూటర్ డేటా ఎంట్రీ మరియు టైపింగ్ నేర్చుకోవాలి',
    expectedSkills: ['data_entry_vernacular_typing'],
    expectedPreference: null
  },
  {
    id: 10,
    lang: 'te',
    dialect: 'telangana',
    text: 'మాకు పొలంలో సేంద్రీయ ఎరువులు వర్మీ కంపోస్ట్ తయారీలో అనుభవం ఉంది',
    expectedSkills: ['organic_compost_vermicompost'],
    expectedPreference: null
  },
  {
    id: 11,
    lang: 'te',
    dialect: 'telangana',
    text: 'గ్రామంలో సిఎస్సి సెంటర్ ద్వారా డిజిటల్ సర్వీసులు మరియు ఆధార్ పేమెంట్స్ చేస్తాను',
    expectedSkills: ['csc_citizen_service_delivery', 'digital_banking_dbt_assistance'],
    expectedPreference: null
  },
  {
    id: 12,
    lang: 'te',
    dialect: 'telangana',
    text: 'హాస్పిటల్ లో పేషెంట్ కేర్ మరియు ప్రథమ చికిత్స అసిస్టెంట్ గా పనిచేశాను',
    expectedSkills: ['general_duty_hospital_assistance', 'first_aid_emergency_response'],
    expectedPreference: null
  },
  {
    id: 13,
    lang: 'te',
    dialect: 'telangana',
    text: 'వెల్డింగ్ పనులు మరియు ఐరన్ గేట్లు గ్రిల్స్ చేయడం నా వృత్తి',
    expectedSkills: ['structural_arc_welding'],
    expectedPreference: null
  },
  {
    id: 14,
    lang: 'te',
    dialect: 'telangana',
    text: 'గొర్రెలు మరియు మేకల పెంపకం గ్రామంలో చేస్తున్నాము',
    expectedSkills: ['goat_sheep_rearing'],
    expectedPreference: null
  },
  {
    id: 15,
    lang: 'te',
    dialect: 'telangana',
    text: 'కిరాణా దుకాణంలో కస్టమర్ సేల్స్ మరియు బిల్లింగ్ కౌంటర్ చూసుకుంటాను',
    expectedSkills: ['retail_sales_customer_service', 'pos_digital_billing'],
    expectedPreference: null
  },

  // 16 to 30: Hindi and Regional Phrasing
  {
    id: 16,
    lang: 'hi',
    dialect: 'standard',
    text: 'मुझे सिलाई मशीन चलाने का अच्छा तजुर्बा है और कपड़े पैटर्न काटने का काम आता है',
    expectedSkills: ['sewing_machine_operation', 'garment_pattern_cutting'],
    expectedPreference: null
  },
  {
    id: 17,
    lang: 'hi',
    dialect: 'standard',
    text: 'हम गाय भैंस का दूध निकालने और पशुओं की देखभाल का काम करते हैं',
    expectedSkills: ['milking_machine_handling', 'cattle_feed_nutrition'],
    expectedPreference: null
  },
  {
    id: 18,
    lang: 'hi',
    dialect: 'standard',
    text: 'सोलर पैनल लगाना और घरों की बिजली वायरिंग का काम मुझे आता है',
    expectedSkills: ['solar_panel_installation', 'house_wiring_electrical'],
    expectedPreference: null
  },
  {
    id: 19,
    lang: 'hi',
    dialect: 'standard',
    text: 'मुझे खुद की दुकान खोलनी है, कोई नौकरी नहीं करनी',
    expectedSkills: [],
    expectedPreference: 'self'
  },
  {
    id: 20,
    lang: 'hi',
    dialect: 'standard',
    text: 'स्मार्टफोन रिपेयरिंग और टच स्क्रीन बदलने का काम सीखा है',
    expectedSkills: ['smartphone_hardware_repair'],
    expectedPreference: null
  },
  {
    id: 21,
    lang: 'hi',
    dialect: 'standard',
    text: 'आचार और मुरब्बा बनाने की कला में मैं पारंगत हूँ',
    expectedSkills: ['pickle_jam_preservation'],
    expectedPreference: null
  },
  {
    id: 22,
    lang: 'hi',
    dialect: 'standard',
    text: 'ईंट की चिनाई और राजमिस्त्री का काम बरसों से कर रहा हूँ',
    expectedSkills: ['masonry_bricklaying'],
    expectedPreference: null
  },
  {
    id: 23,
    lang: 'hi',
    dialect: 'standard',
    text: 'प्लंबिंग और नल फिटिंग का काम मैं अच्छी तरह जानता हूँ',
    expectedSkills: ['sanitary_plumbing'],
    expectedPreference: null
  },
  {
    id: 24,
    lang: 'hi',
    dialect: 'standard',
    text: 'हॉस्पिटल में मरीजों की सेवा और फर्स्ट एड का अनुभव है',
    expectedSkills: ['general_duty_hospital_assistance', 'first_aid_emergency_response'],
    expectedPreference: null
  },
  {
    id: 25,
    lang: 'hi',
    dialect: 'standard',
    text: 'कंप्यूटर में हिंदी टाइपिंग और डेटा एंट्री का कोर्स किया है',
    expectedSkills: ['data_entry_vernacular_typing'],
    expectedPreference: null
  },
  {
    id: 26,
    lang: 'hi',
    dialect: 'bhojpuri',
    text: 'हमरा के बिजली के तार जोड़े अउर मोटर ठीक करे के बा',
    expectedSkills: ['house_wiring_electrical', 'home_appliance_repair'],
    expectedPreference: null
  },
  {
    id: 27,
    lang: 'hi',
    dialect: 'standard',
    text: 'बकरी पालन और भेड़ पालन में अच्छी आमदनी होती है',
    expectedSkills: ['goat_sheep_rearing'],
    expectedPreference: null
  },
  {
    id: 28,
    lang: 'hi',
    dialect: 'standard',
    text: 'कढ़ाई और जरदोजी का हाथ का काम हम घर पर करते हैं',
    expectedSkills: ['hand_embroidery'],
    expectedPreference: null
  },
  {
    id: 29,
    lang: 'hi',
    dialect: 'standard',
    text: 'दुकान में बहीखाता और एकाउंटिंग संभाल सकता हूँ',
    expectedSkills: ['micro_business_bookkeeping'],
    expectedPreference: null
  },
  {
    id: 30,
    lang: 'hi',
    dialect: 'standard',
    text: 'आर्क वेल्डिंग और लोहे की ग्रिल बनाना मेरा मुख्य पेशा है',
    expectedSkills: ['structural_arc_welding'],
    expectedPreference: null
  },

  // 31 to 40: Hinglish and Code Mixed
  {
    id: 31,
    lang: 'hi',
    dialect: 'standard',
    text: 'Main tailoring aur boutique ka business start karna chahti hoon',
    expectedSkills: ['sewing_machine_operation'],
    expectedPreference: 'self'
  },
  {
    id: 32,
    lang: 'hi',
    dialect: 'standard',
    text: 'Mujhe factory ya workshop me monthly salary job chahiye',
    expectedSkills: [],
    expectedPreference: 'wage'
  },
  {
    id: 33,
    lang: 'hi',
    dialect: 'standard',
    text: 'Mobile repairing aur hardware parts change karna aata hai',
    expectedSkills: ['smartphone_hardware_repair'],
    expectedPreference: null
  },
  {
    id: 34,
    lang: 'hi',
    dialect: 'standard',
    text: 'Solar installation aur invertor connection seekhna hai',
    expectedSkills: ['solar_panel_installation'],
    expectedPreference: null
  },
  {
    id: 35,
    lang: 'hi',
    dialect: 'standard',
    text: 'Dairy farming aur cattle feed nutrition me experience hai',
    expectedSkills: ['cattle_feed_nutrition'],
    expectedPreference: null
  },
  {
    id: 36,
    lang: 'hi',
    dialect: 'standard',
    text: 'Baking cakes aur bakery products banana janti hoon',
    expectedSkills: ['commercial_baking'],
    expectedPreference: null
  },
  {
    id: 37,
    lang: 'hi',
    dialect: 'standard',
    text: 'Computer data entry operator ki post ke liye apply karna hai',
    expectedSkills: ['data_entry_vernacular_typing'],
    expectedPreference: null
  },
  {
    id: 38,
    lang: 'hi',
    dialect: 'standard',
    text: 'Hospital general duty assistant patient care ward boy ka kaam kiya hai',
    expectedSkills: ['general_duty_hospital_assistance'],
    expectedPreference: null
  },
  {
    id: 39,
    lang: 'hi',
    dialect: 'standard',
    text: 'Retail customer sales counter aur POS digital billing machine chalata hoon',
    expectedSkills: ['retail_sales_customer_service', 'pos_digital_billing'],
    expectedPreference: null
  },
  {
    id: 40,
    lang: 'hi',
    dialect: 'standard',
    text: 'Home appliances mixer cooler aur fan repair kar leta hoon',
    expectedSkills: ['home_appliance_repair'],
    expectedPreference: null
  },

  // 41 to 50: English and Indian English
  {
    id: 41,
    lang: 'en',
    dialect: 'indian',
    text: 'I have 5 years experience in operating sewing machines and dress stitching',
    expectedSkills: ['sewing_machine_operation'],
    expectedPreference: null
  },
  {
    id: 42,
    lang: 'en',
    dialect: 'indian',
    text: 'I know rooftop solar photovoltaic installation and domestic house wiring',
    expectedSkills: ['solar_panel_installation', 'house_wiring_electrical'],
    expectedPreference: null
  },
  {
    id: 43,
    lang: 'en',
    dialect: 'indian',
    text: 'I want to start my own micro enterprise food processing business',
    expectedSkills: [],
    expectedPreference: 'self'
  },
  {
    id: 44,
    lang: 'en',
    dialect: 'indian',
    text: 'I have worked in dairy herd milking and animal feed nutrition',
    expectedSkills: ['milking_machine_handling', 'cattle_feed_nutrition'],
    expectedPreference: null
  },
  {
    id: 45,
    lang: 'en',
    dialect: 'indian',
    text: 'Skilled in masonry bricklaying and bathroom sanitary plumbing works',
    expectedSkills: ['masonry_bricklaying', 'sanitary_plumbing'],
    expectedPreference: null
  },
  {
    id: 46,
    lang: 'en',
    dialect: 'indian',
    text: 'Looking for wage employment in a manufacturing company with regular salary',
    expectedSkills: [],
    expectedPreference: 'wage'
  },
  {
    id: 47,
    lang: 'en',
    dialect: 'indian',
    text: 'Experienced in vermicompost organic farming and organic compost production',
    expectedSkills: ['organic_compost_vermicompost'],
    expectedPreference: null
  },
  {
    id: 48,
    lang: 'en',
    dialect: 'indian',
    text: 'Proficient in customer sales counter and POS digital scanner billing',
    expectedSkills: ['retail_sales_customer_service', 'pos_digital_billing'],
    expectedPreference: null
  },
  {
    id: 49,
    lang: 'en',
    dialect: 'indian',
    text: 'Trained as bedside geriatric elderly patient home care attendant',
    expectedSkills: ['elderly_patient_home_care'],
    expectedPreference: null
  },
  {
    id: 50,
    lang: 'en',
    dialect: 'indian',
    text: 'Skilled in structural arc welding and fabrication of iron security grills',
    expectedSkills: ['structural_arc_welding'],
    expectedPreference: null
  }
];
