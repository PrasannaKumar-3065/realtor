import React, { useState } from "react";
import { X, Phone, Mail, MessageSquare, CheckCircle, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { api } from "@/api/client";
import { usePrithvi } from "@/store/prithviStore";

interface LeadFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  trigger: "request-details" | "best-price" | "brochure" | "general";
  propertyId?: string;
  propertyTitle?: string;
  propertyPrice?: string;
}

const TRIGGER_LABELS: Record<LeadFormModalProps["trigger"], string> = {
  "request-details": "Request Property Details",
  "best-price": "Get Best Price",
  "brochure": "Download Brochure",
  "general": "Contact Us",
};

const TRIGGER_MESSAGES: Record<LeadFormModalProps["trigger"], string> = {
  "request-details": "I'd like to know more details about this property.",
  "best-price": "Please share the best price for this property.",
  "brochure": "Please send me the brochure for this property.",
  "general": "",
};

export default function LeadFormModal({
  isOpen,
  onClose,
  trigger,
  propertyId = "",
  propertyTitle = "",
  propertyPrice = "",
}: LeadFormModalProps) {
  const { siteInfo } = usePrithvi();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    message: TRIGGER_MESSAGES[trigger],
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.phone.trim()) { setError("Phone number is required."); return; }
    setError("");
    setSubmitting(true);
    try {
      const sourceMap: Record<LeadFormModalProps["trigger"], "form" | "brochure"> = {
        "request-details": "form",
        "best-price": "form",
        "brochure": "brochure",
        "general": "form",
      };
      await api.createLead("prithvi", {
        name: form.name,
        phone: form.phone,
        email: form.email,
        message: form.message,
        propertyId,
        propertyTitle,
        source: sourceMap[trigger],
      });
      setSubmitted(true);
      const waNumber = siteInfo.whatsapp.replace(/[^0-9]/g, "");
      const waText = propertyTitle
        ? `Hi, I am interested in ${propertyTitle}${propertyPrice ? ` (${propertyPrice})` : ""}. Please share more details.`
        : `Hi, I found your listing and I'm interested. Please contact me.`;
      setTimeout(() => {
        window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(waText)}`, "_blank");
      }, 1200);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setSubmitted(false);
    setForm({ name: "", phone: "", email: "", message: TRIGGER_MESSAGES[trigger] });
    setError("");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 z-[200] flex items-center justify-center p-4"
          onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
        >
          <motion.div
            initial={{ scale: 0.93, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.93, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
          >
            <div className="bg-green-700 px-6 py-4 flex items-center justify-between">
              <h2 className="text-white font-bold text-lg">{TRIGGER_LABELS[trigger]}</h2>
              <button onClick={handleClose} className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {propertyTitle && (
              <div className="px-6 py-3 bg-green-50 border-b border-green-100">
                <p className="text-sm text-green-800 font-medium line-clamp-1">{propertyTitle}</p>
                {propertyPrice && <p className="text-xs text-green-600 mt-0.5">{propertyPrice}</p>}
              </div>
            )}

            <div className="p-6">
              {submitted ? (
                <div className="text-center py-6">
                  <CheckCircle className="w-14 h-14 text-green-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Thank You!</h3>
                  <p className="text-gray-500 text-sm">We've received your enquiry. Redirecting you to WhatsApp for a quick response…</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Your Name</label>
                    <Input
                      placeholder="Full name"
                      value={form.name}
                      onChange={(e) => set("name", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <Input
                        required
                        type="tel"
                        placeholder="+91 98765 00000"
                        value={form.phone}
                        onChange={(e) => set("phone", e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Email (optional)</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <Input
                        type="email"
                        placeholder="your@email.com"
                        value={form.email}
                        onChange={(e) => set("email", e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Message</label>
                    <div className="relative">
                      <MessageSquare className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                      <Textarea
                        placeholder="Any specific requirements or questions?"
                        value={form.message}
                        onChange={(e) => set("message", e.target.value)}
                        rows={3}
                        className="pl-9"
                      />
                    </div>
                  </div>
                  {error && <p className="text-sm text-red-500">{error}</p>}
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-green-700 hover:bg-green-800 text-white font-bold py-3 flex items-center justify-center gap-2 text-base"
                  >
                    <Send className="w-4 h-4" />
                    {submitting ? "Sending…" : "Send Enquiry"}
                  </Button>
                  <p className="text-xs text-gray-400 text-center">
                    You'll be connected via WhatsApp for immediate assistance.
                  </p>
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
