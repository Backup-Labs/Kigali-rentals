'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRental } from '@/lib/rentalContext';
import { AdminTask, AssetInventoryItem } from '@/lib/types';
import {
  ShieldCheck,
  TrendingUp,
  Calendar,
  Layers,
  ClipboardList,
  CheckCircle,
  AlertCircle,
  Clock,
  Car,
  Home,
  DollarSign,
  User,
  Plus,
  Edit2,
  RefreshCw,
  Search,
  Filter,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const {
    inventory,
    updateInventoryItem,
    adminTasks,
    updateTaskStatus,
    addTask,
    reservations,
    formatPrice,
    currency,
    toggleCurrency,
  } = useRental();

  const [activeTab, setActiveTab] = useState<'overview' | 'schedule' | 'inventory' | 'tasks'>('overview');
  const [inventorySearch, setInventorySearch] = useState('');
  const [inventoryFilterType, setInventoryFilterType] = useState<'all' | 'property' | 'car'>('all');

  // Modal for editing asset
  const [editingAsset, setEditingAsset] = useState<AssetInventoryItem | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editStatus, setEditStatus] = useState<AssetInventoryItem['status']>('Available');

  // New task form state
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskAsset, setNewTaskAsset] = useState(inventory[0]?.title || '');
  const [newTaskAssignee, setNewTaskAssignee] = useState('Patrick Mugabo');
  const [newTaskType, setNewTaskType] = useState<AdminTask['type']>('cleaning');
  const [newTaskPriority, setNewTaskPriority] = useState<AdminTask['priority']>('high');

  // Metrics computation
  const totalAssets = inventory.length;
  const rentedAssets = inventory.filter((i) => i.status === 'Rented').length;
  const occupancyRate = Math.round((rentedAssets / totalAssets) * 100);

  const pendingCheckouts = reservations.filter(
    (r) => r.status === 'active' || r.status === 'pending_handover'
  ).length;

  const todayArrivals = reservations.filter(
    (r) => r.status === 'confirmed'
  ).length;

  const totalRevenueUsd = reservations.reduce(
    (acc, r) => acc + (r.pricing?.grandTotal || 0),
    0
  );

  const handleOpenEdit = (item: AssetInventoryItem) => {
    setEditingAsset(item);
    setEditPrice(item.pricePerDay);
    setEditStatus(item.status);
  };

  const handleSaveAssetEdit = () => {
    if (!editingAsset) return;
    updateInventoryItem(editingAsset.id, {
      pricePerDay: editPrice,
      status: editStatus,
    });
    setEditingAsset(null);
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle) return;
    addTask({
      title: newTaskTitle,
      type: newTaskType,
      assetId: 'asset-custom',
      assetName: newTaskAsset,
      assetType: 'property',
      assignee: newTaskAssignee,
      assigneeRole: 'Field Operations',
      time: '02:00 PM',
      date: '2026-10-13',
      status: 'pending',
      priority: newTaskPriority,
    });
    setNewTaskTitle('');
    setShowAddTaskModal(false);
  };

  const filteredInventory = inventory.filter((item) => {
    if (inventoryFilterType !== 'all' && item.type !== inventoryFilterType) return false;
    if (inventorySearch && !item.title.toLowerCase().includes(inventorySearch.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#FAF7F2] pb-24 pt-20 sm:pt-24">
      {/* Top Admin Bar */}
      <div className="bg-[#07232C] text-white py-5 border-b border-white/10">
        <div className="container mx-auto px-4 sm:px-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold font-syne uppercase tracking-wider bg-[#C85A2A] text-white px-2 py-0.5 rounded">
                Back-Office AD-01
              </span>
              <span className="text-xs text-emerald-400 font-mono">
                ● Live Operations Console
              </span>
            </div>
            <h1 className="font-syne text-2xl sm:text-3xl font-extrabold text-white">
              Kigali Rentals Hub
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleCurrency}
              className="px-3 py-1.5 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-xs font-mono font-bold text-[#E6D7C3]"
            >
              Currency: {currency} (Click to toggle)
            </button>

            <Link
              href="/handover"
              className="px-4 py-2 rounded-xl bg-[#5A6B3C] hover:bg-[#44522C] text-white text-xs font-syne font-bold flex items-center gap-1.5 shadow-sm"
            >
              <ClipboardList className="w-3.5 h-3.5" />
              <span>Launch Handover</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 pt-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-300 pb-4 mb-6 overflow-x-auto scrollbar-none">
          {[
            { id: 'overview', label: 'Executive Overview' },
            { id: 'schedule', label: 'Unified Schedule Timeline' },
            { id: 'inventory', label: 'Asset Fleet & Pricing' },
            { id: 'tasks', label: 'Operations Task Board' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-syne font-bold transition-all shrink-0 ${
                activeTab === tab.id
                  ? 'skeu-tab-active text-white'
                  : 'skeu-btn-frosted text-slate-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 1. KEY METRIC CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <div className="skeu-card-elevated rounded-2xl p-5 flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold font-syne text-slate-400 uppercase block">
                Today’s Pickups / Arrivals
              </span>
              <span className="font-syne font-extrabold text-3xl text-[#0D3846] mt-1 block">
                {todayArrivals}
              </span>
              <span className="text-xs text-emerald-600 font-medium mt-1 block">
                2 VIP Meet & Greets scheduled
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shadow-xs">
              <Calendar className="w-5 h-5" />
            </div>
          </div>

          <div className="skeu-card-elevated rounded-2xl p-5 flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold font-syne text-slate-400 uppercase block">
                Pending Check-outs
              </span>
              <span className="font-syne font-extrabold text-3xl text-[#C85A2A] mt-1 block">
                {pendingCheckouts}
              </span>
              <span className="text-xs text-slate-500 font-medium mt-1 block">
                Nyarutarama Villa inspection due
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#C85A2A]/10 border border-[#C85A2A]/25 text-[#C85A2A] flex items-center justify-center shadow-xs">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="skeu-card-elevated rounded-2xl p-5 flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold font-syne text-slate-400 uppercase block">
                Occupancy / Fleet Utilization
              </span>
              <span className="font-syne font-extrabold text-3xl text-[#0D3846] mt-1 block">
                {occupancyRate}%
              </span>
              <span className="text-xs text-slate-500 font-medium mt-1 block">
                {rentedAssets} of {totalAssets} assets active
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shadow-xs">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>

          <div className="skeu-card-elevated rounded-2xl p-5 flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold font-syne text-slate-400 uppercase block">
                Active Bookings Revenue
              </span>
              <span className="font-syne font-extrabold text-2xl text-[#0D3846] mt-1 block">
                {formatPrice(totalRevenueUsd)}
              </span>
              <span className="text-xs text-emerald-700 font-medium mt-1 block">
                Via MTN MoMo & Card Holds
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shadow-xs">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* TAB 1: OVERVIEW & RECENT RESERVATIONS */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Recent Reservations Table */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#E6D7C3] shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-syne font-bold text-lg text-[#0D3846]">
                    Recent Confirmed Reservations
                  </h3>
                  <span className="text-xs text-slate-500">Live feed from customer checkout terminal</span>
                </div>
                <Link
                  href="/checkout"
                  className="text-xs font-syne font-bold text-[#C85A2A] hover:underline flex items-center gap-1"
                >
                  <span>Test New Booking</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-syne uppercase text-[10px]">
                      <th className="pb-3">Reference</th>
                      <th className="pb-3">Asset(s)</th>
                      <th className="pb-3">Renter</th>
                      <th className="pb-3">Dates</th>
                      <th className="pb-3">Total</th>
                      <th className="pb-3">Payment</th>
                      <th className="pb-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {reservations.map((res) => (
                      <tr key={res.id} className="hover:bg-[#FAF7F2] transition-colors">
                        <td className="py-3 font-mono font-bold text-[#0D3846]">
                          {res.id}
                        </td>
                        <td className="py-3">
                          <div className="font-bold text-slate-800 line-clamp-1">
                            {res.assetTitle}
                          </div>
                          {res.pairedAssetTitle && (
                            <span className="text-[10px] text-[#C85A2A] font-medium block">
                              + Bundle: {res.pairedAssetTitle}
                            </span>
                          )}
                        </td>
                        <td className="py-3">
                          <span className="font-semibold text-slate-800 block">
                            {res.customer.fullName}
                          </span>
                          <span className="text-slate-400 text-[11px]">{res.customer.phone}</span>
                        </td>
                        <td className="py-3 text-slate-600 font-medium">
                          {res.startDate} → {res.endDate}
                        </td>
                        <td className="py-3 font-mono font-bold text-[#0D3846]">
                          {formatPrice(res.pricing?.grandTotal || 0)}
                        </td>
                        <td className="py-3">
                          <span className="uppercase font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">
                            {res.pricing?.paymentMethod === 'momo_mtn' ? 'MTN MoMo' : res.pricing?.paymentMethod === 'card' ? 'Card' : 'Airtel'}
                          </span>
                        </td>
                        <td className="py-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              res.status === 'confirmed'
                                ? 'bg-blue-100 text-blue-800'
                                : res.status === 'active'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {res.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick Operations Snapshot */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Fleet status mini list */}
              <div className="bg-white rounded-3xl p-6 border border-[#E6D7C3] shadow-sm">
                <h3 className="font-syne font-bold text-base text-[#0D3846] mb-3">
                  Fleet & Property Availability
                </h3>
                <div className="space-y-3">
                  {inventory.slice(0, 4).map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-[#FAF7F2] border border-slate-200 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        {item.type === 'car' ? (
                          <Car className="w-4 h-4 text-[#5A6B3C]" />
                        ) : (
                          <Home className="w-4 h-4 text-[#0D3846]" />
                        )}
                        <span className="font-bold text-slate-800">{item.title}</span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          item.status === 'Available'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.status === 'Rented'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Operations Tasks mini list */}
              <div className="bg-white rounded-3xl p-6 border border-[#E6D7C3] shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-syne font-bold text-base text-[#0D3846]">
                    Immediate Field Tasks
                  </h3>
                  <button
                    onClick={() => setActiveTab('tasks')}
                    className="text-xs font-bold text-[#C85A2A] hover:underline"
                  >
                    View All Tasks
                  </button>
                </div>
                <div className="space-y-3">
                  {adminTasks.slice(0, 4).map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-[#FAF7F2] border border-slate-200 text-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-800 block">{task.title}</span>
                        <span className="text-slate-400 text-[11px]">
                          {task.assignee} • {task.time}
                        </span>
                      </div>
                      <button
                        onClick={() =>
                          updateTaskStatus(
                            task.id,
                            task.status === 'completed' ? 'pending' : 'completed'
                          )
                        }
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          task.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {task.status === 'completed' ? '✓ Done' : 'Pending'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: UNIFIED SCHEDULE TIMELINE (AD-02) */}
        {activeTab === 'schedule' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E6D7C3] shadow-md space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-4">
              <div>
                <h2 className="font-syne font-bold text-xl text-[#0D3846]">
                  Unified Booking & Handover Timeline
                </h2>
                <p className="text-xs text-slate-500">
                  Cross-asset calendar aligning residential villas, penthouses, and vehicles on a synchronized date-axis.
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-[#0D3846]"></span>
                  <span>Properties</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-[#5A6B3C]"></span>
                  <span>Vehicles</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-[#C85A2A]"></span>
                  <span>Combos</span>
                </span>
              </div>
            </div>

            {/* Visual Timeline Grid */}
            <div className="overflow-x-auto">
              <div className="min-w-[700px] border border-slate-200 rounded-2xl overflow-hidden">
                {/* Timeline Header (Days of October 2026) */}
                <div className="grid grid-cols-10 bg-[#07232C] text-white text-xs font-mono py-2.5 px-4 font-bold border-b border-slate-300">
                  <div className="col-span-2">Asset Name</div>
                  <div>Oct 12</div>
                  <div>Oct 13</div>
                  <div>Oct 14</div>
                  <div>Oct 15</div>
                  <div>Oct 16</div>
                  <div>Oct 17</div>
                  <div>Oct 18</div>
                  <div>Oct 19</div>
                </div>

                {/* Timeline Rows */}
                <div className="divide-y divide-slate-100 bg-[#FAF7F2]">
                  {inventory.map((asset) => {
                    const activeRes = reservations.find(
                      (r) => r.assetId === asset.id || r.pairedAssetId === asset.id
                    );

                    return (
                      <div
                        key={asset.id}
                        className="grid grid-cols-10 items-center py-3 px-4 text-xs hover:bg-white transition-colors"
                      >
                        <div className="col-span-2 flex items-center gap-2 pr-2">
                          {asset.type === 'car' ? (
                            <Car className="w-3.5 h-3.5 text-[#5A6B3C] shrink-0" />
                          ) : (
                            <Home className="w-3.5 h-3.5 text-[#0D3846] shrink-0" />
                          )}
                          <span className="font-bold text-[#0D3846] truncate">
                            {asset.title}
                          </span>
                        </div>

                        {/* Calendar cells */}
                        <div className="col-span-8 relative h-7 flex items-center">
                          {activeRes ? (
                            <div
                              className={`absolute h-6 rounded-lg text-white font-syne font-bold text-[10px] flex items-center px-2 truncate shadow-sm ${
                                activeRes.assetType === 'combo'
                                  ? 'bg-[#C85A2A] left-[15%] w-[60%]'
                                  : asset.type === 'car'
                                  ? 'bg-[#5A6B3C] left-[0%] w-[45%]'
                                  : 'bg-[#0D3846] left-[25%] w-[65%]'
                              }`}
                            >
                              <span>
                                {activeRes.id}: {activeRes.customer.fullName}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[10px] text-emerald-600 font-medium pl-2">
                              Available
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: INVENTORY MANAGEMENT & PRICE OVERRIDES (AD-03 to AD-06) */}
        {activeTab === 'inventory' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E6D7C3] shadow-md space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <h2 className="font-syne font-bold text-xl text-[#0D3846]">
                  Asset Inventory & Rate Overrides
                </h2>
                <p className="text-xs text-slate-500">
                  Update daily prices, maintenance flags, and operational status in real time.
                </p>
              </div>

              {/* Filter and Search Bar */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Filter asset name..."
                  value={inventorySearch}
                  onChange={(e) => setInventorySearch(e.target.value)}
                  className="bg-[#FAF7F2] border border-slate-300 rounded-xl px-3 py-1.5 text-xs focus:outline-none"
                />

                <select
                  value={inventoryFilterType}
                  onChange={(e: any) => setInventoryFilterType(e.target.value)}
                  aria-label="Filter inventory by type"
                  className="bg-[#FAF7F2] border border-slate-300 rounded-xl px-2 py-1.5 text-xs focus:outline-none"
                >
                  <option value="all">All Types</option>
                  <option value="property">Properties</option>
                  <option value="car">Vehicles</option>
                </select>
              </div>
            </div>

            {/* Inventory Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-syne uppercase text-[10px]">
                    <th className="pb-3">Asset</th>
                    <th className="pb-3">Type</th>
                    <th className="pb-3">Neighborhood</th>
                    <th className="pb-3">Specs</th>
                    <th className="pb-3">Daily Rate</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredInventory.map((item) => (
                    <tr key={item.id} className="hover:bg-[#FAF7F2] transition-colors">
                      <td className="py-3 flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-slate-200">
                          <Image src={item.imageUrl} alt={item.title} fill className="object-cover" />
                        </div>
                        <span className="font-bold text-slate-900">{item.title}</span>
                      </td>
                      <td className="py-3 capitalize text-slate-600">
                        {item.type}
                      </td>
                      <td className="py-3 text-slate-600">{item.neighborhood}</td>
                      <td className="py-3 text-slate-500 font-mono text-[11px]">{item.specs}</td>
                      <td className="py-3 font-mono font-bold text-[#0D3846]">
                        {formatPrice(item.pricePerDay)}/day
                      </td>
                      <td className="py-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            item.status === 'Available'
                              ? 'bg-emerald-100 text-emerald-800'
                              : item.status === 'Rented'
                              ? 'bg-amber-100 text-amber-800'
                              : item.status === 'Cleaning'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(item)}
                          className="px-3 py-1.5 bg-[#0D3846] hover:bg-[#C85A2A] text-white rounded-lg font-syne font-bold text-[10px] uppercase transition-colors"
                        >
                          Edit Status / Rate
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Asset Edit Modal */}
            {editingAsset && (
              <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full border border-slate-200 shadow-2xl animate-fadeIn space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="font-syne font-bold text-base text-[#0D3846]">
                      Edit {editingAsset.title}
                    </h3>
                    <button
                      onClick={() => setEditingAsset(null)}
                      className="text-slate-400 hover:text-slate-700"
                    >
                      ✕
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-bold font-syne text-slate-700 uppercase mb-1">
                      Override Daily Rate (USD)
                    </label>
                    <input
                      type="number"
                      value={editPrice}
                      onChange={(e) => setEditPrice(parseInt(e.target.value, 10) || 0)}
                      className="w-full bg-[#FAF7F2] border border-slate-300 rounded-xl px-3 py-2 text-sm font-mono font-bold text-slate-900"
                    />
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      Equivalent: {formatPrice(editPrice)}
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold font-syne text-slate-700 uppercase mb-1">
                      Operational Status
                    </label>
                    <select
                      value={editStatus}
                      onChange={(e: any) => setEditStatus(e.target.value)}
                      className="w-full bg-[#FAF7F2] border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900"
                    >
                      <option value="Available">Available (Ready for Booking)</option>
                      <option value="Rented">Rented (Active Reservation)</option>
                      <option value="Cleaning">Cleaning & Turnover</option>
                      <option value="Maintenance">Maintenance & Servicing</option>
                    </select>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setEditingAsset(null)}
                      className="px-4 py-2 text-xs font-syne font-bold text-slate-500 hover:bg-slate-100 rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveAssetEdit}
                      className="px-5 py-2 bg-[#C85A2A] hover:bg-[#B24F23] text-white text-xs font-syne font-bold uppercase rounded-xl shadow-md"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: OPERATIONS TASK BOARD (AD-07 to AD-11) */}
        {activeTab === 'tasks' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E6D7C3] shadow-md space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <h2 className="font-syne font-bold text-xl text-[#0D3846]">
                  Operations Handover & Turnover Tasks
                </h2>
                <p className="text-xs text-slate-500">
                  Cleaner checklists, VIP chauffeur assignments, and handover inspections.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddTaskModal(true)}
                className="px-4 py-2.5 bg-[#C85A2A] hover:bg-[#B24F23] text-white rounded-xl text-xs font-syne font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>Create Dispatch Task</span>
              </button>
            </div>

            {/* Task Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {adminTasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    task.status === 'completed'
                      ? 'bg-slate-50/70 border-slate-200 opacity-70'
                      : 'bg-[#FAF7F2] border-[#E6D7C3] shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span
                      className={`text-[9px] font-syne font-bold uppercase px-2 py-0.5 rounded-full ${
                        task.priority === 'urgent'
                          ? 'bg-red-100 text-red-700'
                          : task.priority === 'high'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {task.priority} Priority
                    </span>

                    <span className="text-[11px] font-mono text-slate-400">
                      {task.time}
                    </span>
                  </div>

                  <h4 className="font-syne font-bold text-sm text-[#0D3846] leading-snug mb-1">
                    {task.title}
                  </h4>

                  <span className="text-xs font-medium text-slate-600 block mb-2">
                    Asset: {task.assetName}
                  </span>

                  {task.notes && (
                    <p className="text-[11px] text-slate-500 bg-white p-2 rounded-lg border border-slate-200 mb-3 line-clamp-2">
                      {task.notes}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <User className="w-3.5 h-3.5 text-[#C85A2A]" />
                      <span className="font-medium truncate max-w-[120px]">{task.assignee}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        updateTaskStatus(
                          task.id,
                          task.status === 'completed' ? 'pending' : 'completed'
                        )
                      }
                      className={`px-3 py-1 rounded-lg font-syne font-bold text-[10px] uppercase transition-colors ${
                        task.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-[#0D3846] text-white hover:bg-[#C85A2A]'
                      }`}
                    >
                      {task.status === 'completed' ? '✓ Completed' : 'Mark Done'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Create Task Modal */}
            {showAddTaskModal && (
              <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                <form
                  onSubmit={handleCreateTask}
                  className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full border border-slate-200 shadow-2xl animate-fadeIn space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="font-syne font-bold text-base text-[#0D3846]">
                      Assign New Operations Task
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowAddTaskModal(false)}
                      className="text-slate-400 hover:text-slate-700"
                    >
                      ✕
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-bold font-syne text-slate-700 uppercase mb-1">
                      Task Description
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Clean pool and refill coffee bar"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      className="w-full bg-[#FAF7F2] border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold font-syne text-slate-700 uppercase mb-1">
                      Assigned Field Staff
                    </label>
                    <input
                      type="text"
                      required
                      value={newTaskAssignee}
                      onChange={(e) => setNewTaskAssignee(e.target.value)}
                      className="w-full bg-[#FAF7F2] border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-900"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold font-syne text-slate-700 uppercase mb-1">
                        Task Type
                      </label>
                      <select
                        value={newTaskType}
                        onChange={(e: any) => setNewTaskType(e.target.value)}
                        className="w-full bg-[#FAF7F2] border border-slate-300 rounded-xl px-2 py-2 text-xs"
                      >
                        <option value="cleaning">Cleaning</option>
                        <option value="driver_dispatch">VIP Chauffeur</option>
                        <option value="handover_checkin">Check-In Handover</option>
                        <option value="handover_checkout">Check-Out Handover</option>
                        <option value="maintenance">Maintenance</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold font-syne text-slate-700 uppercase mb-1">
                        Priority
                      </label>
                      <select
                        value={newTaskPriority}
                        onChange={(e: any) => setNewTaskPriority(e.target.value)}
                        className="w-full bg-[#FAF7F2] border border-slate-300 rounded-xl px-2 py-2 text-xs"
                      >
                        <option value="urgent">Urgent</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddTaskModal(false)}
                      className="px-4 py-2 text-xs font-syne font-bold text-slate-500 hover:bg-slate-100 rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-[#C85A2A] hover:bg-[#B24F23] text-white text-xs font-syne font-bold uppercase rounded-xl shadow-md"
                    >
                      Dispatch Task
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

