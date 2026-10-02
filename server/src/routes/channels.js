import express from 'express';
import twilio from 'twilio';
import { User } from '../models/User.js';
import { Profile } from '../models/Profile.js';
import { channelLimiter, sanitizeString } from '../middleware/security.js';
import { verifyTwilioSignature } from '../middleware/twilioSignature.js';
import { generateEmpatheticResponse } from '../services/aiService.js';

const router = express.Router();
const { MessagingResponse, VoiceResponse } = twilio.twiml;

// GET & POST /api/channels/whatsapp/webhook
router.get('/whatsapp/webhook', (req, res) => {
  return res.send('Twilio WhatsApp Webhook Active');
});

router.post('/whatsapp/webhook', channelLimiter, verifyTwilioSignature, async (req, res) => {
  try {
    const from = req.body.From ? String(req.body.From).replace('whatsapp:', '').trim() : '';
    const body = sanitizeString(req.body.Body, 1000);

    let user = await User.findOne({ phone: from });
    if (!user) {
      user = await User.create({
        name: `WhatsApp User ${from.slice(-4)}`,
        phone: from,
        role: 'beneficiary',
        district: 'Warangal',
        consent: { given: true, at: new Date(), version: '1.0', language: 'te' }
      });
      await Profile.create({
        user: user._id,
        district: 'Warangal',
        channel: 'whatsapp',
        language: 'te'
      });
    }

    const profile = await Profile.findOne({ user: user._id });
    const aiResult = await generateEmpatheticResponse({
      userMessage: body || 'Namaste',
      language: profile ? profile.language : 'te',
      userContext: {
        name: user.name,
        district: profile ? profile.district : 'Warangal',
        skills: profile ? profile.skills : []
      }
    });

    if (profile && aiResult.extractedSkills && aiResult.extractedSkills.length > 0) {
      const skillsSet = new Set(profile.skills || []);
      aiResult.extractedSkills.forEach((s) => skillsSet.add(s));
      profile.skills = Array.from(skillsSet);
      await profile.save();
    }

    const twiml = new MessagingResponse();
    twiml.message(aiResult.replyText);

    res.type('text/xml');
    return res.send(twiml.toString());
  } catch (err) {
    const twiml = new MessagingResponse();
    twiml.message('Namaste! We are currently upgrading our skilling system. Please try again shortly.');
    res.type('text/xml');
    return res.send(twiml.toString());
  }
});

// POST /api/channels/ivr/voice
router.post('/ivr/voice', channelLimiter, verifyTwilioSignature, async (req, res) => {
  const twiml = new VoiceResponse();
  const gather = twiml.gather({
    input: 'dtmf speech',
    action: '/api/channels/ivr/gather',
    method: 'POST',
    numDigits: 1,
    timeout: 5
  });

  gather.say(
    { voice: 'Polly.Aditi', language: 'hi-IN' },
    'PM-AJAY rooz-gar sahayak me aapka swagat hai. Tailoring ya silai sikhne ke liye 1 dabayein. Kheti ya dairy ke liye 2 dabayein. Anya yojanao ke liye 3 dabayein.'
  );

  twiml.say({ voice: 'Polly.Aditi', language: 'hi-IN' }, 'Aapka response nahi mila. Dhanyavaad.');
  res.type('text/xml');
  return res.send(twiml.toString());
});

// POST /api/channels/ivr/gather
router.post('/ivr/gather', channelLimiter, verifyTwilioSignature, async (req, res) => {
  const digits = req.body.Digits;
  const twiml = new VoiceResponse();

  if (digits === '1') {
    twiml.say(
      { voice: 'Polly.Aditi', language: 'hi-IN' },
      'Aapne Tailoring aur Silai chuni hai. Aapke district me PM Vishwakarma aur PMKVY ke antargat muft training aur loan uplabdh hai. Aapke phone par SMS bhej diya gaya hai.'
    );
  } else if (digits === '2') {
    twiml.say(
      { voice: 'Polly.Aditi', language: 'hi-IN' },
      'Aapne Dairy aur Pashupalan chuna hai. District training center me agla batch agle somvaar se shuru ho raha hai.'
    );
  } else {
    twiml.say(
      { voice: 'Polly.Aditi', language: 'hi-IN' },
      'PM-AJAY livelihood helpline se sampark karne ke liye dhanyavaad. Hamare counselor aapse jald hi sampark karenge.'
    );
  }

  res.type('text/xml');
  return res.send(twiml.toString());
});

// POST /api/channels/simulate (Interactive multi-channel simulation endpoint for web demo / testing)
router.post('/simulate', async (req, res) => {
  try {
    const channel = sanitizeString(req.body.channel, 20) || 'kiosk';
    const message = sanitizeString(req.body.message, 500);
    const phone = sanitizeString(req.body.phone, 20) || '9876543210';
    const lang = sanitizeString(req.body.language, 10) || 'te';

    let user = await User.findOne({ phone });
    if (!user) {
      user = await User.create({
        name: `Simulated Beneficiary (${channel})`,
        phone,
        role: 'beneficiary',
        district: 'Warangal',
        consent: { given: true, at: new Date(), version: '1.0', language: lang }
      });
      await Profile.create({
        user: user._id,
        district: 'Warangal',
        channel,
        language: lang
      });
    }

    const profile = await Profile.findOne({ user: user._id });
    const aiResult = await generateEmpatheticResponse({
      userMessage: message,
      language: lang,
      userContext: {
        name: user.name,
        district: profile.district,
        skills: profile.skills || []
      }
    });

    if (aiResult.extractedSkills && aiResult.extractedSkills.length > 0) {
      const skillsSet = new Set(profile.skills || []);
      aiResult.extractedSkills.forEach((s) => skillsSet.add(s));
      profile.skills = Array.from(skillsSet);
      await profile.save();
    }

    return res.json({
      channel,
      phone,
      simulatedResponse: aiResult.replyText,
      extractedSkills: aiResult.extractedSkills,
      profile: {
        skills: profile.skills,
        district: profile.district,
        riskScore: profile.riskScore
      }
    });
  } catch (err) {
    return res.status(500).json({ error: 'Simulation processing failed' });
  }
});

export default router;
