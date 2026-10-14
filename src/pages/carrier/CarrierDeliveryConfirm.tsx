import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ShieldCheck, Camera, CheckCircle2 } from "lucide-react";

export default function CarrierDeliveryConfirm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [photoName, setPhotoName] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const otpComplete = otp.every(d => d.length === 1);

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value && index < 3) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  if (done) {
    return (
      <div className="text-center py-10 space-y-4">
        <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mx-auto">
          <CheckCircle2 className="h-10 w-10 text-emerald-500" />
        </div>
        <div>
          <h2 className="font-extrabold text-slate-900 text-lg" style={{ fontFamily: "Montserrat, sans-serif" }}>Course clôturée</h2>
          <p className="text-xs text-slate-500 mt-1">Course #{id} livrée avec succès. Paiement débloqué.</p>
        </div>
        <button onClick={() => navigate("/transporteur")}
          className="bg-[#FF7A00] hover:bg-[#ff8c1a] text-white font-bold px-6 py-3 rounded-2xl text-sm">
          Retour aux missions
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="font-bold text-slate-900 text-base flex items-center gap-2" style={{ fontFamily: "Montserrat, sans-serif" }}>
        <ShieldCheck className="h-5 w-5 text-[#FF7A00]" /> Confirmation de livraison
      </h2>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 space-y-3">
        <p className="text-xs font-semibold text-slate-600">Code OTP communiqué par l'expéditeur</p>
        <div className="flex justify-center gap-3">
          {otp.map((digit, i) => (
            <input key={i} id={`otp-${i}`} type="text" inputMode="numeric" maxLength={1} value={digit}
              onChange={e => handleOtpChange(i, e.target.value)}
              className="w-12 h-14 text-center text-xl font-black bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-[#FF7A00] focus:ring-2 focus:ring-[#FF7A00]/20 outline-none" />
          ))}
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 space-y-3">
        <p className="text-xs font-semibold text-slate-600">Photo de preuve (optionnel)</p>
        <label className="flex items-center justify-center gap-2 border-2 border-dashed border-slate-200 rounded-xl py-6 cursor-pointer hover:border-[#FF7A00]/40 transition">
          <input type="file" accept="image/*" capture="environment" className="hidden"
            onChange={e => setPhotoName(e.target.files?.[0]?.name ?? null)} />
          <Camera className="h-5 w-5 text-slate-400" />
          <span className="text-xs font-medium text-slate-500">{photoName ?? "Prendre une photo"}</span>
        </label>
      </div>

      <button disabled={!otpComplete} onClick={() => setDone(true)}
        className="w-full bg-[#0B2A4A] hover:bg-[#14325C] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-2xl shadow-lg transition text-sm">
        Clôturer la course
      </button>
    </div>
  );
}
