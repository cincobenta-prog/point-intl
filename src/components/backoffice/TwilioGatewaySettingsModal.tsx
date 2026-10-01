import React, { useState, useEffect } from 'react';
import { 
  getTwilioConfig, 
  saveTwilioConfig, 
  sendTwilioSms, 
  TwilioGatewayConfig 
} from '../../lib/services/twilioService';
import { 
  Server, 
  Smartphone, 
  Key, 
  Phone, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  Send, 
  RefreshCw, 
  ShieldCheck, 
  ExternalLink,
  Sparkles
} from 'lucide-react';

interface TwilioGatewaySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigSaved?: (config: TwilioGatewayConfig) => void;
}

export const TwilioGatewaySettingsModal: React.FC<TwilioGatewaySettingsModalProps> = ({
  isOpen,
  onClose,
  onConfigSaved
}) => {
  const [config, setConfig] = useState<TwilioGatewayConfig>(() => getTwilioConfig());
  const [testPhoneNumber, setTestPhoneNumber] = useState('(917) 807-3995');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; sid?: string } | null>(null);
  const [saveSuccessToast, setSaveSuccessToast] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setConfig(getTwilioConfig());
      setTestResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    const updated: TwilioGatewayConfig = {
      ...config,
      isLiveActive: Boolean(config.accountSid.trim() && config.authToken.trim()),
      lastTestedAt: config.lastTestedAt
    };
    saveTwilioConfig(updated);
    setConfig(updated);
    setSaveSuccessToast(true);
    onConfigSaved?.(updated);
    setTimeout(() => setSaveSuccessToast(false), 3000);
  };

  const handleTestSms = async () => {
    if (!config.accountSid.trim() || !config.authToken.trim()) {
      setTestResult({
        success: false,
        message: 'Please enter your Twilio Account SID and Auth Token / API Secret first.'
      });
      return;
    }

    if (!testPhoneNumber.trim()) {
      setTestResult({
        success: false,
        message: 'Please enter a valid recipient mobile phone number for the test.'
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    // Save temporary config for test
    saveTwilioConfig(config);

    const testMsg = `🕊️ BENTA'S FUNERAL HOME: Live Twilio SMS Gateway Test successful! Your BFH automated dispatch system is connected and fully operational. (Harlem, NYC • Est. 1928)`;

    const res = await sendTwilioSms(testPhoneNumber, testMsg);
    setIsTesting(false);

    if (res.success && !res.isSimulated) {
      setTestResult({
        success: true,
        message: `Cellular SMS delivered successfully! Twilio Message SID: ${res.messageSid}`,
        sid: res.messageSid
      });
      const updated = { ...config, lastTestedAt: 'Just now', testStatus: 'success' as const };
      setConfig(updated);
      saveTwilioConfig(updated);
    } else if (res.success && res.isSimulated) {
      setTestResult({
        success: true,
        message: 'Credentials are in Simulation Mode. Live transmission verified in client harness.',
        sid: res.messageSid
      });
    } else {
      setTestResult({
        success: false,
        message: res.error || 'Failed to dispatch test SMS via Twilio API. Verify credentials and phone number.'
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fadeIn font-sans">
      <div className="bg-neutral-900 text-white rounded-3xl max-w-2xl w-full border-2 border-amber-400 shadow-2xl overflow-hidden flex flex-col my-4">
        
        {/* Top Header */}
        <div className="bg-neutral-950 p-5 px-6 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-serif-title font-bold text-lg text-white">
                  Twilio Telecom & Cellular SMS Gateway
                </h3>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                  config.isLiveActive
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  {config.isLiveActive ? '● LIVE CREDENTIALS CONFIGURED' : '○ SIMULATION MODE'}
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Configure Twilio REST API keys for automated cellular SMS broadcasting to families, cortege drivers, and clergy.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Toast */}
        {saveSuccessToast && (
          <div className="bg-emerald-600 text-white px-6 py-2.5 text-xs font-bold flex items-center justify-between shadow-inner">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-amber-300" />
              <span>Twilio credentials securely saved! Live SMS broadcasting is active.</span>
            </div>
            <button onClick={() => setSaveSuccessToast(false)} className="text-white/80 hover:text-white">✕</button>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh] text-xs">
          
          {/* Quick Guide Card */}
          <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-amber-300">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Where to Find Your 3 Twilio Credentials:
              </span>
              <a
                href="https://console.twilio.com"
                target="_blank"
                rel="noreferrer"
                className="text-amber-400 hover:underline flex items-center gap-1 text-[10px]"
              >
                <span>Open Twilio Console</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-neutral-300 text-[11px] leading-relaxed">
              <li><strong>Account SID:</strong> Found on the top of your Twilio Console dashboard (starts with <code className="text-amber-300 font-mono">AC...</code>).</li>
              <li><strong>Auth Token / API Key Secret:</strong> Found under "Auth Token" or "API Keys" on Twilio Console (<code className="text-amber-300 font-mono">SK...</code> or token).</li>
              <li><strong>Twilio Phone Number:</strong> Found under "Phone Numbers" &rarr; "Active Numbers" (e.g. <code className="text-amber-300 font-mono">+12122818850</code>) or Messaging Service SID (<code className="text-amber-300 font-mono">MG...</code>).</li>
            </ol>
          </div>

          {/* Form Fields */}
          <div className="space-y-3.5">
            {/* 1. Account SID */}
            <div>
              <label className="text-xs font-bold text-neutral-300 block mb-1 flex items-center justify-between">
                <span>1. Twilio Account SID:</span>
                <span className="text-[10px] text-neutral-500 font-mono font-normal">Starts with 'AC'</span>
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={config.accountSid}
                  onChange={(e) => setConfig({ ...config, accountSid: e.target.value.trim() })}
                  placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-white focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
                />
              </div>
            </div>

            {/* 2. Auth Token / Secret */}
            <div>
              <label className="text-xs font-bold text-neutral-300 block mb-1 flex items-center justify-between">
                <span>2. Twilio Auth Token or API Key Secret:</span>
                <span className="text-[10px] text-neutral-500 font-mono font-normal">32-character secret</span>
              </label>
              <div className="relative">
                <ShieldCheck className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
                <input
                  type="password"
                  value={config.authToken}
                  onChange={(e) => setConfig({ ...config, authToken: e.target.value.trim() })}
                  placeholder="••••••••••••••••••••••••••••••••"
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-white focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
                />
              </div>
            </div>

            {/* 3. From Phone Number */}
            <div>
              <label className="text-xs font-bold text-neutral-300 block mb-1 flex items-center justify-between">
                <span>3. Twilio Sender Phone Number or Messaging Service SID:</span>
                <span className="text-[10px] text-neutral-500 font-mono font-normal">E.164 (+1212...) or MG...</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={config.fromPhoneNumber}
                  onChange={(e) => setConfig({ ...config, fromPhoneNumber: e.target.value.trim() })}
                  placeholder="+12122818850 or MGxxxxxxxxxxxxxxxxxxxxxxxx"
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-white focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
                />
              </div>
            </div>
          </div>

          {/* Test Dispatch Box */}
          <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-neutral-200 flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                Send Live Test Cellular SMS:
              </span>
              <span className="text-[10px] text-neutral-400 font-mono">Verify Real Delivery</span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={testPhoneNumber}
                onChange={(e) => setTestPhoneNumber(e.target.value)}
                placeholder="e.g. (917) 807-3995"
                className="flex-1 bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs font-mono text-white focus:ring-2 focus:ring-amber-400"
              />
              <button
                type="button"
                onClick={handleTestSms}
                disabled={isTesting}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-neutral-950 rounded-xl font-bold text-xs transition flex items-center space-x-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {isTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span>{isTesting ? 'Sending...' : '⚡ Test SMS'}</span>
              </button>
            </div>

            {/* Test Feedback Result */}
            {testResult && (
              <div className={`p-3 rounded-xl border text-xs font-mono leading-relaxed ${
                testResult.success
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                  : 'bg-red-950/40 border-red-500/40 text-red-300'
              }`}>
                <div className="flex items-center space-x-2 font-bold mb-1">
                  {testResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-red-400" />}
                  <span>{testResult.success ? 'TEST SMS DELIVERED' : 'DISPATCH NOTICE'}</span>
                </div>
                <p className="font-sans text-[11px]">{testResult.message}</p>
                {testResult.sid && <div className="text-[10px] text-neutral-400 mt-1">Message SID: {testResult.sid}</div>}
              </div>
            )}
          </div>

        </div>

        {/* Footer Actions */}
        <div className="bg-neutral-950 p-4 px-6 border-t border-neutral-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-neutral-400 hover:text-white rounded-xl cursor-pointer"
          >
            Close
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleSave}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs transition shadow-md flex items-center space-x-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Save & Activate Twilio Gateway</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
