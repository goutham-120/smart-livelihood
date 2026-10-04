export const skillsData = [
  // Tailoring & Apparel (8)
  {
    key: 'hand_embroidery',
    name: 'Hand Embroidery',
    names: { en: 'Hand Embroidery', hi: 'हाथ की कढ़ाई', te: 'చేతి ఎంబ్రాయిడరీ' },
    aliases: ['hand embroidery work', 'zari work stitching', 'aari embroidery design', 'needle craft work'],
    level: 2,
    sector: 'Apparel & Handloom',
    prerequisites: []
  },
  {
    key: 'sewing_machine_operation',
    name: 'Sewing Machine Operation',
    names: { en: 'Sewing Machine Operation', hi: 'सिलाई मशीन संचालन', te: 'కుట్టు మిషన్ ఆపరేషన్' },
    aliases: ['tailoring and stitching', 'cloth sewing work', 'garment stitching machine', 'dress stitching'],
    level: 2,
    sector: 'Apparel & Handloom',
    prerequisites: []
  },
  {
    key: 'garment_pattern_cutting',
    name: 'Garment Pattern Cutting',
    names: { en: 'Garment Pattern Cutting', hi: 'कपड़ा पैटर्न काटना', te: 'వస్త్రాల నమూనా కటింగ్' },
    aliases: ['fabric pattern cutting', 'dress measurement cutting', 'cloth master cutting', 'garment layout cutting'],
    level: 3,
    sector: 'Apparel & Handloom',
    prerequisites: ['sewing_machine_operation']
  },
  {
    key: 'apparel_quality_checking',
    name: 'Apparel Quality Checking',
    names: { en: 'Apparel Quality Checking', hi: 'कपड़ा गुणवत्ता जांच', te: 'దుస్తుల నాణ్యత తనిఖీ' },
    aliases: ['garment defect inspection', 'cloth stitching quality check', 'apparel finishing inspection'],
    level: 3,
    sector: 'Apparel & Handloom',
    prerequisites: ['sewing_machine_operation']
  },
  {
    key: 'handloom_weaving',
    name: 'Handloom Weaving',
    names: { en: 'Handloom Weaving', hi: 'हथकरघा बुनाई', te: 'చేనేత నేత పని' },
    aliases: ['traditional saree weaving', 'cotton cloth handloom weaving', 'yarn loom operation'],
    level: 3,
    sector: 'Apparel & Handloom',
    prerequisites: []
  },
  {
    key: 'textile_screen_printing',
    name: 'Textile Screen Printing',
    names: { en: 'Textile Screen Printing', hi: 'कपड़ा स्क्रीन प्रिंटिंग', te: 'వస్త్ర స్క్రీన్ ప్రింటింగ్' },
    aliases: ['fabric block printing', 'dyeing and screen printing', 'saree textile printing'],
    level: 2,
    sector: 'Apparel & Handloom',
    prerequisites: []
  },
  {
    key: 'fashion_accessory_making',
    name: 'Fashion Accessory Making',
    names: { en: 'Fashion Accessory Making', hi: 'फैशन सहायक सामग्री निर्माण', te: 'ఫ్యాషన్ వస్తువుల తయారీ' },
    aliases: ['handmade jewelry crafting', 'bangle making design', 'bead embroidery ornaments'],
    level: 2,
    sector: 'Apparel & Handloom',
    prerequisites: []
  },
  {
    key: 'industrial_sewing',
    name: 'Industrial Sewing',
    names: { en: 'Industrial Sewing', hi: 'औद्योगिक सिलाई', te: 'పారిశ్రామిక కుట్టు పని' },
    aliases: ['garment export stitching', 'high speed power sewing machine', 'apparel factory stitching'],
    level: 3,
    sector: 'Apparel & Handloom',
    prerequisites: ['sewing_machine_operation']
  },

  // Food Processing & Culinary (8)
  {
    key: 'pickle_jam_preservation',
    name: 'Pickle and Jam Preservation',
    names: { en: 'Pickle and Jam Preservation', hi: 'अचार और मुरब्बा संरक्षण', te: 'ఊరగాయలు మరియు జామ్ తయారీ' },
    aliases: ['pickle processing unit', 'fruit chutney preservation', 'spiced vegetable pickling'],
    level: 2,
    sector: 'Food Processing',
    prerequisites: []
  },
  {
    key: 'commercial_baking',
    name: 'Commercial Baking',
    names: { en: 'Commercial Baking', hi: 'व्यावसायिक बेकिंग', te: 'బేకరీ ఉత్పత్తుల తయారీ' },
    aliases: ['bread and biscuit making', 'bakery confectionery baking', 'cake pastry preparation'],
    level: 3,
    sector: 'Food Processing',
    prerequisites: []
  },
  {
    key: 'food_packaging_hygiene',
    name: 'Food Packaging and Hygiene',
    names: { en: 'Food Packaging and Hygiene', hi: 'खाद्य पैकेजिंग और स्वच्छता', te: 'ఆహార ప్యాకింగ్ మరియు పరిశుభ్రత' },
    aliases: ['sealed pouch food packaging', 'fssai food safety hygiene standard', 'vacuum packet sealing'],
    level: 2,
    sector: 'Food Processing',
    prerequisites: []
  },
  {
    key: 'spice_grinding_blending',
    name: 'Spice Grinding and Blending',
    names: { en: 'Spice Grinding and Blending', hi: 'मसाला पिसाई और मिश्रण', te: 'మసాలాల పొడి తయారీ' },
    aliases: ['chilli turmeric masala grinding', 'commercial spice blending packaging', 'powder spice milling'],
    level: 2,
    sector: 'Food Processing',
    prerequisites: []
  },
  {
    key: 'grain_milling_processing',
    name: 'Grain Milling and Processing',
    names: { en: 'Grain Milling and Processing', hi: 'अनाज पिसाई और प्रसंस्करण', te: 'ధాన్యపు మిల్లింగ్ ప్రాసెసింగ్' },
    aliases: ['flour atta mill operation', 'pulses dal processing mill', 'rice milling machinery'],
    level: 3,
    sector: 'Food Processing',
    prerequisites: []
  },
  {
    key: 'dairy_product_making',
    name: 'Dairy Product Making',
    names: { en: 'Dairy Product Making', hi: 'दुग्ध उत्पाद निर्माण', te: 'పాల ఉత్పత్తుల తయారీ' },
    aliases: ['ghee butter paneer production', 'curd and dairy processing unit', 'sweet khoa preparation'],
    level: 3,
    sector: 'Food Processing',
    prerequisites: []
  },
  {
    key: 'fruit_pulp_extraction',
    name: 'Fruit Pulp Extraction',
    names: { en: 'Fruit Pulp Extraction', hi: 'फल गूदा निष्कर्षण', te: 'పండ్ల గుజ్జు వెలికితీత' },
    aliases: ['mango fruit pulp canning', 'citrus juice extraction', 'fruit processing plant processing'],
    level: 3,
    sector: 'Food Processing',
    prerequisites: []
  },
  {
    key: 'catering_cookery',
    name: 'Catering and Cookery',
    names: { en: 'Catering and Cookery', hi: 'खानपान और पाक कला', te: 'వంటకం మరియు క్యాటరింగ్' },
    aliases: ['bulk commercial cooking', 'event catering food preparation', 'tiffin center meal preparation'],
    level: 2,
    sector: 'Food Processing',
    prerequisites: []
  },

  // Agriculture & Horticulture (7)
  {
    key: 'organic_compost_vermicompost',
    name: 'Organic and Vermicompost Preparation',
    names: { en: 'Organic and Vermicompost Preparation', hi: 'जैविक और वर्मीकम्पोस्ट निर्माण', te: 'సేంద్రీయ వర్మీకంపోస్ట్ తయారీ' },
    aliases: ['earthworm vermicompost bed', 'bio fertilizer compost making', 'organic farm manure preparation'],
    level: 2,
    sector: 'Agriculture',
    prerequisites: []
  },
  {
    key: 'drip_irrigation_maintenance',
    name: 'Drip Irrigation Maintenance',
    names: { en: 'Drip Irrigation Maintenance', hi: 'ड्रिप सिंचाई रखरखाव', te: 'బిందు సేద్యం నిర్వహణ' },
    aliases: ['micro irrigation pipe layout', 'drip lateral filter flushing', 'sprinkler irrigation installation'],
    level: 3,
    sector: 'Agriculture',
    prerequisites: []
  },
  {
    key: 'polyhouse_nursery_management',
    name: 'Polyhouse and Nursery Management',
    names: { en: 'Polyhouse and Nursery Management', hi: 'पॉलीहाउस और नर्सरी प्रबंधन', te: 'పాలీహౌస్ నర్సరీ యాజమాన్యం' },
    aliases: ['greenhouse sapling cultivation', 'horticulture seedling nursery', 'shade net plant grafting'],
    level: 3,
    sector: 'Agriculture',
    prerequisites: []
  },
  {
    key: 'integrated_pest_management',
    name: 'Integrated Pest Management',
    names: { en: 'Integrated Pest Management', hi: 'एकीकृत कीट प्रबंधन', te: 'సమగ్ర సస్యరక్షణ' },
    aliases: ['bio pesticide neem oil spraying', 'biological crop pest control', 'crop disease spray identification'],
    level: 3,
    sector: 'Agriculture',
    prerequisites: []
  },
  {
    key: 'tractor_farm_machinery',
    name: 'Tractor and Farm Machinery Operation',
    names: { en: 'Tractor and Farm Machinery Operation', hi: 'ट्रैक्टर और कृषि यंत्र संचालन', te: 'ట్రాక్టర్ వ్యవసాయ యంత్రాల నిర్వహణ' },
    aliases: [
      'tractor ploughing cultivator',
      'harvester farm equipment maintenance',
      'rotavator field operation',
      'tractor farm machinery',
      'farm machinery repair',
      'tractor repair mechanic',
      'farm equipment repair',
      'agricultural machinery operator',
      'tractor operation'
    ],
    level: 3,
    sector: 'Agriculture',
    prerequisites: []
  },
  {
    key: 'medicinal_plant_cultivation',
    name: 'Medicinal Plant Cultivation',
    names: { en: 'Medicinal Plant Cultivation', hi: 'औषधीय पौध खेती', te: 'ఔషధ మొక్కల సాగు' },
    aliases: ['herbal crop farming', 'ashwagandha aloe vera cultivation', 'ayurvedic raw herb harvesting'],
    level: 3,
    sector: 'Agriculture',
    prerequisites: []
  },
  {
    key: 'seed_grading_treatment',
    name: 'Seed Grading and Treatment',
    names: { en: 'Seed Grading and Treatment', hi: 'बीज ग्रेडिंग और उपचार', te: 'విత్తన శుద్ధి మరియు గ్రేడింగ్' },
    aliases: ['agricultural seed germination sorting', 'fungicide seed treatment coating', 'quality crop seed packaging'],
    level: 2,
    sector: 'Agriculture',
    prerequisites: []
  },

  // Dairy & Animal Husbandry (6)
  {
    key: 'milking_machine_handling',
    name: 'Milking Machine and Quality Handling',
    names: { en: 'Milking Machine and Quality Handling', hi: 'मिल्किंग मशीन और गुणवत्ता प्रबंधन', te: 'మిల్కింగ్ మెషిన్ నిర్వహణ' },
    aliases: ['automated dairy milking cluster', 'milk fat testing lactometer', 'dairy sanitation bulk milk cooler'],
    level: 2,
    sector: 'Dairy & Animal Husbandry',
    prerequisites: []
  },
  {
    key: 'cattle_feed_nutrition',
    name: 'Cattle Feed and Nutrition',
    names: { en: 'Cattle Feed and Nutrition', hi: 'पशु आहार एवं पोषण', te: 'పశువుల దాణా మరియు పోషణ' },
    aliases: ['silage green fodder preparation', 'cattle feed ration formulation', 'mineral mixture livestock feeding'],
    level: 2,
    sector: 'Dairy & Animal Husbandry',
    prerequisites: []
  },
  {
    key: 'artificial_insemination_support',
    name: 'Artificial Insemination Support',
    names: { en: 'Artificial Insemination Support', hi: 'कृत्रिम गर्भाधान सहायता', te: 'కృత్రిమ గర్భధారణ సహాయం' },
    aliases: ['bovine breeding ai technique', 'liquid nitrogen semen straw storage', 'veterinary breeding technician support'],
    level: 4,
    sector: 'Dairy & Animal Husbandry',
    prerequisites: []
  },
  {
    key: 'poultry_farm_brooding',
    name: 'Poultry Farm and Brooding Management',
    names: { en: 'Poultry Farm and Brooding Management', hi: 'पोल्ट्री फार्म एवं ब्रूडिंग प्रबंधन', te: 'పౌల్ట్రీ బ్రూడింగ్ నిర్వహణ' },
    aliases: ['broiler chicken shed temperature control', 'country chicken rearing vaccination', 'egg layer farm management'],
    level: 3,
    sector: 'Dairy & Animal Husbandry',
    prerequisites: []
  },
  {
    key: 'goat_sheep_rearing',
    name: 'Goat and Sheep Rearing',
    names: { en: 'Goat and Sheep Rearing', hi: 'बकरी और भेड़ पालन', te: 'మేకలు మరియు గొర్రెల పెంపకం' },
    aliases: ['stall fed goat farming management', 'sheep deworming vaccination routine', 'livestock herd grazing management'],
    level: 2,
    sector: 'Dairy & Animal Husbandry',
    prerequisites: []
  },
  {
    key: 'dairy_shed_hygiene',
    name: 'Dairy Shed Hygiene and Disease Prevention',
    names: { en: 'Dairy Shed Hygiene and Disease Prevention', hi: 'डेयरी शेड स्वच्छता एवं रोग निवारण', te: 'డైరీ షెడ్ పరిశుభ్రత మరియు వ్యాధి నివారణ' },
    aliases: ['cattle shed disinfection cleaning', 'mastitis foot and mouth detection', 'livestock animal welfare hygiene'],
    level: 2,
    sector: 'Dairy & Animal Husbandry',
    prerequisites: []
  },

  // Electronics & Electrical Repair (7)
  {
    key: 'home_appliance_repair',
    name: 'Home Appliance Repair',
    names: { en: 'Home Appliance Repair', hi: 'घरेलू उपकरण मरम्मत', te: 'గృహోపకరణాల మరమ్మత్తు' },
    aliases: ['washing machine mixer grinder servicing', 'fan cooler iron repair', 'kitchen electric appliance troubleshooting'],
    level: 3,
    sector: 'Electronics & Hardware',
    prerequisites: []
  },
  {
    key: 'house_wiring_electrical',
    name: 'House Wiring and Electrical Installation',
    names: { en: 'House Wiring and Electrical Installation', hi: 'हाउस वायरिंग और विद्युत स्थापना', te: 'ఇంటి వైరింగ్ మరియు ఎలక్ట్రికల్ ఫిట్టింగ్' },
    aliases: ['single phase house electrical wiring', 'mcb distribution board fixing', 'conduit switchboard wiring'],
    level: 3,
    sector: 'Electronics & Hardware',
    prerequisites: []
  },
  {
    key: 'solar_panel_installation',
    name: 'Solar Panel Installation and Maintenance',
    names: { en: 'Solar Panel Installation and Maintenance', hi: 'सोलर पैनल स्थापना और रखरखाव', te: 'సోలార్ ప్యానెల్ బిగింపు మరియు నిర్వహణ' },
    aliases: ['rooftop solar pv module mounting', 'solar inverter battery cabling', 'solar panel angle cleaning'],
    level: 3,
    sector: 'Electronics & Hardware',
    prerequisites: ['house_wiring_electrical']
  },
  {
    key: 'smartphone_hardware_repair',
    name: 'Smartphone Hardware Repair',
    names: { en: 'Smartphone Hardware Repair', hi: 'स्मार्टफोन हार्डवेयर मरम्मत', te: 'స్మార్ట్‌ఫోన్ హార్డ్‌వేర్ రిపేర్' },
    aliases: ['mobile screen display replacement', 'charging port smd soldering', 'smartphone battery mic speaker change'],
    level: 3,
    sector: 'Electronics & Hardware',
    prerequisites: []
  },
  {
    key: 'refrigeration_ac_servicing',
    name: 'Refrigeration and AC Servicing',
    names: { en: 'Refrigeration and AC Servicing', hi: 'प्रशीतन और एसी सर्विसिंग', te: 'రిఫ్రిజిరేటర్ మరియు ఏసీ సర్వీసింగ్' },
    aliases: ['split ac gas charging vacuuming', 'fridge compressor troubleshooting', 'copper pipe brazing flare tool'],
    level: 4,
    sector: 'Electronics & Hardware',
    prerequisites: ['house_wiring_electrical']
  },
  {
    key: 'motor_rewinding',
    name: 'Electric Motor Rewinding',
    names: { en: 'Electric Motor Rewinding', hi: 'इलेक्ट्रिक मोटर रिवाइंडिंग', te: 'ఎలక్ట్రిక్ మోటార్ రీవైండింగ్' },
    aliases: ['submersible pump motor coil winding', 'copper wire insulation slot wedging', 'ceiling fan armature rewinding'],
    level: 3,
    sector: 'Electronics & Hardware',
    prerequisites: []
  },
  {
    key: 'cctv_security_installation',
    name: 'CCTV and Security System Installation',
    names: { en: 'CCTV and Security System Installation', hi: 'सीसीटीवी और सुरक्षा प्रणाली स्थापना', te: 'సీసీటీవీ సెక్యూరిటీ సిస్టమ్ ఇన్స్టాలేషన్' },
    aliases: ['ip camera dvr nvr configuration', 'coaxial bnc connector cabling', 'biometric attendance sensor setup'],
    level: 3,
    sector: 'Electronics & Hardware',
    prerequisites: ['house_wiring_electrical']
  },

  // Construction & Plumbing (6)
  {
    key: 'masonry_bricklaying',
    name: 'Masonry and Bricklaying',
    names: { en: 'Masonry and Bricklaying', hi: 'चिनाई और ईंट जोड़ाई', te: 'మేస్త్రీ మరియు ఇటుకల నిర్మాణం' },
    aliases: ['cement mortar brick wall construction', 'plastering concrete block laying', 'level plumb line foundation work'],
    level: 2,
    sector: 'Construction',
    prerequisites: []
  },
  {
    key: 'sanitary_plumbing',
    name: 'Sanitary and Plumbing Fitting',
    names: { en: 'Sanitary and Plumbing Fitting', hi: 'सेनेटरी और प्लंबिंग फिटिंग', te: 'శానిటరీ మరియు ప్లంబింగ్ ఫిట్టింగ్' },
    aliases: ['cpvc upvc pipe joint installation', 'bathroom water tap shower valve repair', 'overhead water tank pipe connection'],
    level: 3,
    sector: 'Construction',
    prerequisites: []
  },
  {
    key: 'tile_marble_laying',
    name: 'Tile and Marble Laying',
    names: { en: 'Tile and Marble Laying', hi: 'टाइल और मार्बल बिछाना', te: 'టైల్స్ మరియు మార్బుల్ అమరిక' },
    aliases: ['vitrified floor tile cutting fixing', 'wall tile ceramic adhesive spacing', 'granite slab polishing level'],
    level: 3,
    sector: 'Construction',
    prerequisites: []
  },
  {
    key: 'structural_arc_welding',
    name: 'Structural Arc Welding',
    names: { en: 'Structural Arc Welding', hi: 'संरचनात्मक आर्क वेल्डिंग', te: 'ఆర్క్ వెల్డింగ్ పని' },
    aliases: ['iron gate grill metal fabrication', 'shielded metal arc welding electrode', 'mild steel angle bar cutting joint'],
    level: 3,
    sector: 'Construction',
    prerequisites: []
  },
  {
    key: 'building_painting_distempering',
    name: 'Building Painting and Distempering',
    names: { en: 'Building Painting and Distempering', hi: 'भवन पुताई और डिस्टेंपरिंग', te: 'భవన రంగులు మరియు పెయింటింగ్' },
    aliases: ['wall putty sanding roller painting', 'exterior weatherproof emulsion coat', 'wood enamel paint application'],
    level: 2,
    sector: 'Construction',
    prerequisites: []
  },
  {
    key: 'carpentry_shuttering',
    name: 'Carpentry and Shuttering',
    names: { en: 'Carpentry and Shuttering', hi: 'बढ़ईगीरी और शटरिंग', te: 'చెక్క పని మరియు షట్టరింగ్' },
    aliases: ['plywood door frame furniture joint', 'concrete column slab shuttering formwork', 'wood planing drilling measuring'],
    level: 3,
    sector: 'Construction',
    prerequisites: []
  },

  // Retail & Micro-Commerce (6)
  {
    key: 'retail_sales_customer_service',
    name: 'Retail Sales and Customer Service',
    names: { en: 'Retail Sales and Customer Service', hi: 'खुदरा बिक्री और ग्राहक सेवा', te: 'రిటైల్ అమ్మకాలు మరియు కస్టమర్ సర్వీస్' },
    aliases: ['counter sales store greeting', 'product merchandising shelf display', 'customer grievance resolution handling'],
    level: 2,
    sector: 'Retail & Commerce',
    prerequisites: []
  },
  {
    key: 'pos_digital_billing',
    name: 'POS and Digital Billing Operations',
    names: { en: 'POS and Digital Billing Operations', hi: 'पीओएस और डिजिटल बिलिंग संचालन', te: 'పిఒఎస్ మరియు డిజిటల్ బిల్లింగ్' },
    aliases: ['barcode scanner cash register entry', 'upi qr payment card swipe terminal', 'gst retail invoice printing'],
    level: 2,
    sector: 'Retail & Commerce',
    prerequisites: []
  },
  {
    key: 'inventory_stock_replenishment',
    name: 'Inventory and Stock Replenishment',
    names: { en: 'Inventory and Stock Replenishment', hi: 'इन्वेंटरी और स्टॉक पुनःपूर्ति', te: 'ఇన్వెంటరీ మరియు స్టాక్ నిర్వహణ' },
    aliases: ['godown stock register counting', 'expiry date product rotation fifo', 'warehouse item dispatch receiving'],
    level: 2,
    sector: 'Retail & Commerce',
    prerequisites: []
  },
  {
    key: 'micro_business_bookkeeping',
    name: 'Micro-business Bookkeeping',
    names: { en: 'Micro-business Bookkeeping', hi: 'सूक्ष्म व्यवसाय बहीखाता', te: 'చిన్న వ్యాపార లెక్కలు మరియు ఖాతా' },
    aliases: ['daily cash ledger entry ledger', 'credit khata customer tracking', 'profit margin revenue tracking record'],
    level: 3,
    sector: 'Retail & Commerce',
    prerequisites: []
  },
  {
    key: 'ecommerce_order_fulfillment',
    name: 'E-commerce Order Fulfillment',
    names: { en: 'E-commerce Order Fulfillment', hi: 'ई-कॉमर्स ऑर्डर पूर्ति', te: 'ఈ-కామర్స్ ఆర్డర్ ప్యాకింగ్' },
    aliases: ['online courier parcel packing dispatch', 'delivery routing label sticking', 'return parcel checking inventory'],
    level: 2,
    sector: 'Retail & Commerce',
    prerequisites: []
  },
  {
    key: 'rural_market_vending',
    name: 'Rural Market Vending and Aggregation',
    names: { en: 'Rural Market Vending and Aggregation', hi: 'ग्रामीण बाजार बिक्री एवं एकत्रीकरण', te: 'గ్రామీణ మార్కెట్ వ్యాపారం' },
    aliases: ['weekly shandy haat vegetable stall', 'direct farm produce price negotiation', 'collective self help group selling'],
    level: 2,
    sector: 'Retail & Commerce',
    prerequisites: []
  },

  // Digital & IT Enabled Services (6)
  {
    key: 'data_entry_vernacular_typing',
    name: 'Data Entry and Vernacular Typing',
    names: { en: 'Data Entry and Vernacular Typing', hi: 'डेटा प्रविष्टि और मातृभाषा टाइपिंग', te: 'డేటా ఎంట్రీ మరియు టైపింగ్' },
    aliases: ['telugu hindi english keyboard typing', 'excel spreadsheet data feeding form', 'e-governance portal application entry'],
    level: 2,
    sector: 'Digital & IT-ITeS',
    prerequisites: []
  },
  {
    key: 'csc_citizen_service_delivery',
    name: 'CSC and Citizen Service Delivery',
    names: { en: 'CSC and Citizen Service Delivery', hi: 'सीएससी और नागरिक सेवा वितरण', te: 'మీ-సేవ / సిఎస్‌సి పౌర సేవలు' },
    aliases: ['meeseva caste income certificate apply', 'aadhaar card pan card update registration', 'pm kisan online portal verification'],
    level: 3,
    sector: 'Digital & IT-ITeS',
    prerequisites: ['data_entry_vernacular_typing']
  },
  {
    key: 'digital_banking_dbt_assistance',
    name: 'Digital Banking and DBT Assistance',
    names: { en: 'Digital Banking and DBT Assistance', hi: 'डिजिटल बैंकिंग एवं डीबीटी सहायता', te: 'డిజిటల్ బ్యాంకింగ్ మరియు డిబిటి సహాయం' },
    aliases: ['bank mitra aeps micro atm withdrawal', 'pm sby pm jjy scheme enrolment', 'shg bank credit linkage assistance'],
    level: 3,
    sector: 'Digital & IT-ITeS',
    prerequisites: []
  },
  {
    key: 'basic_computer_troubleshooting',
    name: 'Basic Computer and Printer Troubleshooting',
    names: { en: 'Basic Computer and Printer Troubleshooting', hi: 'बुनियादी कंप्यूटर एवं प्रिंटर समस्या निवारण', te: 'కంప్యూటర్ మరియు ప్రింటర్ ట్రబుల్షూటింగ్' },
    aliases: ['printer cartridge refill paper jam', 'windows operating system antivirus installation', 'lan internet wifi router connection'],
    level: 3,
    sector: 'Digital & IT-ITeS',
    prerequisites: []
  },
  {
    key: 'social_media_promotional_content',
    name: 'Social Media Local Business Promotion',
    names: { en: 'Social Media Local Business Promotion', hi: 'सोशल मीडिया स्थानीय व्यवसाय प्रचार', te: 'సోషల్ మీడియా వ్యాపార ప్రచారం' },
    aliases: ['whatsapp business product catalog post', 'google maps business profile listing', 'canva flyer design for local shop'],
    level: 2,
    sector: 'Digital & IT-ITeS',
    prerequisites: []
  },
  {
    key: 'bpo_voice_inbound_support',
    name: 'BPO Voice and Inbound Support',
    names: { en: 'BPO Voice and Inbound Support', hi: 'बीपीओ वॉयस और इनबाउंड सहायता', te: 'బిపిఒ వాయిస్ సపోర్ట్' },
    aliases: ['call center telephonic customer query', 'crm ticket logging status update', 'regional language helpline operator'],
    level: 3,
    sector: 'Digital & IT-ITeS',
    prerequisites: []
  },

  // Healthcare & Community Support (6)
  {
    key: 'elderly_patient_home_care',
    name: 'Elderly and Patient Home Care',
    names: { en: 'Elderly and Patient Home Care', hi: 'बुजुर्ग एवं रोगी गृह देखभाल', te: 'వృద్ధులు మరియు రోగుల గృహ సంరక్షణ' },
    aliases: ['bedside patient feeding sponge bath', 'vital signs bp thermometer monitoring', 'medicine schedule mobility wheelchair support'],
    level: 3,
    sector: 'Healthcare Support',
    prerequisites: []
  },
  {
    key: 'first_aid_emergency_response',
    name: 'First Aid and Emergency Response',
    names: { en: 'First Aid and Emergency Response', hi: 'प्राथमिक चिकित्सा एवं आपातकालीन प्रतिक्रिया', te: 'ప్రథమ చికిత్స మరియు అత్యవసర స్పందన' },
    aliases: ['cpr basic life support dressing bandaging', 'burn wound cut temporary stabilization', 'ambulance patient stretcher handling'],
    level: 3,
    sector: 'Healthcare Support',
    prerequisites: []
  },
  {
    key: 'general_duty_hospital_assistance',
    name: 'General Duty Hospital Assistance',
    names: { en: 'General Duty Hospital Assistance', hi: 'सामान्य ड्यूटी अस्पताल सहायता', te: 'ఆసుపత్రి జనరల్ డ్యూటీ సహాయం' },
    aliases: ['hospital ward linen sanitization', 'patient sample transfer wheelchair shifting', 'sterilization autoclave ward cleaning'],
    level: 3,
    sector: 'Healthcare Support',
    prerequisites: []
  },
  {
    key: 'maternal_child_nutrition_guidance',
    name: 'Maternal and Child Nutrition Guidance',
    names: { en: 'Maternal and Child Nutrition Guidance', hi: 'मातृ एवं शिशु पोषण मार्गदर्शन', te: 'తల్లీ పిల్లల పోషకాహార మార్గదర్శకత్వం' },
    aliases: ['anganwadi poshan tracker data monitoring', 'infant breastfeed weaning dietary guidance', 'pregnant mother iron folic acid advice'],
    level: 3,
    sector: 'Healthcare Support',
    prerequisites: []
  },
  {
    key: 'community_sanitation_survey',
    name: 'Community Sanitation and Hygiene Survey',
    names: { en: 'Community Sanitation and Hygiene Survey', hi: 'सामुदायिक स्वच्छता एवं सर्वेक्षण', te: 'కమ్యూనిటీ పారిశుధ్య సర్వే' },
    aliases: ['swachh bharat village chlorination check', 'waste segregation vector control tracking', 'public health awareness campaign'],
    level: 2,
    sector: 'Healthcare Support',
    prerequisites: []
  },
  {
    key: 'pharmacy_retail_assistant',
    name: 'Pharmacy Retail Assistance',
    names: { en: 'Pharmacy Retail Assistance', hi: 'फार्मेसी खुदरा सहायता', te: 'ఫార్మసీ రిటైల్ సహాయం' },
    aliases: ['medicine shelf sorting expiry sorting', 'prescription billing inventory receipt', 'medical store strip pack identification'],
    level: 3,
    sector: 'Healthcare Support',
    prerequisites: []
  }
];
