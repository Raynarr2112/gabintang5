import React, { useState, useRef, useEffect } from 'react';
import { Lock, ShieldCheck, AlertCircle, Eye, EyeOff, RotateCcw } from 'lucide-react';

const PIN_STORAGE_KEY = 'scoopmatch_admin_pin_v2';
const LEGACY_PIN_KEY = 'scoopmatch_admin_pin';
const SESSION_KEY = 'scoopmatch_admin_session';
const DEFAULT_PIN = '1234';

// Get stored PIN or default
function getStoredPin() {
  try {
    // Bersihkan PIN lama jika ada yang tersangkut dari sesi sebelumnya
    if (localStorage.getItem(LEGACY_PIN_KEY)) {
      localStorage.removeItem(LEGACY_PIN_KEY);
    }
    return localStorage.getItem(PIN_STORAGE_KEY) || DEFAULT_PIN;
  } catch {
    return DEFAULT_PIN;
  }
}

export function resetAdminPinToDefault() {
  try {
    localStorage.removeItem(PIN_STORAGE_KEY);
    localStorage.removeItem(LEGACY_PIN_KEY);
    return DEFAULT_PIN;
  } catch {
    return DEFAULT_PIN;
  }
}

// Check if session is still valid (valid for 8 hours)
function isSessionValid() {
  try {
    const session = localStorage.getItem(SESSION_KEY);
    if (!session) return false;
    const timestamp = parseInt(session, 10);
    const eightHours = 8 * 60 * 60 * 1000;
    return Date.now() - timestamp < eightHours;
  } catch {
    return false;
  }
}

function createSession() {
  try {
    localStorage.setItem(SESSION_KEY, String(Date.now()));
  } catch {
    // silent fail
  }
}

export function clearAdminSession() {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    // silent fail
  }
}

export function changeAdminPin(newPin) {
  try {
    localStorage.setItem(PIN_STORAGE_KEY, newPin);
    return true;
  } catch {
    return false;
  }
}

export default function AdminPinGate({ children }) {
  const [isUnlocked, setIsUnlocked] = useState(() => isSessionValid());
  const [pin, setPin] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];

  useEffect(() => {
    if (!isUnlocked && inputRefs[0].current) {
      inputRefs[0].current.focus();
    }
  }, [isUnlocked]);

  if (isUnlocked) {
    return children;
  }

  const handleDigitChange = (index, value) => {
    if (error) setError('');
    if (shake) setShake(false);

    // Only allow single digits
    const digit = value.replace(/\D/g, '').slice(-1);
    const newPin = [...pin];
    newPin[index] = digit;
    setPin(newPin);

    // Auto-advance to next input
    if (digit && index < 3) {
      inputRefs[index + 1].current?.focus();
    }

    // Auto-submit when all 4 digits entered
    if (digit && index === 3) {
      const fullPin = newPin.join('');
      if (fullPin.length === 4) {
        setTimeout(() => {
          if (fullPin === getStoredPin()) {
            createSession();
            setIsUnlocked(true);
          } else {
            setError('PIN salah! Coba lagi.');
            setShake(true);
            setPin(['', '', '', '']);
            setTimeout(() => {
              inputRefs[0].current?.focus();
            }, 300);
          }
        }, 150);
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    if (pastedText.length === 4) {
      const newPin = pastedText.split('');
      setPin(newPin);
      inputRefs[3].current?.focus();

      setTimeout(() => {
        if (pastedText === getStoredPin()) {
          createSession();
          setIsUnlocked(true);
        } else {
          setError('PIN salah! Coba lagi.');
          setShake(true);
          setPin(['', '', '', '']);
          setTimeout(() => inputRefs[0].current?.focus(), 300);
        }
      }, 150);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-icechoco-900 via-icechoco-800 to-icechoco-950 flex flex-col items-center justify-center p-4">
      {/* Lock Card */}
      <div
        className={`w-full max-w-sm bg-white/95 backdrop-blur-lg rounded-4xl p-8 shadow-2xl border-2 border-white/50 space-y-6 transition-transform ${shake ? 'animate-shake' : ''
          }`}
      >
        {/* Lock Icon / Brand Logo */}
        <div className="flex flex-col items-center space-y-3">
          <img
            src="/logo-gabintang5.jpg"
            alt="Logo GABINTANG5"
            className="w-20 h-20 rounded-full object-cover shadow-lg border-2 border-rose-200 bg-white"
          />
          <div className="text-center">
            <h1 className="font-fredoka text-2xl font-bold text-icechoco-900">
              Admin GABINTANG5 🔐
            </h1>
            <p className="text-xs text-icechoco-600 font-medium mt-1">
              Masukkan PIN 4 digit untuk mengakses panel barista & kasir booth.
            </p>
          </div>
        </div>

        {/* PIN Input Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-3">
            {pin.map((digit, i) => (
              <input
                key={i}
                ref={inputRefs[i]}
                type={showPin ? 'text' : 'password'}
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                onPaste={i === 0 ? handlePaste : undefined}
                className={`w-14 h-16 text-center text-2xl font-fredoka font-bold rounded-2xl border-2 transition-all focus:outline-none ${error
                    ? 'border-rose-400 bg-rose-50/50 text-rose-700'
                    : digit
                      ? 'border-emerald-400 bg-emerald-50/50 text-emerald-800 shadow-sm'
                      : 'border-cream-300 bg-cream-50 text-icechoco-900 focus:border-icechoco-500 focus:ring-2 focus:ring-icechoco-200'
                  }`}
                autoComplete="off"
              />
            ))}
          </div>

          {/* Show/Hide PIN toggle */}
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => setShowPin(!showPin)}
              className="text-[11px] font-semibold text-icechoco-500 hover:text-icechoco-800 flex items-center gap-1 transition-colors"
            >
              {showPin ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              {showPin ? 'Sembunyikan PIN' : 'Tampilkan PIN'}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex flex-col items-center gap-2 animate-fade-in">
              <div className="flex items-center justify-center gap-1.5 text-rose-600 text-xs font-bold">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{error}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  resetAdminPinToDefault();
                  setError('PIN berhasil direset kembali ke 1234!');
                  setPin(['', '', '', '']);
                  inputRefs[0].current?.focus();
                }}
                className="text-[11px] font-bold text-amber-700 hover:text-amber-900 underline flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset PIN ke Default (1234)</span>
              </button>
            </div>
          )}
        </div>

        {/* Hint */}
        <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200 text-center space-y-1.5">
          <p className="text-[11px] text-amber-800 font-medium">
            <span className="font-bold">💡 PIN Default:</span> 1234 — Ubah di pengaturan panel barista setelah login.
          </p>
          <button
            type="button"
            onClick={() => {
              resetAdminPinToDefault();
              setError('');
              setPin(['1', '2', '3', '4']);
              createSession();
              setIsUnlocked(true);
            }}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 hover:text-rose-700 underline"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset PIN & Masuk Sekarang</span>
          </button>
        </div>

        {/* Security Footer */}
        <div className="flex items-center justify-center gap-1.5 text-[10px] text-icechoco-500 font-semibold">
          <ShieldCheck className="w-3 h-3 text-emerald-500" />
          <span>Sesi login berlaku 8 jam sejak terakhir masuk</span>
        </div>
      </div>

      {/* Branding */}
      <div className="mt-6 text-center">
        <p className="font-fredoka font-bold text-sm text-cream-300/80 flex items-center gap-1.5">
          <span>🍦</span>
          <span>ScoopMatch Booth</span>
        </p>
        <p className="text-[10px] text-cream-400/50 mt-0.5">
          Panel khusus barista & kasir booth
        </p>
      </div>
    </div>
  );
}
