import { useState } from "react";
import { useSearchParams } from "react-router";
import { LifeBuoy, AlertTriangle, Send, CheckCircle2, PhoneCall } from "lucide-react";

const ISSUE_TYPES = [
  "Retard de livraison",
  "Marchandise endommagée",
  "Problème de paiement",
  "Comportement du chauffeur / expéditeur",
  "Autre",
];

export default function Support() {
  const [searchParams] = useSearchParams();
  const [course, setCourse] = useState(searchParams.get("course") ?? "");
  const [issueType, setIssueType] = useState(ISSUE_TYPES[0]);
  const [description, setDescription] = useState("");
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div className="text-center py-10 space-y-4">
        <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mx-auto">
          <CheckCircle2 className="h-10 w-10 text-emerald-500" />
        </div>
        <div>
          <h2 className="font-extrabold text-slate-900 text-lg" style={{ fontFamily: "Montserrat, sans-serif" }}>Signalement envoyé</h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">Notre équipe support vous recontacte sous 24h ouvrées.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="font-bold text-slate-900 text-base flex items-center gap-2" style={{ fontFamily: "Montserrat, sans-serif" }}>
        <LifeBuoy className="h-5 w-5 text-[#FF7A00]" /> Support & litige
      </h2>

      <a href="tel:+2290192004503"
        className="flex items-center justify-between bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
            <PhoneCall className="h-4.5 w-4.5 text-[#FF7A00]" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900">Assistance urgente</p>
            <p className="text-[11px] text-slate-500">+229 01 92 00 45 03</p>
          </div>
        </div>
      </a>

      <form onSubmit={e => { e.preventDefault(); setSent(true); }} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 space-y-3">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Course concernée</label>
          <input type="text" value={course} onChange={e => setCourse(e.target.value)} placeholder="ex: #SF-8902"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-medium focus:ring-2 focus:ring-[#FF7A00] outline-none" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Type de problème</label>
          <select value={issueType} onChange={e => setIssueType(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-medium focus:ring-2 focus:ring-[#FF7A00] outline-none">
            {ISSUE_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Description</label>
          <textarea required value={description} onChange={e => setDescription(e.target.value)} rows={4}
            placeholder="Décrivez le problème rencontré..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-medium focus:ring-2 focus:ring-[#FF7A00] outline-none resize-none" />
        </div>
        <div className="flex items-start gap-2 text-[11px] text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-2.5">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          Pour un litige financier, le paiement reste séquestré jusqu'à résolution.
        </div>
        <button type="submit"
          className="w-full bg-[#FF7A00] hover:bg-[#ff8c1a] text-white font-bold py-3.5 rounded-2xl shadow-lg transition flex items-center justify-center gap-2 text-sm">
          Envoyer le signalement <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
