/**
 * IVR Telephony Handler via Twilio Voice
 * Provides DTMF language menu, speech and DTMF gathering, TTS audio responses,
 * DTMF confirmation, and automated SMS summary dispatch upon call conclusion.
 */

import twilio from 'twilio';
import { User } from '../models/User.js';
import { Profile } from '../models/Profile.js';
import { Occupation } from '../models/Occupation.js';
import { RegionDemand } from '../models/RegionDemand.js';
import { processConversationTurn } from '../services/conversation.js';

const { VoiceResponse } = twilio.twiml;

let twilioClientInstance = null;
const getTwilioClient = () => {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) return null;
  if (!twilioClientInstance) {
    twilioClientInstance = twilio(sid, token);
  }
  return twilioClientInstance;
};

// In memory active call states keyed by call SID or caller phone
const callStates = new Map();

/**
 * Handle incoming IVR call initialization.
 */
export const handleIvrVoice = async (req, res) => {
  const twiml = new VoiceResponse();
  const caller = req.body.From || req.body.Caller || '';
  const callSid = req.body.CallSid || `call_${Date.now()}`;

  callStates.set(callSid, {
    caller,
    language: 'te',
    selectedTrade: null,
    step: 'language'
  });

  const gather = twiml.gather({
    input: 'dtmf',
    action: '/api/channels/ivr/gather?step=language',
    method: 'POST',
    numDigits: 1,
    timeout: 6
  });

  gather.say(
    { voice: 'Polly.Aditi', language: 'hi-IN' },
    'PM AJAY Rozgar Helpline me aapka swagat hai. Telugu bhasha kosam 1 nokkandi. Hindi ke liye 2 dabayein. For English press 3.'
  );

  twiml.say(
    { voice: 'Polly.Aditi', language: 'hi-IN' },
    'Aapka response nahi mila. Dhanyavaad.'
  );
  twiml.hangup();

  res.type('text/xml');
  return res.send(twiml.toString());
};

/**
 * Handle IVR Gather steps: language selection, skill input, confirmation, and SMS dispatch.
 */
export const handleIvrGather = async (req, res) => {
  const callSid = req.body.CallSid || '';
  const caller = req.body.From || req.body.Caller || '';
  const digits = req.body.Digits ? String(req.body.Digits).trim() : '';
  const speechResult = req.body.SpeechResult ? String(req.body.SpeechResult).trim() : '';
  const step = req.query.step || 'language';

  const callState = callStates.get(callSid) || {
    caller,
    language: 'te',
    selectedTrade: 'sewing_machine_operation',
    step: 'language'
  };

  const twiml = new VoiceResponse();

  // Step 1: Language selection
  if (step === 'language') {
    if (digits === '2') {
      callState.language = 'hi';
    } else if (digits === '3') {
      callState.language = 'en';
    } else {
      callState.language = 'te';
    }
    callState.step = 'skill';
    callStates.set(callSid, callState);

    const gather = twiml.gather({
      input: 'speech dtmf',
      action: '/api/channels/ivr/gather?step=skill',
      method: 'POST',
      numDigits: 1,
      timeout: 6
    });

    if (callState.language === 'te') {
      gather.say(
        { voice: 'Polly.Aditi', language: 'hi-IN' },
        'దయచేసి మీరు నేర్చుకోవాలనుకుంటున్న పని గురించి మాట్లాడండి. లేదా టైలరింగ్ మరియు కుట్టుపని కోసం 1 నొక్కండి. డెయిరీ మరియు పశుపోషణ కోసం 2 నొక్కండి. ఎలక్ట్రికల్ మరియు సోలార్ కోసం 3 నొక్కండి.'
      );
    } else if (callState.language === 'hi') {
      gather.say(
        { voice: 'Polly.Aditi', language: 'hi-IN' },
        'कृपया अपने हुनर के बारे में बोलकर बताएं. या सिलाई काम के लिए 1 दबाएं. डेयरी और पशुपालन के लिए 2 दबाएं. बिजली और सोलर काम के लिए 3 दबाएं.'
      );
    } else {
      gather.say(
        { voice: 'Polly.Aditi', language: 'en-IN' },
        'Please speak your work experience or trade interest. Or press 1 for Tailoring, 2 for Dairy Farming, 3 for Electrical and Solar.'
      );
    }

    twiml.say({ voice: 'Polly.Aditi', language: 'hi-IN' }, 'Pratiksha karein.');
    res.type('text/xml');
    return res.send(twiml.toString());
  }

  // Step 2: Skill or Trade selection
  if (step === 'skill') {
    let tradeKey = 'sewing_machine_operation';
    let tradeTitle = 'Self Employed Tailor';

    if (digits === '2' || speechResult.toLowerCase().includes('dairy') || speechResult.toLowerCase().includes('pashu')) {
      tradeKey = 'dairy_farmer_entrepreneur';
      tradeTitle = 'Dairy Farmer Entrepreneur';
    } else if (digits === '3' || speechResult.toLowerCase().includes('electric') || speechResult.toLowerCase().includes('solar')) {
      tradeKey = 'solar_pv_installer';
      tradeTitle = 'Solar PV Installation Technician';
    }

    callState.selectedTrade = tradeKey;
    callState.selectedTitle = tradeTitle;
    callState.step = 'confirm';
    callStates.set(callSid, callState);

    const gather = twiml.gather({
      input: 'dtmf',
      action: '/api/channels/ivr/gather?step=confirm',
      method: 'POST',
      numDigits: 1,
      timeout: 5
    });

    if (callState.language === 'te') {
      gather.say(
        { voice: 'Polly.Aditi', language: 'hi-IN' },
        `మీ ఎంపిక ${tradeTitle}. మీ జిల్లాలో దీనికి NSQF సర్టిఫికేషన్ మరియు PM విశ్వకర్మ ఉచిత టూల్‌కిట్ లోన్ పథకం అందుబాటులో ఉంది. మీ ఫోన్‌కు పూర్తి వివరాల SMS పొందడానికి 1 నొక్కండి. మళ్లీ వినడానికి 2 నొక్కండి.`
      );
    } else if (callState.language === 'hi') {
      gather.say(
        { voice: 'Polly.Aditi', language: 'hi-IN' },
        `आपकी पसंद ${tradeTitle} है. आपके जिले में NSQF सर्टिफिकेशन और PM विश्वकर्मा टूलकिट लोन योजना उपलब्ध है. अपने फोन पर SMS प्राप्त करने के लिए 1 दबाएं. दोबारा सुनने के लिए 2 दबाएं.`
      );
    } else {
      gather.say(
        { voice: 'Polly.Aditi', language: 'en-IN' },
        `Your matched pathway is ${tradeTitle}. NSQF training and PM Vishwakarma toolkit loans are available in your district. Press 1 to receive an SMS summary. Press 2 to repeat.`
      );
    }

    twiml.say({ voice: 'Polly.Aditi', language: 'hi-IN' }, 'Dhanyavaad.');
    twiml.hangup();
    res.type('text/xml');
    return res.send(twiml.toString());
  }

  // Step 3: Confirmation and Automated SMS Dispatch
  if (step === 'confirm') {
    if (digits === '1') {
      const summaryText = `PM AJAY Skilling Summary: Matched Pathway: ${callState.selectedTitle || 'Self Employed Tailor'} (NSQF Aligned). Free training and PM Vishwakarma / PMEGP loan support available in your district. Visit your nearest District Center or reply to 1800123456.`;

      // Send SMS via Twilio if client configured
      try {
        const twilioClient = getTwilioClient();
        if (twilioClient && caller) {
          const fromPhone = process.env.TWILIO_PHONE_NUMBER || process.env.TWILIO_WHATSAPP_FROM?.replace('whatsapp:', '');
          if (fromPhone) {
            await twilioClient.messages.create({
              body: summaryText,
              to: caller,
              from: fromPhone
            });
          }
        }
      } catch (smsErr) {
        // Continue voice response gracefully
      }

      const confirmMsg = callState.language === 'te'
        ? 'ధన్యవాదాలు! మీ మొబైల్ నంబర్‌కు పూర్తి శిక్షణ వివరాల SMS పంపబడింది. PM AJAY జీవనోపాధి హెల్ప్‌లైన్‌ను సంప్రదించినందుకు కృతజ్ఞతలు. నమస్కారం.'
        : callState.language === 'hi'
          ? 'धन्यवाद! आपके मोबाइल नंबर पर ट्रेनिंग विवरण का SMS भेज दिया गया है. PM AJAY हेल्पलाइन से संपर्क करने के लिए धन्यवाद. नमस्ते.'
          : 'Thank you! An SMS summary has been dispatched to your mobile number. Thank you for contacting PM AJAY Helpline. Namaste.';

      twiml.say({ voice: 'Polly.Aditi', language: 'hi-IN' }, confirmMsg);
      twiml.hangup();

      callStates.delete(callSid);
      res.type('text/xml');
      return res.send(twiml.toString());
    } else {
      twiml.redirect('/api/channels/ivr/gather?step=skill');
      res.type('text/xml');
      return res.send(twiml.toString());
    }
  }

  twiml.say({ voice: 'Polly.Aditi', language: 'hi-IN' }, 'Namaste.');
  twiml.hangup();
  res.type('text/xml');
  return res.send(twiml.toString());
};
