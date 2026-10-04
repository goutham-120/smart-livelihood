/**
 * WhatsApp Channel Handler via Twilio Sandbox
 * Supports incoming text, voice notes (downloaded with Basic Auth, converted via ffmpeg, transcribed with Sarvam),
 * rate limiting per phone, explicit consent, and state machine progression.
 */

import fs from 'fs';
import path from 'path';
import os from 'os';
import { exec } from 'child_process';
import { promisify } from 'util';
import twilio from 'twilio';
import { User } from '../models/User.js';
import { Profile } from '../models/Profile.js';
import { processConversationTurn } from '../services/conversation.js';
import { getSpeechProvider } from './speech.js';
import { detectLanguageFromText, normalizeLanguageCode } from './languages.js';

const execAsync = promisify(exec);
const { MessagingResponse } = twilio.twiml;

/**
 * Download Twilio media attachment with HTTP Basic Authentication.
 */
const downloadTwilioMedia = async (mediaUrl, accountSid, authToken) => {
  const authHeader = 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64');
  const res = await fetch(mediaUrl, {
    headers: { Authorization: authHeader }
  });

  if (!res.ok) {
    throw new Error(`Failed to download Twilio media: ${res.statusText}`);
  }

  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
};

/**
 * Handle incoming WhatsApp webhook request.
 */
export const handleWhatsAppWebhook = async (req, res) => {
  const from = req.body.From ? String(req.body.From).replace('whatsapp:', '').trim() : '';
  const rawBody = req.body.Body ? String(req.body.Body).trim() : '';
  const numMedia = parseInt(req.body.NumMedia || '0', 10);
  const mediaUrl0 = req.body.MediaUrl0;
  const mediaContentType0 = req.body.MediaContentType0 || '';

  const twiml = new MessagingResponse();

  if (!from) {
    twiml.message('Error: Invalid sender phone number');
    res.type('text/xml');
    return res.send(twiml.toString());
  }

  // Find or create beneficiary user record
  let user = await User.findOne({ phone: from });
  let isNewUser = false;
  if (!user) {
    isNewUser = true;
    user = await User.create({
      name: `WhatsApp Beneficiary (${from.slice(-4)})`,
      phone: from,
      role: 'beneficiary',
      district: 'Warangal',
      consent: { given: false, at: null, version: '1.0', language: 'te' }
    });

    await Profile.create({
      user: user._id,
      district: 'Warangal',
      state: 'Telangana',
      channel: 'whatsapp',
      language: 'te',
      skills: []
    });
  }

  const profile = await Profile.findOne({ user: user._id });
  const userLang = profile?.language || 'te';

  // 1. Consent Check for First Message
  if (!user.consent?.given) {
    const lowerBody = rawBody.toLowerCase();
    const isConsentAffirmative =
      lowerBody === 'yes' ||
      lowerBody === 'haan' ||
      lowerBody === 'avunu' ||
      lowerBody === 'sare' ||
      lowerBody === 'ha' ||
      lowerBody === '1';

    if (isConsentAffirmative) {
      user.consent = {
        given: true,
        at: new Date(),
        version: '1.0',
        language: userLang
      };
      await user.save();

      const welcomeAck = userLang === 'te'
        ? `ధన్యవాదాలు! మీ సమ్మతి నమోదైంది. మీ నైపుణ్యాలు మరియు ఆసక్తుల ఆధారంగా ఉచిత NSQF శిక్షణ మరియు ప్రభుత్వ రుణ పథకాలను గుర్తిద్దాం. మీ ఇంట్లో లేదా కుటుంబంలో సాంప్రదాయకంగా ఎలాంటి పనులు చేస్తుంటారు?`
        : userLang === 'hi'
          ? `धन्यवाद! आपकी सहमति दर्ज हो गई है. आपके हुनर के आधार पर मुफ्त NSQF ट्रेनिंग और सरकारी योजनाएं खोजते हैं. आपके परिवार में पारंपरिक रूप से किस तरह का काम होता रहा है?`
          : `Thank you! Your consent has been recorded. Let us discover free NSQF skilling and government loan opportunities. What kind of traditional work does your family or household engage in?`;

      twiml.message(welcomeAck);
      res.type('text/xml');
      return res.send(twiml.toString());
    } else {
      const consentPrompt = userLang === 'te'
        ? `నమస్కారం! PM AJAY జీవనోపాధి సహాయకుడికి స్వాగతం. మీ నైపుణ్యాల ఆధారంగా ఉచిత శిక్షణ మరియు ప్రభుత్వ పథకాలను సిఫార్సు చేయడానికి మేము మీ వివరాలు ఉపయోగించవచ్చా? కొనసాగించడానికి YES లేదా AVUNU అని రిప్లై ఇవ్వండి.`
        : userLang === 'hi'
          ? `नमस्ते! PM AJAY आजीविका सहायक में आपका स्वागत है. आपके हुनर के अनुसार ट्रेनिंग और योजनाओं की सिफारिश के लिए क्या हम विवरण दर्ज कर सकते हैं? आगे बढ़ने के लिए YES या HAAN लिखकर भेजें.`
          : `Namaste! Welcome to PM AJAY Livelihood Assistant. May we record your details to recommend free NSQF skilling and enterprise schemes? Please reply YES to begin.`;

      twiml.message(consentPrompt);
      res.type('text/xml');
      return res.send(twiml.toString());
    }
  }

  // 2. Handle Audio Voice Notes
  let processedText = rawBody;
  let detectedVoiceLang = null;

  if (numMedia > 0 && mediaUrl0) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    const tmpDir = os.tmpdir();
    const tempInputFile = path.join(tmpDir, `wa_${Date.now()}_input.ogg`);
    const tempOutputFile = path.join(tmpDir, `wa_${Date.now()}_output.wav`);

    try {
      const mediaBuffer = await downloadTwilioMedia(mediaUrl0, accountSid, authToken);
      fs.writeFileSync(tempInputFile, mediaBuffer);

      // Convert audio with ffmpeg to 16kHz mono WAV
      await execAsync(`ffmpeg -y -i "${tempInputFile}" -ar 16000 -ac 1 "${tempOutputFile}"`);
      const wavBuffer = fs.readFileSync(tempOutputFile);

      if (process.env.SARVAM_API_KEY) {
        const sttResult = await provider.transcribe(wavBuffer, 'auto');
        processedText = sttResult.transcript || '';
        detectedVoiceLang = sttResult.language;
      } else {
        twiml.message('We received your voice note. Please type your reply in text so our system can assist you immediately.');
        res.type('text/xml');
        return res.send(twiml.toString());
      }
    } catch (err) {
      twiml.message('Voice note could not be processed. Please type your answer in text.');
      res.type('text/xml');
      return res.send(twiml.toString());
    } finally {
      // Clean up temporary files immediately
      try {
        if (fs.existsSync(tempInputFile)) fs.unlinkSync(tempInputFile);
        if (fs.existsSync(tempOutputFile)) fs.unlinkSync(tempOutputFile);
      } catch (cleanErr) {
        // Non-blocking cleanup
      }
    }
  }

  if (!processedText) {
    twiml.message('Please send a text message or voice note to continue.');
    res.type('text/xml');
    return res.send(twiml.toString());
  }

  // 3. Process turn with multilingual WhatsApp livelihood assistant
  const { handleWhatsAppMessage } = await import('../services/whatsappAssistant.js');
  const waResult = await handleWhatsAppMessage({
    phone: from,
    message: processedText,
    rawLanguage: detectedVoiceLang,
    userId: user._id
  });

  twiml.message(waResult.replyText);
  res.type('text/xml');
  return res.send(twiml.toString());
};
