'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useRental } from '@/lib/rentalContext';
import { Reservation, ReservationPricing } from '@/lib/types';
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  ArrowLeft,
  FileText,
  CreditCard,
  Smartphone,
  UploadCloud,
  Check,
  AlertCircle,
  FileCheck,
  Printer,
  Calendar,
  MapPin,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import CustomSelect, { SelectOption } from '@/components/ui/CustomSelect';

export default function CheckoutPage() {
  const router = useRouter();
  const {
    draftBooking,
    createReservation,
    formatPrice,
    currency,
    lockSecondsLeft,
    listings,
  } = useRental();

  // Active step (1: Guest, 2: Add-ons, 3: Agreement, 4: Payment, 5: Success)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Asset resolving
  const asset = draftBooking.asset || listings[0];
  const pairedAsset = draftBooking.pairedAssetId
    ? listings.find((l) => l.id === draftBooking.pairedAssetId)
    : undefined;

  // Step 1: Guest Information
  const [fullName, setFullName] = useState('Sarah Jenkins');
  const [email, setEmail] = useState('sarah.jenkins@safari-invest.com');
  const [phone, setPhone] = useState('+250 788 456 789');
  const [idType, setIdType] = useState<'passport' | 'national_id' | 'driver_license'>('passport');
  const [idNumber, setIdNumber] = useState('USA-98342109');
  const [uploadedDocName, setUploadedDocName] = useState<string>('sarah_jenkins_passport.pdf');
  const [isUploading, setIsUploading] = useState(false);

  // Step 2: Add-ons Selection
  const [airportPickup, setAirportPickup] = useState(draftBooking.addOns.airportPickup);
  const [dedicatedDriver, setDedicatedDriver] = useState(draftBooking.addOns.dedicatedDriver);
  const [childSeat, setChildSeat] = useState(draftBooking.addOns.childSeat);
  const [wifiHotspot, setWifiHotspot] = useState(draftBooking.addOns.wifiHotspot);
  const [damageWaiver, setDamageWaiver] = useState(true);

  // Step 3: Signature Canvas
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(true); // default true with typed fallback
  const [signatureType, setSignatureType] = useState<'draw' | 'type'>('type');
  const [typedSignature, setTypedSignature] = useState('Sarah Jenkins');

  // Step 4: Payment Simulator
  const [paymentMethod, setPaymentMethod] = useState<'momo_mtn' | 'momo_airtel' | 'card'>('momo_mtn');
  const [paymentPlan, setPaymentPlan] = useState<'pay_full' | 'deposit_30' | 'hold_card'>('pay_full');
  const [momoNumber, setMomoNumber] = useState('+250 788 456 789');
  const [isSimulatingPayment, setIsSimulatingPayment] = useState(false);
  const [momoPromptStep, setMomoPromptStep] = useState<'idle' | 'prompt_sent' | 'pin_verified'>('idle');

  // Confirmed Reservation Result
  const [confirmedReservation, setConfirmedReservation] = useState<Reservation | null>(null);

  // Format lock timer
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Pricing calculations
  const days = draftBooking.daysCount || 4;
  const baseRate = asset.pricePerDay;
  const baseTotal = baseRate * days;
  const pairedDailyRate = pairedAsset ? (asset.crossSellRecommendation?.discountDailyRate || pairedAsset.pricePerDay) : 0;
  const pairedTotal = pairedDailyRate * days;
  const cleaningFee = asset.cleaningOrServiceFee;

  let addOnsTotal = 0;
  if (airportPickup) addOnsTotal += 30;
  if (dedicatedDriver) addOnsTotal += 25 * days;
  if (childSeat) addOnsTotal += 15;
  if (wifiHotspot) addOnsTotal += 10;
  if (damageWaiver) addOnsTotal += 12 * days;

  const securityDepositHold = asset.securityDeposit;
  const subtotal = baseTotal + pairedTotal + cleaningFee + addOnsTotal;
  const taxesAndTourismLevy = Math.round(subtotal * 0.05);
  const grandTotal = subtotal + taxesAndTourismLevy;

  let payableToday = grandTotal;
  let dueAtCheckIn = 0;
  if (paymentPlan === 'deposit_30') {
    payableToday = Math.round(grandTotal * 0.3);
    dueAtCheckIn = grandTotal - payableToday;
  } else if (paymentPlan === 'hold_card') {
    payableToday = securityDepositHold;
    dueAtCheckIn = grandTotal;
  }

  // Handle Mock File Upload
  const handleMockUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIsUploading(true);
      setTimeout(() => {
        setUploadedDocName(e.target.files![0].name);
        setIsUploading(false);
      }, 700);
    }
  };

  // Canvas signature handlers
  useEffect(() => {
    if (signatureType === 'draw' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#FFC72C';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
      }
    }
  }, [signatureType, currentStep]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    setHasSignature(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  // Submit and create reservation
  const handlePaymentSubmit = () => {
    setIsSimulatingPayment(true);
    if (paymentMethod.startsWith('momo')) {
      setMomoPromptStep('prompt_sent');
      setTimeout(() => {
        setMomoPromptStep('pin_verified');
        finishBooking();
      }, 1800);
    } else {
      setTimeout(() => {
        finishBooking();
      }, 1500);
    }
  };

  const finishBooking = () => {
    const reservationPricing: ReservationPricing = {
      baseDailyRate: baseRate,
      days,
      baseTotal,
      comboAssetDailyRate: pairedAsset ? pairedDailyRate : undefined,
      comboTotal: pairedAsset ? pairedTotal : undefined,
      cleaningOrServiceFee: cleaningFee,
      addOnsTotal,
      securityDepositHold,
      subtotal,
      taxesAndTourismLevy,
      grandTotal,
      payableToday,
      dueAtCheckIn,
      currency,
      paymentPlan,
      paymentMethod,
    };

    const newResId = `KGL-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newReservation: Reservation = {
      id: newResId,
      assetId: asset.id,
      assetTitle: asset.title,
      assetType: pairedAsset ? 'combo' : asset.type,
      assetImage: asset.images[0],
      pairedAssetId: pairedAsset?.id,
      pairedAssetTitle: pairedAsset?.title,
      pairedAssetImage: pairedAsset?.images[0],
      neighborhood: asset.neighborhood,
      customer: {
        fullName,
        email,
        phone,
        idNumber,
        idType,
        documentUploaded: true,
        documentFileName: uploadedDocName,
      },
      startDate: draftBooking.startDate,
      endDate: draftBooking.endDate,
      daysCount: days,
      status: 'confirmed',
      addOns: {
        airportPickup,
        dedicatedDriver,
        childSeat,
        wifiHotspot,
        damageWaiver,
      },
      pricing: reservationPricing,
      agreementSigned: true,
      signatureDataUrl: typedSignature,
      createdAt: new Date().toISOString(),
      handoverStatus: {
        checkInDone: false,
        checkOutDone: false,
      },
    };

    createReservation(newReservation);
    setConfirmedReservation(newReservation);
    setIsSimulatingPayment(false);
    setCurrentStep(5); // Go to Success
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] dark:bg-[#0B0C0E] text-zinc-900 dark:text-white pb-24 pt-20 sm:pt-24">
      {/* Top Lock Banner */}
      <div className="bg-white dark:bg-[#141414] text-zinc-600 dark:text-slate-300 py-2.5 border-b border-black/5 dark:border-black/5 dark:border-white/10">
        <div className="container mx-auto px-4 sm:px-6 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#FFC72C]" />
            <span className="font-semibold text-zinc-900 dark:text-white">SSL Encrypted Rwandan Checkout</span>
          </div>
          <div className="flex items-center gap-2 font-mono text-xs bg-white/10 px-3 py-1 rounded-full border border-white/20">
            <Lock className="w-3.5 h-3.5 text-[#FFC72C] animate-pulse" />
            <span>Price Guaranteed for: {formatTimer(lockSecondsLeft)}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 pt-8">
        {/* Step Progress Stepper (Only on steps 1-4) */}
        {currentStep < 5 && (
          <div className="max-w-3xl mx-auto mb-10">
            <div className="grid grid-cols-4 gap-2 text-center text-xs font-tenor font-bold">
              {[
                { num: 1, label: 'Guest & ID' },
                { num: 2, label: 'Add-ons' },
                { num: 3, label: 'Agreement' },
                { num: 4, label: 'Payment' },
              ].map((s) => (
                <button
                  key={s.num}
                  type="button"
                  onClick={() => s.num < currentStep && setCurrentStep(s.num)}
                  disabled={s.num > currentStep}
                  className={`p-2.5 rounded-xl transition-all flex flex-col items-center gap-1 ${
                    currentStep === s.num
                      ? 'skeu-tab-active !text-[#111111] font-extrabold'
                      : currentStep > s.num
                      ? 'bg-[#FFC72C]/10 text-[#FFC72C] border border-[#FFC72C]/30 shadow-xs'
                      : 'skeu-btn-frosted !text-zinc-500 dark:!text-zinc-400 opacity-60'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                    currentStep === s.num ? 'bg-black/15 text-[#111111] font-bold' : 'bg-black/5 dark:bg-white/20'
                  }`}>
                    {currentStep > s.num ? '✓' : s.num}
                  </span>
                  <span className="truncate">{s.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 2-Column Content Layout (Steps 1-4) */}
        {currentStep < 5 ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Steps Form (7 cols) */}
            <div className="lg:col-span-7 skeu-card-elevated rounded-3xl p-6 sm:p-8">
              {/* STEP 1: GUEST & DOCUMENTS */}
              {currentStep === 1 && (
                <div className="space-y-6 animate-fadeIn">
                  <div>
                    <h2 className="font-tenor text-2xl font-bold text-[#FFC72C]">
                      Guest Identification & Verification
                    </h2>
                    <p className="text-xs text-zinc-400 mt-1">
                      Required by Rwanda Directorate General of Immigration and Emigration.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold font-tenor text-zinc-700 dark:text-zinc-300 uppercase mb-1">
                        Full Legal Name (as on Passport / ID)
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full skeu-input rounded-xl px-4 py-2.5 text-sm font-medium text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none"
                        placeholder="e.g. David Mugisha"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold font-tenor text-zinc-700 dark:text-zinc-300 uppercase mb-1">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full skeu-input rounded-xl px-4 py-2.5 text-sm font-medium text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none"
                          placeholder="name@organization.rw"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold font-tenor text-zinc-700 dark:text-zinc-300 uppercase mb-1">
                          Phone Number (WhatsApp / MoMo)
                        </label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full skeu-input rounded-xl px-4 py-2.5 text-sm font-medium text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none"
                          placeholder="+250 788 000 000"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <CustomSelect
                          label="Document Type"
                          options={[
                            { value: 'passport', label: 'Passport (International)', description: 'For international visitors' },
                            { value: 'national_id', label: 'Rwandan National ID', description: 'Indangamuntu' },
                            { value: 'driver_license', label: 'Driver’s License', description: 'Valid national or international' },
                          ]}
                          value={idType}
                          onChange={(val: any) => setIdType(val)}
                        />

                      <div>
                        <label className="block text-xs font-bold font-tenor text-zinc-700 dark:text-zinc-300 uppercase mb-1">
                          Document / Passport Number
                        </label>
                        <input
                          type="text"
                          value={idNumber}
                          onChange={(e) => setIdNumber(e.target.value)}
                          className="w-full skeu-input rounded-xl px-4 py-2.5 text-sm font-medium text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none"
                          placeholder="e.g. 1 1990 8 00..."
                        />
                      </div>
                    </div>

                    {/* Document Upload Slot */}
                    <div>
                      <label className="block text-xs font-bold font-tenor text-zinc-700 dark:text-zinc-300 uppercase mb-1">
                        Upload Photo ID / Passport Copy
                      </label>
                      <div className="border-2 border-dashed border-black/5 dark:border-white/10 hover:border-[#FFC72C] rounded-2xl p-6 text-center skeu-tray transition-colors relative cursor-pointer">
                        <input
                          type="file"
                          onChange={handleMockUpload}
                          aria-label="Upload Photo ID or Passport Copy"
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                        <UploadCloud className="w-8 h-8 text-[#FFC72C] mx-auto mb-2" />
                        <span className="text-xs font-bold font-tenor text-[#FFC72C] block">
                          {isUploading
                            ? 'Verifying file integrity...'
                            : uploadedDocName
                            ? `File Attached: ${uploadedDocName}`
                            : 'Click or drag PDF / JPG / PNG'}
                        </span>
                        <span className="text-[11px] text-slate-400 mt-1 block">
                          Encrypted on Rwandan Sovereign Cloud (Maximum 15MB)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="px-6 py-3 skeu-btn-teal !text-[#111111] font-tenor font-extrabold text-xs uppercase tracking-wider rounded-xl flex items-center gap-2"
                    >
                      <span>Continue to Add-ons</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: ADD-ONS & BUNDLE SELECTION */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-fadeIn">
                  <div>
                    <h2 className="font-tenor text-2xl font-bold text-[#FFC72C]">
                      Curate Your Experience
                    </h2>
                    <p className="text-xs text-zinc-400 mt-1">
                      Select optional services to tailor your Rwanda journey.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-start justify-between p-4 rounded-2xl border border-black/5 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-[#0B0C0E] cursor-pointer transition-colors">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={airportPickup}
                          onChange={(e) => setAirportPickup(e.target.checked)}
                          className="mt-1 rounded accent-[#FFC72C]"
                        />
                        <div>
                          <span className="font-tenor font-bold text-sm text-[#FFC72C] block">
                            Kigali Airport VIP Meet & Greet
                          </span>
                          <span className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                            Terminal sign greeting, luggage handling, and direct transit to your address.
                          </span>
                        </div>
                      </div>
                      <span className="font-tenor font-bold text-xs text-[#FFC72C] shrink-0">
                        +{formatPrice(30)}
                      </span>
                    </label>

                    <label className="flex items-start justify-between p-4 rounded-2xl border border-black/5 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-[#0B0C0E] cursor-pointer transition-colors">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={dedicatedDriver}
                          onChange={(e) => setDedicatedDriver(e.target.checked)}
                          className="mt-1 rounded accent-[#FFC72C]"
                        />
                        <div>
                          <span className="font-tenor font-bold text-sm text-[#FFC72C] block">
                            Professional Executive Chauffeur
                          </span>
                          <span className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                            Experienced English/French driver for 10 hours daily. Eliminates navigation stress.
                          </span>
                        </div>
                      </div>
                      <span className="font-tenor font-bold text-xs text-[#FFC72C] shrink-0">
                        +{formatPrice(25 * days)}
                      </span>
                    </label>

                    <label className="flex items-start justify-between p-4 rounded-2xl border border-black/5 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-[#0B0C0E] cursor-pointer transition-colors">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={childSeat}
                          onChange={(e) => setChildSeat(e.target.checked)}
                          className="mt-1 rounded accent-[#FFC72C]"
                        />
                        <div>
                          <span className="font-tenor font-bold text-sm text-[#FFC72C] block">
                            Sanitized Child Safety Booster Seat
                          </span>
                          <span className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                            ISOFIX-certified infant or toddler seat pre-installed before arrival.
                          </span>
                        </div>
                      </div>
                      <span className="font-tenor font-bold text-xs text-[#FFC72C] shrink-0">
                        +{formatPrice(15)}
                      </span>
                    </label>

                    <label className="flex items-start justify-between p-4 rounded-2xl border border-black/5 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-[#0B0C0E] cursor-pointer transition-colors">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={wifiHotspot}
                          onChange={(e) => setWifiHotspot(e.target.checked)}
                          className="mt-1 rounded accent-[#FFC72C]"
                        />
                        <div>
                          <span className="font-tenor font-bold text-sm text-[#FFC72C] block">
                            5G High-Speed Pocket MiFi Device
                          </span>
                          <span className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                            Unlimited nationwide data on MTN Rwanda network. Connect up to 8 devices anywhere.
                          </span>
                        </div>
                      </div>
                      <span className="font-tenor font-bold text-xs text-[#FFC72C] shrink-0">
                        +{formatPrice(10)}
                      </span>
                    </label>

                    <label className="flex items-start justify-between p-4 rounded-2xl border-2 border-[#FFC72C]/40 bg-[#FFC72C]/10 cursor-pointer">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={damageWaiver}
                          onChange={(e) => setDamageWaiver(e.target.checked)}
                          className="mt-1 rounded accent-[#FFC72C]"
                        />
                        <div>
                          <span className="font-tenor font-bold text-sm text-[#FFC72C] flex items-center gap-2">
                            <span>Zero-Deductible Damage Waiver</span>
                            <span className="text-[10px] bg-[#FFC72C] text-[#111111] font-bold px-2 py-0.5 rounded font-mono">
                              RECOMMENDED
                            </span>
                          </span>
                          <span className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                            Protects against minor windshield chips, door dings, and appliance mishaps without deposit deduction.
                          </span>
                        </div>
                      </div>
                      <span className="font-tenor font-bold text-xs text-[#FFC72C] shrink-0">
                        +{formatPrice(12 * days)}
                      </span>
                    </label>
                  </div>

                  <div className="pt-4 flex justify-between">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="px-4 py-2.5 text-xs font-tenor font-bold text-zinc-400 hover:text-white flex items-center gap-1.5"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="px-6 py-3 bg-[#FFC72C] hover:bg-[#FFC72C] text-[#111111] font-bold font-tenor font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-2"
                    >
                      <span>Review Digital Agreement</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: DIGITAL AGREEMENT PREVIEW (HO-01) */}
              {currentStep === 3 && (
                <div className="space-y-6 animate-fadeIn">
                  <div>
                    <h2 className="font-tenor text-2xl font-bold text-[#FFC72C]">
                      Rental Agreement & Digital Signature
                    </h2>
                    <p className="text-xs text-zinc-400 mt-1">
                      Review key terms and sign electronically (HO-01 compliant).
                    </p>
                  </div>

                  {/* Contract Scrollbox */}
                  <div className="h-64 overflow-y-auto bg-slate-50 dark:bg-[#0B0C0E] p-4 rounded-2xl border border-black/10 dark:border-white/15 text-xs text-zinc-700 dark:text-zinc-300 space-y-3 font-sans leading-relaxed">
                    <div className="border-b border-black/10 dark:border-white/10 pb-2">
                      <span className="font-tenor font-bold text-sm text-[#FFC72C] block">
                        KIGALI RENTALS MASTER RENTAL AGREEMENT #KGL-AGR-2026
                      </span>
                      <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        Between Kigali Rentals SARL and {fullName}
                      </span>
                    </div>

                    <p>
                      <strong>1. ASSET SPECIFICATION:</strong> The Lessor agrees to rent the selected asset(s) ({asset.title}
                      {pairedAsset ? ` bundled with ${pairedAsset.title}` : ''}) for the duration of {days} days from {draftBooking.startDate} to {draftBooking.endDate}.
                    </p>

                    <p>
                      <strong>2. CONDITION HANDOVER:</strong> A joint digital condition report (HO-02) shall be conducted prior to vehicle departure or property key access, recording odometer readings, fuel/electricity gauges, and pre-existing marks.
                    </p>

                    <p>
                      <strong>3. SECURITY DEPOSIT:</strong> A refundable security hold of {formatPrice(securityDepositHold)} is held on card or Mobile Money and shall be unblocked within 24 hours of checkout inspection.
                    </p>

                    <p>
                      <strong>4. RWANDAN LAW:</strong> This agreement is governed by the laws of the Republic of Rwanda. Smoking is strictly prohibited inside residential properties. Driving must adhere to the 60km/h urban speed limits monitored by national speed cameras.
                    </p>
                  </div>

                  {/* Signature Pad */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold font-tenor text-zinc-700 dark:text-zinc-300 uppercase">
                        Legal Signature
                      </label>
                      <div className="flex items-center gap-2 text-xs">
                        <button
                          type="button"
                          onClick={() => setSignatureType('type')}
                          className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                            signatureType === 'type'
                              ? 'bg-[#FFC72C] text-[#111111] font-bold'
                              : 'text-zinc-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-800'
                          }`}
                        >
                          Type Name
                        </button>
                        <button
                          type="button"
                          onClick={() => setSignatureType('draw')}
                          className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                            signatureType === 'draw'
                              ? 'bg-[#FFC72C] text-[#111111] font-bold'
                              : 'text-zinc-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-800'
                          }`}
                        >
                          Draw Pad
                        </button>
                      </div>
                    </div>

                    {signatureType === 'type' ? (
                      <div>
                        <input
                          type="text"
                          value={typedSignature}
                          onChange={(e) => {
                            setTypedSignature(e.target.value);
                            setHasSignature(e.target.value.length > 2);
                          }}
                          className="w-full bg-slate-50 dark:bg-[#0B0C0E] border-2 border-zinc-200 dark:border-white/15 rounded-2xl p-4 font-serif italic text-2xl text-[#FFC72C] focus:outline-none focus:border-[#FFC72C]"
                          placeholder="Type your full legal name"
                        />
                        <span className="text-[11px] text-zinc-500 dark:text-slate-400 mt-1 block">
                          Electronically binding signature representation
                        </span>
                      </div>
                    ) : (
                      <div>
                        <canvas
                          ref={canvasRef}
                          width={480}
                          height={120}
                          onMouseDown={startDrawing}
                          onMouseMove={draw}
                          onMouseUp={stopDrawing}
                          onMouseLeave={stopDrawing}
                          className="w-full h-32 bg-white dark:bg-[#141519] border-2 border-dashed border-zinc-300 dark:border-white/15 rounded-2xl cursor-crosshair shadow-inner"
                        />
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-[11px] text-zinc-500 dark:text-slate-400">
                            Draw your signature inside the box
                          </span>
                          <button
                            type="button"
                            onClick={clearCanvas}
                            className="text-xs text-[#FFC72C] hover:underline font-bold"
                          >
                            Clear
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 flex justify-between">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="px-4 py-2.5 text-xs font-tenor font-bold text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white flex items-center gap-1.5 transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back</span>
                    </button>

                    <button
                      type="button"
                      disabled={!hasSignature}
                      onClick={() => setCurrentStep(4)}
                      className="px-6 py-3 bg-[#FFC72C] hover:bg-[#FFD54F] disabled:opacity-50 !text-[#111111] font-tenor font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-2"
                    >
                      <span>Agree & Proceed to Payment</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: PAYMENT SIMULATOR (PY-01, PY-02) */}
              {currentStep === 4 && (
                <div className="space-y-6 animate-fadeIn">
                  <div>
                    <h2 className="font-tenor text-2xl font-bold text-[#FFC72C]">
                      Rwanda Payment Terminal
                    </h2>
                    <p className="text-xs text-zinc-400 mt-1">
                      Choose Mobile Money or International Card.
                    </p>
                  </div>

                  {/* Payment Plan Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentPlan('pay_full')}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        paymentPlan === 'pay_full'
                          ? 'border-[#FFC72C] bg-[#FFC72C]/10 ring-2 ring-[#FFC72C]/30'
                          : 'border-black/10 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-[#0B0C0E]'
                      }`}
                    >
                      <span className="text-xs font-tenor font-bold text-[#FFC72C] block">
                        Pay 100% Today
                      </span>
                      <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block mt-0.5">
                        {formatPrice(grandTotal)}
                      </span>
                      <span className="text-[10px] text-[#FFC72C] font-semibold block mt-1">
                        Zero check-in balance
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentPlan('deposit_30')}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        paymentPlan === 'deposit_30'
                          ? 'border-[#FFC72C] bg-[#FFC72C]/10 ring-2 ring-[#FFC72C]/30'
                          : 'border-black/10 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-[#0B0C0E]'
                      }`}
                    >
                      <span className="text-xs font-tenor font-bold text-[#FFC72C] block">
                        Pay 30% Deposit
                      </span>
                      <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block mt-0.5">
                        {formatPrice(Math.round(grandTotal * 0.3))} today
                      </span>
                      <span className="text-[10px] text-[#FFC72C] font-semibold block mt-1">
                        Balance at check-in
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentPlan('hold_card')}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        paymentPlan === 'hold_card'
                          ? 'border-[#FFC72C] bg-[#FFC72C]/10 ring-2 ring-[#FFC72C]/30'
                          : 'border-black/10 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-[#0B0C0E]'
                      }`}
                    >
                      <span className="text-xs font-tenor font-bold text-[#FFC72C] block">
                        Hold with Card
                      </span>
                      <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block mt-0.5">
                        {formatPrice(securityDepositHold)} hold
                      </span>
                      <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block mt-1">
                        Pay rent upon arrival
                      </span>
                    </button>
                  </div>

                  {/* Payment Method Selector */}
                  <div className="space-y-4">
                    <span className="block text-xs font-bold font-tenor text-zinc-700 dark:text-zinc-300 uppercase">
                      Select Method
                    </span>

                    <div className="grid grid-cols-3 gap-3">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('momo_mtn')}
                        className={`p-3 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
                          paymentMethod === 'momo_mtn'
                            ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/20 ring-2 ring-amber-500/30'
                            : 'border-black/10 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-[#0E0F12]'
                        }`}
                      >
                        <div className="w-9 h-9 rounded-full bg-[#FFCC00] flex items-center justify-center font-bold text-xs text-black shadow-sm">
                          MoMo
                        </div>
                        <span className="text-xs font-bold text-zinc-900 dark:text-white">MTN MoMo</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('momo_airtel')}
                        className={`p-3 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
                          paymentMethod === 'momo_airtel'
                            ? 'border-red-500 bg-red-50 dark:bg-red-950/20 ring-2 ring-red-500/30'
                            : 'border-black/10 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-[#0E0F12]'
                        }`}
                      >
                        <div className="w-9 h-9 rounded-full bg-[#ED1C24] flex items-center justify-center font-bold text-xs text-white shadow-sm">
                          Airtel
                        </div>
                        <span className="text-xs font-bold text-zinc-900 dark:text-white">Airtel Money</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('card')}
                        className={`p-3 rounded-2xl border flex flex-col items-center gap-2 transition-all ${
                          paymentMethod === 'card'
                            ? 'border-[#FFC72C] bg-amber-50/50 dark:bg-[#0E0F12] ring-2 ring-[#FFC72C]/30'
                            : 'border-black/10 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-[#0E0F12]'
                        }`}
                      >
                        <div className="w-9 h-9 rounded-full bg-[#FFC72C] flex items-center justify-center text-[#111111] shadow-sm">
                          <CreditCard className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-zinc-900 dark:text-white">Credit / Debit</span>
                      </button>
                    </div>

                    {/* Method details input */}
                    {paymentMethod.startsWith('momo') ? (
                      <div className="bg-slate-50 dark:bg-[#0B0C0E] p-4 rounded-2xl border border-black/10 dark:border-white/15 space-y-3">
                        <label className="block text-xs font-bold font-tenor text-zinc-700 dark:text-zinc-300">
                          Enter Rwandan Mobile Money Number
                        </label>
                        <div className="flex gap-2">
                          <span className="px-3 py-2.5 bg-white dark:bg-[#141519] border border-black/10 dark:border-white/15 rounded-xl text-xs font-bold font-mono text-zinc-700 dark:text-zinc-300">
                            +250
                          </span>
                          <input
                            type="tel"
                            value={momoNumber}
                            onChange={(e) => setMomoNumber(e.target.value)}
                            className="flex-1 bg-white dark:bg-[#141519] border border-black/10 dark:border-white/15 rounded-xl px-3 py-2.5 text-xs font-semibold text-zinc-900 dark:text-white"
                            placeholder="788 123 456"
                          />
                        </div>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                          A prompt will appear instantly on your phone requesting your 4-digit MoMo PIN.
                        </p>

                        {isSimulatingPayment && (
                          <div className="p-3 rounded-xl bg-[#FFC72C]/10 border border-[#FFC72C]/30 flex items-center gap-3 animate-pulse">
                            <RefreshCw className="w-4 h-4 text-[#FFC72C] animate-spin" />
                            <span className="text-xs text-[#FFC72C] font-medium">
                              {momoPromptStep === 'prompt_sent'
                                ? 'Dial *182*7*1# prompt sent to phone. Waiting for PIN confirmation...'
                                : 'PIN accepted! Finalizing instant reservation...'}
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-slate-50 dark:bg-[#0B0C0E] p-4 rounded-2xl border border-black/10 dark:border-white/15 space-y-3">
                        <div>
                          <label className="block text-xs font-bold font-tenor text-zinc-700 dark:text-zinc-300 mb-1">
                            Card Number
                          </label>
                          <input
                            type="text"
                            defaultValue="4124 •••• •••• 8829"
                            className="w-full bg-white dark:bg-[#141519] border border-black/10 dark:border-white/15 rounded-xl p-2.5 text-xs font-mono font-medium text-zinc-900 dark:text-white"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold font-tenor text-zinc-700 dark:text-zinc-300 mb-1">
                              Expiry Date
                            </label>
                            <input
                              type="text"
                              defaultValue="12/28"
                              className="w-full bg-white dark:bg-[#141519] border border-black/10 dark:border-white/15 rounded-xl p-2.5 text-xs font-mono font-medium text-zinc-900 dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold font-tenor text-zinc-700 dark:text-zinc-300 mb-1">
                              CVV / CVC
                            </label>
                            <input
                              type="password"
                              defaultValue="842"
                              className="w-full bg-white dark:bg-[#141519] border border-black/10 dark:border-white/15 rounded-xl p-2.5 text-xs font-mono font-medium text-zinc-900 dark:text-white"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 flex justify-between items-center">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="px-4 py-2.5 text-xs font-tenor font-bold text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white flex items-center gap-1.5 transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back</span>
                    </button>

                    <button
                      type="button"
                      disabled={isSimulatingPayment}
                      onClick={handlePaymentSubmit}
                      className="px-8 py-3.5 bg-[#FFC72C] hover:bg-[#E5B224] disabled:opacity-50 !text-[#111111] font-tenor font-extrabold text-sm tracking-tight rounded-2xl transition-all flex items-center gap-2"
                    >
                      {isSimulatingPayment ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-4 h-4" />
                          <span>Pay {formatPrice(payableToday)}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right Summary Sticky Card (5 cols) */}
            <div className="lg:col-span-5 bg-white dark:bg-[#141519] rounded-3xl p-6 sm:p-7 border border-black/5 dark:border-white/10 shadow-lg sticky top-24">
              <h3 className="font-tenor font-bold text-base text-[#FFC72C] mb-4">
                Booking Summary
              </h3>

              {/* Main Asset Mini Card */}
              <div className="flex items-center gap-3.5 pb-4 border-b border-slate-100">
                <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-black/5 dark:border-white/10">
                  <Image src={asset.images[0]} alt={asset.title} fill className="object-cover" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#FFC72C]">
                    {asset.type === 'car' ? 'Vehicle' : 'Property'}
                  </span>
                  <h4 className="font-tenor font-bold text-sm text-[#FFC72C] line-clamp-1">
                    {asset.title}
                  </h4>
                  <div className="text-xs text-zinc-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{asset.neighborhood}, Kigali</span>
                  </div>
                </div>
              </div>

              {/* Paired Asset if Combo */}
              {pairedAsset && (
                <div className="flex items-center gap-3.5 py-3 border-b border-slate-100">
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-black/5 dark:border-white/10">
                    <Image src={pairedAsset.images[0]} alt={pairedAsset.title} fill className="object-cover" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#FFC72C]">
                      Paired Bundle (-20%)
                    </span>
                    <h4 className="font-tenor font-bold text-xs text-[#FFC72C] line-clamp-1">
                      {pairedAsset.title}
                    </h4>
                    <span className="text-[11px] text-zinc-400 font-mono">
                      +{formatPrice(pairedDailyRate)}/day
                    </span>
                  </div>
                </div>
              )}

              {/* Trip Dates */}
              <div className="py-4 border-b border-black/5 dark:border-white/10 space-y-1 text-xs">
                <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                  <span>Dates:</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-200">
                    {draftBooking.startDate} to {draftBooking.endDate} ({days} days)
                  </span>
                </div>
                <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                  <span>Guest:</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-200">{fullName}</span>
                </div>
              </div>

              {/* Price Calculation Itemization */}
              <div className="py-4 space-y-2 text-xs border-b border-black/5 dark:border-white/10 text-zinc-600 dark:text-zinc-400">
                <div className="flex justify-between">
                  <span>Base rate ({formatPrice(baseRate)} × {days}d)</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-200">{formatPrice(baseTotal)}</span>
                </div>

                {pairedAsset && (
                  <div className="flex justify-between text-[#FFC72C]">
                    <span>Combo vehicle ({formatPrice(pairedDailyRate)} × {days}d)</span>
                    <span className="font-semibold">{formatPrice(pairedTotal)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Cleaning & turnover</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-200">{formatPrice(cleaningFee)}</span>
                </div>

                {addOnsTotal > 0 && (
                  <div className="flex justify-between">
                    <span>Add-on services</span>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-200">{formatPrice(addOnsTotal)}</span>
                  </div>
                )}

                <div className="flex justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
                  <span>Rwanda Tourism & Municipal Levy (5%)</span>
                  <span>{formatPrice(taxesAndTourismLevy)}</span>
                </div>

                <div className="flex justify-between text-zinc-400 pt-1">
                  <span>Refundable Deposit Hold</span>
                  <span className="font-mono text-[#FFC72C]">
                    {formatPrice(securityDepositHold)} (Hold)
                  </span>
                </div>
              </div>

              {/* Grand Total & Payable Now */}
              <div className="pt-4 space-y-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs font-tenor font-bold text-zinc-500 dark:text-zinc-400 uppercase">
                    Grand Total
                  </span>
                  <span className="font-tenor font-extrabold text-lg text-zinc-900 dark:text-zinc-300">
                    {formatPrice(grandTotal)}
                  </span>
                </div>

                <div className="flex justify-between items-baseline p-3 rounded-2xl bg-slate-100 dark:bg-[#0B0C0E] border border-black/5 dark:border-white/10">
                  <span className="font-tenor font-bold text-sm text-[#FFC72C]">Payable Now</span>
                  <span className="font-tenor font-extrabold text-2xl text-[#FFC72C]">
                    {formatPrice(payableToday)}
                  </span>
                </div>

                {dueAtCheckIn > 0 && (
                  <div className="text-right text-[11px] text-zinc-500 dark:text-zinc-400">
                    Remaining {formatPrice(dueAtCheckIn)} due upon arrival handover
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* STEP 5: SUCCESS STATE WITH PRINTABLE PDF RECEIPT & HANDOVER CTA */
          <div className="max-w-3xl mx-auto bg-white dark:bg-[#141519] rounded-3xl p-6 sm:p-10 border border-black/5 dark:border-white/10 shadow-2xl animate-fadeIn">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-[#FFC72C]/15 text-[#FFC72C] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#FFC72C]/20">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <span className="text-xs font-bold font-tenor uppercase tracking-wider text-[#FFC72C] bg-[#FFC72C]/10 px-3 py-1 rounded-full border border-[#FFC72C]/20">
                Payment Authorized & Inventory Confirmed
              </span>

              <h1 className="font-tenor text-3xl font-extrabold text-[#FFC72C] mt-3">
                Murakaza Neza! Your Kigali Booking is Ready.
              </h1>

              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-lg mx-auto mt-2">
                A confirmation SMS and digital agreement have been dispatched to {phone}. Your operations concierge is notified.
              </p>
            </div>

            {/* Printable Digital Receipt / Voucher Card (PY-04) */}
            <div className="bg-slate-50 dark:bg-[#0B0C0E] rounded-2xl p-6 border-2 border-dashed border-zinc-300 dark:border-white/15 mb-8 font-sans">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-black/10 dark:border-white/15 gap-2">
                <div>
                  <span className="font-tenor font-extrabold text-lg text-zinc-900 dark:text-white tracking-tight">
                    Kigali<span className="text-[#FFC72C]">Rentals</span> Voucher
                  </span>
                  <span className="text-xs text-zinc-500 dark:text-zinc-400 block">
                    Issued: {new Date().toLocaleDateString('en-GB')}
                  </span>
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-[10px] uppercase font-bold text-zinc-500 dark:text-slate-400 block font-tenor">
                    Booking Reference Code
                  </span>
                  <span className="font-mono text-base font-bold text-[#FFC72C] bg-white dark:bg-[#141519] px-2 py-0.5 rounded border border-black/10 dark:border-white/10">
                    {confirmedReservation?.id || 'KGL-2026-8942'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-b border-black/10 dark:border-white/15 text-xs">
                <div>
                  <span className="text-zinc-500 dark:text-slate-400 block text-[10px] uppercase font-bold">Renter</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-200">{fullName}</span>
                </div>
                <div>
                  <span className="text-zinc-500 dark:text-slate-400 block text-[10px] uppercase font-bold">Check-in</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-200">{draftBooking.startDate}</span>
                </div>
                <div>
                  <span className="text-zinc-500 dark:text-slate-400 block text-[10px] uppercase font-bold">Check-out</span>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-200">{draftBooking.endDate}</span>
                </div>
                <div>
                  <span className="text-zinc-500 dark:text-slate-400 block text-[10px] uppercase font-bold">Total Paid</span>
                  <span className="font-mono font-bold text-[#FFC72C]">{formatPrice(payableToday)}</span>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                <span>Verification ID: {idNumber}</span>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 text-[#FFC72C] hover:text-[#d4a017] font-bold"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print PDF Receipt</span>
                </button>
              </div>
            </div>

            {/* Next Steps & Action Buttons */}
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-white dark:bg-[#141519] border border-black/5 dark:border-white/10 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-[#FFC72C] shrink-0 mt-0.5" />
                <div className="text-xs text-zinc-700 dark:text-zinc-300">
                  <span className="font-bold text-[#FFC72C] block mb-0.5">
                    Next Step: Digital Handover & Inspection
                  </span>
                  When receiving the vehicle or property keys, launch the mobile Condition Tool to sign off on odometer, fuel level, and key exchange.
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link
                  href="/handover"
                  className="w-full bg-[#FFC72C] hover:bg-[#FFC72C] text-[#111111] font-bold py-3.5 px-6 rounded-2xl font-tenor font-bold text-xs uppercase tracking-wider text-center shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>Open Handover Inspection Tool</span>
                </Link>

                <Link
                  href="/admin"
                  className="w-full bg-slate-100 dark:bg-[#0B0C0E] hover:bg-slate-200 dark:hover:bg-zinc-800 text-[#FFC72C] border border-black/5 dark:border-white/10 py-3.5 px-6 rounded-2xl font-tenor font-bold text-xs uppercase tracking-wider text-center transition-all flex items-center justify-center gap-2"
                >
                  <span>View in Admin Back-Office</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

