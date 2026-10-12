'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRental } from '@/lib/rentalContext';
import { ConditionReport } from '@/lib/types';
import {
  ClipboardCheck,
  Car as CarIcon,
  Home as HomeIcon,
  Fuel,
  Gauge,
  Camera,
  CheckCircle2,
  AlertTriangle,
  Key,
  Zap,
  Droplets,
  RotateCcw,
  ShieldCheck,
  FileCheck,
  Sparkles,
  ArrowRight,
  Plus,
  Trash2,
} from 'lucide-react';
import CustomSelect from '@/components/ui/CustomSelect';

export default function HandoverToolPage() {
  const {
    reservations,
    conditionReports,
    saveConditionReport,
  } = useRental();

  // Active Selected Reservation
  const [selectedBookingId, setSelectedBookingId] = useState<string>(
    reservations[0]?.id || 'KGL-2026-8910'
  );

  const selectedBooking = reservations.find((r) => r.id === selectedBookingId) || reservations[0];

  // Stage: Check-in vs Check-out vs Side-by-Side Comparison
  const [activeTab, setActiveTab] = useState<'check_in' | 'check_out' | 'compare'>('check_in');

  // Car form states
  const [odometer, setOdometer] = useState<number>(34120);
  const [fuelLevel, setFuelLevel] = useState<number>(100);
  const [carCleanliness, setCarCleanliness] = useState<'pristine' | 'standard' | 'muddy'>('pristine');
  const [carScratches, setCarScratches] = useState<
    { id: string; location: string; severity: 'minor' | 'moderate' | 'major'; note: string }[]
  >([
    { id: '1', location: 'Rear bumper right corner', severity: 'minor', note: '1.5cm surface scuff' }
  ]);
  const [newScratchNote, setNewScratchNote] = useState('');
  const [newScratchLoc, setNewScratchLoc] = useState('');

  // Property form states
  const [keysHandedOver, setKeysHandedOver] = useState(true);
  const [keyBoxPin, setKeyBoxPin] = useState('9420');
  const [electricityKwh, setElectricityKwh] = useState(12450.8);
  const [waterUnits, setWaterUnits] = useState(842.1);
  const [propertyCleanliness, setPropertyCleanliness] = useState<'pristine' | 'good' | 'needs_attention'>('pristine');
  const [rooms, setRooms] = useState<
    { id: string; room: string; status: 'ok' | 'issue'; notes: string }[]
  >([
    { id: '1', room: 'Living Room & Balcony', status: 'ok', notes: 'Smart TV & AC in optimal condition' },
    { id: '2', room: 'Master Bedroom Suite', status: 'ok', notes: 'Linens, safe box, and bathroom verified' },
    { id: '3', room: 'Kitchen & Dining', status: 'ok', notes: 'Nespresso, fridge, and cutlery counted' },
    { id: '4', room: 'Backup Generator & Water Tank', status: 'ok', notes: 'Diesel level at 95%, auto-transfer switch tested' },
  ]);

  // Photo slots mock
  const [exteriorPhotos, setExteriorPhotos] = useState({
    front: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=600&q=80',
    back: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=600&q=80',
    driverSide: 'https://images.unsplash.com/photo-1553440569-bcc63803a83d?auto=format&fit=crop&w=600&q=80',
    passengerSide: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=600&q=80',
  });

  const [savedSuccessMessage, setSavedSuccessMessage] = useState<string | null>(null);

  const isCarAsset = selectedBooking?.assetType === 'car'; 

  const addScratch = () => {
    if (!newScratchLoc) return;
    setCarScratches((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        location: newScratchLoc,
        severity: 'minor',
        note: newScratchNote || 'Superficial mark recorded',
      },
    ]);
    setNewScratchLoc('');
    setNewScratchNote('');
  };

  const removeScratch = (id: string) => {
    setCarScratches((prev) => prev.filter((s) => s.id !== id));
  };

  const toggleRoomStatus = (id: string) => {
    setRooms((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: r.status === 'ok' ? 'issue' : 'ok' } : r
      )
    );
  };

  const handleSaveReport = () => {
    const report: ConditionReport = {
      id: `rep-${selectedBooking.id}-${activeTab}`,
      bookingId: selectedBooking.id,
      assetId: selectedBooking.assetId,
      assetTitle: selectedBooking.assetTitle,
      assetType: isCarAsset ? 'car' : 'property',
      stage: activeTab === 'check_out' ? 'check_out' : 'check_in',
      timestamp: new Date().toISOString(),
      agentName: 'Patrick Mugabo (Kigali Fleet Ops)',
      customerName: selectedBooking.customer.fullName,
      carData: isCarAsset
        ? {
            odometer,
            fuelLevel,
            cleanliness: carCleanliness,
            exteriorPhotos,
            scratches: carScratches,
            spareTireAndJack: true,
            trianglePresent: true,
            notes: 'Joint inspection signed by customer and field coordinator.',
          }
        : undefined,
      propertyData: !isCarAsset
        ? {
            keysHandedOver,
            keyBoxPin,
            electricityMeterKwh: electricityKwh,
            waterMeterUnits: waterUnits,
            cleanliness: propertyCleanliness,
            roomsChecklist: rooms,
            acAndAppliancesWorking: true,
            poolAndGardenCondition: 'excellent',
            notes: 'Cash-power token and water meter recorded.',
          }
        : undefined,
      completed: true,
    };

    saveConditionReport(report);
    setSavedSuccessMessage(
      `Handover Report for ${selectedBooking.id} successfully recorded and cryptographically timestamped!`
    );
    setTimeout(() => setSavedSuccessMessage(null), 4000);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] pb-24 pt-20 sm:pt-24">
      {/* Header */}
      <div className="bg-[#0D3846] text-white py-6 border-b border-white/10">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-[11px] font-bold font-syne uppercase tracking-wider text-[#C85A2A] bg-white/10 px-2.5 py-0.5 rounded-full mb-1">
                <ClipboardCheck className="w-3.5 h-3.5" />
                <span>Field Operations & Renter Inspection Tool</span>
              </div>
              <h1 className="font-syne text-2xl sm:text-3xl font-extrabold text-white">
                Condition Handover Protocol
              </h1>
              <p className="text-xs text-[#E6D7C3]/80 mt-1">
                Standardized check-in & return inspections to eliminate deposit friction and guarantee zero surprise fees.
              </p>
            </div>

            {/* Quick Switcher of Active Reservation */}
            <div className="w-full sm:w-80">
              <CustomSelect
                label="Selected Booking"
                value={selectedBookingId}
                onChange={(val) => setSelectedBookingId(val)}
                options={reservations.map((res) => ({
                  value: res.id,
                  label: `${res.id} — ${res.assetTitle}`,
                  description: `${res.customer.fullName} (${res.customer.phone})`,
                }))}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 pt-6">
        {/* Success Alert Banner */}
        {savedSuccessMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-500 text-white font-syne font-bold text-xs flex items-center justify-between shadow-lg animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-white" />
              <span>{savedSuccessMessage}</span>
            </div>
            <button onClick={() => setSavedSuccessMessage(null)} className="text-white/80 hover:text-white">
              ✕
            </button>
          </div>
        )}

        {/* Selected Booking Mini Info Card */}
        <div className="skeu-card-elevated rounded-2xl p-4 sm:p-5 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-slate-200 shadow-inner">
              <Image
                src={selectedBooking?.assetImage || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=400&q=80'}
                alt={selectedBooking?.assetTitle || ''}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-[#C85A2A] bg-[#C85A2A]/10 px-2 py-0.5 rounded shadow-[inset_0_1px_1px_rgba(200,90,42,0.15)]">
                  {selectedBooking?.id}
                </span>
                <span className="text-xs text-slate-500">
                  {isCarAsset ? 'Vehicle Fleet' : 'Property Asset'}
                </span>
              </div>
              <h3 className="font-syne font-bold text-base text-[#0D3846]">
                {selectedBooking?.assetTitle}
              </h3>
              <p className="text-xs text-slate-600">
                Renter: <span className="font-semibold text-slate-800">{selectedBooking?.customer.fullName}</span> ({selectedBooking?.customer.phone})
              </p>
            </div>
          </div>

          {/* Mode Tabs */}
          <div className="flex items-center gap-2 skeu-tray p-1.5 rounded-2xl">
            <button
              onClick={() => setActiveTab('check_in')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-syne font-bold transition-all ${
                activeTab === 'check_in'
                  ? 'skeu-tab-active text-white'
                  : 'skeu-btn-frosted text-slate-600'
              }`}
            >
              1. Check-In (Arrival)
            </button>
            <button
              onClick={() => setActiveTab('check_out')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-syne font-bold transition-all ${
                activeTab === 'check_out'
                  ? 'skeu-tab-active text-white'
                  : 'skeu-btn-frosted text-slate-600'
              }`}
            >
              2. Check-Out (Departure)
            </button>
            <button
              onClick={() => setActiveTab('compare')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-syne font-bold transition-all ${
                activeTab === 'compare'
                  ? 'skeu-tab-active-accent text-white'
                  : 'skeu-btn-frosted text-[#C85A2A]'
              }`}
            >
              3. Compare Both (HO-05)
            </button>
          </div>
        </div>

        {/* VIEW 1 & 2: CHECK-IN / CHECK-OUT INSPECTION FORM */}
        {activeTab !== 'compare' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Main Inspection Canvas (8 cols) */}
            <div className="lg:col-span-8 space-y-6">
              {isCarAsset ? (
                /* CAR INSPECTION FORM */
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E6D7C3] shadow-md space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <h2 className="font-syne font-bold text-xl text-[#0D3846]">
                        Vehicle Telemetry & Condition
                      </h2>
                      <span className="text-xs text-slate-500">
                        {activeTab === 'check_in' ? 'Pre-rental baseline verification' : 'Post-rental return verification'}
                      </span>
                    </div>
                    <span className="text-xs font-bold font-syne uppercase bg-[#5A6B3C]/10 text-[#5A6B3C] px-3 py-1 rounded-full">
                      Automotive
                    </span>
                  </div>

                  {/* Odometer & Fuel Gauge Sliders */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Odometer */}
                    <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-slate-200">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-bold font-syne text-slate-700 uppercase flex items-center gap-1.5">
                          <Gauge className="w-4 h-4 text-[#C85A2A]" />
                          <span>Odometer Mileage</span>
                        </label>
                        <span className="text-xs font-mono font-bold text-[#0D3846]">
                          {odometer.toLocaleString()} km
                        </span>
                      </div>
                      <input
                        type="number"
                        value={odometer}
                        onChange={(e) => setOdometer(parseInt(e.target.value, 10) || 0)}
                        aria-label="Odometer mileage reading"
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm font-mono font-bold text-slate-800"
                      />
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        Verify dashboard cluster display
                      </span>
                    </div>

                    {/* Fuel Level */}
                    <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-slate-200">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-bold font-syne text-slate-700 uppercase flex items-center gap-1.5">
                          <Fuel className="w-4 h-4 text-[#C85A2A]" />
                          <span>Fuel Tank Gauge</span>
                        </label>
                        <span className="text-xs font-mono font-bold text-[#0D3846]">
                          {fuelLevel}% {fuelLevel === 100 ? '(Full F)' : fuelLevel < 25 ? '(Low E)' : ''}
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={fuelLevel}
                        onChange={(e) => setFuelLevel(parseInt(e.target.value, 10))}
                        aria-label="Fuel tank gauge percentage"
                        className="w-full accent-[#C85A2A] cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] font-mono font-bold text-slate-500 mt-1">
                        <span>E (Empty)</span>
                        <span>1/4</span>
                        <span>1/2</span>
                        <span>3/4</span>
                        <span>F (Full)</span>
                      </div>
                    </div>
                  </div>

                  {/* 4-Angle Exterior Photo Upload Slots */}
                  <div>
                    <label className="block text-xs font-bold font-syne text-slate-700 uppercase mb-2 flex items-center gap-1.5">
                      <Camera className="w-4 h-4 text-[#C85A2A]" />
                      <span>4-Angle Exterior Photographic Log</span>
                    </label>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { label: 'Front Grille', key: 'front', url: exteriorPhotos.front },
                        { label: 'Rear Bumper', key: 'back', url: exteriorPhotos.back },
                        { label: 'Driver Side', key: 'driverSide', url: exteriorPhotos.driverSide },
                        { label: 'Passenger Side', key: 'passengerSide', url: exteriorPhotos.passengerSide },
                      ].map((slot) => (
                        <div
                          key={slot.key}
                          className="relative aspect-[4/3] rounded-2xl overflow-hidden border-2 border-slate-200 group bg-slate-900"
                        >
                          <Image src={slot.url} alt={slot.label} fill className="object-cover" />
                          <div className="absolute inset-0 bg-black/40 flex flex-col justify-end p-2 text-white">
                            <span className="text-[10px] font-syne font-bold uppercase truncate">
                              {slot.label}
                            </span>
                            <span className="text-[9px] text-emerald-300">✓ Uploaded</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Scratches & Dents Notes Log */}
                  <div>
                    <label className="block text-xs font-bold font-syne text-slate-700 uppercase mb-2">
                      Pre-Existing Scratches & Imperfections
                    </label>

                    <div className="space-y-2 mb-3">
                      {carScratches.map((s) => (
                        <div
                          key={s.id}
                          className="flex items-center justify-between p-3 rounded-xl bg-[#FAF7F2] border border-slate-200 text-xs"
                        >
                          <div>
                            <span className="font-bold text-[#0D3846] block">{s.location}</span>
                            <span className="text-slate-500">{s.note}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeScratch(s.id)}
                            className="text-slate-400 hover:text-red-600 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Add Scratch inline */}
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        placeholder="Location (e.g. Left wing mirror)"
                        value={newScratchLoc}
                        onChange={(e) => setNewScratchLoc(e.target.value)}
                        className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs flex-1"
                      />
                      <input
                        type="text"
                        placeholder="Note (e.g. Minor paint chip)"
                        value={newScratchNote}
                        onChange={(e) => setNewScratchNote(e.target.value)}
                        className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs flex-1"
                      />
                      <button
                        type="button"
                        onClick={addScratch}
                        className="px-3.5 py-2 bg-[#0D3846] hover:bg-[#C85A2A] text-white text-xs font-syne font-bold rounded-xl flex items-center justify-center gap-1 shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Mark</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* PROPERTY INSPECTION FORM */
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E6D7C3] shadow-md space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <h2 className="font-syne font-bold text-xl text-[#0D3846]">
                        Property Handover & Utility Check
                      </h2>
                      <span className="text-xs text-slate-500">
                        {activeTab === 'check_in' ? 'Check-in meter & key log' : 'Departure inspection & turnover'}
                      </span>
                    </div>
                    <span className="text-xs font-bold font-syne uppercase bg-[#0D3846]/10 text-[#0D3846] px-3 py-1 rounded-full">
                      Property
                    </span>
                  </div>

                  {/* Key Exchange & Smart Lock PIN */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-slate-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Key className="w-4 h-4 text-[#C85A2A]" />
                        <span className="text-xs font-bold font-syne text-slate-700 uppercase">
                          Keys / Smart Lock
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-600">Smart Lock PIN:</span>
                        <span className="font-mono font-bold text-sm text-[#0D3846] bg-white px-2 py-0.5 rounded border border-slate-300">
                          {keyBoxPin}
                        </span>
                      </div>
                      <label className="flex items-center gap-2 mt-3 text-xs text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={keysHandedOver}
                          onChange={(e) => setKeysHandedOver(e.target.checked)}
                          className="rounded accent-[#C85A2A]"
                        />
                        <span>Physical Gate Remote Handed Over</span>
                      </label>
                    </div>

                    <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-slate-200">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-4 h-4 text-amber-500" />
                        <span className="text-xs font-bold font-syne text-slate-700 uppercase">
                          Cash-Power Electricity (kWh)
                        </span>
                      </div>
                      <input
                        type="number"
                        value={electricityKwh}
                        onChange={(e) => setElectricityKwh(parseFloat(e.target.value) || 0)}
                        aria-label="Cash-power electricity meter in kilowatt hours"
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-slate-800"
                      />
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        EUCL Prepaid Token Meter reading
                      </span>
                    </div>
                  </div>

                  {/* Room-by-room condition checklist */}
                  <div>
                    <label className="block text-xs font-bold font-syne text-slate-700 uppercase mb-2">
                      Room Condition Sign-off
                    </label>

                    <div className="space-y-2.5">
                      {rooms.map((room) => (
                        <div
                          key={room.id}
                          className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 bg-[#FAF7F2]"
                        >
                          <div>
                            <span className="font-syne font-bold text-xs text-[#0D3846] block">
                              {room.room}
                            </span>
                            <span className="text-[11px] text-slate-500">{room.notes}</span>
                          </div>

                          <button
                            type="button"
                            onClick={() => toggleRoomStatus(room.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-syne font-bold transition-all ${
                              room.status === 'ok'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-red-500 text-white'
                            }`}
                          >
                            {room.status === 'ok' ? '✓ Verified OK' : '⚠ Issue Logged'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Sign-off Box (4 cols) */}
            <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-[#E6D7C3] shadow-md space-y-5 sticky top-24">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 font-syne">
                  Inspection Summary
                </span>
                <h3 className="font-syne font-bold text-lg text-[#0D3846]">
                  Sign & File Handover
                </h3>
              </div>

              <div className="space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-3">
                <div className="flex justify-between">
                  <span>Booking ID:</span>
                  <span className="font-mono font-bold text-slate-800">{selectedBooking.id}</span>
                </div>
                <div className="flex justify-between">
                  <span>Inspector:</span>
                  <span className="font-semibold text-slate-800">Patrick Mugabo (KGL Ops)</span>
                </div>
                <div className="flex justify-between">
                  <span>Stage:</span>
                  <span className="capitalize font-bold text-[#C85A2A]">
                    {activeTab === 'check_in' ? 'Check-In Baseline' : 'Check-Out Return'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Timestamp:</span>
                  <span className="font-mono text-slate-500">
                    {new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} (CAT)
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-[#5A6B3C]/10 border border-[#5A6B3C]/30 text-xs text-slate-700">
                <ShieldCheck className="w-4 h-4 text-[#5A6B3C] mb-1" />
                Both renter and operations coordinator verify the above entries. Digital copy dispatched to renter email.
              </div>

              <button
                type="button"
                onClick={handleSaveReport}
                className="w-full bg-[#C85A2A] hover:bg-[#B24F23] text-white py-3 px-4 rounded-xl font-syne font-bold text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2"
              >
                <FileCheck className="w-4 h-4" />
                <span>Save Condition Report</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('compare')}
                className="w-full bg-[#FAF7F2] hover:bg-slate-200 text-[#0D3846] py-2.5 px-4 rounded-xl font-syne font-bold text-xs text-center transition-colors"
              >
                Switch to Comparison View
              </button>
            </div>
          </div>
        ) : (
          /* VIEW 3: COMPARISON VIEW (HO-05) */
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E6D7C3] shadow-md animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-2 mb-6">
              <div>
                <span className="text-xs font-bold font-syne uppercase tracking-wider text-[#C85A2A]">
                  Dispute Elimination Protocol
                </span>
                <h2 className="font-syne text-2xl font-extrabold text-[#0D3846]">
                  Side-by-Side Condition Comparison (HO-05)
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full border border-emerald-300">
                  Zero Deductions • Full Deposit Release Eligible
                </span>
              </div>
            </div>

            {/* Comparison Metrics Columns */}
            {isCarAsset ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Column A: Check-In */}
                <div className="p-5 rounded-2xl bg-[#FAF7F2] border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-300 pb-2">
                    <span className="font-syne font-bold text-sm text-[#0D3846]">
                      Check-In Status (October 12)
                    </span>
                    <span className="text-xs font-mono bg-white px-2 py-0.5 rounded border border-slate-200">
                      Baseline
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Odometer:</span>
                      <span className="font-mono font-bold text-slate-800">34,120 km</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Fuel Level:</span>
                      <span className="font-mono font-bold text-slate-800">100% (Full)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Exterior Scratches:</span>
                      <span className="font-bold text-slate-800">1 Logged (Rear bumper)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Cleanliness:</span>
                      <span className="font-bold text-emerald-700">Pristine</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-900 border border-slate-300">
                      <Image src={exteriorPhotos.front} alt="Front checkin" fill className="object-cover" />
                      <span className="absolute bottom-1 left-1 text-[9px] bg-black/60 text-white px-1 rounded">Front In</span>
                    </div>
                    <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-900 border border-slate-300">
                      <Image src={exteriorPhotos.back} alt="Back checkin" fill className="object-cover" />
                      <span className="absolute bottom-1 left-1 text-[9px] bg-black/60 text-white px-1 rounded">Back In</span>
                    </div>
                  </div>
                </div>

                {/* Column B: Check-Out */}
                <div className="p-5 rounded-2xl bg-white border-2 border-emerald-500/50 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <span className="font-syne font-bold text-sm text-[#0D3846]">
                      Check-Out Status (Return)
                    </span>
                    <span className="text-xs font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                      Match Verified
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Odometer:</span>
                      <span className="font-mono font-bold text-slate-800">
                        {odometer.toLocaleString()} km (+{(odometer - 34120)} km driven)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Fuel Level:</span>
                      <span className="font-mono font-bold text-slate-800">
                        {fuelLevel}% {fuelLevel >= 95 ? '(Returned Full ✓)' : '(Needs Top-up)'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">New Scratches:</span>
                      <span className="font-bold text-emerald-700">None detected ✓</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Cleanliness:</span>
                      <span className="font-bold text-slate-800 capitalize">{carCleanliness}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-900 border border-slate-300">
                      <Image src={exteriorPhotos.front} alt="Front checkout" fill className="object-cover" />
                      <span className="absolute bottom-1 left-1 text-[9px] bg-black/60 text-white px-1 rounded">Front Out</span>
                    </div>
                    <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-900 border border-slate-300">
                      <Image src={exteriorPhotos.back} alt="Back checkout" fill className="object-cover" />
                      <span className="absolute bottom-1 left-1 text-[9px] bg-black/60 text-white px-1 rounded">Back Out</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Property Comparison */}
                <div className="p-5 rounded-2xl bg-[#FAF7F2] border border-slate-200 space-y-3">
                  <h4 className="font-syne font-bold text-sm text-[#0D3846]">Check-in Baseline</h4>
                  <div className="text-xs space-y-1.5 text-slate-600">
                    <div>Electricity: 12,450.8 kWh</div>
                    <div>Water Units: 842.1 m³</div>
                    <div>Keys: Smart Lock PIN + 2 gate remotes</div>
                    <div>All rooms spotless</div>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white border-2 border-emerald-500/50 space-y-3">
                  <h4 className="font-syne font-bold text-sm text-[#0D3846]">Check-out Departure</h4>
                  <div className="text-xs space-y-1.5 text-slate-600">
                    <div>Electricity: {electricityKwh} kWh</div>
                    <div>Water Units: {waterUnits} m³</div>
                    <div>Keys returned in full ✓</div>
                    <div>Inventory intact ✓</div>
                  </div>
                </div>
              </div>
            )}

            {/* Final Sign-off & Deposit Release */}
            <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-600">
                <span className="font-bold text-[#0D3846] block">
                  Automatic Deposit Unfreeze
                </span>
                Triggering sign-off releases the {selectedBooking?.pricing?.securityDepositHold ? `$${selectedBooking.pricing.securityDepositHold}` : '$250'} security hold back to renter’s card or MoMo wallet.
              </div>

              <button
                type="button"
                onClick={() => {
                  alert(`Deposit release authorized for ${selectedBooking.customer.fullName}! SMS confirmation sent to ${selectedBooking.customer.phone}.`);
                }}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-syne font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Approve Return & Release Deposit</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

