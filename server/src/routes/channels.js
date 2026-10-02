import express from 'express';
import { channelLimiter, sanitizeString } from '../middleware/security.js';
import { verifyTwilioSignature } from '../middleware/twilioSignature.js';
import { handleWhatsAppWebhook } from '../channels/whatsapp.js';
import { handleIvrVoice, handleIvrGather } from '../channels/ivr.js';
import { processConversationTurn } from '../services/conversation.js';
import { User } from '../models/User.js';
import { Profile } from '../models/Profile.js';

const router = express.Router();

// GET /api/channels/whatsapp/webhook
router.get('/whatsapp/webhook', (req, res) => {
  return res.send('PM AJAY Twilio WhatsApp Webhook Active');
});

// POST /api/channels/whatsapp/webhook
router.post('/whatsapp/webhook', channelLimiter, verifyTwilioSignature, handleWhatsAppWebhook);

// POST /api/channels/ivr/voice
router.post('/ivr/voice', channelLimiter, verifyTwilioSignature, handleIvrVoice);

// POST /api/channels/ivr/gather
router.post('/ivr/gather', channelLimiter, verifyTwilioSignature, handleIvrGather);

/**
 * POST /api/channels/simulate
 * Interactive multi-channel simulation endpoint for web demo and testing without live telephony.
 * Simulates WhatsApp, IVR, and Kiosk interactions with state machine backing.
 */
router.post('/simulate', async (req, res) => {
  try {
    const channel = sanitizeString(req.body.channel, 20) || 'whatsapp';
    const message = sanitizeString(req.body.message, 1000);
    const phone = sanitizeString(req.body.phone, 20) || '9876543210';
    const lang = sanitizeString(req.body.language, 10) || 'te';
    const dialect = sanitizeString(req.body.dialect, 40) || '';
    const digits = sanitizeString(req.body.digits, 10) || '';
    const ivrStep = sanitizeString(req.body.ivrStep, 20) || 'language';

    // 1. IVR Specific Simulation Flow
    if (channel === 'ivr') {
      if (ivrStep === 'language') {
        const selectedLang = digits === '2' ? 'hi' : digits === '3' ? 'en' : 'te';
        const prompt = selectedLang === 'te'
          ? 'మీ భాష తెలుగు ఎంపికైంది. దయచేసి మీరు నేర్చుకోవాలనుకుంటున్న పని గురించి మాట్లాడండి. లేదా కుట్టుపని కోసం 1, డెయిరీ కోసం 2, ఎలక్ట్రికల్ కోసం 3 నొక్కండి.'
          : selectedLang === 'hi'
            ? 'आपकी भाषा हिन्दी चुनी गई है. कृपया अपने हुनर के बारे में बताएं. या सिलाई के लिए 1, डेयरी के लिए 2, बिजली काम के लिए 3 दबाएं.'
            : 'English selected. Please speak about your skills or press 1 for Tailoring, 2 for Dairy, 3 for Electrical.';

        return res.json({
          channel: 'ivr',
          ivrStep: 'skill',
          language: selectedLang,
          audioPrompt: prompt,
          options: [
            { digit: '1', label: 'Tailoring & Garment Making' },
            { digit: '2', label: 'Dairy & Livestock Farming' },
            { digit: '3', label: 'Solar & Electrical Technician' }
          ]
        });
      }

      if (ivrStep === 'skill') {
        let tradeTitle = 'Self Employed Tailor';
        let tradeKey = 'self_employed_tailor';

        if (digits === '2' || message.toLowerCase().includes('dairy')) {
          tradeTitle = 'Dairy Farmer Entrepreneur';
          tradeKey = 'dairy_farmer_entrepreneur';
        } else if (digits === '3' || message.toLowerCase().includes('electric') || message.toLowerCase().includes('solar')) {
          tradeTitle = 'Solar PV Installation Technician';
          tradeKey = 'solar_pv_installer';
        }

        const confirmPrompt = lang === 'te'
          ? `మీ ఎంపిక ${tradeTitle}. మీ జిల్లాలో NSQF సర్టిఫికేషన్ మరియు PM విశ్వకర్మ టూల్‌కిట్ లోన్ పథకం అందుబాటులో ఉంది. మీ ఫోన్‌కు SMS సారాంశం పొందడానికి 1 నొక్కండి.`
          : lang === 'hi'
            ? `आपकी पसंद ${tradeTitle} है. आपके जिले में NSQF ट्रेनिंग और PM विश्वकर्मा टूलकिट लोन उपलब्ध है. फोन पर SMS पाने के लिए 1 दबाएं.`
            : `Your matched pathway is ${tradeTitle}. NSQF certification and PM Vishwakarma toolkit loans are available. Press 1 to receive an SMS summary.`;

        return res.json({
          channel: 'ivr',
          ivrStep: 'confirm',
          language: lang,
          tradeTitle,
          tradeKey,
          audioPrompt: confirmPrompt
        });
      }

      if (ivrStep === 'confirm') {
        const smsSummary = `PM AJAY Skilling Summary: Matched Pathway: Self Employed Tailor (NSQF Level 4). 100% free training and PM Vishwakarma collateral free loan support. Nearest Center: Warangal District Livelihood Center.`;
        return res.json({
          channel: 'ivr',
          ivrStep: 'completed',
          audioPrompt: 'ధన్యవాదాలు! మీ మొబైల్ నంబర్‌కు పూర్తి శిక్షణ వివరాల SMS పంపబడింది. నమస్కారం.',
          smsSent: true,
          smsSummary
        });
      }
    }

    // 2. WhatsApp and Kiosk Simulation Flow
    let user = await User.findOne({ phone });
    if (!user) {
      user = await User.create({
        name: `Simulated Beneficiary (${phone.slice(-4)})`,
        phone,
        role: 'beneficiary',
        district: 'Warangal',
        consent: { given: true, at: new Date(), version: '1.0', language: lang }
      });

      await Profile.create({
        user: user._id,
        district: 'Warangal',
        state: 'Telangana',
        channel,
        language: lang,
        skills: []
      });
    }

    const sessionKey = `sim_${channel}_${phone}`;
    const result = await processConversationTurn({
      text: message || 'Namaste',
      lang,
      dialect,
      channel,
      userId: user._id,
      sessionKey
    });

    return res.json({
      channel,
      phone,
      simulatedResponse: result.replyText,
      replyText: result.replyText,
      stage: result.stage,
      isComplete: result.isComplete || false,
      extractedSkills: result.extractedSkills || [],
      updatedProfile: result.updatedProfile || {},
      matchedOpportunities: result.matchedOpportunities || [],
      profile: {
        skills: result.extractedSkills || [],
        district: result.updatedProfile?.district || 'Warangal',
        riskScore: result.updatedProfile?.riskScore || 20
      }
    });
  } catch (err) {
    return res.status(500).json({ error: 'Simulation processing failed' });
  }
});

export default router;
