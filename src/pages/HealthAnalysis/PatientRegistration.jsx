import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/context/LanguageContext";
import { UserPlus, ArrowRight, Activity, Search, X, Scale, Ruler, MapPin, Calendar, Plus, Pencil, Trash2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

export default function PatientRegistration() {
  const { t, lang } = useLanguage();
  const navigate = useNavigate();

  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modals state
  const [showModal, setShowModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [deletingPatient, setDeletingPatient] = useState(null);

  const [form, setForm] = useState({
    name: "",
    age: "",
    gender: "Male",
    mobile: "",
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
      toast.error("Failed to load patients");
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
        toast.success(`Patient details updated for ${editingPatient.patient_code}`);
        setShowModal(false);
        fetchPatients();
      } else {
        // Create Patient with Weight, Height, Address
        const patientRes = await axiosInstance.post("v1/patients", form);
        const newPatient = patientRes.data.data;
        toast.success(`Patient Registered: ${newPatient.patient_code}`);

        setShowModal(false);
        fetchPatients();

        // Create Visit & Navigate to Quantum Scan
        const visitRes = await axiosInstance.post("v1/visits", {
          patient_id: newPatient._id,
        });

        navigate(`/quantum-scan/${visitRes.data.data._id}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save patient details");
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDeletePatient = async () => {
    if (!deletingPatient) return;
    try {
      await axiosInstance.delete(`v1/patients/${deletingPatient._id}`);
      toast.success(`Deleted patient ${deletingPatient.patient_code}`);
      setDeletingPatient(null);
      fetchPatients();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete patient record");
    }
  };

  const startNewScan = async (patientId) => {
    try {
      const visitRes = await axiosInstance.post("v1/visits", {
        patient_id: patientId,
      });
      navigate(`/quantum-scan/${visitRes.data.data._id}`);
    } catch (err) {
      toast.error("Failed to start new scan");
    }
  };

  const filteredPatients = patients.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      p.name?.toLowerCase().includes(q) ||
      p.patient_code?.toLowerCase().includes(q) ||
      p.mobile?.includes(q) ||
      p.address?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Page Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 p-6 text-white shadow-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-indigo-200 font-semibold">Quantum Health System</p>
          <h1 className="text-2xl font-bold mt-1">{t("patientReg")}</h1>
          <p className="text-sm text-indigo-100 mt-1">
            {lang === "hi"
              ? "रोगी पंजीकृत करें, विवरण संपादित करें और क्वांटम मशीन रिपोर्ट स्कैन शुरू करें।"
              : "Register and manage patients with full details (Weight, Height, Address) & start scan sessions."}
          </p>
        </div>
        <Button
          onClick={openRegisterModal}
          className="bg-white text-indigo-700 hover:bg-indigo-50 font-bold px-5 py-2.5 rounded-xl shadow-md shrink-0 flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          <span>Register New Patient</span>
        </Button>
      </div>

      {/* Patient Directory Card */}
      <Card className="shadow-sm border-0">
        <CardHeader className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800">
          <CardTitle className="text-lg font-bold">
            Patient Directory ({filteredPatients.length})
          </CardTitle>
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search name, code, mobile, address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto min-h-[350px]">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 dark:bg-slate-800 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3">Patient Code</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Age / Gender</th>
                  <th className="px-4 py-3">Mobile</th>
                  <th className="px-4 py-3">Weight & Height</th>
                  <th className="px-4 py-3">Address</th>
                  <th className="px-4 py-3">Registered</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-slate-400 text-sm animate-pulse">
                      Loading patient records...
                    </td>
                  </tr>
                ) : filteredPatients.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-slate-400 text-sm">
                      No patients found. Click <strong>Register New Patient</strong> above to add one.
                    </td>
                  </tr>
                ) : (
                  filteredPatients.map((p) => (
                    <tr key={p._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-indigo-600 dark:text-indigo-400 text-xs">
                        {p.patient_code}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100">{p.name}</td>
                      <td className="px-4 py-3 text-slate-500">{p.age} Yrs / {p.gender}</td>
                      <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">{p.mobile}</td>
                      <td className="px-4 py-3 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-1 font-medium bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300">
                            <Scale className="h-3 w-3 text-indigo-500" />
                            {p.weight ? `${p.weight} ${p.weight_unit || "kg"}` : "-"}
                          </span>
                          <span className="flex items-center gap-1 font-medium bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300">
                            <Ruler className="h-3 w-3 text-violet-500" />
                            {p.height ? `${p.height} ${p.height_unit || "cm"}` : "-"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500 max-w-xs" title={p.address}>
                        {p.address ? (
                          <span className="flex items-center gap-1 whitespace-pre-line">
                            <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                            {p.address}
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-slate-400" />
                          {new Date(p.createdAt).toLocaleDateString("en-IN")}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => startNewScan(p._id)}
                            className="text-xs text-indigo-600 border-indigo-200 hover:bg-indigo-50 font-semibold"
                          >
                            <Activity className="mr-1 h-3.5 w-3.5" /> New Scan
                          </Button>

                          <Button
                            size="sm"
                            variant="ghost"
                            title="Edit Patient Details"
                            onClick={() => openEditModal(p)}
                            className="h-8 w-8 p-0 text-slate-500 hover:text-indigo-600"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>

                          <Button
                            size="sm"
                            variant="ghost"
                            title="Delete Patient Record"
                            onClick={() => setDeletingPatient(p)}
                            className="h-8 w-8 p-0 text-slate-500 hover:text-rose-600"
                          >
                            <Trash2 className="h-4 w-4 text-rose-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
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
                  {editingPatient ? `Edit Patient (${editingPatient.patient_code})` : "Register New Patient"}
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
                  {t("patientName")} *
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
                    {t("age")} *
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
                    {t("gender")} *
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

              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  {t("mobile")} *
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
                    ? "Update Patient Details"
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
              <h3 className="text-lg font-bold">Delete Patient Record</h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Are you sure you want to delete patient record <strong className="text-slate-900 dark:text-slate-100">{deletingPatient.patient_code} - {deletingPatient.name}</strong>?
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setDeletingPatient(null)}>Cancel</Button>
              <Button variant="destructive" onClick={confirmDeletePatient}>Confirm Delete</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
