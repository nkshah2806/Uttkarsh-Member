import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import axiosInstance from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { scanPricingService } from "@/services/scanPricingService";
import ScanPricingSelectionModal from "@/components/ScanPricingSelectionModal";
import {
  UserPlus,
  ArrowRight,
  Activity,
  X,
  Scale,
  Ruler,
  MapPin,
  Calendar,
  Plus,
  Pencil,
  Trash2,
  AlertTriangle,
  Eye,
  CheckCircle2,
  Clock,
  FileText,
  User,
  Phone,
  Mail,
} from "lucide-react";
import { toast } from "sonner";
import ReusableTable from "@/components/ReusableTable";
import LocalizedText from "@/components/LocalizedText";

export default function PatientRegistration() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Modals state
  const [showModal, setShowModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [deletingPatient, setDeletingPatient] = useState(null);

  // Scan pricing selection state (only used when multiple active prices exist)
  const [pricingOptions, setPricingOptions] = useState([]);
  const [pricingModalOpen, setPricingModalOpen] = useState(false);
  const [startingScan, setStartingScan] = useState(false);
  const [pendingScanPatientId, setPendingScanPatientId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    age: "",
    gender: "Male",
    mobile: "",
    dob: "",
    email: "",
    weight: "",
    weight_unit: "kg",
    height: "",
    height_unit: "cm",
    address: "",
  });

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("v1/patients");
      setPatients(res.data.data || []);
    } catch (err) {
      toast.error(t("demo.patientRegistration.toastLoadFailed"));
    } finally {
      setLoading(false);
    }
  };

  const openRegisterModal = () => {
    setEditingPatient(null);
    setForm({
      name: "",
      age: "",
      gender: "Male",
      mobile: "",
      dob: "",
      email: "",
      weight: "",
      weight_unit: "kg",
      height: "",
      height_unit: "cm",
      address: "",
    });
    setShowModal(true);
  };

  const openEditModal = (patient) => {
    setEditingPatient(patient);
    setForm({
      name: patient.name || "",
      age: patient.age || "",
      gender: patient.gender || "Male",
      mobile: patient.mobile || "",
      dob: patient.dob ? new Date(patient.dob).toISOString().split("T")[0] : "",
      email: patient.email || "",
      weight: patient.weight !== null && patient.weight !== undefined ? patient.weight : "",
      weight_unit: patient.weight_unit || "kg",
      height: patient.height !== null && patient.height !== undefined ? patient.height : "",
      height_unit: patient.height_unit || "cm",
      address: patient.address || "",
    });
    setShowModal(true);
  };

  const handleSavePatient = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);

      if (editingPatient) {
        // Edit Patient
        await axiosInstance.put(`v1/patients/${editingPatient._id}`, form);
        toast.success(
          t("demo.patientRegistration.toastUpdated", { code: editingPatient.patient_code })
        );
        setShowModal(false);
        fetchPatients();
      } else {
        // Create Patient
        const patientRes = await axiosInstance.post("v1/patients", form);
        const newPatient = patientRes.data.data;
        toast.success(
          t("demo.patientRegistration.toastRegistered", { code: newPatient.patient_code })
        );

        setShowModal(false);
        setSubmitting(false);
        fetchPatients();

        // Create Visit & Navigate to Quantum Scan (price-aware)
        await choosePricingAndStartScan(newPatient._id);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || t("demo.patientRegistration.toastSaveFailed"));
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDeletePatient = async () => {
    if (!deletingPatient) return;
    try {
      await axiosInstance.delete(`v1/patients/${deletingPatient._id}`);
      toast.success(
        t("demo.patientRegistration.toastDeleted", { code: deletingPatient.patient_code })
      );
      setDeletingPatient(null);
      fetchPatients();
    } catch (err) {
      toast.error(err.response?.data?.message || t("demo.patientRegistration.toastDeleteFailed"));
    }
  };

  const launchVisit = async (patientId, scanPricingId) => {
    try {
      setStartingScan(true);
      const visitRes = await axiosInstance.post("v1/visits", {
        patient_id: patientId,
        scan_pricing_id: scanPricingId,
      });
      navigate(`/quantum-scan/${visitRes.data.data._id}`);
    } catch (err) {
      toast.error(t("demo.patientRegistration.toastScanStartFailed"));
      setStartingScan(false);
    }
  };

  const choosePricingAndStartScan = async (patientId) => {
    try {
      setStartingScan(true);
      const pricings = await scanPricingService.getActiveScanPricings();
      if (pricings.length === 0) {
        toast.info(t("demo.patientRegistration.toastNoActivePrice"));
        await launchVisit(patientId, undefined);
        return;
      }
      const defaultPricing = pricings.find((p) => p.is_default);
      if (defaultPricing || pricings.length === 1) {
        // Single active price (or an explicit default) is auto-selected.
        await launchVisit(patientId, (defaultPricing || pricings[0])._id);
        return;
      }
      // Multiple active prices with no explicit default -> let the consultant pick.
      setPendingScanPatientId(patientId);
      setPricingOptions(pricings);
      setPricingModalOpen(true);
      setStartingScan(false);
    } catch (err) {
      toast.error(t("demo.patientRegistration.toastScanStartFailed"));
      setStartingScan(false);
    }
  };

  const startNewScan = async (patientId) => {
    await choosePricingAndStartScan(patientId);
  };

  const handleConfirmPricing = async (pricingId) => {
    if (!pendingScanPatientId) return;
    const patientId = pendingScanPatientId;
    setPricingModalOpen(false);
    setPendingScanPatientId(null);
    await launchVisit(patientId, pricingId);
  };

  // Clean, focused table columns
  const headers = [
    {
      key: "patient_code",
      label: t("demo.patientRegistration.colClientId"),
      render: (row) => (
        <span className="font-mono font-bold text-xs bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 px-2 py-1 rounded-md border border-emerald-200/60 dark:border-emerald-800">
          {row.patient_code}
        </span>
      ),
    },
    {
      key: "name",
      label: t("demo.patientRegistration.colClientName"),
      render: (row) => (
        <button
          onClick={() => navigate(`/patients/${row._id}`)}
          className="text-left font-semibold text-slate-900 dark:text-slate-100 hover:text-emerald-600 dark:hover:text-emerald-400 hover:underline transition-colors"
        >
          <LocalizedText value={row.name} />
        </button>
      ),
    },
    {
      key: "age",
      label: t("demo.patientRegistration.colAgeGender"),
      render: (row) => (
        <span className="inline-flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400 font-medium">
          <span>{row.age}</span>
          <span>{t("demo.patientRegistration.yrs")}</span>
          <span aria-hidden="true">/</span>
          <LocalizedText value={row.gender} />
        </span>
      ),
    },
    {
      key: "mobile",
      label: t("demo.patientRegistration.colMobile"),
      render: (row) => (
        <span className="text-xs font-mono text-slate-700 dark:text-slate-300 font-medium">
          {row.mobile}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: t("demo.patientRegistration.colRegDate"),
      render: (row) => (
        <span className="flex items-center gap-1.5 text-xs text-slate-500">
          <Calendar className="h-3.5 w-3.5 text-slate-400" />
          <span>
            {new Date(row.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
        </span>
      ),
    },
    {
      key: "registered_by",
      label: t("demo.patientRegistration.colConsultant"),
      render: (row) => (
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          <LocalizedText
            value={row.registered_by?.fullName || row.registered_by?.username}
            fallback={t("demo.patientRegistration.franchiseConsultant")}
          />
        </span>
      ),
    },
    {
      key: "latest_status",
      label: t("demo.patientRegistration.colStatus"),
      render: (row) => {
        const st = row.latest_status;
        if (st === "SHARED") {
          return (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="h-3 w-3" /> {t("demo.patientRegistration.statusShared")}
            </span>
          );
        }
        if (st === "REPORT_READY") {
          return (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <FileText className="h-3 w-3" /> {t("demo.patientRegistration.statusReportReady")}
            </span>
          );
        }
        if (st === "DATA_ENTRY") {
          return (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
              <Clock className="h-3 w-3" /> {t("demo.patientRegistration.statusInProgress")}
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            {t("demo.patientRegistration.statusRegistered")}
          </span>
        );
      },
    },
    {
      key: "actions",
      label: t("demo.patientRegistration.colActions"),
      filterable: false,
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          {/* Eye / View Details Button */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate(`/patients/${row._id}`)}
            className="h-8 px-2.5 text-xs font-semibold text-emerald-600 border-emerald-200 hover:bg-emerald-50 dark:text-emerald-300 dark:border-emerald-800 dark:hover:bg-emerald-950"
            title={t("demo.patientRegistration.viewDetailsTitle")}
          >
            <Eye className="h-3.5 w-3.5 mr-1" /> {t("demo.patientRegistration.viewDetails")}
          </Button>

          {/* New Scan Button */}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => startNewScan(row._id)}
            className="h-8 px-2 text-xs font-semibold text-slate-700 hover:text-emerald-600 hover:bg-emerald-50/50 dark:text-slate-300 dark:hover:text-emerald-400"
            title={t("demo.patientRegistration.newScanTitle")}
          >
            <Activity className="h-3.5 w-3.5 mr-1 text-emerald-500" /> {t("demo.patientRegistration.newScan")}
          </Button>

          {/* Edit Patient */}
          <Button
            size="sm"
            variant="ghost"
            title={t("demo.patientRegistration.editClientTitle")}
            onClick={() => openEditModal(row)}
            className="h-8 w-8 p-0 text-slate-500 hover:text-emerald-600"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>

          {/* Delete Patient */}
          <Button
            size="sm"
            variant="ghost"
            title={t("demo.patientRegistration.deleteClientTitle")}
            onClick={() => setDeletingPatient(row)}
            className="h-8 w-8 p-0 text-slate-500 hover:text-rose-600"
          >
            <Trash2 className="h-3.5 w-3.5 text-rose-500" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 p-6 text-white shadow-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-emerald-200 font-semibold">{t("demo.patientRegistration.bannerTag")}</p>
          <h1 className="text-2xl font-bold mt-1">{t("demo.patientRegistration.title")}</h1>
          <p className="text-sm text-emerald-100 mt-1">
            {t("demo.patientRegistration.bannerDesc")}
          </p>
        </div>
        <Button
          onClick={openRegisterModal}
          className="bg-white text-emerald-700 hover:bg-emerald-50 font-bold px-5 py-2.5 rounded-xl shadow-md shrink-0 flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          <span>{t("demo.patientRegistration.registerNewClient")}</span>
        </Button>
      </div>

      {/* Patient Directory Table Card */}
      <Card className="shadow-xs border border-slate-200/80 dark:border-slate-800">
        <CardContent className="p-6">
          <ReusableTable
            headers={headers}
            data={patients}
            loading={loading}
            Search={t("demo.patientRegistration.searchPlaceholder")}
            CreateExportRender={() => (
              <Button
                onClick={openRegisterModal}
                className="bg-emerald-600 text-white hover:bg-emerald-700 font-semibold px-4 py-2 rounded-xl shadow-xs shrink-0 flex items-center gap-2 text-xs"
              >
                <Plus className="h-4 w-4" />
                <span>{t("demo.patientRegistration.addClient")}</span>
              </Button>
            )}
            pagination={true}
          />
        </CardContent>
      </Card>

      {/* Modal Dialog for Patient Registration / Editing */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-lg space-y-4 shadow-2xl border border-slate-100 dark:border-slate-800 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold">
                <UserPlus className="h-5 w-5" />
                <h3 className="text-lg">
                  {editingPatient
                    ? t("demo.patientRegistration.editClientHeading", { code: editingPatient.patient_code })
                    : t("demo.patientRegistration.registerNewClient")}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSavePatient} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  {t("demo.patientRegistration.clientNameLabel")}
                </label>
                <input
                  type="text"
                  required
                  placeholder={t("demo.patientRegistration.clientNamePh")}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white dark:bg-slate-800 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    {t("demo.patientRegistration.ageLabel")}
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="150"
                    placeholder="42"
                    value={form.age}
                    onChange={(e) => setForm({ ...form, age: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white dark:bg-slate-800 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    {t("demo.patientRegistration.genderLabel")}
                  </label>
                  <select
                    value={form.gender}
                    onChange={(e) => setForm({ ...form, gender: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white dark:bg-slate-800 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Male">{t("demo.patientRegistration.genderMale")}</option>
                    <option value="Female">{t("demo.patientRegistration.genderFemale")}</option>
                    <option value="Other">{t("demo.patientRegistration.genderOther")}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    {t("demo.patientRegistration.mobileLabel")}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={t("demo.patientRegistration.mobilePh")}
                    maxLength={10}
                    value={form.mobile}
                    onChange={(e) => setForm({ ...form, mobile: e.target.value.replace(/\D/g, "") })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white dark:bg-slate-800 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    {t("demo.patientRegistration.emailLabel")}
                  </label>
                  <input
                    type="email"
                    placeholder={t("demo.patientRegistration.emailPh")}
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white dark:bg-slate-800 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  {t("demo.patientRegistration.dobLabel")}
                </label>
                <input
                  type="date"
                  value={form.dob}
                  onChange={(e) => setForm({ ...form, dob: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white dark:bg-slate-800 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Weight & Height Fields */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    {t("demo.patientRegistration.weightLabel")}
                  </label>
                  <div className="flex items-center">
                    <input
                      type="number"
                      step="any"
                      min="0.5"
                      max="300"
                      placeholder={t("demo.patientRegistration.weightPh")}
                      value={form.weight}
                      onChange={(e) => setForm({ ...form, weight: e.target.value })}
                      className="w-full rounded-l-lg border border-r-0 border-slate-200 px-3 py-2 text-sm bg-white dark:bg-slate-800 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <span className="bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 rounded-r-lg">
                      kg
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    {t("demo.patientRegistration.heightLabel")}
                  </label>
                  <div className="flex items-center">
                    <input
                      type="number"
                      step="any"
                      min="20"
                      max="300"
                      placeholder={t("demo.patientRegistration.heightPh")}
                      value={form.height}
                      onChange={(e) => setForm({ ...form, height: e.target.value })}
                      className="w-full rounded-l-lg border border-r-0 border-slate-200 px-3 py-2 text-sm bg-white dark:bg-slate-800 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <span className="bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 rounded-r-lg">
                      cm
                    </span>
                  </div>
                </div>
              </div>

              {/* Address Field */}
              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  {t("demo.patientRegistration.addressLabel")}
                </label>
                <textarea
                  rows={2}
                  placeholder={t("demo.patientRegistration.addressPh")}
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white dark:bg-slate-800 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowModal(false)}
                >
                  {t("common.cancel")}
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5"
                >
                  {submitting
                    ? t("demo.patientRegistration.saving")
                    : editingPatient
                      ? t("demo.patientRegistration.updateClient")
                      : t("demo.patientRegistration.saveAndProceed")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Patient Delete */}
      {deletingPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl border border-rose-100 dark:border-rose-900/50">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="h-6 w-6 shrink-0" />
              <h3 className="text-lg font-bold">{t("demo.patientRegistration.deleteTitle")}</h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {t("demo.patientRegistration.deleteConfirmPrefix")} <strong className="text-slate-900 dark:text-slate-100">{deletingPatient.patient_code} - <LocalizedText value={deletingPatient.name} /></strong>{t("demo.patientRegistration.deleteConfirmSuffix")}
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setDeletingPatient(null)}>{t("common.cancel")}</Button>
              <Button variant="destructive" onClick={confirmDeletePatient}>{t("demo.patientRegistration.confirmDelete")}</Button>
            </div>
          </div>
        </div>
      )}

      {/* Scan Pricing Selection Modal (only opens when multiple active prices exist) */}
      <ScanPricingSelectionModal
        open={pricingModalOpen}
        pricings={pricingOptions}
        onClose={() => {
          setPricingModalOpen(false);
          setPendingScanPatientId(null);
        }}
        onConfirm={handleConfirmPricing}
        submitting={startingScan}
      />
    </div>
  );
}
