import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  User,
  Building2,
  Building,
  CreditCard,
  Lock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Save,
  MapPin,
  Phone,
  Mail,
  Sparkles,
} from "lucide-react";
import {
  memberProfileSchema,
  INDIA_STATES,
  FRANCHISE_TYPES,
  UNDER_GROUPS,
  ACCOUNT_TYPES,
} from "@/schemas/memberProfileSchema";
import { memberProfileService } from "@/services/memberProfileService";

export default function MemberProfilePage() {
  const navigate = useNavigate();
  const [initialLoading, setInitialLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [profileData, setProfileData] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(memberProfileSchema),
    defaultValues: {
      distributor_id: "",
      franchise_code: "",
      member_name: "",
      branch_name: "",
      store_name: "",
      state: "",
      city: "",
      district: "",
      area: "",
      franchise_type: "Standard Distributor",
      under_group: "General Group",
      contact_person: "",
      phone: "",
      email: "",
      address: "",
      pincode: "",
      account_name: "",
      bank_name: "",
      account_number: "",
      account_type: "Savings",
      ifsc_code: "",
      branch_address: "",
      password: "",
      confirm_password: "",
    },
  });

  // Load existing or draft profile from server
  const loadProfile = async () => {
    try {
      setInitialLoading(true);
      const res = await memberProfileService.getProfile();
      if (res.success && res.data) {
        setProfileData(res.data);
        reset({
          distributor_id: res.data.distributor_id || "",
          franchise_code: res.data.franchise_code || "",
          member_name: res.data.member_name || "",
          branch_name: res.data.branch_name || "",
          store_name: res.data.store_name || "",
          state: res.data.state || "",
          city: res.data.city || "",
          district: res.data.district || "",
          area: res.data.area || "",
          franchise_type: res.data.franchise_type || "Standard Distributor",
          under_group: res.data.under_group || "General Group",
          contact_person: res.data.contact_person || "",
          phone: res.data.phone || "",
          email: res.data.email || "",
          address: res.data.address || "",
          pincode: res.data.pincode || "",
          account_name: res.data.account_name || "",
          bank_name: res.data.bank_name || "",
          account_number: res.data.account_number || "",
          account_type: res.data.account_type || "Savings",
          ifsc_code: res.data.ifsc_code || "",
          branch_address: res.data.branch_address || "",
          password: "",
          confirm_password: "",
        });

        // Store profile status in localStorage for fast route guards
        localStorage.setItem(
          "isProfileCompleted",
          res.data.profile_completed ? "true" : "false"
        );
      }
    } catch (err) {
      console.error("Failed to load profile:", err);
      toast.error("Failed to load member profile details");
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const onSubmit = async (data) => {
    try {
      setSubmitting(true);
      const res = await memberProfileService.saveProfile(data);
      if (res.success) {
        toast.success("✅ Profile completed and saved successfully!");
        localStorage.setItem("isProfileCompleted", "true");
        window.dispatchEvent(new Event("profileCompleted"));

        // Redirect smoothly to dashboard
        setTimeout(() => {
          navigate("/dashboard", { replace: true });
        }, 400);
      }
    } catch (err) {
      console.error("Save profile error:", err);
      const errMsg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to save profile. Please check all fields.";
      toast.error(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-sm text-muted-foreground font-medium">
          Loading your personal details…
        </p>
      </div>
    );
  }

  const isCompleted = profileData?.profile_completed || false;
  const percentage = profileData?.completion_percentage || 0;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Header Banner */}
      <div className="rounded-2xl border border-border bg-gradient-to-r from-emerald-950/20 via-background to-amber-950/10 p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-primary/10 text-primary">
                <User className="w-6 h-6" />
              </span>
              <h1 className="text-2xl font-bold tracking-tight">
                Member Profile & Personal Details
              </h1>
            </div>
            <p className="text-sm text-muted-foreground max-w-xl">
              Complete your Franchise, Bank & Contact details to activate your
              member account and unlock full portal access.
            </p>
          </div>

          {/* Completion Status Badge */}
          <div className="flex flex-col items-start md:items-end gap-2 bg-background/80 backdrop-blur-sm p-4 rounded-xl border border-border shrink-0">
            <div className="flex items-center gap-2">
              {isCompleted ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Profile Complete (100%)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 border border-amber-500/20 animate-pulse">
                  <AlertCircle className="w-3.5 h-3.5" /> Setup Required ({percentage}%)
                </span>
              )}
            </div>

            {/* Progress Bar */}
            <div className="w-48 bg-muted rounded-full h-2.5 overflow-hidden border border-border">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  isCompleted ? "bg-emerald-500" : "bg-gradient-to-r from-amber-500 to-primary"
                }`}
                style={{ width: `${isCompleted ? 100 : percentage || 15}%` }}
              />
            </div>
          </div>
        </div>

        {!isCompleted && (
          <div className="mt-4 pt-4 border-t border-border/50 flex items-center gap-2 text-xs text-amber-600 font-medium">
            <Sparkles className="w-4 h-4 shrink-0" />
            Note: All required fields marked with an asterisk (*) must be completed to proceed to your dashboard.
          </div>
        )}
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* SECTION A: FRANCHISE DETAILS */}
        <div className="rounded-2xl border border-border bg-card p-6 md:p-8 space-y-6 shadow-xs">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-600">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">A. Franchise & Personal Details</h2>
              <p className="text-xs text-muted-foreground">
                Your distributor information, contact address, and franchise group settings.
              </p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {/* Distributor ID */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                Distributor ID (Auto / Read-Only)
              </label>
              <input
                type="text"
                readOnly
                {...register("distributor_id")}
                className="w-full rounded-xl border border-border bg-muted/60 px-4 py-2.5 text-sm font-mono font-semibold text-foreground outline-none cursor-not-allowed opacity-90"
              />
            </div>

            {/* Member Name */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                Member Name <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                placeholder="Full Member Name"
                {...register("member_name")}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
              />
              {errors.member_name && (
                <p className="text-xs text-destructive mt-1 font-medium">
                  {errors.member_name.message}
                </p>
              )}
            </div>

            {/* Branch Name */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                Branch Name
              </label>
              <input
                type="text"
                placeholder="Regional Branch"
                {...register("branch_name")}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
              />
            </div>

            {/* Store Name */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                Store / Outlet Name
              </label>
              <input
                type="text"
                placeholder="Store Name (if applicable)"
                {...register("store_name")}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
              />
            </div>

            {/* State */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                State <span className="text-destructive">*</span>
              </label>
              <select
                {...register("state")}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
              >
                <option value="">-- Select State --</option>
                {INDIA_STATES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
              {errors.state && (
                <p className="text-xs text-destructive mt-1 font-medium">
                  {errors.state.message}
                </p>
              )}
            </div>

            {/* City */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                City <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                placeholder="City / Town"
                {...register("city")}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
              />
              {errors.city && (
                <p className="text-xs text-destructive mt-1 font-medium">
                  {errors.city.message}
                </p>
              )}
            </div>

            {/* District */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                District <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                placeholder="District"
                {...register("district")}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
              />
              {errors.district && (
                <p className="text-xs text-destructive mt-1 font-medium">
                  {errors.district.message}
                </p>
              )}
            </div>

            {/* Area */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                Area / Locality
              </label>
              <input
                type="text"
                placeholder="Sub-district or Area"
                {...register("area")}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
              />
            </div>

            {/* Franchise Type */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                Franchise Type <span className="text-destructive">*</span>
              </label>
              <select
                {...register("franchise_type")}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
              >
                {FRANCHISE_TYPES.map((ft) => (
                  <option key={ft} value={ft}>
                    {ft}
                  </option>
                ))}
              </select>
            </div>

            {/* Under Group */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                Under Group <span className="text-destructive">*</span>
              </label>
              <select
                {...register("under_group")}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
              >
                {UNDER_GROUPS.map((ug) => (
                  <option key={ug} value={ug}>
                    {ug}
                  </option>
                ))}
              </select>
            </div>

            {/* Franchise Code */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                Franchise Code (Auto / Read-Only)
              </label>
              <input
                type="text"
                readOnly
                {...register("franchise_code")}
                className="w-full rounded-xl border border-border bg-muted/60 px-4 py-2.5 text-sm font-mono font-semibold text-foreground outline-none cursor-not-allowed opacity-90"
              />
            </div>

            {/* Contact Person Name */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                Contact Person Name <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                placeholder="Full Name"
                {...register("contact_person")}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
              />
              {errors.contact_person && (
                <p className="text-xs text-destructive mt-1 font-medium">
                  {errors.contact_person.message}
                </p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                Phone Number (10 Digits) <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                maxLength={10}
                placeholder="9876543210"
                {...register("phone")}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
              />
              {errors.phone && (
                <p className="text-xs text-destructive mt-1 font-medium">
                  {errors.phone.message}
                </p>
              )}
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                Email Address <span className="text-destructive">*</span>
              </label>
              <input
                type="email"
                placeholder="member@example.com"
                {...register("email")}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
              />
              {errors.email && (
                <p className="text-xs text-destructive mt-1 font-medium">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* PIN Code */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                PIN Code (6 Digits) <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                maxLength={6}
                placeholder="400001"
                {...register("pincode")}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
              />
              {errors.pincode && (
                <p className="text-xs text-destructive mt-1 font-medium">
                  {errors.pincode.message}
                </p>
              )}
            </div>

            {/* Full Address */}
            <div className="sm:col-span-2 lg:col-span-3">
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                Full Address <span className="text-destructive">*</span>
              </label>
              <textarea
                rows={2}
                placeholder="Street address, building, landmark..."
                {...register("address")}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
              />
              {errors.address && (
                <p className="text-xs text-destructive mt-1 font-medium">
                  {errors.address.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* SECTION B: BANK INFORMATION */}
        <div className="rounded-2xl border border-border bg-card p-6 md:p-8 space-y-6 shadow-xs">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">B. Bank Information</h2>
              <p className="text-xs text-muted-foreground">
                Your bank payout account details for payouts, commissions, and franchise settlements.
              </p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {/* Account Holder Name */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                Account Holder Name <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                placeholder="Name as per Bank Passbook"
                {...register("account_name")}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
              />
              {errors.account_name && (
                <p className="text-xs text-destructive mt-1 font-medium">
                  {errors.account_name.message}
                </p>
              )}
            </div>

            {/* Bank Name */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                Bank Name <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. State Bank of India, HDFC Bank"
                {...register("bank_name")}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
              />
              {errors.bank_name && (
                <p className="text-xs text-destructive mt-1 font-medium">
                  {errors.bank_name.message}
                </p>
              )}
            </div>

            {/* Account Number */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                Account Number <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                placeholder="Bank Account Number"
                {...register("account_number")}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
              />
              {errors.account_number && (
                <p className="text-xs text-destructive mt-1 font-medium">
                  {errors.account_number.message}
                </p>
              )}
            </div>

            {/* Account Type */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                Account Type <span className="text-destructive">*</span>
              </label>
              <select
                {...register("account_type")}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
              >
                {ACCOUNT_TYPES.map((at) => (
                  <option key={at} value={at}>
                    {at}
                  </option>
                ))}
              </select>
            </div>

            {/* IFSC Code */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                IFSC Code <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                maxLength={11}
                placeholder="e.g. SBIN0001234"
                {...register("ifsc_code")}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm uppercase outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
              />
              {errors.ifsc_code && (
                <p className="text-xs text-destructive mt-1 font-medium">
                  {errors.ifsc_code.message}
                </p>
              )}
            </div>

            {/* Branch Address */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                Branch Address / City
              </label>
              <input
                type="text"
                placeholder="Bank Branch City"
                {...register("branch_address")}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
              />
            </div>
          </div>
        </div>

        {/* SECTION C: LOGIN INFORMATION */}
        <div className="rounded-2xl border border-border bg-card p-6 md:p-8 space-y-6 shadow-xs">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold">C. Login & Security Information</h2>
              <p className="text-xs text-muted-foreground">
                Optional: Update your account password if you wish to change it now.
              </p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {/* New Password */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                New Password (Optional, Min 8 Chars)
              </label>
              <input
                type="password"
                placeholder="Leave blank to keep current password"
                {...register("password")}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
              />
              {errors.password && (
                <p className="text-xs text-destructive mt-1 font-medium">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                Confirm New Password
              </label>
              <input
                type="password"
                placeholder="Re-enter new password"
                {...register("confirm_password")}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
              />
              {errors.confirm_password && (
                <p className="text-xs text-destructive mt-1 font-medium">
                  {errors.confirm_password.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-between gap-4 p-4 rounded-2xl border border-border bg-card shadow-lg sticky bottom-6 z-10 backdrop-blur-md">
          <p className="text-xs text-muted-foreground hidden sm:block">
            Please double-check your bank account and phone details before saving.
          </p>
          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto ml-auto px-8 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition flex items-center justify-center gap-2 shadow-md cursor-pointer"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Saving Details…
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Save & Complete Profile
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
