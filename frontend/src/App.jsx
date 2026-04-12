/**
 * Arogya Mitra — Monolithic React App
 * Pixel-perfect mirror of templates/index.html + static/css/style.css + static/js/main.js
 *
 * Sections:
 *   1. Imports
 *   2. Utility helpers (formatTimeAgo, downloadChat)
 *   3. Sidebar component
 *   4. ChatArea component
 *   5. InputArea component
 *   6. App root (all state + API logic)
 */

// ══════════════════════════════════════════════════════════════
// SECTION 1 — IMPORTS
// ══════════════════════════════════════════════════════════════
import { useState, useEffect, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import HospitalsTab from './HospitalsTab';
import NewsTab from './NewsTab';
import VitalsTab from './VitalsTab';
import MedicationsTab from './MedicationsTab';
import DietPlannerTab from './DietPlannerTab';
import './index.css';

// ══════════════════════════════════════════════════════════════
// TRANSLATIONS
// ══════════════════════════════════════════════════════════════
const translations = {
  en: {
    welcomeTitle: 'Welcome to Arogya Mitra',
    welcomeSubtitle: 'Your AI-powered medical assistant is ready to help',
    quickQuestions: 'Quick Questions:',
    feverSymptoms: 'Fever Symptoms',
    headacheTreatment: 'Headache Treatment',
    highBloodPressure: 'High Blood Pressure',
    diabetesManagement: 'Diabetes Management',
    covidPrevention: 'COVID Prevention',
    coldRemedies: 'Cold Remedies',
    thinking: 'Arogya Mitra is thinking',
    medicalAIAssistant: 'Medical AI Assistant',
    askQuestion: 'Ask your medical question...',
    disclaimer: 'AI can make mistakes. Always consult healthcare professionals for medical advice.',
    newChat: 'New Chat',
    chatHistory: 'Chat History',
    clearConversation: 'Clear conversation',
    downloadChat: 'Download chat',
    settings: 'Settings',
    language: 'Language',
    english: 'English',
    hindi: 'Hindi',
    telugu: 'Telugu',
    tamil: 'Tamil',
    voiceInput: 'Voice input',
    stopVoiceInput: 'Stop voice input',
    voiceNotSupported: 'Voice input is not supported in this browser.',
    voiceInitializing: 'Speech recognition is still initializing, please try again.',
    voiceStopped: 'Voice input stopped.',
    listening: 'Listening... speak now.',
    voiceCaptured: 'Voice input captured. Press send to submit.',
    voiceError: 'Voice input error: ',
    chatLoaded: 'Chat loaded successfully',
    chatDeleted: 'Chat deleted successfully',
    failedLoad: 'Failed to load chat',
    failedDelete: 'Failed to delete chat',
    sendMessage: 'Send message',
    attachFile: 'Attach file',
    you: 'You',
    arogyaMitra: 'Arogya Mitra',
    source: 'Source',
    copy: 'Copy',
    copySuccess: 'Text copied to clipboard!',
    listen: 'Listen',
    speaking: 'Speaking...',
    stopped: 'Speech stopped',
    speechNotSupported: 'Speech synthesis not supported',
    voiceQuality: 'Voice Quality',
    autoSelect: 'Auto-select best',
    justNow: 'Just now',
    minutesAgo: 'm ago',
    hoursAgo: 'h ago',
    daysAgo: 'd ago',
    aiReady: 'AI Ready',
  },
  hi: {
    welcomeTitle: 'अरोघ्य मित्र में आपका स्वागत है',
    welcomeSubtitle: 'आपका AI-संचालित चिकित्सा सहायक मदद करने के लिए तैयार है',
    quickQuestions: 'त्वरित प्रश्न:',
    feverSymptoms: 'बुखार के लक्षण',
    headacheTreatment: 'सिरदर्द का इलाज',
    highBloodPressure: 'उच्च रक्तचाप',
    diabetesManagement: 'मधुमेह प्रबंधन',
    covidPrevention: 'कोविड रोकथाम',
    coldRemedies: 'सर्दी के उपाय',
    thinking: 'अरोघ्य मित्र सोच रहा है',
    medicalAIAssistant: 'चिकित्सा AI सहायक',
    askQuestion: 'अपना चिकित्सा प्रश्न पूछें...',
    disclaimer: 'AI गलतियाँ कर सकता है। हमेशा स्वास्थ्य पेशेवरों से सलाह लें।',
    newChat: 'नई चैट',
    chatHistory: 'चैट इतिहास',
    clearConversation: 'बातचीत साफ करें',
    downloadChat: 'चैट डाउनलोड करें',
    settings: 'सेटिंग्स',
    language: 'भाषा',
    english: 'अंग्रेजी',
    hindi: 'हिंदी',
    telugu: 'तेलुगु',
    tamil: 'तमिल',
    voiceInput: 'वॉइस इनपुट',
    stopVoiceInput: 'वॉइस इनपुट रोकें',
    voiceNotSupported: 'यह ब्राउज़र वॉइस इनपुट का समर्थन नहीं करता।',
    voiceInitializing: 'स्पीच रिकॉग्निशन अभी भी शुरू हो रहा है, कृपया फिर से प्रयास करें।',
    voiceStopped: 'वॉइस इनपुट रोक दिया गया।',
    listening: 'सुन रहा है... अब बोलें।',
    voiceCaptured: 'वॉइस इनपुट कैप्चर किया गया। भेजें दबाएं।',
    voiceError: 'वॉइस इनपुट त्रुटि: ',
    chatLoaded: 'चैट सफलतापूर्वक लोड हुई',
    chatDeleted: 'चैट सफलतापूर्वक हटाई गई',
    failedLoad: 'चैट लोड करने में विफल',
    failedDelete: 'चैट हटाने में विफल',
    sendMessage: 'संदेश भेजें',
    attachFile: 'फाइल अटैच करें',
    you: 'आप',
    arogyaMitra: 'अरोघ्य मित्र',
    source: 'स्रोत',
    copy: 'कॉपी',
    copySuccess: 'टेक्स्ट क्लिपबोर्ड में कॉपी किया गया!',
    listen: 'सुनें',
    speaking: 'बोल रहा है...',
    stopped: 'वॉइस रोका गया',
    speechNotSupported: 'स्पीच सिंथेसिस सपोर्ट नहीं है',
    voiceQuality: 'वॉइस क्वालिटी',
    autoSelect: 'सर्वोत्तम ऑटो-सेलेक्ट',
    justNow: 'अभी',
    minutesAgo: 'मिनट पहले',
    hoursAgo: 'घंटे पहले',
    daysAgo: 'दिन पहले',
    aiReady: 'AI तैयार',
  },
  te: {
    welcomeTitle: 'అరోగ్య మిత్రలో స్వాగతం',
    welcomeSubtitle: 'మీ AI-చేత నడిపించే వైద్య సహాయకుడు సహాయం చేయడానికి సిద్ధంగా ఉన్నాడు',
    quickQuestions: 'త్వరిత ప్రశ్నలు:',
    feverSymptoms: 'జ్వరం లక్షణాలు',
    headacheTreatment: 'తలనొప్పి చికిత్స',
    highBloodPressure: 'అధిక రక్తపోటు',
    diabetesManagement: 'మధుమేహ నిర్వహణ',
    covidPrevention: 'కోవిడ్ నివారణ',
    coldRemedies: 'జలుబు మందులు',
    thinking: 'అరోగ్య మిత్ర ఆలోచిస్తోంది',
    medicalAIAssistant: 'వైద్య AI సహాయకుడు',
    askQuestion: 'మీ వైద్య ప్రశ్న అడగండి...',
    disclaimer: 'AI తప్పులు చేయవచ్చు. ఎల్లప్పుడూ వైద్య నిపుణులను సంప్రదించండి.',
    newChat: 'కొత్త చాట్',
    chatHistory: 'చాట్ చరిత్ర',
    clearConversation: 'సంభాషణను క్లియర్ చేయండి',
    downloadChat: 'చాట్ డౌన్‌లోడ్ చేయండి',
    settings: 'సెట్టింగులు',
    language: 'భాష',
    english: 'ఇంగ్లీష్',
    hindi: 'హిందీ',
    telugu: 'తెలుగు',
    tamil: 'తమిళం',
    voiceInput: 'వాయిస్ ఇన్‌పుట్',
    stopVoiceInput: 'వాయిస్ ఇన్‌పుట్ ఆపండి',
    voiceNotSupported: 'ఈ బ్రౌజర్ వాయిస్ ఇన్‌పుట్‌ను సపోర్ట్ చేయదు.',
    voiceInitializing: 'స్పీచ్ రికాగ్నిషన్ ఇంకా ప్రారంభమవుతోంది, దయచేసి మళ్లీ ప్రయత్నించండి.',
    voiceStopped: 'వాయిస్ ఇన్‌పుట్ ఆపబడింది.',
    listening: 'వింటోంది... ఇప్పుడు మాట్లాడండి.',
    voiceCaptured: 'వాయిస్ ఇన్‌పుట్ క్యాప్చర్ చేయబడింది. పంపండి నొక్కండి.',
    voiceError: 'వాయిస్ ఇన్‌పుట్ లోపం: ',
    chatLoaded: 'చాట్ విజయవంతంగా లోడ్ అయింది',
    chatDeleted: 'చాట్ విజయవంతంగా తొలగించబడింది',
    failedLoad: 'చాట్ లోడ్ చేయడంలో విఫలమైంది',
    failedDelete: 'చాట్ తొలగించడంలో విఫలమైంది',
    sendMessage: 'సందేశం పంపండి',
    attachFile: 'ఫైల్ అటాచ్ చేయండి',
    you: 'మీరు',
    arogyaMitra: 'అరోగ్య మిత్ర',
    source: 'మూలం',
    copy: 'కాపీ',
    copySuccess: 'టెక్స్ట్ క్లిప్‌బోర్డ్‌కు కాపీ చేయబడింది!',
    listen: 'వినండి',
    speaking: 'మాట్లాడుతోంది...',
    stopped: 'స్పీచ్ నిలిపివేయబడింది',
    speechNotSupported: 'స్పీచ్ సింథసిస్ సపోర్ట్ లేదు',
    voiceQuality: 'వాయిస్ క్వాలిటీ',
    autoSelect: 'బెస్ట్ ఆటో-సెలెక్ట్',
    justNow: 'ఇప్పుడే',
    minutesAgo: 'నిమిషాల క్రితం',
    hoursAgo: 'గంటల క్రితం',
    daysAgo: 'రోజుల క్రితం',
    aiReady: 'AI సిద్ధం',
  },
  ta: {
    welcomeTitle: 'அரோக்ய மித்ராவில் வரவேற்கிறோம்',
    welcomeSubtitle: 'உங்கள் AI-இயக்கப்படும் மருத்துவ உதவியாளர் உதவ தயாராக உள்ளார்',
    quickQuestions: 'விரைவு கேள்விகள்:',
    feverSymptoms: 'காய்ச்சல் அறிகுறிகள்',
    headacheTreatment: 'தலைவலி சிகிச்சை',
    highBloodPressure: 'உயர் இரத்த அழுத்தம்',
    diabetesManagement: 'நீரிழிவு நிர்வாகம்',
    covidPrevention: 'கோவிட் தடுப்பு',
    coldRemedies: 'குளிர் மருந்துகள்',
    thinking: 'அரோக்ய மித்ரா யோசிக்கிறார்',
    medicalAIAssistant: 'மருத்துவ AI உதவியாளர்',
    askQuestion: 'உங்கள் மருத்துவ கேள்வியை கேளுங்கள்...',
    disclaimer: 'AI தவறுகளை செய்யலாம். எப்போதும் மருத்துவ நிபுணர்களை அணுகுங்கள்.',
    newChat: 'புதிய சாட்',
    chatHistory: 'சாட் வரலாறு',
    clearConversation: 'உரையாடலை அழிக்கவும்',
    downloadChat: 'சாட்டை பதிவிறக்கவும்',
    settings: 'அமைப்புகள்',
    language: 'மொழி',
    english: 'ஆங்கிலம்',
    hindi: 'இந்தி',
    telugu: 'தெலுங்கு',
    tamil: 'தமிழ்',
    voiceInput: 'குரல் உள்ளீடு',
    stopVoiceInput: 'குரல் உள்ளீட்டை நிறுத்து',
    voiceNotSupported: 'இந்த உலாவி குரல் உள்ளீட்டை ஆதரிக்காது.',
    voiceInitializing: 'பேச்சு அங்கீகாரம் இன்னும் தொடங்குகிறது, மீண்டும் முயற்சிக்கவும்.',
    voiceStopped: 'குரல் உள்ளீடு நிறுத்தப்பட்டது.',
    listening: 'கேட்கிறது... இப்போது பேசுங்கள்.',
    voiceCaptured: 'குரல் உள்ளீடு பிடிக்கப்பட்டது. அனுப்பு அழுத்தவும்.',
    voiceError: 'குரல் உள்ளீடு பிழை: ',
    chatLoaded: 'சாட் வெற்றிகரமாக ஏற்றப்பட்டது',
    chatDeleted: 'சாட் வெற்றிகரமாக நீக்கப்பட்டது',
    failedLoad: 'சாட்டை ஏற்றுவதில் தோல்வி',
    failedDelete: 'சாட்டை நீக்குவதில் தோல்வி',
    sendMessage: 'செய்தியை அனுப்பு',
    attachFile: 'கோப்பை இணைக்கவும்',
    you: 'நீங்கள்',
    arogyaMitra: 'அரோக்ய மித்ரா',
    source: 'மூலம்',
    copy: 'நகல்',
    copySuccess: 'உரை கிளிப்போர்டுக்கு நகலெடுக்கப்பட்டது!',
    listen: 'கேளுங்கள்',
    speaking: 'பேசுகிறது...',
    stopped: 'ஒலி நிறுத்தப்பட்டுள்ளது',
    speechNotSupported: 'பேச்சு ஒலிப்பு ஆதரவு இல்லை',
    voiceQuality: 'குரல் தரம்',
    autoSelect: 'சிறந்ததை தானாக தேர்ந்தெடு',
    justNow: 'இப்போதே',
    minutesAgo: 'நிமிடங்கள் முன்பு',
    hoursAgo: 'மணிநேரங்கள் முன்பு',
    daysAgo: 'நாட்கள் முன்பு',
    aiReady: 'AI தயார்',
  },
};

// ══════════════════════════════════════════════════════════════
// SECTION 2 — UTILITY HELPERS
// ══════════════════════════════════════════════════════════════
function formatTimeAgo(timestamp, language) {
  const now = new Date();
  const past = new Date(timestamp);
  const diffMs = now - past;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return translations[language].justNow;
  if (diffMins < 60) return `${diffMins}${translations[language].minutesAgo}`;
  if (diffHours < 24) return `${diffHours}${translations[language].hoursAgo}`;
  if (diffDays < 7) return `${diffDays}${translations[language].daysAgo}`;
  return past.toLocaleDateString();
}

function buildDownloadText(chatHistory, language) {
  let content = `${translations[language].arogyaMitra} Chat Export\n`;
  content += '='.repeat(50) + '\n\n';
  chatHistory.forEach((msg) => {
    content += `[${msg.timestamp}] ${msg.type === 'user' ? translations[language].you : translations[language].arogyaMitra}:\n`;
    content += msg.content + '\n';
    if (msg.source) content += `${translations[language].source}: ${msg.source}\n`;
    content += '\n';
  });
  return content;
}

// ══════════════════════════════════════════════════════════════
// SECTION 3 — SIDEBAR COMPONENT
// ══════════════════════════════════════════════════════════════
function Sidebar({ sidebarOpen, sessions, currentSessionId, onNewChat, onLoadSession, onDeleteSession, onToggleTheme, theme, language, onLanguageChange, voiceQuality, onVoiceQualityChange }) {
  return (
    <aside className={`sidebar glass-effect${sidebarOpen ? '' : ' collapsed'}`}>
      <div className="sidebar-content">

        {/* Logo + New Chat */}
        <div className="sidebar-header">
          <div className="logo-wrapper">
            <div className="logo-animated">
              <div className="logo-pulse" />
              <i className="fas fa-heartbeat" />
            </div>
            <div className="logo-text">
              <h1>Arogya Mitra</h1>
              <span className="version">AI Assistant v3.0</span>
            </div>
          </div>
          <button className="new-chat-btn" onClick={onNewChat}>
            <i className="fas fa-plus" />
            <span>{translations[language].newChat}</span>
          </button>
        </div>

        {/* Chat History */}
        <div className="chat-history-section">
          <div className="section-header">
            <span>{translations[language].chatHistory}</span>
            <div className="section-line" />
          </div>
          <div className="chat-list">
            {sessions === null ? (
              <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-tertiary)', fontSize: '13px' }}>
                <div className="loading-spinner" style={{ margin: '0 auto 10px' }} />
                Loading chats...
              </div>
            ) : sessions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-tertiary)', fontSize: '13px' }}>
                No chat history yet
              </div>
            ) : (
              sessions.map((session) => (
                <div
                  key={session.session_id}
                  className={`chat-item${currentSessionId === session.session_id ? ' active' : ''}`}
                  onClick={() => onLoadSession(session.session_id)}
                >
                  <i className="fas fa-message" />
                  <div className="chat-item-content">
                    <div className="chat-item-title">{session.preview || 'New conversation'}</div>
                    <div className="chat-item-time">{formatTimeAgo(session.last_active, language)}</div>
                  </div>
                  <button
                    className="chat-item-delete"
                    onClick={(e) => { e.stopPropagation(); onDeleteSession(session.session_id); }}
                  >
                    <i className="fas fa-trash" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Settings */}
        <div className="settings-section glass-effect">
          <div className="section-header">
            <i className="fas fa-cog" />
            <span>{translations[language].settings}</span>
            <div className="section-line" />
          </div>
          <div className="settings-list">
            <div className="setting-item language-setting">
              <label className="language-label">
                <i className="fas fa-globe" />
                {translations[language].language}:
              </label>
              <select value={language} onChange={(e) => onLanguageChange(e.target.value)} className="language-select">
                <option value="en">English</option>
                <option value="hi">हिन्दी (Hindi)</option>
                <option value="te">తెలుగు (Telugu)</option>
                <option value="ta">தமிழ் (Tamil)</option>
              </select>
            </div>
            <div className="setting-item voice-setting">
              <label className="voice-label">
                <i className="fas fa-volume-up" />
                {translations[language].voiceQuality}:
              </label>
              <select value={voiceQuality} onChange={(e) => onVoiceQualityChange(e.target.value)} className="voice-select">
                <option value="auto">{translations[language].autoSelect}</option>
                <option value="google">Google</option>
                <option value="microsoft">Microsoft</option>
                <option value="apple">Apple</option>
                <option value="system">System</option>
              </select>
            </div>
          </div>
        </div>

        {/* Theme Toggle */}
        <div className="sidebar-footer">
          <button className="theme-btn glass-effect" onClick={onToggleTheme}>
            <i className={`fas ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`} />
          </button>
        </div>

      </div>
    </aside>
  );
}

// ══════════════════════════════════════════════════════════════
// SECTION 4 — CHAT AREA COMPONENT
// ══════════════════════════════════════════════════════════════
function getQuickQuestions(language) {
  return [
    { icon: 'fa-thermometer', label: translations[language].feverSymptoms, q: 'What are the symptoms of fever?' },
    { icon: 'fa-head-side-virus', label: translations[language].headacheTreatment, q: 'How to treat a headache?' },
    { icon: 'fa-heart-pulse', label: translations[language].highBloodPressure, q: 'What causes high blood pressure?' },
    { icon: 'fa-notes-medical', label: translations[language].diabetesManagement, q: 'Tell me about diabetes management' },
    { icon: 'fa-virus-covid', label: translations[language].covidPrevention, q: 'COVID-19 prevention tips' },
    { icon: 'fa-pills', label: translations[language].coldRemedies, q: 'Common cold remedies' },
  ];
}

function ChatArea({ messages, isTyping, showWelcome, onQuickQuestion, chatAreaRef, language, onShowToast, voiceQuality, playingIndex, onSpeakStart, onSpeakStop }) {
  const QUICK_QUESTIONS = getQuickQuestions(language);
  return (
    <div className="chat-area" ref={chatAreaRef}>

      {/* Welcome Screen */}
      <div className={`welcome-screen${showWelcome ? '' : ' hidden'}`}>
        <div className="welcome-content">
          <div className="logo-3d">
            <i className="fas fa-stethoscope" />
          </div>
          <h1 className="welcome-title">{translations[language].welcomeTitle}</h1>
          <p className="welcome-subtitle">{translations[language].welcomeSubtitle}</p>

          <div className="quick-actions">
            <h3>{translations[language].quickQuestions}</h3>
            <div className="quick-buttons">
              {QUICK_QUESTIONS.map(({ icon, label, q }) => (
                <button key={q} className="quick-btn glass-effect" onClick={() => onQuickQuestion(q)}>
                  <i className={`fas ${icon}`} />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="features">
            {[
              { icon: 'fa-brain', label: 'AI-Powered' },
              { icon: 'fa-database', label: 'Medical Database' },
              { icon: 'fa-shield-alt', label: 'Reliable Info' },
            ].map(({ icon, label }) => (
              <div key={label} className="feature-card glass-effect">
                <i className={`fas ${icon}`} />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="messages-container">
        {messages.map((msg, idx) => (
          <MessageBubble
            key={idx}
            msg={msg}
            language={language}
            onShowToast={onShowToast}
            voiceQuality={voiceQuality}
            isPlaying={playingIndex === idx}
            onSpeakStart={() => onSpeakStart(idx)}
            onSpeakStop={onSpeakStop}
          />
        ))}
      </div>

      {/* Typing Indicator */}
      <div className={`typing-indicator${isTyping ? ' active' : ''}`}>
        <div className="typing-bubble glass-effect">
          <div className="typing-content">
            <span className="typing-text">{translations[language].thinking}</span>
            <div className="typing-dots">
              <span className="dot" />
              <span className="dot" />
              <span className="dot" />
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

function MessageBubble({ msg, language, onShowToast, voiceQuality = 'auto', isPlaying, onSpeakStart, onSpeakStop }) {
  const copyText = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(msg.content);
      onShowToast(translations[language].copySuccess || 'Text copied to clipboard!', 'success');
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = msg.content;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        onShowToast(translations[language].copySuccess || 'Text copied to clipboard!', 'success');
      } catch (fallbackError) {
        onShowToast('Failed to copy text', 'error');
      }
      document.body.removeChild(textArea);
    }
  }, [msg.content, language, onShowToast]);

  const speakText = useCallback(() => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(msg.content);

      // Set language
      const langMap = {
        en: 'en-US',
        hi: 'hi-IN',
        te: 'te-IN',
        ta: 'ta-IN'
      };
      utterance.lang = langMap[language] || 'en-US';

      // Get available voices and select the best one
      const voices = window.speechSynthesis.getVoices();
      let selectedVoice = null;

      if (voices.length > 0) {
        // Priority order for voice selection (higher quality voices first)
        const preferredVoiceNames = [
          // Google voices (usually highest quality)
          'Google',
          // Microsoft voices (good quality)
          'Microsoft',
          'Zira',
          'David',
          'Mark',
          'Zira',
          // Apple voices (good quality on macOS)
          'Samantha',
          'Alex',
          'Victoria',
          'Daniel',
          // System default as fallback
          'default'
        ];

        // Preferred voice selection based on voiceQuality setting
        const qualityMap = {
          google: ['google'],
          microsoft: ['microsoft', 'zira', 'david', 'mark'],
          apple: ['samantha', 'alex', 'victoria', 'daniel'],
          system: ['default']
        };

        const preferredList = voiceQuality === 'auto' ? preferredVoiceNames : qualityMap[voiceQuality] || preferredVoiceNames;

        for (const preferredName of preferredList) {
          selectedVoice = voices.find(voice =>
            voice.lang.startsWith(utterance.lang.split('-')[0]) &&
            (voice.name.toLowerCase().includes(preferredName.toLowerCase()) ||
             voice.voiceURI.toLowerCase().includes(preferredName.toLowerCase()))
          );
          if (selectedVoice) break;
        }

        // If no selected voice found using preferred set, fallback to any matching language
        if (!selectedVoice) {
          selectedVoice = voices.find(voice => voice.lang.startsWith(utterance.lang.split('-')[0]));
        }

        // If still no voice found, use the first available voice
        if (!selectedVoice && voices.length > 0) {
          selectedVoice = voices[0];
        }
      }

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      // Optimize speech parameters for better quality
      utterance.rate = 0.85; // Slightly slower for clarity
      utterance.pitch = 1.1; // Slightly higher pitch for more natural sound
      utterance.volume = 0.9; // Slightly lower volume to prevent distortion

      utterance.onstart = () => {
        onShowToast(translations[language].speaking || 'Speaking...', 'info');
        onSpeakStart && onSpeakStart();
      };

      utterance.onend = () => {
        onSpeakStop && onSpeakStop();
      };

      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event.error);
        onSpeakStop && onSpeakStop();
        onShowToast(translations[language].speechNotSupported || 'Speech synthesis failed', 'error');
      };

      const speakUtterance = () => {
        // Ensure old callbacks are removed
        window.speechSynthesis.onvoiceschanged = null;
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
        window.speechSynthesis.speak(utterance);
      };

      // Ensure voices are loaded before speaking (some browsers need this)
      if (voices.length === 0) {
        // If voices aren't loaded yet, wait for them once and then speak
        window.speechSynthesis.onvoiceschanged = () => {
          const nextVoices = window.speechSynthesis.getVoices();
          let nextSelectedVoice = null;
          const nextQualityMap = {
            google: ['google'],
            microsoft: ['microsoft', 'zira', 'david', 'mark'],
            apple: ['samantha', 'alex', 'victoria', 'daniel'],
            system: ['default']
          };
          const nextPreferredList = voiceQuality === 'auto' ? preferredVoiceNames : nextQualityMap[voiceQuality] || preferredVoiceNames;

          for (const preferredName of nextPreferredList) {
            nextSelectedVoice = nextVoices.find(voice =>
              voice.lang.startsWith(utterance.lang.split('-')[0]) &&
              (voice.name.toLowerCase().includes(preferredName.toLowerCase()) ||
               voice.voiceURI.toLowerCase().includes(preferredName.toLowerCase()))
            );
            if (nextSelectedVoice) break;
          }

          if (!nextSelectedVoice) {
            nextSelectedVoice = nextVoices.find(voice => voice.lang.startsWith(utterance.lang.split('-')[0]));
          }

          if (!nextSelectedVoice && nextVoices.length > 0) {
            nextSelectedVoice = nextVoices[0];
          }

          if (nextSelectedVoice) {
            utterance.voice = nextSelectedVoice;
          }

          window.speechSynthesis.onvoiceschanged = null;
          window.speechSynthesis.speak(utterance);
        };
        window.speechSynthesis.getVoices(); // trigger voice list load
      } else {
        speakUtterance();
      }
    } else {
      onShowToast(translations[language].speechNotSupported || 'Speech synthesis not supported in this browser', 'error');
    }
  }, [msg.content, language, onShowToast, voiceQuality]);

  if (msg.type === 'user') {
    return (
      <div className="message user-message">
        <div className="message-wrapper">
          <div className="message-avatar"><i className="fas fa-user" /></div>
          <div className="message-content">
            <div className="message-text">
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>
            <span className="message-time">{formatTimeAgo(msg.timestamp, language)}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`message bot-message${isPlaying ? ' playing' : ''}`}>
      <div className="message-wrapper">
        <div className="message-avatar"><i className="fas fa-robot" />
          {isPlaying && <span className="playing-indicator" />}
        </div>
        <div className="message-content">
          <div className="message-text">
            <ReactMarkdown>{msg.content}</ReactMarkdown>
          </div>
          <span className="message-time">{formatTimeAgo(msg.timestamp, language)}</span>
          <div className="message-footer">
            {msg.source && (
              <span className="message-source">
                <i className="fas fa-database" />
                {msg.source}
              </span>
            )}
            <div className="message-actions">
              <button className="message-action" title={translations[language].copy} onClick={copyText}>
                <i className="fas fa-copy" />
              </button>
              <button className="message-action" title={translations[language].listen} onClick={speakText}>
                <i className="fas fa-volume-up" />
              </button>
              <button className="message-action" title={translations[language].stop} onClick={() => {
                window.speechSynthesis.cancel();
                onSpeakStop && onSpeakStop();
                onShowToast(translations[language].stopped || 'Speech stopped', 'info');
              }}>
                <i className="fas fa-stop" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// SECTION 5 — INPUT AREA COMPONENT
// ══════════════════════════════════════════════════════════════
function InputArea({ inputValue, setInputValue, onSend, isTyping, isRecording, toggleVoiceInput, inputRef, language, translations }) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const handleInput = (e) => {
    setInputValue(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  };

  return (
    <div className="input-area">
      <div className="input-wrapper">
        <div className="input-container glass-effect">
          <textarea
            ref={inputRef}
            className="message-input"
            placeholder={translations[language].askQuestion}
            rows={1}
            value={inputValue}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
          />
          <button
            className={`input-btn ${isRecording ? 'recording' : ''}`}
            title={isRecording ? translations[language].stopVoiceInput : translations[language].voiceInput}
            onClick={toggleVoiceInput}
            type="button"
          >
            <i className="fas fa-microphone" />
          </button>
          <button
            className="send-btn"
            title="Send message"
            aria-label="Send message"
            onClick={onSend}
            disabled={!inputValue.trim() || isTyping}
          >
            <i className="fas fa-paper-plane" />
          </button>
        </div>
        <div className="input-info">
          <i className="fas fa-info-circle" />
          <span>AI can make mistakes. Always consult healthcare professionals for medical advice.</span>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// SECTION 6 — APP ROOT  (all state + API logic)
// ══════════════════════════════════════════════════════════════
const API_BASE = '/api/v1';

// ── Mobile detection hook ──────────────────────────────────────
function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= breakpoint);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= breakpoint);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, [breakpoint]);
  return isMobile;
}

export default function App() {
  // ── State ──────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'hospitals' | 'news'
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const [language, setLanguage] = useState(() => localStorage.getItem('language') || 'en');
  const [voiceQuality, setVoiceQuality] = useState(() => localStorage.getItem('voiceQuality') || 'auto');
  const [playingIndex, setPlayingIndex] = useState(null);
  const isMobile = useIsMobile();
  
  // On mobile default to closed; on desktop restore from localStorage
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (window.innerWidth <= 768) return false;
    return localStorage.getItem('sidebarOpen') !== 'false';
  });
  const [sessions, setSessions] = useState(null);           // null = loading
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);       // for download
  const [showWelcome, setShowWelcome] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [isRecording, setIsRecording] = useState(false);

  const chatAreaRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);
  const toastTimerRef = useRef(null);

  // ── Theme ──────────────────────────────────────────────────
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // ── Language ───────────────────────────────────────────────
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  // ── Voice Quality ───────────────────────────────────────────
  useEffect(() => {
    localStorage.setItem('voiceQuality', voiceQuality);
  }, [voiceQuality]);

  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light');

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
  };

  const handleSpeakStart = (index) => {
    setPlayingIndex(index);
  };

  const handleSpeakStop = () => {
    setPlayingIndex(null);
  };

  // ── Toast ──────────────────────────────────────────────────
  const showToast = useCallback((message, type = 'success') => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ show: true, message, type });
    toastTimerRef.current = setTimeout(() => setToast(t => ({ ...t, show: false })), 3000);
  }, []);

  // ── Voice input (SpeechRecognition) ─────────────────────────
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;

    // Map language codes to speech recognition language codes
    const langMap = {
      en: 'en-US',
      hi: 'hi-IN',
      te: 'te-IN',
      ta: 'ta-IN'
    };
    recognition.lang = langMap[language] || 'en-US';

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0]?.transcript || '')
        .join('');
      setInputValue(prev => (event.results[event.results.length - 1].isFinal ? transcript : prev + transcript));

      if (event.results[event.results.length - 1].isFinal) {
        setIsRecording(false);
        recognition.stop();
        showToast(translations[language].voiceCaptured, 'success');
      }
    };

    recognition.onerror = (error) => {
      console.error('SpeechRecognition error', error);
      setIsRecording(false);
      showToast(translations[language].voiceError + error.error, 'error');
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      recognitionRef.current = null;
    };
  }, [showToast, language]);

  // ── Sidebar ────────────────────────────────────────────────
  const toggleSidebar = () => {
    setSidebarOpen(prev => {
      if (!isMobile) localStorage.setItem('sidebarOpen', !prev);
      return !prev;
    });
  };

  const closeSidebar = () => setSidebarOpen(false);

  // ── Voice button handler
  const toggleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast('Voice input is not supported in this browser.', 'error');
      return;
    }

    if (!recognitionRef.current) {
      showToast('Speech recognition is still initializing, please try again.', 'warning');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
      showToast('Voice input stopped.', 'success');
      return;
    }

    try {
      recognitionRef.current.start();
      setIsRecording(true);
      showToast('Listening... speak now.', 'success');
    } catch (err) {
      console.error('start speech recognition', err);
      showToast('Could not start voice input: ' + (err?.message || 'unknown error'), 'error');
    }
  };

  // ── Scroll to bottom ───────────────────────────────────────
  const scrollToBottom = useCallback(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTo({ top: chatAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, isTyping, scrollToBottom]);

  // ── Load sessions ──────────────────────────────────────────
  const loadSessions = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/sessions`);
      const data = await res.json();
      if (data.success && data.sessions) setSessions(data.sessions);
    } catch {
      setSessions([]);
    }
  }, []);

  // ── Load current history on mount ──────────────────────────
  useEffect(() => {
    loadSessions();
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/history`);
        const data = await res.json();
        if (data.success && data.messages && data.messages.length > 0) {
          const msgs = data.messages.map(m => ({
            type: m.role === 'user' ? 'user' : 'assistant',
            content: m.content,
            timestamp: m.timestamp || '',
            source: m.source || null,
          }));
          setMessages(msgs);
          setChatHistory(msgs.map(m => ({ ...m })));
          setShowWelcome(false);
        }
      } catch { /* silent */ }
    })();
  }, [loadSessions]);

  // ── Load session ───────────────────────────────────────────
  const loadSession = useCallback(async (sessionId) => {
    try {
      const res = await fetch(`${API_BASE}/session/${sessionId}`);
      const data = await res.json();
      if (data.success) {
        setCurrentSessionId(sessionId);
        const msgs = data.messages.map(m => ({
          type: m.role === 'user' ? 'user' : 'assistant',
          content: m.content,
          timestamp: m.timestamp || '',
          source: m.source || null,
        }));
        setMessages(msgs);
        setChatHistory(msgs.map(m => ({ ...m })));
        setShowWelcome(false);
        showToast('Chat loaded successfully', 'success');
      }
    } catch {
      showToast('Failed to load chat', 'error');
    }
  }, [showToast]);

  // ── Delete session ─────────────────────────────────────────
  const deleteSession = useCallback(async (sessionId) => {
    if (!window.confirm('Are you sure you want to delete this chat?')) return;
    try {
      const res = await fetch(`${API_BASE}/session/${sessionId}`, { method: 'DELETE' });
      if (res.ok) {
        await loadSessions();
        if (currentSessionId === sessionId) createNewChat();
        showToast('Chat deleted successfully', 'success');
      }
    } catch {
      showToast('Failed to delete chat', 'error');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSessionId, loadSessions, showToast]);

  // ── New chat ───────────────────────────────────────────────
  const createNewChat = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/new-chat`, { method: 'POST' });
      if (res.ok) {
        setMessages([]);
        setChatHistory([]);
        setCurrentSessionId(null);
        setShowWelcome(true);
        await loadSessions();
        showToast('New chat created', 'success');
      }
    } catch {
      showToast('Failed to create new chat', 'error');
    }
  }, [loadSessions, showToast]);

  // ── Clear chat ─────────────────────────────────────────────
  const clearChat = useCallback(async () => {
    if (!window.confirm('Are you sure you want to clear this conversation?')) return;
    try {
      const res = await fetch(`${API_BASE}/clear`, { method: 'POST' });
      if (res.ok) {
        setMessages([]);
        setChatHistory([]);
        setShowWelcome(true);
        showToast('Conversation cleared', 'success');
      }
    } catch {
      showToast('Failed to clear conversation', 'error');
    }
  }, [showToast]);

  // ── Download chat ──────────────────────────────────────────
  const downloadChat = useCallback(() => {
    if (chatHistory.length === 0) { showToast('No messages to download', 'error'); return; }
    const content = buildDownloadText(chatHistory);
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medigenius-chat-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Chat downloaded successfully', 'success');
  }, [chatHistory, showToast]);

  // ── Send message ───────────────────────────────────────────
  const sendMessage = useCallback(async (overrideText) => {
    const message = (overrideText ?? inputValue).trim();
    if (!message || isTyping) return;

    setShowWelcome(false);
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = { type: 'user', content: message, timestamp: time, source: null };
    setMessages(prev => [...prev, userMsg]);
    setChatHistory(prev => [...prev, userMsg]);
    setInputValue('');
    if (inputRef.current) { inputRef.current.style.height = 'auto'; }
    setIsTyping(true);

    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });
      const data = await res.json();

      if (data.success) {
        const botMsg = {
          type: 'assistant',
          content: data.response,
          timestamp: data.timestamp || time,
          source: data.source || null,
        };
        setMessages(prev => [...prev, botMsg]);
        setChatHistory(prev => [...prev, botMsg]);
        showToast('Response received', 'success');
        await loadSessions();
      } else {
        const errMsg = { type: 'assistant', content: 'Sorry, I encountered an error. Please try again.', timestamp: time, source: null };
        setMessages(prev => [...prev, errMsg]);
        showToast('Error occurred', 'error');
      }
    } catch {
      const errMsg = { type: 'assistant', content: 'Connection error. Please check your internet and try again.', timestamp: time, source: null };
      setMessages(prev => [...prev, errMsg]);
      showToast('Connection error', 'error');
    } finally {
      setIsTyping(false);
    }
  }, [inputValue, isTyping, loadSessions, showToast]);

  // Quick question handler
  const handleQuickQuestion = useCallback((q) => {
    setTimeout(() => sendMessage(q), 200);
  }, [sendMessage]);

  // ── Toast colors ───────────────────────────────────────────
  const toastColors = {
    success: 'linear-gradient(135deg, #10b981, #059669)',
    error: 'linear-gradient(135deg, #ef4444, #dc2626)',
    info: 'linear-gradient(135deg, #3b82f6, #2563eb)',
  };
  const toastIcons = {
    success: 'fa-check-circle',
    error: 'fa-exclamation-circle',
    info: 'fa-info-circle',
  };
  // ── Render ─────────────────────────────────────────────────
  return (
    <>
      {/* Animated Background */}
      <div className="animated-background">
        <div className="gradient-overlay" />
        <div className="floating-circles">
          <div className="circle circle-1" />
          <div className="circle circle-2" />
          <div className="circle circle-3" />
        </div>
      </div>

      <div className="app-container">

        {/* Sidebar Toggle */}
        <button className="sidebar-toggle-btn" onClick={toggleSidebar}>
          <i className="fas fa-bars" />
        </button>

        {/* Mobile backdrop — closes sidebar on click */}
        {isMobile && sidebarOpen && (
          <div className="sidebar-backdrop" onClick={closeSidebar} />
        )}

        {/* Sidebar */}
        <Sidebar
          sidebarOpen={sidebarOpen}
          sessions={sessions}
          currentSessionId={currentSessionId}
          onNewChat={createNewChat}
          onLoadSession={loadSession}
          onDeleteSession={deleteSession}
          onToggleTheme={toggleTheme}
          theme={theme}
          language={language}
          onLanguageChange={handleLanguageChange}
          voiceQuality={voiceQuality}
          onVoiceQualityChange={setVoiceQuality}
        />

        {/* Main Content */}
        <main className={`main-content${sidebarOpen ? ' sidebar-open' : ''}`}>

          {/* Header */}
          <header className="app-header glass-header">
            <div className="header-content">
              <h2 className="gradient-text">Medical AI Assistant</h2>
              <div className="status-indicator">
                <div className="status-ring">
                  <span className="ring-pulse" />
                </div>
                <span>AI Ready</span>
              </div>
            </div>
            <div className="header-actions">
              <button className="action-btn" title="Clear conversation" onClick={clearChat}>
                <i className="fas fa-trash" />
              </button>
              <button className="action-btn" title="Download chat" onClick={downloadChat}>
                <i className="fas fa-download" />
              </button>
            </div>
          </header>

          {/* Tab Navigation */}
          <div className="tab-navigation">
            <button
              className={`tab-btn ${activeTab === 'chat' ? 'active' : ''}`}
              onClick={() => setActiveTab('chat')}
            >
              <i className="fas fa-comment-medical" /> Chat
            </button>
            <button
              className={`tab-btn ${activeTab === 'hospitals' ? 'active' : ''}`}
              onClick={() => setActiveTab('hospitals')}
            >
              <i className="fas fa-hospital" /> Nearby Hospitals
            </button>
            <button
              className={`tab-btn ${activeTab === 'news' ? 'active' : ''}`}
              onClick={() => setActiveTab('news')}
            >
              <i className="fas fa-newspaper" /> Vaccination News
            </button>
            <button
              className={`tab-btn ${activeTab === 'vitals' ? 'active' : ''}`}
              onClick={() => setActiveTab('vitals')}
            >
              <i className="fas fa-heartbeat" /> Vitals Dashboard
            </button>
            <button
              className={`tab-btn ${activeTab === 'medications' ? 'active' : ''}`}
              onClick={() => setActiveTab('medications')}
            >
              <i className="fas fa-pills" /> Medications
            </button>
            <button
              className={`tab-btn ${activeTab === 'diet' ? 'active' : ''}`}
              onClick={() => setActiveTab('diet')}
            >
              <i className="fas fa-utensils" /> AI Diet Planner
            </button>
          </div>

          {/* Tab Content */}
          <div className="tab-content">
            {activeTab === 'chat' && (
              <>
                <ChatArea
                  messages={messages}
                  isTyping={isTyping}
                  showWelcome={showWelcome}
                  onQuickQuestion={handleQuickQuestion}
                  chatAreaRef={chatAreaRef}
                  language={language}
                  onShowToast={showToast}
                  voiceQuality={voiceQuality}
                  playingIndex={playingIndex}
                  onSpeakStart={handleSpeakStart}
                  onSpeakStop={handleSpeakStop}
                />
                <InputArea
                  inputValue={inputValue}
                  setInputValue={setInputValue}
                  onSend={() => sendMessage()}
                  isTyping={isTyping}
                  isRecording={isRecording}
                  toggleVoiceInput={toggleVoiceInput}
                  inputRef={inputRef}
                  language={language}
                  translations={translations}
                />
              </>
            )}
            {activeTab === 'hospitals' && (
              <HospitalsTab showToast={showToast} translations={translations} language={language} />
            )}
            {activeTab === 'news' && <NewsTab showToast={showToast} />}
            {activeTab === 'vitals' && <VitalsTab />}
            {activeTab === 'medications' && <MedicationsTab />}
            {activeTab === 'diet' && <DietPlannerTab />}
          </div>
        </main>
      </div>

      {/* Toast Notification */}
      <div
        className={`toast${toast.show ? ' show' : ''}`}
        style={{ background: toastColors[toast.type] }}
      >
        <i className={`fas ${toastIcons[toast.type]}`} />
        <span>{toast.message}</span>
      </div>
    </>
  );
}
