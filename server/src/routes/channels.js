import express from 'express';
import { channelLimiter, sanitizeString } from '../middleware/security.js';
import { verifyTwilioSignature } from '../middleware/twilioSignature.js';
import { handleWhatsAppWebhook } from '../channels/whatsapp.js';
import { handleIvrVoice, handleIvrGather } from '../channels/ivr.js';
import { processConversationTurn } from '../services/conversation.js';
import { User } from '../models/User.js';
import { Profile } from '../models/Profile.js';
import {
  detectLanguageFromText,
  normalizeLanguageCode,
  getLanguageConfig
} from '../channels/languages.js';

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
    const rawLang = sanitizeString(req.body.language, 20);
    const dialect = sanitizeString(req.body.dialect, 40) || '';
    const digits = sanitizeString(req.body.digits, 10) || '';
    const ivrStep = sanitizeString(req.body.ivrStep, 20) || 'language';

    // Per-turn language detection: Do NOT default or lock to English or Telugu!
    let lang = rawLang;
    if (!lang || lang === 'auto' || normalizeLanguageCode(lang) === 'en') {
      const detected = detectLanguageFromText(message);
      if (detected.language !== 'en' || !lang || lang === 'auto') {
        lang = detected.language;
      }
    }
    lang = normalizeLanguageCode(lang);

    // 1. IVR Specific Simulation Flow
    if (channel === 'ivr') {
      // If arbitrary user speech input is passed (from browser microphone or audio transcription)
      if (message && !digits) {
        const activeLang = normalizeLanguageCode(rawLang || lang);
        const langConfig = getLanguageConfig(activeLang);
        const { generateEmpatheticResponse } = await import('../services/aiService.js');
        const { extractLivelihoodProfile } = await import('../services/extract.js');

        let user = await User.findOne({ phone });
        if (!user) {
          user = await User.create({
            name: `Helpline Caller (${phone.slice(-4)})`,
            phone,
            role: 'beneficiary',
            district: 'Warangal',
            consent: { given: true, at: new Date(), version: '1.0', language: activeLang }
          });
        }

        let profile = await Profile.findOne({ user: user._id });
        if (!profile) {
          profile = await Profile.create({
            user: user._id,
            district: 'Warangal',
            state: 'Telangana',
            channel: 'ivr',
            language: activeLang,
            skills: []
          });
        }

        const userContext = {
          name: user.name,
          district: profile.district,
          skills: profile.skills,
          employmentPreference: profile.employmentPreference,
          education: profile.education
        };

        const [aiResult, ruleExtracted] = await Promise.all([
          generateEmpatheticResponse({
            userMessage: message,
            language: activeLang,
            userContext
          }),
          extractLivelihoodProfile(message)
        ]);

        const mergedSkills = Array.from(new Set([
          ...(profile.skills || []),
          ...(aiResult.extractedSkills || []),
          ...(ruleExtracted.skills || [])
        ]));
        profile.skills = mergedSkills;
        await profile.save();

        return res.json({
          channel: 'ivr',
          ivrStep: 'voice_conversation',
          language: activeLang,
          languageName: langConfig.name,
          nativeName: langConfig.nativeName,
          speechCode: langConfig.speechCode,
          transcript: message,
          audioPrompt: aiResult.replyText,
          replyText: aiResult.replyText,
          extractedSkills: profile.skills,
          options: [
            { digit: '1', label: 'Tailoring & Garments' },
            { digit: '2', label: 'Dairy & Livestock' },
            { digit: '3', label: 'Solar & Electrical' }
          ]
        });
      }

      // Existing DTMF Keypad Handling
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

        if (digits === '2' || (message && message.toLowerCase().includes('dairy'))) {
          tradeTitle = 'Dairy Farmer Entrepreneur';
          tradeKey = 'dairy_farmer_entrepreneur';
        } else if (digits === '3' || (message && (message.toLowerCase().includes('electric') || message.toLowerCase().includes('solar')))) {
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

    // 2. WhatsApp Conversational Livelihood Assistant Flow
    if (channel === 'whatsapp') {
      const { handleWhatsAppMessage } = await import('../services/whatsappAssistant.js');
      const waResult = await handleWhatsAppMessage({
        phone,
        message,
        rawLanguage: rawLang
      });

      return res.json({
        channel: 'whatsapp',
        phone,
        simulatedResponse: waResult.replyText,
        replyText: waResult.replyText,
        response: waResult.replyText,
        displayUserMessage: waResult.displayUserMessage,
        stage: 'conversational_dialogue',
        inputLanguage: waResult.inputLanguage,
        responseLanguage: waResult.responseLanguage,
        language: waResult.language,
        languageName: waResult.languageName,
        nativeName: waResult.nativeName,
        speechCode: waResult.speechCode,
        intent: waResult.intent,
        isComplete: false,
        extractedSkills: waResult.extractedSkills || [],
        matchedOpportunities: waResult.matchedOpportunities || [],
        matchedCourses: waResult.matchedCourses || [],
        matchedSchemes: waResult.matchedSchemes || [],
        updatedProfile: {
          skills: waResult.extractedSkills || [],
          district: 'Warangal'
        }
      });
    }

    // 3. Other Channel Simulation Flow (Kiosk / Fallback)
    let user = await User.findOne({ phone });
    if (!user) {
      user = await User.create({
        name: `Simulated Beneficiary (${phone.slice(-4)})`,
        phone,
        role: 'beneficiary',
        district: 'Warangal',
        consent: { given: true, at: new Date(), version: '1.0', language: lang }
      });
    }

    let profile = await Profile.findOne({ user: user._id });
    if (!profile) {
      profile = await Profile.create({
        user: user._id,
        district: 'Warangal',
        state: 'Telangana',
        channel,
        language: lang,
        skills: []
      });
    }

    const { generateEmpatheticResponse } = await import('../services/aiService.js');
    const { extractLivelihoodProfile } = await import('../services/extract.js');

    const userContext = {
      name: user.name,
      district: profile.district,
      skills: profile.skills,
      employmentPreference: profile.employmentPreference,
      education: profile.education
    };

    const [aiResult, ruleExtracted] = await Promise.all([
      generateEmpatheticResponse({
        userMessage: message || 'Namaste',
        language: lang,
        userContext
      }),
      extractLivelihoodProfile(message || '')
    ]);

    const mergedSkills = Array.from(new Set([
      ...(profile.skills || []),
      ...(aiResult.extractedSkills || []),
      ...(ruleExtracted.skills || [])
    ]));
    profile.skills = mergedSkills;
    if (ruleExtracted.education) profile.education = ruleExtracted.education;
    if (aiResult.identifiedPreference) profile.employmentPreference = aiResult.identifiedPreference;
    await profile.save();

    const langConfig = getLanguageConfig(lang);

    return res.json({
      channel,
      phone,
      simulatedResponse: aiResult.replyText,
      replyText: aiResult.replyText,
      stage: 'conversational_dialogue',
      language: lang,
      languageName: langConfig.name,
      nativeName: langConfig.nativeName,
      speechCode: langConfig.speechCode,
      isComplete: false,
      extractedSkills: profile.skills,
      updatedProfile: {
        skills: profile.skills,
        district: profile.district,
        education: profile.education,
        employmentPreference: profile.employmentPreference
      },
      matchedOpportunities: [],
      profile: {
        skills: profile.skills,
        district: profile.district,
        riskScore: profile.riskScore || 20
      }
    });
  } catch (err) {
    console.error('SIMULATION ERROR:', err);
    return res.status(500).json({ error: 'Simulation processing failed', message: err.message, stack: err.stack });
  }
});

export default router;
