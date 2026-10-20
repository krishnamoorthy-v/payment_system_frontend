import React from 'react';
import { User, Mail, Phone } from 'lucide-react';
import type { CustomerDetails } from '../types/payment';

interface CustomerFormProps {
  details: CustomerDetails;
  onChange: (details: CustomerDetails) => void;
  disabled?: boolean;
}

export const CustomerForm: React.FC<CustomerFormProps> = ({ details, onChange, disabled }) => {
  const handleChange = (field: keyof CustomerDetails, value: string) => {
    onChange({
      ...details,
      [field]: value,
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <User className="w-5 h-5 text-indigo-400" />
          Customer Information
        </h2>
        <p className="text-sm text-slate-400">Pre-fills Razorpay checkout and sends payment receipt</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Full Name */}
        <div className="md:col-span-2">
          <label htmlFor="customer-name" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Full Name <span className="text-rose-400">*</span>
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="customer-name"
              name="name"
              type="text"
              required
              disabled={disabled}
              autoComplete="name"
              placeholder="e.g. Krishna Sharma"
              value={details.fullName}
              onChange={(e) => handleChange('fullName', e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:opacity-50"
            />
          </div>
        </div>

        {/* Email Address */}
        <div>
          <label htmlFor="customer-email" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Email Address <span className="text-rose-400">*</span>
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="customer-email"
              name="email"
              type="email"
              required
              disabled={disabled}
              autoComplete="email"
              placeholder="krishna@example.com"
              value={details.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:opacity-50"
            />
          </div>
        </div>

        {/* Phone Number */}
        <div>
          <label htmlFor="customer-phone" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Phone Number <span className="text-rose-400">*</span>
          </label>
          <div className="relative">
            <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="customer-phone"
              name="tel"
              type="tel"
              required
              disabled={disabled}
              autoComplete="tel"
              placeholder="9876543210"
              value={details.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:opacity-50"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
