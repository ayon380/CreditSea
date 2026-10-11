'use client';

import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../../lib/api';
import { formatDate, formatCurrency } from '../../../lib/formatters';
import { ISalesLead } from '../../../types';
import {
  Users,
  Search,
  Phone,
  Mail,
  UserCheck,
  Clock,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

export default function SalesDashboardPage() {
  const [leads, setLeads] = useState<ISalesLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stepFilter, setStepFilter] = useState<string>('ALL');

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await apiRequest('/operations/sales/leads');
      if (res.success && res.leads) {
        setLeads(res.leads);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStepBadge = (step: number) => {
    switch (step) {
      case 1:
        return {
          label: 'Step 1: Registered Only',
          desc: 'Dropped off before filling details',
          color: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
        };
      case 2:
        return {
          label: 'Step 2: Personal Details',
          desc: 'BRE passed, pending document',
          color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
        };
      case 3:
        return {
          label: 'Step 3: Document Uploaded',
          desc: 'Salary slip uploaded, pending loan apply',
          color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
        };
      default:
        return {
          label: `Step ${step}`,
          desc: 'Pre-application lead',
          color: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
        };
    }
  };

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(search.toLowerCase()) ||
      lead.email.toLowerCase().includes(search.toLowerCase()) ||
      lead.phone.includes(search);

    const matchesStep = stepFilter === 'ALL' || lead.applicationStep === Number(stepFilter);

    return matchesSearch && matchesStep;
  });

  return (
    <div className="space-y-6">
      {/* Module Title Banner */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0075FF] mb-1">
            <Users className="w-4 h-4" />
            <span>Sales & Pre-Application Lead Tracking</span>
          </div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">
            Borrower Pre-Application Queue
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Registered prospects who have started their application but have not submitted it yet.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-center">
            <span className="text-[10px] uppercase font-bold text-gray-400 block">Total Active Leads</span>
            <span className="text-xl font-black text-[#0075FF]">{leads.length}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search leads by applicant name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-transparent text-sm text-gray-900 dark:text-white focus:outline-none focus:border-[#0075FF]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-gray-500 whitespace-nowrap">Filter Drop-off:</span>
          <select
            value={stepFilter}
            onChange={(e) => setStepFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs font-semibold text-gray-800 dark:text-gray-200 focus:outline-none"
          >
            <option value="ALL">All Stages</option>
            <option value="1">Step 1: Registered Only</option>
            <option value="2">Step 2: Personal Details Completed</option>
            <option value="3">Step 3: Document Uploaded</option>
          </select>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="text-center py-20 text-gray-400 text-sm">
            <div className="w-8 h-8 border-3 border-[#0075FF] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <span>Loading pre-application leads...</span>
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Users className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">No matching leads found</p>
            <p className="text-xs text-gray-400">Borrowers who register will automatically appear here as leads.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 dark:bg-gray-800/60 text-gray-500 uppercase font-bold tracking-wider border-b border-gray-200 dark:border-gray-800">
                <tr>
                  <th className="p-4">Lead Contact</th>
                  <th className="p-4">Drop-Off Stage</th>
                  <th className="p-4">Stated Income</th>
                  <th className="p-4">Employment</th>
                  <th className="p-4">Registered On</th>
                  <th className="p-4 text-right">Lead Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {filteredLeads.map((lead) => {
                  const badge = getStepBadge(lead.applicationStep);

                  return (
                    <tr key={lead.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-sm text-gray-900 dark:text-white">
                          {lead.name}
                        </div>
                        <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {lead.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {lead.phone}
                          </span>
                        </div>
                      </td>

                      <td className="p-4">
                        <span className={`inline-block px-2.5 py-1 rounded-lg font-bold border text-[11px] ${badge.color}`}>
                          {badge.label}
                        </span>
                        <span className="block text-[10px] text-gray-400 mt-1">
                          {badge.desc}
                        </span>
                      </td>

                      <td className="p-4 font-semibold text-gray-800 dark:text-gray-200">
                        {lead.monthlySalary ? formatCurrency(lead.monthlySalary) + ' / mo' : '—'}
                      </td>

                      <td className="p-4">
                        <span className="text-gray-600 dark:text-gray-400">
                          {lead.employmentMode ? lead.employmentMode.replace('_', ' ') : '—'}
                        </span>
                      </td>

                      <td className="p-4 text-gray-500">
                        {formatDate(lead.registeredAt)}
                      </td>

                      <td className="p-4 text-right">
                        <a
                          href={`tel:${lead.phone}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-gray-800 hover:bg-[#0075FF] hover:text-white text-gray-700 dark:text-gray-300 transition-colors"
                        >
                          <Phone className="w-3 h-3" />
                          <span>Call Lead</span>
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
