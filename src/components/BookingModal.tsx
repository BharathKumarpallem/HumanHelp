import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProviderProfile, ProviderService, DeliveryMode } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  X, 
  Calendar, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  DollarSign,
  ChevronRight,
  ArrowLeft,
  Truck,
  Activity,
  Video,
  Home
} from 'lucide-react';

interface BookingModalProps {
  provider: ProviderProfile;
  preselectedServiceId?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  provider,
  preselectedServiceId,
  onClose,
  onSuccess
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const services = provider.services || [];
  const initialService = services.find(s => s.id === preselectedServiceId) || services[0];

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedService, setSelectedService] = useState<ProviderService | undefined>(initialService);
  const [date, setDate] = useState<string>('2026-10-15');
  const [timeSlot, setTimeSlot] = useState<string>('10:00 AM - 12:00 PM');
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>(initialService?.deliveryMode || 'home_visit');
  const [address, setAddress] = useState<string>(user?.location || '428 Elm Street, Apt 3B, Downtown');
  const [problemDescription, setProblemDescription] = useState<string>('');
  const [specialRequirements, setSpecialRequirements] = useState<string>('');
  const [prescriptionNote, setPrescriptionNote] = useState<string>('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [bookingConfirmedId, setBookingConfirmedId] = useState<string | null>(null);

  const availableSlots = [
    '08:30 AM - 10:00 AM',
    '10:00 AM - 12:00 PM',
    '01:00 PM - 03:00 PM',
    '03:30 PM - 05:00 PM',
    '05:00 PM - 06:30 PM'
  ];

  const basePrice = selectedService ? selectedService.basePrice : provider.startingRate;
  const platformFee = Number((basePrice * 0.05).toFixed(2));
  const totalAmount = Number((basePrice + platformFee).toFixed(2));

  const isPharmacyService = selectedService?.categoryId === 'cat-pharmacy' || selectedService?.requiresPrescription;
  const isHealthcareService = selectedService?.categoryId === 'cat-health' || provider.isMedicalProfessional;

  const handleCreateBooking = async () => {
    if (!selectedService || !user) return;
    if (!problemDescription.trim()) {
      setErrorMessage('Please provide a short description of the problem or service request.');
      return;
    }
    if (isPharmacyService && !prescriptionNote.trim()) {
      setErrorMessage('Please provide your prescription reference number, pharmacy on file, or prescribing physician name.');
      return;
    }
    if (!termsAccepted) {
      setErrorMessage('Please agree to the service terms and cancellation policy.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const locationMapping: 'in_person' | 'remote' | 'delivery' = 
        deliveryMode === 'online_consultation' ? 'remote' : 
        deliveryMode === 'delivery' ? 'delivery' : 'in_person';

      const created = await api.bookings.create({
        customerId: user.id,
        providerId: provider.id,
        serviceId: selectedService.id,
        date,
        timeSlot,
        locationType: locationMapping,
        serviceAddress: deliveryMode === 'online_consultation' ? 'Secure Telehealth / Remote Video Room' : address,
        problemDescription: isPharmacyService && prescriptionNote 
          ? `${problemDescription}\n[Prescription/Rx Reference: ${prescriptionNote}]` 
          : problemDescription,
        requirements: specialRequirements || undefined,
      });

      setBookingConfirmedId(created.id);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit booking request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <img
              src={provider.avatarUrl}
              alt={provider.businessName}
              className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
            />
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                Book with {provider.businessName}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isHealthcareService ? '🏥 Licensed Healthcare Service' : isPharmacyService ? '🚑 Medical Delivery' : `Starting rate: $${provider.startingRate}/${provider.pricingType}`} • Step {bookingConfirmedId ? 4 : step} of 4
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {/* Healthcare Safety Notice Banner */}
          {isHealthcareService && (
            <div className="mb-4 p-3 rounded-xl bg-cyan-50/80 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800 text-[11px] text-cyan-950 dark:text-cyan-200 flex items-start gap-2">
              <Activity className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <strong>Healthcare Consultation Notice:</strong> This appointment is with a verified licensed medical professional ({provider.verificationBadgeLabel}). For acute emergencies (severe chest pain, uncontrolled bleeding, difficulty breathing), immediately dial 911 or 112.
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-800 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {bookingConfirmedId ? (
            /* Success confirmation screen */
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 stroke-[2.2]" />
              </div>
              <h4 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {isPharmacyService ? 'Prescription Order Dispatched!' : 'Booking Request Submitted!'}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                Your request for <strong>{selectedService?.title}</strong> on <strong>{date} ({timeSlot})</strong> has been dispatched to {provider.businessName}. You will receive status updates and tracking details.
              </p>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-xs text-left max-w-sm mx-auto space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Booking Reference:</span>
                  <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">{bookingConfirmedId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Service Format:</span>
                  <span className="font-semibold capitalize text-slate-800 dark:text-slate-200">{deliveryMode.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Price Estimate:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">${totalAmount}</span>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-center gap-3">
                <button
                  onClick={() => {
                    onClose();
                    navigate('/bookings');
                  }}
                  className="btn-primary text-xs px-5"
                >
                  View in My Bookings
                </button>
                <button
                  onClick={onClose}
                  className="btn-secondary text-xs px-4"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* STEP 1: Select Service */}
              {step === 1 && (
                <div className="space-y-4">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    1. Select Service Package
                  </h4>
                  <div className="space-y-2.5">
                    {services.map((srv) => (
                      <div
                        key={srv.id}
                        onClick={() => {
                          setSelectedService(srv);
                          setDeliveryMode(srv.deliveryMode);
                        }}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                          selectedService?.id === srv.id
                            ? 'border-brand-500 bg-brand-50/40 dark:bg-brand-950/30 ring-1 ring-brand-500/30'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                            {srv.title}
                          </span>
                          <span className="font-bold text-brand-700 dark:text-brand-300 text-sm">
                            ${srv.basePrice} {srv.pricingModel === 'hourly' ? '/hr' : 'flat'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                          {srv.description}
                        </p>
                        <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-3">
                          <span className="capitalize font-medium text-slate-600 dark:text-slate-300">
                            Format: {srv.deliveryMode.replace('_', ' ')}
                          </span>
                          <span>•</span>
                          <span>Est. duration: {srv.durationMinutes || 60} mins</span>
                          {srv.requiresPrescription && (
                            <>
                              <span>•</span>
                              <span className="text-amber-600 font-bold">Rx Required</span>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 2: Pick Date & Delivery Format */}
              {step === 2 && (
                <div className="space-y-5">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    2. Choose Date, Slot & Service Delivery Format
                  </h4>

                  {/* Delivery Format selector */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Service Delivery Format
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setDeliveryMode('home_visit')}
                        className={`p-2.5 rounded-xl border text-xs font-medium flex items-center gap-2 ${
                          deliveryMode === 'home_visit'
                            ? 'border-brand-500 bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 ring-1 ring-brand-500/30'
                            : 'border-slate-200 dark:border-slate-800 text-slate-600'
                        }`}
                      >
                        <Home className="w-3.5 h-3.5" />
                        <span>Home Visit / On-Site</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeliveryMode('online_consultation')}
                        className={`p-2.5 rounded-xl border text-xs font-medium flex items-center gap-2 ${
                          deliveryMode === 'online_consultation'
                            ? 'border-brand-500 bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 ring-1 ring-brand-500/30'
                            : 'border-slate-200 dark:border-slate-800 text-slate-600'
                        }`}
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Online Consultation</span>
                      </button>

                      {isPharmacyService && (
                        <button
                          type="button"
                          onClick={() => setDeliveryMode('delivery')}
                          className={`p-2.5 rounded-xl border text-xs font-medium col-span-2 flex items-center justify-center gap-2 ${
                            deliveryMode === 'delivery'
                              ? 'border-brand-500 bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 ring-1 ring-brand-500/30'
                              : 'border-slate-200 dark:border-slate-800 text-slate-600'
                          }`}
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>Express Courier Delivery to Address</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Service Date
                    </label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Available Time Slots
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {availableSlots.map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setTimeSlot(slot)}
                          className={`p-2.5 rounded-xl border text-xs text-left font-medium transition-all ${
                            timeSlot === slot
                              ? 'border-brand-500 bg-brand-50/60 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 ring-1 ring-brand-500/30'
                              : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 opacity-70" />
                            <span>{slot}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Details & Prescription Safeguards */}
              {step === 3 && (
                <div className="space-y-4">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    3. Location & Case Information
                  </h4>

                  {deliveryMode !== 'online_consultation' && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                        {deliveryMode === 'delivery' ? 'Delivery Address' : 'Service Address'}
                      </label>
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Street address, apartment/suite, city"
                        className="input-field"
                      />
                    </div>
                  )}

                  {/* Prescription Safeguard Input */}
                  {isPharmacyService && (
                    <div className="p-3.5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800 space-y-2">
                      <label className="block text-xs font-bold text-indigo-950 dark:text-indigo-200">
                        Prescription (Rx) Reference & Doctor Details <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={prescriptionNote}
                        onChange={(e) => setPrescriptionNote(e.target.value)}
                        placeholder="e.g. Rx #882910 on file at Metro Health or Dr. Thorne referral"
                        className="input-field"
                      />
                      <p className="text-[10px] text-indigo-800/80 dark:text-indigo-300/80 leading-relaxed">
                        🔒 Regulated medications require pharmacy prescription verification prior to courier dispatch. Patient details are stored under medical privacy safeguards.
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Service Description / Notes <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      value={problemDescription}
                      onChange={(e) => setProblemDescription(e.target.value)}
                      placeholder="Please describe symptoms, maintenance needs, equipment model, or specific instructions..."
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Special Access / Gate Notes (Optional)
                    </label>
                    <input
                      type="text"
                      value={specialRequirements}
                      onChange={(e) => setSpecialRequirements(e.target.value)}
                      placeholder="e.g. Building entrance code, parking spot, pets"
                      className="input-field"
                    />
                  </div>
                </div>
              )}

              {/* STEP 4: Review Pricing & Cancellation Terms */}
              {step === 4 && (
                <div className="space-y-4">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    4. Pricing Breakdown & Escrow Agreement
                  </h4>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Service Fee:</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">${basePrice}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Platform Trust & Escrow Fee (5%):</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">${platformFee}</span>
                    </div>
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between text-sm font-bold">
                      <span className="text-slate-900 dark:text-slate-100">Total Booking Estimate:</span>
                      <span className="text-brand-700 dark:text-brand-300">${totalAmount}</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 text-xs text-amber-900 dark:text-amber-200 space-y-1">
                    <div className="font-semibold flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-amber-600" />
                      Fair Cancellation Policy
                    </div>
                    <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
                      {selectedService?.cancellationPolicy || 'Free cancellation up to 24 hours prior.'} Payments are protected by platform escrow until you confirm the service is completed.
                    </p>
                  </div>

                  <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-700 dark:text-slate-300 pt-2">
                    <input
                      type="checkbox"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="mt-0.5 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                    />
                    <span>
                      I understand that this request is subject to provider confirmation and accept HumanHelp's safety and pricing terms.
                    </span>
                  </label>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Footer Controls */}
        {!bookingConfirmedId && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((step - 1) as any)}
                className="btn-secondary text-xs px-3.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={() => {
                  if (step === 3 && !problemDescription.trim()) {
                    setErrorMessage('Please describe the problem or service needs.');
                    return;
                  }
                  if (step === 3 && isPharmacyService && !prescriptionNote.trim()) {
                    setErrorMessage('Please provide prescription reference details.');
                    return;
                  }
                  setErrorMessage(null);
                  setStep((step + 1) as any);
                }}
                className="btn-primary text-xs px-4"
              >
                <span>Continue</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                disabled={isSubmitting || !termsAccepted}
                onClick={handleCreateBooking}
                className="btn-primary text-xs px-5 shadow-sm"
              >
                {isSubmitting ? 'Submitting...' : 'Confirm Booking Request'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
