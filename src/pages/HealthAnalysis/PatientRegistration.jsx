import React, { useState, useEffect } from "react";
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

export default function PatientRegistration() {
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
      toast.error("Failed to load clients");
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
        toast.success(`Client details updated for ${editingPatient.patient_code}`);
        setShowModal(false);
        fetchPatients();
      } else {
        // Create Patient
        const patientRes = await axiosInstance.post("v1/patients", form);
        const newPatient = patientRes.data.data;
        toast.success(`Client Registered: ${newPatient.patient_code}`);

        setShowModal(false);
        setSubmitting(false);
        fetchPatients();

        // Create Visit & Navigate to Quantum Scan (price-aware)
        await choosePricingAndStartScan(newPatient._id);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save client details");
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDeletePatient = async () => {
    if (!deletingPatient) return;
    try {
      await axiosInstance.delete(`v1/patients/${deletingPatient._id}`);
      toast.success(`Deleted client ${deletingPatient.patient_code}`);
      setDeletingPatient(null);
      fetchPatients();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete client record");
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
      toast.error("Failed to start new scan");
      setStartingScan(false);
    }
  };

  const choosePricingAndStartScan = async (patientId) => {
    try {
      setStartingScan(true);
      const pricings = await scanPricingService.getActiveScanPricings();
      if (pricings.length === 0) {
        toast.info("No active scan price configured. Scan will be recorded without an amount.");
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
      toast.error("Failed to start new scan");
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
      label: "Client ID",
      render: (row) => (
        <span className="font-mono font-bold text-xs bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 px-2 py-1 rounded-md border border-indigo-200/60 dark:border-indigo-800">
          {row.patient_code}
        </span>
      ),
    },
    {
      key: "name",
      label: "Client Name",
      render: (row) => (
        <button
          onClick={() => navigate(`/patients/${row._id}`)}
          className="text-left font-semibold text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline transition-colors"
        >
          {row.name}
        </button>
      ),
    },
    {
      key: "age",
      label: "Age / Gender",
      render: (row) => (
        <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
          {row.age} Yrs / {row.gender}
        </span>
      ),
    },
    {
      key: "mobile",
      label: "Mobile Number",
      render: (row) => (
        <span className="text-xs font-mono text-slate-700 dark:text-slate-300 font-medium">
          {row.mobile}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Registration Date",
      render: (row) => (
        <span className="flex items-center gap-1.5 text-xs text-slate-500">
          <Calendar className="h-3.5 w-3.5 text-slate-400" />
          {new Date(row.createdAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>
      ),
    },
    {
      key: "registered_by",
      label: "Consultant Name",
      render: (row) => (
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          {row.registered_by?.fullName || row.registered_by?.username || "Franchise Consultant"}
        </span>
      ),
    },
    {
      key: "latest_status",
      label: "Status",
      render: (row) => {
        const st = row.latest_status;
        if (st === "SHARED") {
          return (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="h-3 w-3" /> Report Shared
            </span>
          );
        }
        if (st === "REPORT_READY") {
          return (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              <FileText className="h-3 w-3" /> Report Ready
            </span>
          );
        }
        if (st === "DATA_ENTRY") {
          return (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
              <Clock className="h-3 w-3" /> In Progress
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            Registered
          </span>
        );
      },
    },
    {
      key: "actions",
      label: "Actions",
      filterable: false,
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          {/* Eye / View Details Button */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate(`/patients/${row._id}`)}
            className="h-8 px-2.5 text-xs font-semibold text-indigo-600 border-indigo-200 hover:bg-indigo-50 dark:text-indigo-300 dark:border-indigo-800 dark:hover:bg-indigo-950"
            title="View Complete Client Profile & History"
          >
            <Eye className="h-3.5 w-3.5 mr-1" /> View Details
          </Button>

          {/* New Scan Button */}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => startNewScan(row._id)}
            className="h-8 px-2 text-xs font-semibold text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/50 dark:text-slate-300 dark:hover:text-indigo-400"
            title="Start New Scan Session"
          >
            <Activity className="h-3.5 w-3.5 mr-1 text-indigo-500" /> New Scan
          </Button>

          {/* Edit Patient */}
          <Button
            size="sm"
            variant="ghost"
            title="Edit Client"
            onClick={() => openEditModal(row)}
            className="h-8 w-8 p-0 text-slate-500 hover:text-indigo-600"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>

          {/* Delete Patient */}
          <Button
            size="sm"
            variant="ghost"
            title="Delete Client Record"
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
      <div className="rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 p-6 text-white shadow-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-indigo-200 font-semibold">Quantum Health System</p>
          <h1 className="text-2xl font-bold mt-1">Client Registration</h1>
          <p className="text-sm text-indigo-100 mt-1">
            Clean client directory overview. Click View Details on any client to see their full profile and report history.
          </p>
        </div>
        <Button
          onClick={openRegisterModal}
          className="bg-white text-indigo-700 hover:bg-indigo-50 font-bold px-5 py-2.5 rounded-xl shadow-md shrink-0 flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          <span>Register New Client</span>
        </Button>
      </div>

      {/* Patient Directory Table Card */}
      <Card className="shadow-xs border border-slate-200/80 dark:border-slate-800">
        <CardContent className="p-6">
          <ReusableTable
            headers={headers}
            data={patients}
            loading={loading}
            Search="Search by Client ID, Name, Mobile, Email..."
            CreateExportRender={() => (
              <Button
                onClick={openRegisterModal}
                className="bg-indigo-600 text-white hover:bg-indigo-700 font-semibold px-4 py-2 rounded-xl shadow-xs shrink-0 flex items-center gap-2 text-xs"
              >
                <Plus className="h-4 w-4" />
                <span>Add Client</span>
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
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold">
                <UserPlus className="h-5 w-5" />
                <h3 className="text-lg">
                  {editingPatient ? `Edit Client (${editingPatient.patient_code})` : "Register New Client"}
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
                  Client Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white dark:bg-slate-800 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Age *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="150"
                    placeholder="42"
                    value={form.age}
                    onChange={(e) => setForm({ ...form, age: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white dark:bg-slate-800 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Gender *
                  </label>
                  <select
                    value={form.gender}
                    onChange={(e) => setForm({ ...form, gender: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white dark:bg-slate-800 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Male">Male (पुरुष)</option>
                    <option value="Female">Female (महिला)</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Mobile Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="10-digit mobile number"
                    maxLength={10}
                    value={form.mobile}
                    onChange={(e) => setForm({ ...form, mobile: e.target.value.replace(/\D/g, "") })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white dark:bg-slate-800 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="client@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white dark:bg-slate-800 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={form.dob}
                  onChange={(e) => setForm({ ...form, dob: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white dark:bg-slate-800 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Weight & Height Fields */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Weight (kg)
                  </label>
                  <div className="flex items-center">
                    <input
                      type="number"
                      step="any"
                      min="0.5"
                      max="300"
                      placeholder="e.g. 68"
                      value={form.weight}
                      onChange={(e) => setForm({ ...form, weight: e.target.value })}
                      className="w-full rounded-l-lg border border-r-0 border-slate-200 px-3 py-2 text-sm bg-white dark:bg-slate-800 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <span className="bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 rounded-r-lg">
                      kg
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Height (cm)
                  </label>
                  <div className="flex items-center">
                    <input
                      type="number"
                      step="any"
                      min="20"
                      max="300"
                      placeholder="e.g. 172"
                      value={form.height}
                      onChange={(e) => setForm({ ...form, height: e.target.value })}
                      className="w-full rounded-l-lg border border-r-0 border-slate-200 px-3 py-2 text-sm bg-white dark:bg-slate-800 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                  Full Address
                </label>
                <textarea
                  rows={2}
                  placeholder="Street, City, State, Pin Code..."
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white dark:bg-slate-800 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5"
                >
                  {submitting
                    ? "Saving..."
                    : editingPatient
                      ? "Update Client Details"
                      : "Save & Proceed to Scan"}
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
              <h3 className="text-lg font-bold">Delete Client Record</h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Are you sure you want to delete client record <strong className="text-slate-900 dark:text-slate-100">{deletingPatient.patient_code} - {deletingPatient.name}</strong>?
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setDeletingPatient(null)}>Cancel</Button>
              <Button variant="destructive" onClick={confirmDeletePatient}>Confirm Delete</Button>
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
