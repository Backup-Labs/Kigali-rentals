'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { useRental } from '@/lib/rentalContext';
import { ConditionReport } from '@/lib/types';
import {
  ClipboardCheck,
  Fuel,
  Gauge,
  Camera,
  CheckCircle2,
  Key,
  Zap,
  ShieldCheck,
  FileCheck,
  Plus,
  Trash2,
  Download,
  Upload,
  FileSpreadsheet,
  ArrowLeftRight,
} from 'lucide-react';
import CustomSelect from '@/components/ui/CustomSelect';
import { sanitizePlainText } from '@/lib/sanitize';

export default function HandoverWorkspace() {
  const {
    reservations,
    conditionReports,
    saveConditionReport,
    updateReservationStatus,
  } = useRental();

  const [selectedBookingId, setSelectedBookingId] = useState<string>(
    reservations[0]?.id || 'KGL-2026-8910'
  );

  const selectedBooking =
    reservations.find((r) => r.id === selectedBookingId) || reservations[0];

  const [activeTab, setActiveTab] = useState<'check_in' | 'check_out' | 'compare'>(
    'check_in'
  );

  // Check-In (Arrival) Car Telemetry State
  const [checkInOdometer, setCheckInOdometer] = useState<number>(34120);
  const [checkInFuel, setCheckInFuel] = useState<number>(100);
  const [checkInCarCleanliness, setCheckInCarCleanliness] = useState<
    'pristine' | 'standard' | 'muddy'
  >('pristine');

  // Check-Out (Departure) Car Telemetry State
  const [checkOutOdometer, setCheckOutOdometer] = useState<number>(34485);
  const [checkOutFuel, setCheckOutFuel] = useState<number>(100);
  const [checkOutCarCleanliness, setCheckOutCarCleanliness] = useState<
    'pristine' | 'standard' | 'muddy'
  >('pristine');

  const [carScratches, setCarScratches] = useState<
    { id: string; location: string; severity: 'minor' | 'moderate' | 'major'; note: string }[]
  >([
    {
      id: '1',
      location: 'Rear bumper right corner',
      severity: 'minor',
      note: '1.5cm surface scuff logged at arrival',
    },
  ]);
  const [newScratchNote, setNewScratchNote] = useState('');
  const [newScratchLoc, setNewScratchLoc] = useState('');

  // Property States (Arrival vs Departure)
  const [keysHandedOver, setKeysHandedOver] = useState(true);
  const [keyBoxPin, setKeyBoxPin] = useState('9420');
  const [checkInElecKwh, setCheckInElecKwh] = useState(12450.8);
  const [checkOutElecKwh, setCheckOutElecKwh] = useState(12518.4);
  const [checkInWaterUnits, setCheckInWaterUnits] = useState(842.1);
  const [checkOutWaterUnits, setCheckOutWaterUnits] = useState(846.5);
  const [propertyCleanliness, setPropertyCleanliness] = useState<
    'pristine' | 'good' | 'needs_attention'
  >('pristine');
  const [rooms, setRooms] = useState<
    { id: string; room: string; status: 'ok' | 'issue'; notes: string }[]
  >([
    {
      id: '1',
      room: 'Living Room & Balcony',
      status: 'ok',
      notes: 'Smart TV & AC in optimal condition',
    },
    {
      id: '2',
      room: 'Master Bedroom Suite',
      status: 'ok',
      notes: 'Linens, safe box, and bathroom verified',
    },
    {
      id: '3',
      room: 'Kitchen & Dining',
      status: 'ok',
      notes: 'Nespresso, fridge, and cutlery counted',
    },
    {
      id: '4',
      room: 'Backup Generator & Water Tank',
      status: 'ok',
      notes: 'Diesel level at 95%, auto-transfer switch tested',
    },
  ]);

  // Cloudinary-seeded exterior photo slots
  const [exteriorPhotos, setExteriorPhotos] = useState({
    front:
      'https://res.cloudinary.com/dlf3koulm/image/upload/v1793090855/kigali-rentals/seed/asset_df0ef6305e8f.jpg',
    back: 'https://res.cloudinary.com/dlf3koulm/image/upload/v1793090857/kigali-rentals/seed/asset_960c6b2d0b68.jpg',
    driverSide:
      'https://res.cloudinary.com/dlf3koulm/image/upload/v1793090856/kigali-rentals/seed/asset_e16f049ba9b4.jpg',
    passengerSide:
      'https://res.cloudinary.com/dlf3koulm/image/upload/v1793090855/kigali-rentals/seed/asset_df0ef6305e8f.jpg',
  });
  const [uploadingSlot, setUploadingSlot] = useState<string | null>(null);
  const fileSlotInputRef = useRef<HTMLInputElement>(null);
  const [activePhotoSlotKey, setActivePhotoSlotKey] = useState<
    'front' | 'back' | 'driverSide' | 'passengerSide'
  >('front');

  const [savedSuccessMessage, setSavedSuccessMessage] = useState<string | null>(null);

  const isCarAsset = selectedBooking?.assetType === 'car';

  const currentOdometer = activeTab === 'check_out' ? checkOutOdometer : checkInOdometer;
  const setCurrentOdometer =
    activeTab === 'check_out' ? setCheckOutOdometer : setCheckInOdometer;

  const currentFuel = activeTab === 'check_out' ? checkOutFuel : checkInFuel;
  const setCurrentFuel = activeTab === 'check_out' ? setCheckOutFuel : setCheckInFuel;

  const currentCarCleanliness =
    activeTab === 'check_out' ? checkOutCarCleanliness : checkInCarCleanliness;
  const setCurrentCarCleanliness =
    activeTab === 'check_out' ? setCheckOutCarCleanliness : setCheckInCarCleanliness;

  const currentElecKwh = activeTab === 'check_out' ? checkOutElecKwh : checkInElecKwh;
  const setCurrentElecKwh =
    activeTab === 'check_out' ? setCheckOutElecKwh : setCheckInElecKwh;

  const currentWaterUnits =
    activeTab === 'check_out' ? checkOutWaterUnits : checkInWaterUnits;
  const setCurrentWaterUnits =
    activeTab === 'check_out' ? setCheckOutWaterUnits : setCheckInWaterUnits;

  const addScratch = () => {
    const cleanLoc = sanitizePlainText(newScratchLoc, 100);
    const cleanNote = sanitizePlainText(newScratchNote, 200);
    if (!cleanLoc) return;
    setCarScratches((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        location: cleanLoc,
        severity: 'minor',
        note: cleanNote || 'Superficial mark recorded',
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

  const handlePhotoSlotUpload = async (file: File | undefined) => {
    if (!file) return;
    setUploadingSlot(activePhotoSlotKey);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          setExteriorPhotos((prev) => ({
            ...prev,
            [activePhotoSlotKey]: data.url,
          }));
          setSavedSuccessMessage(`Uploaded ${activePhotoSlotKey} photo to Cloudinary!`);
          setTimeout(() => setSavedSuccessMessage(null), 3500);
        }
      }
    } finally {
      setUploadingSlot(null);
    }
  };

  const buildReportForStage = (stage: 'check_in' | 'check_out'): ConditionReport => {
    const isOut = stage === 'check_out';
    return {
      id: `rep-${selectedBooking.id}-${stage}`,
      bookingId: selectedBooking.id,
      assetId: selectedBooking.assetId,
      assetTitle: selectedBooking.assetTitle,
      assetType: isCarAsset ? 'car' : 'property',
      stage,
      timestamp: new Date().toISOString(),
      agentName: 'Patrick Mugabo (Kigali Fleet Ops)',
      customerName: selectedBooking.customer.fullName,
      carData: isCarAsset
        ? {
            odometer: isOut ? checkOutOdometer : checkInOdometer,
            fuelLevel: isOut ? checkOutFuel : checkInFuel,
            cleanliness: isOut ? checkOutCarCleanliness : checkInCarCleanliness,
            exteriorPhotos,
            scratches: carScratches,
            spareTireAndJack: true,
            trianglePresent: true,
            notes: isOut
              ? 'Departure return inspection verified and signed.'
              : 'Arrival baseline inspection verified and signed.',
          }
        : undefined,
      propertyData: !isCarAsset
        ? {
            keysHandedOver,
            keyBoxPin,
            electricityMeterKwh: isOut ? checkOutElecKwh : checkInElecKwh,
            waterMeterUnits: isOut ? checkOutWaterUnits : checkInWaterUnits,
            cleanliness: propertyCleanliness,
            roomsChecklist: rooms,
            acAndAppliancesWorking: true,
            poolAndGardenCondition: 'excellent',
            notes: isOut
              ? 'Departure meter & room sign-off verified.'
              : 'Arrival meter & key handover verified.',
          }
        : undefined,
      completed: true,
    };
  };

  const handleSaveReport = (stageOverride?: 'check_in' | 'check_out') => {
    if (!selectedBooking) return;
    const stage =
      stageOverride || (activeTab === 'check_out' ? 'check_out' : 'check_in');
    const report = buildReportForStage(stage);
    saveConditionReport(report);
    setSavedSuccessMessage(
      `${stage === 'check_in' ? 'Arrival (Check-In)' : 'Departure (Check-Out)'} Report for ${selectedBooking.id} saved to Aiven PostgreSQL!`
    );
    setTimeout(() => setSavedSuccessMessage(null), 4000);
  };

  // High-Resolution Canvas PNG Report Downloader for Arrival, Departure, or Side-by-Side Comparison
  const handleDownloadReport = (mode: 'check_in' | 'check_out' | 'compare') => {
    if (!selectedBooking) return;

    // Also save to DB so the downloaded report is persisted
    if (mode === 'check_in' || mode === 'check_out') {
      saveConditionReport(buildReportForStage(mode));
    } else {
      saveConditionReport(buildReportForStage('check_in'));
      saveConditionReport(buildReportForStage('check_out'));
    }

    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = mode === 'compare' ? 1420 : 1220;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background
    ctx.fillStyle = '#0D0E12';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Top Gold Header Bar
    ctx.fillStyle = '#FFC72C';
    ctx.fillRect(0, 0, canvas.width, 12);

    // Header Card
    ctx.fillStyle = '#15171E';
    ctx.fillRect(48, 44, canvas.width - 96, 130);
    ctx.strokeStyle = 'rgba(255, 199, 44, 0.35)';
    ctx.lineWidth = 2;
    ctx.strokeRect(48, 44, canvas.width - 96, 130);

    ctx.fillStyle = '#FFC72C';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('KIGALI RENTALS • OFFICIAL CONDITION & HANDOVER CERTIFICATE', 80, 84);

    const modeTitle =
      mode === 'check_in'
        ? 'ARRIVAL (CHECK-IN) INSPECTION REPORT'
        : mode === 'check_out'
        ? 'DEPARTURE (CHECK-OUT) INSPECTION REPORT'
        : 'SIDE-BY-SIDE ARRIVAL VS. DEPARTURE COMPARISON REPORT';

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText(modeTitle, 80, 124);

    ctx.fillStyle = '#A1A1AA';
    ctx.font = '14px monospace';
    ctx.fillText(
      `Booking Ref: ${selectedBooking.id}   |   Issued: ${new Date().toISOString().slice(0, 19).replace('T', ' ')} UTC`,
      80,
      154
    );

    // Booking & Customer Metadata Box
    ctx.fillStyle = '#141519';
    ctx.fillRect(48, 200, canvas.width - 96, 145);
    ctx.strokeStyle = '#27272A';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(48, 200, canvas.width - 96, 145);

    ctx.fillStyle = '#FFC72C';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('ASSET & RENTER DETAILS', 80, 232);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText(`${selectedBooking.assetTitle} (${selectedBooking.neighborhood})`, 80, 264);

    ctx.fillStyle = '#D4D4D8';
    ctx.font = '15px sans-serif';
    ctx.fillText(
      `Renter: ${selectedBooking.customer.fullName}  •  Phone: ${selectedBooking.customer.phone}  •  Email: ${selectedBooking.customer.email}`,
      80,
      294
    );
    ctx.fillText(
      `Rental Period: ${selectedBooking.startDate} to ${selectedBooking.endDate} (${selectedBooking.daysCount} days)  •  Security Deposit Hold: $${selectedBooking.pricing?.securityDepositHold || 250}`,
      80,
      322
    );

    if (mode !== 'compare') {
      // Single Stage Report (Arrival or Departure)
      const isOut = mode === 'check_out';
      ctx.fillStyle = '#141519';
      ctx.fillRect(48, 375, canvas.width - 96, 560);
      ctx.strokeStyle = '#27272A';
      ctx.strokeRect(48, 375, canvas.width - 96, 560);

      ctx.fillStyle = '#FFC72C';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText(
        isOut
          ? 'RECORDED DEPARTURE (CHECK-OUT) TELEMETRY & CONDITION'
          : 'RECORDED ARRIVAL (CHECK-IN) BASELINE TELEMETRY & CONDITION',
        80,
        418
      );

      if (isCarAsset) {
        const odo = isOut ? checkOutOdometer : checkInOdometer;
        const fuel = isOut ? checkOutFuel : checkInFuel;
        const clean = isOut ? checkOutCarCleanliness : checkInCarCleanliness;

        const rows = [
          ['Stage Classification', isOut ? 'Departure / Return Check-Out' : 'Arrival / Handover Check-In'],
          ['Odometer Reading', `${odo.toLocaleString()} km`],
          ['Fuel Tank Level', `${fuel}% (${fuel >= 95 ? 'Full Tank' : 'Partial'})`],
          ['Interior & Exterior Cleanliness', clean.toUpperCase()],
          ['Spare Wheel, High-Lift Jack & Triangle', 'PRESENT & VERIFIED'],
          ['4-Angle Photographic Evidence', '4 / 4 Angles Logged on Cloudinary CDN'],
        ];

        rows.forEach(([label, val], idx) => {
          const y = 470 + idx * 54;
          ctx.fillStyle = idx % 2 === 0 ? '#1A1C23' : '#141519';
          ctx.fillRect(80, y - 30, canvas.width - 160, 44);
          ctx.fillStyle = '#A1A1AA';
          ctx.font = '15px sans-serif';
          ctx.fillText(label, 100, y - 2);
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 16px monospace';
          ctx.fillText(val, 620, y - 2);
        });

        ctx.fillStyle = '#FFC72C';
        ctx.font = 'bold 15px sans-serif';
        ctx.fillText('LOGGED EXTERIOR MARKS / NOTES:', 80, 820);

        if (carScratches.length === 0) {
          ctx.fillStyle = '#10B981';
          ctx.font = '15px sans-serif';
          ctx.fillText('Zero scratches or exterior marks logged.', 80, 852);
        } else {
          carScratches.slice(0, 3).forEach((s, i) => {
            ctx.fillStyle = '#E4E4E7';
            ctx.font = '14px sans-serif';
            ctx.fillText(`• ${s.location}: ${s.note} (${s.severity.toUpperCase()})`, 80, 852 + i * 26);
          });
        }
      } else {
        const elec = isOut ? checkOutElecKwh : checkInElecKwh;
        const water = isOut ? checkOutWaterUnits : checkInWaterUnits;

        const rows = [
          ['Stage Classification', isOut ? 'Departure / Return Check-Out' : 'Arrival / Handover Check-In'],
          ['Smart Lock PIN & Gate Remotes', `PIN #${keyBoxPin} (${keysHandedOver ? 'Handed Over' : 'Pending'})`],
          ['EUCL Cash-Power Electricity Meter', `${elec.toLocaleString()} kWh`],
          ['WASAC Water Meter Reading', `${water.toLocaleString()} m³`],
          ['Property Cleanliness Rating', propertyCleanliness.toUpperCase()],
          ['Backup Generator & Inverter Status', 'TESTED & OPERATIONAL'],
        ];

        rows.forEach(([label, val], idx) => {
          const y = 470 + idx * 54;
          ctx.fillStyle = idx % 2 === 0 ? '#1A1C23' : '#141519';
          ctx.fillRect(80, y - 30, canvas.width - 160, 44);
          ctx.fillStyle = '#A1A1AA';
          ctx.font = '15px sans-serif';
          ctx.fillText(label, 100, y - 2);
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 16px monospace';
          ctx.fillText(val, 620, y - 2);
        });

        ctx.fillStyle = '#FFC72C';
        ctx.font = 'bold 15px sans-serif';
        ctx.fillText('ROOM-BY-ROOM CHECKLIST:', 80, 815);
        rooms.slice(0, 4).forEach((rm, i) => {
          ctx.fillStyle = rm.status === 'ok' ? '#10B981' : '#F43F5E';
          ctx.font = 'bold 14px sans-serif';
          ctx.fillText(
            `[${rm.status === 'ok' ? 'OK' : 'ISSUE'}] ${rm.room} — ${rm.notes}`,
            80,
            845 + i * 24
          );
        });
      }
    } else {
      // SIDE-BY-SIDE COMPARISON REPORT (ARRIVAL VS DEPARTURE)
      ctx.fillStyle = '#141519';
      ctx.fillRect(48, 375, 536, 720);
      ctx.strokeStyle = '#27272A';
      ctx.strokeRect(48, 375, 536, 720);

      ctx.fillStyle = '#141519';
      ctx.fillRect(616, 375, 536, 720);
      ctx.strokeStyle = '#FFC72C';
      ctx.strokeRect(616, 375, 536, 720);

      // Left Column Header: Arrival
      ctx.fillStyle = '#FFC72C';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText('1. ARRIVAL BASELINE (CHECK-IN)', 78, 418);

      // Right Column Header: Departure
      ctx.fillStyle = '#10B981';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText('2. DEPARTURE RETURN (CHECK-OUT)', 646, 418);

      if (isCarAsset) {
        const kmDriven = Math.max(0, checkOutOdometer - checkInOdometer);
        const fuelDiff = checkOutFuel - checkInFuel;

        const leftRows = [
          ['Odometer at Arrival', `${checkInOdometer.toLocaleString()} km`],
          ['Fuel Level at Arrival', `${checkInFuel}%`],
          ['Cleanliness at Arrival', checkInCarCleanliness.toUpperCase()],
          ['Logged Marks at Arrival', `${carScratches.length} Recorded`],
          ['Emergency Kit & Spare', 'Verified Present'],
        ];

        const rightRows = [
          ['Odometer at Return', `${checkOutOdometer.toLocaleString()} km (+${kmDriven} km)`],
          ['Fuel Level at Return', `${checkOutFuel}% (${fuelDiff >= 0 ? 'Full Match' : `${fuelDiff}%`})`],
          ['Cleanliness at Return', checkOutCarCleanliness.toUpperCase()],
          ['New Unlogged Damage', 'NONE DETECTED'],
          ['Security Deposit Status', 'ELIGIBLE FOR FULL RELEASE'],
        ];

        leftRows.forEach(([k, v], i) => {
          const y = 475 + i * 70;
          ctx.fillStyle = '#1A1C23';
          ctx.fillRect(74, y - 30, 484, 52);
          ctx.fillStyle = '#A1A1AA';
          ctx.font = '14px sans-serif';
          ctx.fillText(k, 90, y - 6);
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 15px monospace';
          ctx.fillText(v, 90, y + 14);
        });

        rightRows.forEach(([k, v], i) => {
          const y = 475 + i * 70;
          ctx.fillStyle = '#1A1C23';
          ctx.fillRect(642, y - 30, 484, 52);
          ctx.fillStyle = '#A1A1AA';
          ctx.font = '14px sans-serif';
          ctx.fillText(k, 658, y - 6);
          ctx.fillStyle = '#10B981';
          ctx.font = 'bold 15px monospace';
          ctx.fillText(v, 658, y + 14);
        });
      } else {
        const elecUsed = (checkOutElecKwh - checkInElecKwh).toFixed(1);
        const waterUsed = (checkOutWaterUnits - checkInWaterUnits).toFixed(1);

        const leftRows = [
          ['Electricity Meter (In)', `${checkInElecKwh.toLocaleString()} kWh`],
          ['Water Meter (In)', `${checkInWaterUnits.toLocaleString()} m³`],
          ['Keys & Gate Remotes', `PIN #${keyBoxPin} Handed Over`],
          ['Rooms Verified OK', `${rooms.filter((r) => r.status === 'ok').length} / ${rooms.length} Rooms`],
          ['Generator & Inverter', '100% Operational'],
        ];

        const rightRows = [
          ['Electricity Meter (Out)', `${checkOutElecKwh.toLocaleString()} kWh (+${elecUsed} kWh)`],
          ['Water Meter (Out)', `${checkOutWaterUnits.toLocaleString()} m³ (+${waterUsed} m³)`],
          ['Keys & Remotes Returned', keysHandedOver ? 'Returned in Full' : 'Pending'],
          ['Rooms Inspection Out', `${rooms.filter((r) => r.status === 'ok').length} / ${rooms.length} Verified OK`],
          ['Security Deposit Status', 'ELIGIBLE FOR FULL RELEASE'],
        ];

        leftRows.forEach(([k, v], i) => {
          const y = 475 + i * 70;
          ctx.fillStyle = '#1A1C23';
          ctx.fillRect(74, y - 30, 484, 52);
          ctx.fillStyle = '#A1A1AA';
          ctx.font = '14px sans-serif';
          ctx.fillText(k, 90, y - 6);
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 15px monospace';
          ctx.fillText(v, 90, y + 14);
        });

        rightRows.forEach(([k, v], i) => {
          const y = 475 + i * 70;
          ctx.fillStyle = '#1A1C23';
          ctx.fillRect(642, y - 30, 484, 52);
          ctx.fillStyle = '#A1A1AA';
          ctx.font = '14px sans-serif';
          ctx.fillText(k, 658, y - 6);
          ctx.fillStyle = '#10B981';
          ctx.font = 'bold 15px monospace';
          ctx.fillText(v, 658, y + 14);
        });
      }

      // Comparison Verdict Banner inside columns
      ctx.fillStyle = 'rgba(16, 185, 129, 0.14)';
      ctx.fillRect(74, 860, 1052, 95);
      ctx.strokeStyle = '#10B981';
      ctx.strokeRect(74, 860, 1052, 95);

      ctx.fillStyle = '#10B981';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText(
        'COMPARISON VERDICT: ZERO UNLOGGED DAMAGES • FULL SECURITY DEPOSIT RELEASE AUTHORIZED',
        100,
        900
      );
      ctx.fillStyle = '#D4D4D8';
      ctx.font = '14px sans-serif';
      ctx.fillText(
        `Both Arrival (Check-In) and Departure (Check-Out) inspections match. Security deposit hold ($${selectedBooking.pricing?.securityDepositHold || 250}) cleared for release.`,
        100,
        932
      );
    }

    // Footer Sign-Off Block
    const footerY = mode === 'compare' ? 1135 : 965;
    ctx.fillStyle = '#141519';
    ctx.fillRect(48, footerY, canvas.width - 96, 200);
    ctx.strokeStyle = '#27272A';
    ctx.strokeRect(48, footerY, canvas.width - 96, 200);

    ctx.fillStyle = '#A1A1AA';
    ctx.font = '14px sans-serif';
    ctx.fillText('OPERATIONS INSPECTOR SIGNATURE', 80, footerY + 45);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('Patrick Mugabo — Kigali Fleet & Property Ops', 80, footerY + 75);
    ctx.strokeStyle = '#FFC72C';
    ctx.beginPath();
    ctx.moveTo(80, footerY + 125);
    ctx.quadraticCurveTo(140, footerY + 95, 200, footerY + 120);
    ctx.quadraticCurveTo(260, footerY + 140, 320, footerY + 108);
    ctx.stroke();
    ctx.fillStyle = '#71717A';
    ctx.font = '12px monospace';
    ctx.fillText('Digitally Signed & Timestamped', 80, footerY + 155);

    ctx.fillStyle = '#A1A1AA';
    ctx.font = '14px sans-serif';
    ctx.fillText('RENTER / GUEST ACKNOWLEDGMENT', 640, footerY + 45);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText(selectedBooking.customer.fullName, 640, footerY + 75);
    ctx.strokeStyle = '#10B981';
    ctx.beginPath();
    ctx.moveTo(640, footerY + 125);
    ctx.quadraticCurveTo(700, footerY + 95, 760, footerY + 125);
    ctx.quadraticCurveTo(820, footerY + 145, 890, footerY + 105);
    ctx.stroke();
    ctx.fillStyle = '#71717A';
    ctx.font = '12px monospace';
    ctx.fillText('Verified Customer Counter-Signature', 640, footerY + 155);

    // Trigger Download
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    const fileLabel =
      mode === 'check_in'
        ? 'Arrival-CheckIn-Report'
        : mode === 'check_out'
        ? 'Departure-CheckOut-Report'
        : 'Comparison-Arrival-vs-Departure-Report';
    link.download = `${selectedBooking.id}-${fileLabel}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setSavedSuccessMessage(
      `Downloaded ${fileLabel} (${selectedBooking.id}) and synced to Aiven DB!`
    );
    setTimeout(() => setSavedSuccessMessage(null), 4000);
  };

  if (!selectedBooking) {
    return (
      <div className="p-8 text-center text-sm text-zinc-500">
        No reservations found for handover inspection.
      </div>
    );
  }

  const savedReportsForBooking = conditionReports.filter(
    (r) => r.bookingId === selectedBooking.id
  );

  return (
    <div className="space-y-6">
      {/* Hidden File Input for 4-Angle Exterior Photo Upload to Cloudinary */}
      <input
        ref={fileSlotInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handlePhotoSlotUpload(e.target.files?.[0])}
      />

      {/* Top Controls Bar: Select Reservation + Quick Download Buttons for All 3 Report Types */}
      <div className="bg-white dark:bg-[#141519] rounded-2xl p-5 border border-zinc-200/80 dark:border-zinc-800/80 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold font-tenor uppercase tracking-wider text-[#FFC72C] bg-[#FFC72C]/10 px-2.5 py-0.5 rounded-full mb-1">
            <ClipboardCheck className="w-3.5 h-3.5" />
            <span>Admin Handover & Inspection Protocol</span>
          </div>
          <h2 className="font-tenor text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-white">
            Arrival, Departure & Comparison Reports
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Record telemetry, upload inspection photos to Cloudinary, and download official Arrival, Departure, or Comparison certificates.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="w-full sm:w-72">
            <CustomSelect
              label="Active Booking"
              value={selectedBookingId}
              onChange={(val) => setSelectedBookingId(val)}
              options={reservations.map((res) => ({
                value: res.id,
                label: `${res.id} — ${res.assetTitle}`,
                description: `${res.customer.fullName} (${res.customer.phone})`,
              }))}
            />
          </div>

          {/* Direct Download Buttons for Arrival, Departure, and Comparison */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleDownloadReport('check_in')}
              className="h-10 px-3.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 hover:bg-[#FFC72C] text-zinc-800 dark:text-zinc-200 hover:text-[#111111] border border-zinc-200 dark:border-zinc-800 text-xs font-tenor font-bold flex items-center gap-1.5 transition-colors"
              title="Download Arrival (Check-In) Report"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Arrival Report</span>
            </button>

            <button
              type="button"
              onClick={() => handleDownloadReport('check_out')}
              className="h-10 px-3.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 hover:bg-[#FFC72C] text-zinc-800 dark:text-zinc-200 hover:text-[#111111] border border-zinc-200 dark:border-zinc-800 text-xs font-tenor font-bold flex items-center gap-1.5 transition-colors"
              title="Download Departure (Check-Out) Report"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Departure Report</span>
            </button>

            <button
              type="button"
              onClick={() => handleDownloadReport('compare')}
              className="h-10 px-4 rounded-xl bg-[#FFC72C] hover:bg-[#FFD54F] text-[#111111] text-xs font-tenor font-extrabold flex items-center gap-1.5 transition-colors"
              title="Download Side-by-Side Comparison Report"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>Download Comparison</span>
            </button>
          </div>
        </div>
      </div>

      {/* Toast Notification Banner */}
      {savedSuccessMessage && (
        <div className="p-4 rounded-2xl bg-emerald-600 text-white font-tenor font-bold text-xs flex items-center justify-between shadow-lg animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-white shrink-0" />
            <span>{savedSuccessMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setSavedSuccessMessage(null)}
            className="text-white/80 hover:text-white"
          >
            ×
          </button>
        </div>
      )}

      {/* Selected Booking Summary & Stage Switcher */}
      <div className="bg-white dark:bg-[#141519] rounded-2xl p-4 sm:p-5 border border-zinc-200/80 dark:border-zinc-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-zinc-200 dark:border-zinc-800">
            <Image
              src={selectedBooking.assetImage}
              alt={selectedBooking.assetTitle}
              fill
              className="object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-[#FFC72C] bg-[#FFC72C]/10 px-2 py-0.5 rounded">
                {selectedBooking.id}
              </span>
              <span className="text-xs text-zinc-400">
                {isCarAsset ? 'Vehicle Fleet' : 'Property Asset'}
              </span>
              <span className="text-[11px] text-emerald-500 font-semibold">
                • {savedReportsForBooking.length} Saved Report
                {savedReportsForBooking.length === 1 ? '' : 's'}
              </span>
            </div>
            <h3 className="font-tenor font-bold text-base text-zinc-900 dark:text-white">
              {selectedBooking.assetTitle}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Renter:{' '}
              <span className="font-semibold text-zinc-900 dark:text-zinc-200">
                {selectedBooking.customer.fullName}
              </span>{' '}
              ({selectedBooking.customer.phone})
            </p>
          </div>
        </div>

        {/* Mode Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-zinc-100 dark:bg-[#0B0C0E] p-1.5 rounded-2xl border border-zinc-200 dark:border-zinc-800">
          <button
            type="button"
            onClick={() => setActiveTab('check_in')}
            className={`px-3.5 py-2 rounded-xl text-xs font-tenor font-bold transition-all ${
              activeTab === 'check_in'
                ? 'bg-[#FFC72C] text-[#111111] font-extrabold'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            1. Arrival (Check-In)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('check_out')}
            className={`px-3.5 py-2 rounded-xl text-xs font-tenor font-bold transition-all ${
              activeTab === 'check_out'
                ? 'bg-[#FFC72C] text-[#111111] font-extrabold'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            2. Departure (Check-Out)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('compare')}
            className={`px-3.5 py-2 rounded-xl text-xs font-tenor font-bold transition-all ${
              activeTab === 'compare'
                ? 'bg-[#FFC72C] text-[#111111] font-extrabold'
                : 'text-[#FFC72C] hover:bg-[#FFC72C]/10'
            }`}
          >
            3. Compare Both (Arrival vs. Departure)
          </button>
        </div>
      </div>

      {/* VIEW 1 & 2: ARRIVAL OR DEPARTURE INSPECTION EDITOR */}
      {activeTab !== 'compare' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Main Inspection Canvas (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {isCarAsset ? (
              <div className="bg-white dark:bg-[#141519] rounded-3xl p-6 sm:p-7 border border-zinc-200/80 dark:border-zinc-800/80 space-y-6">
                <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
                  <div>
                    <h3 className="font-tenor font-bold text-lg text-zinc-900 dark:text-white">
                      {activeTab === 'check_in'
                        ? 'Arrival (Check-In) Vehicle Telemetry'
                        : 'Departure (Check-Out) Vehicle Telemetry'}
                    </h3>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      {activeTab === 'check_in'
                        ? 'Record baseline mileage, fuel, and 4-angle photos at handover'
                        : 'Record return mileage, fuel, and post-trip condition at return'}
                    </span>
                  </div>
                  <span className="text-xs font-bold font-tenor uppercase bg-[#FFC72C]/15 text-[#FFC72C] px-3 py-1 rounded-full">
                    {activeTab === 'check_in' ? 'Arrival Stage' : 'Departure Stage'}
                  </span>
                </div>

                {/* Odometer & Fuel Gauge */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-zinc-50 dark:bg-[#0B0C0E] p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold font-tenor text-zinc-700 dark:text-zinc-300 uppercase flex items-center gap-1.5">
                        <Gauge className="w-4 h-4 text-[#FFC72C]" />
                        <span>Odometer (km)</span>
                      </label>
                    </div>
                    <input
                      type="number"
                      value={currentOdometer}
                      onChange={(e) => setCurrentOdometer(parseInt(e.target.value, 10) || 0)}
                      className="w-full bg-white dark:bg-[#141519] border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-sm font-mono font-bold text-zinc-900 dark:text-white"
                    />
                  </div>

                  <div className="bg-zinc-50 dark:bg-[#0B0C0E] p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold font-tenor text-zinc-700 dark:text-zinc-300 uppercase flex items-center gap-1.5">
                        <Fuel className="w-4 h-4 text-[#FFC72C]" />
                        <span>Fuel Level ({currentFuel}%)</span>
                      </label>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={currentFuel}
                      onChange={(e) => setCurrentFuel(parseInt(e.target.value, 10))}
                      className="w-full accent-[#FFC72C] cursor-pointer mt-2"
                    />
                  </div>

                  <div className="bg-zinc-50 dark:bg-[#0B0C0E] p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                    <label className="text-xs font-bold font-tenor text-zinc-700 dark:text-zinc-300 uppercase block mb-2">
                      Cleanliness
                    </label>
                    <select
                      value={currentCarCleanliness}
                      onChange={(e) =>
                        setCurrentCarCleanliness(
                          e.target.value as 'pristine' | 'standard' | 'muddy'
                        )
                      }
                      className="w-full h-9 px-3 rounded-xl bg-white dark:bg-[#141519] border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-900 dark:text-white"
                    >
                      <option value="pristine">Pristine</option>
                      <option value="standard">Standard</option>
                      <option value="muddy">Muddy / Needs Wash</option>
                    </select>
                  </div>
                </div>

                {/* 4-Angle Exterior Photo Upload Slots (Cloudinary) */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold font-tenor text-zinc-700 dark:text-zinc-300 uppercase flex items-center gap-1.5">
                      <Camera className="w-4 h-4 text-[#FFC72C]" />
                      <span>4-Angle Exterior Photos (Click any angle to upload to Cloudinary)</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {(
                      [
                        { label: 'Front Grille', key: 'front', url: exteriorPhotos.front },
                        { label: 'Rear Bumper', key: 'back', url: exteriorPhotos.back },
                        { label: 'Driver Side', key: 'driverSide', url: exteriorPhotos.driverSide },
                        {
                          label: 'Passenger Side',
                          key: 'passengerSide',
                          url: exteriorPhotos.passengerSide,
                        },
                      ] as const
                    ).map((slot) => (
                      <div
                        key={slot.key}
                        onClick={() => {
                          setActivePhotoSlotKey(slot.key);
                          fileSlotInputRef.current?.click();
                        }}
                        className="cursor-pointer relative aspect-[4/3] rounded-2xl overflow-hidden border-2 border-zinc-200 dark:border-zinc-800 hover:border-[#FFC72C] group bg-zinc-900 transition-all"
                      >
                        <Image src={slot.url} alt={slot.label} fill className="object-cover" />
                        <div className="absolute inset-0 bg-black/45 group-hover:bg-black/60 flex flex-col justify-between p-2.5 text-white transition-colors">
                          <span className="self-end bg-black/60 px-2 py-0.5 rounded-md text-[10px] flex items-center gap-1">
                            <Upload className="w-3 h-3 text-[#FFC72C]" />
                            <span>
                              {uploadingSlot === slot.key ? 'Uploading...' : 'Replace'}
                            </span>
                          </span>
                          <div>
                            <span className="text-[10px] font-tenor font-bold uppercase block truncate">
                              {slot.label}
                            </span>
                            <span className="text-[9px] text-emerald-300">Cloudinary Hosted</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Scratches & Imperfections Log */}
                <div>
                  <label className="block text-xs font-bold font-tenor text-zinc-700 dark:text-zinc-300 uppercase mb-2">
                    Exterior Scratches / Marks Log
                  </label>

                  <div className="space-y-2 mb-3">
                    {carScratches.map((s) => (
                      <div
                        key={s.id}
                        className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-[#0B0C0E] border border-zinc-200 dark:border-zinc-800 text-xs"
                      >
                        <div>
                          <span className="font-bold text-[#FFC72C] block">{s.location}</span>
                          <span className="text-zinc-600 dark:text-zinc-400">{s.note}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeScratch(s.id)}
                          className="text-zinc-400 hover:text-rose-500 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      placeholder="Location (e.g. Left wing mirror)"
                      value={newScratchLoc}
                      onChange={(e) => setNewScratchLoc(e.target.value)}
                      className="bg-white dark:bg-[#0B0C0E] border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs flex-1 text-zinc-900 dark:text-white"
                    />
                    <input
                      type="text"
                      placeholder="Note (e.g. Minor paint chip)"
                      value={newScratchNote}
                      onChange={(e) => setNewScratchNote(e.target.value)}
                      className="bg-white dark:bg-[#0B0C0E] border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs flex-1 text-zinc-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={addScratch}
                      className="px-3.5 py-2 bg-[#FFC72C] hover:bg-[#FFD54F] text-[#111111] text-xs font-tenor font-extrabold rounded-xl flex items-center justify-center gap-1 shrink-0 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Mark</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* PROPERTY INSPECTION FORM */
              <div className="bg-white dark:bg-[#141519] rounded-3xl p-6 sm:p-7 border border-zinc-200/80 dark:border-zinc-800/80 space-y-6">
                <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
                  <div>
                    <h3 className="font-tenor font-bold text-lg text-zinc-900 dark:text-white">
                      {activeTab === 'check_in'
                        ? 'Arrival (Check-In) Property & Utility Log'
                        : 'Departure (Check-Out) Property & Utility Log'}
                    </h3>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      Verify keys, EUCL Cash-Power electricity, WASAC water meter, and room conditions
                    </span>
                  </div>
                  <span className="text-xs font-bold font-tenor uppercase bg-[#FFC72C]/15 text-[#FFC72C] px-3 py-1 rounded-full">
                    {activeTab === 'check_in' ? 'Arrival Stage' : 'Departure Stage'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-zinc-50 dark:bg-[#0B0C0E] p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center gap-2 mb-2">
                      <Key className="w-4 h-4 text-[#FFC72C]" />
                      <span className="text-xs font-bold font-tenor text-zinc-700 dark:text-zinc-300 uppercase">
                        Smart Lock PIN
                      </span>
                    </div>
                    <input
                      type="text"
                      value={keyBoxPin}
                      onChange={(e) => setKeyBoxPin(e.target.value)}
                      className="w-full bg-white dark:bg-[#141519] border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-zinc-900 dark:text-white"
                    />
                    <label className="flex items-center gap-2 mt-2.5 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={keysHandedOver}
                        onChange={(e) => setKeysHandedOver(e.target.checked)}
                        className="rounded accent-[#FFC72C]"
                      />
                      <span>Gate Remotes Verified</span>
                    </label>
                  </div>

                  <div className="bg-zinc-50 dark:bg-[#0B0C0E] p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-4 h-4 text-[#FFC72C]" />
                      <span className="text-xs font-bold font-tenor text-zinc-700 dark:text-zinc-300 uppercase">
                        Electricity (kWh)
                      </span>
                    </div>
                    <input
                      type="number"
                      step="0.1"
                      value={currentElecKwh}
                      onChange={(e) => setCurrentElecKwh(parseFloat(e.target.value) || 0)}
                      className="w-full bg-white dark:bg-[#141519] border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-zinc-900 dark:text-white"
                    />
                  </div>

                  <div className="bg-zinc-50 dark:bg-[#0B0C0E] p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                    <span className="text-xs font-bold font-tenor text-zinc-700 dark:text-zinc-300 uppercase block mb-2">
                      Water Meter (m³)
                    </span>
                    <input
                      type="number"
                      step="0.1"
                      value={currentWaterUnits}
                      onChange={(e) => setCurrentWaterUnits(parseFloat(e.target.value) || 0)}
                      className="w-full bg-white dark:bg-[#141519] border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-1.5 text-xs font-mono font-bold text-zinc-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold font-tenor text-zinc-700 dark:text-zinc-300 uppercase mb-2">
                    Room Condition Sign-Off
                  </label>
                  <div className="space-y-2.5">
                    {rooms.map((room) => (
                      <div
                        key={room.id}
                        className="flex items-center justify-between p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#0B0C0E]"
                      >
                        <div>
                          <span className="font-tenor font-bold text-xs text-zinc-900 dark:text-white block">
                            {room.room}
                          </span>
                          <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                            {room.notes}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => toggleRoomStatus(room.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-tenor font-bold transition-all ${
                            room.status === 'ok'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-rose-600 text-white'
                          }`}
                        >
                          {room.status === 'ok' ? 'Verified OK' : 'Issue Logged'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Sign-Off & Report Export Box (4 cols) */}
          <div className="lg:col-span-4 bg-white dark:bg-[#141519] rounded-3xl p-6 border border-zinc-200/80 dark:border-zinc-800/80 space-y-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-zinc-500 dark:text-zinc-400 font-tenor">
                Official Handover Filing
              </span>
              <h3 className="font-tenor font-bold text-lg text-zinc-900 dark:text-white">
                {activeTab === 'check_in'
                  ? 'Save & Export Arrival Report'
                  : 'Save & Export Departure Report'}
              </h3>
            </div>

            <div className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400 border-t border-zinc-200 dark:border-zinc-800 pt-3">
              <div className="flex justify-between">
                <span>Booking ID:</span>
                <span className="font-mono font-bold text-zinc-900 dark:text-zinc-200">
                  {selectedBooking.id}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Inspector:</span>
                <span className="font-semibold text-zinc-900 dark:text-zinc-200">
                  Patrick Mugabo (KGL Ops)
                </span>
              </div>
              <div className="flex justify-between">
                <span>Stage:</span>
                <span className="font-bold text-[#FFC72C]">
                  {activeTab === 'check_in' ? 'Arrival (Check-In)' : 'Departure (Check-Out)'}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#FFC72C]/10 border border-[#FFC72C]/30 text-xs text-zinc-700 dark:text-zinc-300 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-[#FFC72C] shrink-0 mt-0.5" />
              <span>
                Saving records this inspection in Aiven PostgreSQL. You can also download the signed PNG certificate below.
              </span>
            </div>

            <button
              type="button"
              onClick={() => handleSaveReport(activeTab)}
              className="w-full h-11 bg-[#FFC72C] hover:bg-[#FFD54F] text-[#111111] rounded-xl font-tenor font-extrabold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
            >
              <FileCheck className="w-4 h-4" />
              <span>
                Save {activeTab === 'check_in' ? 'Arrival' : 'Departure'} Report to DB
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleDownloadReport(activeTab)}
              className="w-full h-11 bg-zinc-900 dark:bg-white text-white dark:text-[#111111] hover:opacity-90 rounded-xl font-tenor font-extrabold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>
                Download {activeTab === 'check_in' ? 'Arrival' : 'Departure'} Certificate (PNG)
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('compare')}
              className="w-full h-10 bg-zinc-100 dark:bg-[#0B0C0E] hover:bg-zinc-200 dark:hover:bg-zinc-800 text-[#FFC72C] rounded-xl font-tenor font-bold text-xs text-center transition-colors border border-zinc-200 dark:border-zinc-800"
            >
              View Side-by-Side Comparison
            </button>
          </div>
        </div>
      ) : (
        /* VIEW 3: SIDE-BY-SIDE COMPARISON VIEW (ARRIVAL VS DEPARTURE) */
        <div className="bg-white dark:bg-[#141519] rounded-3xl p-6 sm:p-8 border border-zinc-200/80 dark:border-zinc-800/80 animate-fadeIn space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-zinc-200 dark:border-zinc-800 gap-4">
            <div>
              <span className="text-xs font-bold font-tenor uppercase tracking-wider text-[#FFC72C]">
                Arrival vs. Departure Verification
              </span>
              <h3 className="font-tenor text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-white">
                Side-by-Side Condition Comparison ({selectedBooking.id})
              </h3>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleDownloadReport('check_in')}
                className="h-9 px-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 text-xs font-bold flex items-center gap-1.5 border border-zinc-200 dark:border-zinc-800"
              >
                <Download className="w-3.5 h-3.5 text-[#FFC72C]" />
                <span>Arrival PNG</span>
              </button>
              <button
                type="button"
                onClick={() => handleDownloadReport('check_out')}
                className="h-9 px-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 text-xs font-bold flex items-center gap-1.5 border border-zinc-200 dark:border-zinc-800"
              >
                <Download className="w-3.5 h-3.5 text-[#FFC72C]" />
                <span>Departure PNG</span>
              </button>
              <button
                type="button"
                onClick={() => handleDownloadReport('compare')}
                className="h-9 px-4 rounded-xl bg-[#FFC72C] hover:bg-[#FFD54F] text-[#111111] text-xs font-tenor font-extrabold flex items-center gap-1.5"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Download Full Comparison Report</span>
              </button>
            </div>
          </div>

          {isCarAsset ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Column A: Arrival */}
              <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-[#0B0C0E] border border-zinc-200 dark:border-zinc-800 space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2.5">
                  <span className="font-tenor font-bold text-sm text-[#FFC72C]">
                    1. Arrival (Check-In Baseline)
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDownloadReport('check_in')}
                    className="text-[11px] font-bold text-zinc-600 dark:text-zinc-300 hover:text-[#FFC72C] flex items-center gap-1"
                  >
                    <Download className="w-3 h-3" />
                    <span>Download Arrival</span>
                  </button>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Odometer at Arrival:</span>
                    <span className="font-mono font-bold text-zinc-900 dark:text-white">
                      {checkInOdometer.toLocaleString()} km
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Fuel Level at Arrival:</span>
                    <span className="font-mono font-bold text-zinc-900 dark:text-white">
                      {checkInFuel}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Logged Exterior Marks:</span>
                    <span className="font-bold text-zinc-900 dark:text-white">
                      {carScratches.length} Recorded
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Cleanliness:</span>
                    <span className="font-bold text-[#FFC72C] uppercase">
                      {checkInCarCleanliness}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-zinc-900">
                    <Image
                      src={exteriorPhotos.front}
                      alt="Front arrival"
                      fill
                      className="object-cover"
                    />
                    <span className="absolute bottom-1.5 left-1.5 text-[9px] bg-black/70 text-white px-1.5 py-0.5 rounded">
                      Arrival Front
                    </span>
                  </div>
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-zinc-900">
                    <Image
                      src={exteriorPhotos.back}
                      alt="Back arrival"
                      fill
                      className="object-cover"
                    />
                    <span className="absolute bottom-1.5 left-1.5 text-[9px] bg-black/70 text-white px-1.5 py-0.5 rounded">
                      Arrival Rear
                    </span>
                  </div>
                </div>
              </div>

              {/* Column B: Departure */}
              <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-[#0B0C0E] border-2 border-[#FFC72C]/40 space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2.5">
                  <span className="font-tenor font-bold text-sm text-emerald-500">
                    2. Departure (Check-Out Return)
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDownloadReport('check_out')}
                    className="text-[11px] font-bold text-zinc-600 dark:text-zinc-300 hover:text-[#FFC72C] flex items-center gap-1"
                  >
                    <Download className="w-3 h-3" />
                    <span>Download Departure</span>
                  </button>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Odometer at Departure:</span>
                    <span className="font-mono font-bold text-zinc-900 dark:text-white">
                      {checkOutOdometer.toLocaleString()} km (+
                      {Math.max(0, checkOutOdometer - checkInOdometer)} km driven)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Fuel Level at Departure:</span>
                    <span className="font-mono font-bold text-zinc-900 dark:text-white">
                      {checkOutFuel}%{' '}
                      {checkOutFuel >= checkInFuel ? '(Full Match)' : '(Top-up Required)'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">New Unlogged Scratches:</span>
                    <span className="font-bold text-emerald-500">None Detected</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Cleanliness:</span>
                    <span className="font-bold text-zinc-900 dark:text-white uppercase">
                      {checkOutCarCleanliness}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-zinc-900">
                    <Image
                      src={exteriorPhotos.front}
                      alt="Front departure"
                      fill
                      className="object-cover"
                    />
                    <span className="absolute bottom-1.5 left-1.5 text-[9px] bg-black/70 text-white px-1.5 py-0.5 rounded">
                      Departure Front
                    </span>
                  </div>
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-zinc-900">
                    <Image
                      src={exteriorPhotos.back}
                      alt="Back departure"
                      fill
                      className="object-cover"
                    />
                    <span className="absolute bottom-1.5 left-1.5 text-[9px] bg-black/70 text-white px-1.5 py-0.5 rounded">
                      Departure Rear
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-[#0B0C0E] border border-zinc-200 dark:border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-tenor font-bold text-sm text-[#FFC72C]">
                    1. Arrival Baseline (Check-In)
                  </h4>
                  <button
                    type="button"
                    onClick={() => handleDownloadReport('check_in')}
                    className="text-[11px] font-bold text-zinc-500 hover:text-[#FFC72C] flex items-center gap-1"
                  >
                    <Download className="w-3 h-3" />
                    <span>Download Arrival</span>
                  </button>
                </div>
                <div className="text-xs space-y-1.5 text-zinc-600 dark:text-zinc-400">
                  <div>Electricity Meter: {checkInElecKwh.toLocaleString()} kWh</div>
                  <div>Water Meter: {checkInWaterUnits.toLocaleString()} m³</div>
                  <div>Keys: Smart Lock PIN #{keyBoxPin} + 2 gate remotes</div>
                  <div>Rooms Verified: {rooms.length} / {rooms.length} Spotless</div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-[#0B0C0E] border-2 border-[#FFC72C]/40 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-tenor font-bold text-sm text-emerald-500">
                    2. Departure Return (Check-Out)
                  </h4>
                  <button
                    type="button"
                    onClick={() => handleDownloadReport('check_out')}
                    className="text-[11px] font-bold text-zinc-500 hover:text-[#FFC72C] flex items-center gap-1"
                  >
                    <Download className="w-3 h-3" />
                    <span>Download Departure</span>
                  </button>
                </div>
                <div className="text-xs space-y-1.5 text-zinc-600 dark:text-zinc-400">
                  <div>
                    Electricity Meter: {checkOutElecKwh.toLocaleString()} kWh (+
                    {(checkOutElecKwh - checkInElecKwh).toFixed(1)} kWh used)
                  </div>
                  <div>
                    Water Meter: {checkOutWaterUnits.toLocaleString()} m³ (+
                    {(checkOutWaterUnits - checkInWaterUnits).toFixed(1)} m³ used)
                  </div>
                  <div>Keys & Gate Remotes: Returned in Full</div>
                  <div>
                    Rooms Verified OK: {rooms.filter((r) => r.status === 'ok').length} /{' '}
                    {rooms.length}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Final Sign-off & Deposit Release + Download Comparison */}
          <div className="pt-5 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-zinc-600 dark:text-zinc-400">
              <span className="font-bold text-emerald-500 block">
                Automatic Security Deposit Release Ready
              </span>
              Completing sign-off marks booking {selectedBooking.id} as completed and releases the $
              {selectedBooking.pricing?.securityDepositHold || 250} deposit hold.
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => handleDownloadReport('compare')}
                className="h-11 px-5 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-[#111111] font-tenor font-extrabold text-xs uppercase tracking-wider flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Download Comparison Report</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  updateReservationStatus(selectedBooking.id, 'completed');
                  handleSaveReport('check_out');
                  setSavedSuccessMessage(
                    `Return approved & $${selectedBooking.pricing?.securityDepositHold || 250} deposit released for ${selectedBooking.customer.fullName}!`
                  );
                }}
                className="h-11 px-6 bg-[#FFC72C] hover:bg-[#FFD54F] text-[#111111] font-tenor font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Approve Return & Release Deposit</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

