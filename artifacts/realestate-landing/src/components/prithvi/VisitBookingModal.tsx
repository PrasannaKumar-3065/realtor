import React, { useState } from "react";
import { X, Phone, Calendar, Clock, CheckCircle, CalendarCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { api } from "@/api/client";

interface VisitBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId?: string;
  propertyTitle?: string;
}

const TIME_SLOTS = [
  "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
  "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM",
];

export default function VisitBookingModal({
  isOpen,
  onClose,
  propertyId = "",
  propertyTitle = "",
}: VisitBookingModalProps) {
  const today = new Date().toISOString().split("T")[0];
  const [form, setForm] = useState({ name: "", phone: "", date: "", time: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.phone.trim()) { setError("Phone number is required."); return; }
    if (!form.date) { setError("Please select a visit date."); return; }
    if (!form.time) { setError("Please select a time slot."); return; }
    setError("");
    setSubmitting(true);
    try {
      await api.createBooking("prithvi", {
        name: form.name,
        phone: form.phone,
        propertyId,
        propertyTitle,
        date: form.date,
        time: form.time,
      });
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setSubmitted(false);
    setForm({ name: "", phone: "", date: "", time: "" });
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
              <div className="flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-white" />
                <h2 className="text-white font-bold text-lg">Schedule a Site Visit</h2>
              </div>
              <button onClick={handleClose} className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {propertyTitle && (
              <div className="px-6 py-3 bg-green-50 border-b border-green-100">
                <p className="text-sm text-green-800 font-medium line-clamp-1">{propertyTitle}</p>
              </div>
            )}

            <div className="p-6">
              {submitted ? (
                <div className="text-center py-6">
                  <CheckCircle className="w-14 h-14 text-green-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Visit Booked!</h3>
                  <p className="text-gray-500 text-sm mb-1">
                    Your site visit is scheduled for <strong>{form.date}</strong> at <strong>{form.time}</strong>.
                  </p>
                  <p className="text-gray-400 text-sm">Our team will confirm your visit shortly.</p>
                  <Button onClick={handleClose} className="mt-6 bg-green-700 hover:bg-green-800">Done</Button>
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
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Preferred Date <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <Input
                        required
                        type="date"
                        min={today}
                        value={form.date}
                        onChange={(e) => set("date", e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Preferred Time <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {TIME_SLOTS.map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => set("time", slot)}
                          className={`text-xs font-medium py-2 px-1 rounded-lg border transition-colors ${
                            form.time === slot
                              ? "bg-green-700 text-white border-green-700"
                              : "border-gray-200 text-gray-600 hover:border-green-400 hover:text-green-700"
                          }`}
                        >
                          <Clock className="w-3 h-3 mx-auto mb-0.5" />
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                  {error && <p className="text-sm text-red-500">{error}</p>}
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-green-700 hover:bg-green-800 text-white font-bold py-3 flex items-center justify-center gap-2 text-base"
                  >
                    <CalendarCheck className="w-4 h-4" />
                    {submitting ? "Booking…" : "Confirm Visit"}
                  </Button>
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
