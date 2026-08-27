import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useLanguage } from "@/context/LanguageContext";
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
  const { t } = useLanguage();
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
        localStorage.setItem(
          "memberApprovalStatus",
          res.data.approval_status || "pending"
        );
        localStorage.setItem(
          "memberApprovalReason",
          res.data.rejection_reason || ""
        );
      }
    } catch (err) {
      console.error("Failed to load profile:", err);
      toast.error(t("loadProfileFailed"));
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
        const saved = res.data || {};
        const completed = !!saved.profile_completed;
        const approvalStatus = saved.approval_status || "pending";

        localStorage.setItem(
          "isProfileCompleted",
          completed ? "true" : "false"
        );
        localStorage.setItem("memberApprovalStatus", approvalStatus);
        localStorage.setItem("memberApprovalReason", saved.rejection_reason || "");

        setProfileData(saved);

        if (completed) {
          window.dispatchEvent(new Event("profileCompleted"));
          toast.success(
            approvalStatus === "approved"
              ? t("profileApprovedRedirect")
              : t("profileSubmittedToast")
          );
          if (approvalStatus === "approved") {
            setTimeout(() => {
              navigate("/dashboard", { replace: true });
            }, 400);
          }
        } else {
          toast.success(t("profileSavedPartial"));
        }
      }
    } catch (err) {
      console.error("Save profile error:", err);
      const errMsg =
        err?.response?.data?.message ||
        err?.message ||
        t("saveProfileFailed");
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
          {t("loadingPersonalDetails")}
        </p>
      </div>
    );
  }

  const isCompleted = profileData?.profile_completed || false;
  const percentage = profileData?.completion_percentage || 0;
  const approvalStatus = profileData?.approval_status || "pending";
  const rejectionReason = profileData?.rejection_reason || "";

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Approval Status Banner */}
      {approvalStatus !== "approved" && (
        <div
          className={`rounded-2xl border p-5 flex items-start gap-4 ${approvalStatus === "rejected"
            ? "border-rose-500/40 bg-rose-500/10"
            : "border-amber-500/40 bg-amber-500/10"
            }`}
        >
          <div
            className={`p-2.5 rounded-xl shrink-0 ${approvalStatus === "rejected"
              ? "bg-rose-500/15 text-rose-600"
              : "bg-amber-500/15 text-amber-600"
              }`}
          >
            {approvalStatus === "rejected" ? (
              <AlertCircle className="w-6 h-6" />
            ) : isCompleted ? (
              <ShieldCheck className="w-6 h-6" />
            ) : (
              <AlertCircle className="w-6 h-6" />
            )}
          </div>
          <div className="flex-1">
            {!isCompleted ? (
              <>
                <h2 className="text-lg font-bold text-amber-600">
                  {t("profileIncompleteLocked")}
                </h2>
                <p className="text-sm text-foreground/80 mt-1">
                  {t("profileIncompleteMsg")}
                </p>
                <p className="text-xs text-foreground/70 mt-2 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" /> {t("profileOnlyAccessMsg")}
                </p>
              </>
            ) : approvalStatus === "rejected" ? (
              <>
                <h2 className="text-lg font-bold text-rose-600">
                  {t("profileRejected")}
                </h2>
                <p className="text-sm text-foreground/80 mt-1">
                  {t("profileRejectedMsg")}
                </p>
                {rejectionReason && (
                  <div className="mt-3 rounded-xl border border-rose-500/30 bg-background/60 p-3 text-sm">
                    <span className="font-semibold">{t("reasonLabel")}</span>
                    {rejectionReason}
                  </div>
                )}
                <p className="text-xs text-foreground/70 mt-3">
                  {t("profileResubmitMsg")}
                </p>
              </>
            ) : (
              <>
                <h2 className="text-lg font-bold text-amber-600">
                  {t("profileSubmittedPending")}
                </h2>
                <p className="text-sm text-foreground/80 mt-1">
                  {t("profileSubmittedMsg")}
                </p>
                <p className="text-xs text-foreground/70 mt-2 flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> {t("profileEditAnytimeMsg")}
                </p>
              </>
            )}
          </div>
        </div>
      )}
      {/* Header Banner */}
      <div className="rounded-2xl border border-border bg-gradient-to-r from-emerald-950/20 via-background to-amber-950/10 p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-primary/10 text-primary">
                <User className="w-6 h-6" />
              </span>
              <h1 className="text-2xl font-bold tracking-tight">
                {t("memberProfileTitle")}
              </h1>
            </div>
            <p className="text-sm text-muted-foreground max-w-xl">
              {t("memberProfileSubtitle")}
            </p>
          </div>

          {/* Completion Status Badge */}
          <div className="flex flex-col items-start md:items-end gap-2 bg-background/80 backdrop-blur-sm p-4 rounded-xl border border-border shrink-0">
            <div className="flex items-center gap-2">
              {isCompleted ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {t("profileComplete100")}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 border border-amber-500/20 animate-pulse">
                  <AlertCircle className="w-3.5 h-3.5" /> {t("setupRequired")} ({percentage}%)
                </span>
              )}
            </div>

            {/* Progress Bar */}
            <div className="w-48 bg-muted rounded-full h-2.5 overflow-hidden border border-border">
              <div
                className={`h-full transition-all duration-500 rounded-full ${isCompleted ? "bg-emerald-500" : "bg-gradient-to-r from-amber-500 to-primary"
                  }`}
                style={{ width: `${isCompleted ? 100 : percentage || 15}%` }}
              />
            </div>
          </div>
        </div>

        {!isCompleted && (
          <div className="mt-4 pt-4 border-t border-border/50 flex items-center gap-2 text-xs text-amber-600 font-medium">
            <Sparkles className="w-4 h-4 shrink-0" />
            {t("noteRequiredFields")}
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
              <h2 className="text-lg font-bold">{t("franchiseSection")}</h2>
              <p className="text-xs text-muted-foreground">
                {t("franchiseSectionDesc")}
              </p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {/* Distributor ID */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                {t("distributorId")}
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
                {t("memberName")} <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                placeholder={t("phFullMemberName")}
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
                {t("branchName")}
              </label>
              <input
                type="text"
                placeholder={t("phRegionalBranch")}
                {...register("branch_name")}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
              />
            </div>

            {/* Store Name */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                {t("storeName")}
              </label>
              <input
                type="text"
                placeholder={t("phStoreName")}
                {...register("store_name")}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
              />
            </div>

            {/* State */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                {t("stateLabel")} <span className="text-destructive">*</span>
              </label>
              <select
                {...register("state")}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
              >
                <option value="">{t("phSelectState")}</option>
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
                {t("cityLabel")} <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                placeholder={t("phCityTown")}
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
                {t("districtLabel")} <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                placeholder={t("phDistrict")}
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
                {t("areaLabel")}
              </label>
              <input
                type="text"
                placeholder={t("phSubDistrict")}
                {...register("area")}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
              />
            </div>

            {/* Franchise Type */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                {t("franchiseType")} <span className="text-destructive">*</span>
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
                {t("underGroup")} <span className="text-destructive">*</span>
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
                {t("franchiseCode")}
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
                {t("contactPersonName")} <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                placeholder={t("phFullName")}
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
                {t("phoneNumber")} <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                maxLength={10}
                placeholder={t("phPhone")}
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
                {t("emailAddress")} <span className="text-destructive">*</span>
              </label>
              <input
                type="email"
                placeholder={t("phEmail")}
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
                {t("pinCode")} <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                maxLength={6}
                placeholder={t("phPinCode")}
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
                {t("fullAddress")} <span className="text-destructive">*</span>
              </label>
              <textarea
                rows={2}
                placeholder={t("phAddress")}
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
              <h2 className="text-lg font-bold">{t("bankSection")}</h2>
              <p className="text-xs text-muted-foreground">
                {t("bankSectionDesc")}
              </p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {/* Account Holder Name */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                {t("accountHolderName")} <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                placeholder={t("phAccountName")}
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
                {t("bankName")} <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                placeholder={t("phBankName")}
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
                {t("accountNumber")} <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                placeholder={t("phAccountNumber")}
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
                {t("accountType")} <span className="text-destructive">*</span>
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
                {t("ifscCode")} <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                maxLength={11}
                placeholder={t("phIfscCode")}
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
                {t("branchAddress")}
              </label>
              <input
                type="text"
                placeholder={t("phBranchCity")}
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
              <h2 className="text-lg font-bold">{t("loginSection")}</h2>
              <p className="text-xs text-muted-foreground">
                {t("loginSectionDesc")}
              </p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {/* New Password */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                {t("newPassword")}
              </label>
              <input
                type="password"
                placeholder={t("phPassword")}
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
                {t("confirmNewPassword")}
              </label>
              <input
                type="password"
                placeholder={t("phConfirmPassword")}
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
            {t("doubleCheckMsg")}
          </p>
          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto ml-auto px-8 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition flex items-center justify-center gap-2 shadow-md cursor-pointer"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> {t("savingDetails")}
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> {t("saveCompleteProfile")}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
