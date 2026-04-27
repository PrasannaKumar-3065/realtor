import React, { useState, useEffect } from "react";
import { Calculator, IndianRupee } from "lucide-react";
import { Input } from "@/components/ui/input";

interface EMICalculatorProps {
  defaultPrice?: number;
}

function formatINR(amount: number): string {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} Lac`;
  return `₹${amount.toLocaleString("en-IN")}`;
}

function calcEMI(principal: number, ratePercent: number, tenureYears: number): number {
  if (principal <= 0 || ratePercent <= 0 || tenureYears <= 0) return 0;
  const r = ratePercent / 12 / 100;
  const n = tenureYears * 12;
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

export default function EMICalculator({ defaultPrice = 0 }: EMICalculatorProps) {
  const [principal, setPrincipal] = useState(Math.round(defaultPrice * 0.8));
  const [rate, setRate] = useState(8.5);
  const [tenure, setTenure] = useState(15);
  const [emi, setEMI] = useState(0);

  useEffect(() => {
    setEMI(calcEMI(principal, rate, tenure));
  }, [principal, rate, tenure]);

  useEffect(() => {
    if (defaultPrice > 0) setPrincipal(Math.round(defaultPrice * 0.8));
  }, [defaultPrice]);

  const totalPayment = emi * tenure * 12;
  const totalInterest = totalPayment - principal;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h2 className="font-bold text-gray-900 text-lg mb-5 flex items-center gap-2">
        <Calculator className="w-5 h-5 text-green-600" /> EMI Calculator
      </h2>

      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-gray-700">Loan Amount</label>
            <span className="text-sm font-bold text-green-700">{formatINR(principal)}</span>
          </div>
          <div className="relative">
            <IndianRupee className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              type="number"
              min={0}
              step={50000}
              value={principal || ""}
              onChange={(e) => setPrincipal(Number(e.target.value))}
              className="pl-9 font-mono text-sm"
              placeholder="e.g. 5000000"
            />
          </div>
          <input
            type="range"
            min={100000}
            max={Math.max(10000000, defaultPrice * 1.5)}
            step={50000}
            value={principal}
            onChange={(e) => setPrincipal(Number(e.target.value))}
            className="w-full mt-2 accent-green-600"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-gray-700">Interest Rate (p.a.)</label>
            <span className="text-sm font-bold text-green-700">{rate}%</span>
          </div>
          <Input
            type="number"
            min={4}
            max={20}
            step={0.1}
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
            className="font-mono text-sm"
          />
          <input
            type="range"
            min={4}
            max={20}
            step={0.1}
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
            className="w-full mt-2 accent-green-600"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-gray-700">Tenure</label>
            <span className="text-sm font-bold text-green-700">{tenure} years</span>
          </div>
          <Input
            type="number"
            min={1}
            max={30}
            step={1}
            value={tenure}
            onChange={(e) => setTenure(Number(e.target.value))}
            className="font-mono text-sm"
          />
          <input
            type="range"
            min={1}
            max={30}
            step={1}
            value={tenure}
            onChange={(e) => setTenure(Number(e.target.value))}
            className="w-full mt-2 accent-green-600"
          />
        </div>
      </div>

      {emi > 0 && (
        <div className="mt-5 pt-5 border-t border-gray-100">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center mb-4">
            <p className="text-xs text-green-600 mb-1 font-medium uppercase tracking-wide">Monthly EMI</p>
            <p className="text-3xl font-extrabold text-green-700">
              ₹{Math.round(emi).toLocaleString("en-IN")}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-gray-400 text-xs mb-1">Total Interest</p>
              <p className="font-bold text-gray-700">{formatINR(Math.round(totalInterest))}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-gray-400 text-xs mb-1">Total Payment</p>
              <p className="font-bold text-gray-700">{formatINR(Math.round(totalPayment))}</p>
            </div>
          </div>
          <p className="text-xs text-gray-400 text-center mt-3">
            * Indicative EMI. Actual rate may vary by lender.
          </p>
        </div>
      )}
    </div>
  );
}
