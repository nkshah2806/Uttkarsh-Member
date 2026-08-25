import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axiosInstance from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import {
  ArrowLeft,
  User,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Scale,
  Ruler,
  Activity,
  FileText,
  Eye,
  Download,
  Printer,
  Share2,
  Clock,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Stethoscope,
  Plus,
  Pencil,
  X,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Layers,
  HeartPulse,
  Sparkles,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import ReusableTable from "@/components/ReusableTable";

export default function PatientDetails() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { t, lang } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [patientData, setPatientData] = useState(null);
  const [visits, setVisits] = useState([]);
  const [stats, setStats] = useState({});

  // Active Report Modal State
  const [selectedVisitId, setSelectedVisitId] = useState(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [detailedReport, setDetailedReport] = useState(null);
  const [reportLang, setReportLang] = useState(lang);
  const [paramFilter, setParamFilter] = useState("all"); // 'all', 'abnormal', 'normal'
  const [paramSearch, setParamSearch] = useState("");

  // Edit Patient Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [submittingEdit, setSubmittingEdit] = useState(false);
  const [editForm, setEditForm] = useState({
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
    fetchPatientProfile();
  }, [patientId]);

  const fetchPatientProfile = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`v1/patients/${patientId}`);
      if (res.data.success) {
        setPatientData(res.data.data.patient);
        setVisits(res.data.data.visits || []);
        setStats(res.data.data.stats || {});
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load patient details");
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = () => {
    if (!patientData) return;
    setEditForm({
      name: patientData.name || "",
      age: patientData.age || "",
      gender: patientData.gender || "Male",
      mobile: patientData.mobile || "",
      dob: patientData.dob ? new Date(patientData.dob).toISOString().split("T")[0] : "",
      email: patientData.email || "",
      weight: patientData.weight !== null && patientData.weight !== undefined ? patientData.weight : "",
      weight_unit: patientData.weight_unit || "kg",
      height: patientData.height !== null && patientData.height !== undefined ? patientData.height : "",
      height_unit: patientData.height_unit || "cm",
      address: patientData.address || "",
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      setSubmittingEdit(true);
      await axiosInstance.put(`v1/patients/${patientId}`, editForm);
      toast.success("Patient details updated successfully");
      setShowEditModal(false);
      fetchPatientProfile();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update patient details");
    } finally {
      setSubmittingEdit(false);
    }
  };

  const startNewScan = async () => {
    try {
      const visitRes = await axiosInstance.post("v1/visits", {
        patient_id: patientId,
      });
      navigate(`/quantum-scan/${visitRes.data.data._id}`);
    } catch (err) {
      toast.error("Failed to start new scan");
    }
  };

  // Open Detailed Report Modal
  const openReportModal = async (visitId) => {
    try {
      setSelectedVisitId(visitId);
      setReportModalOpen(true);
      setReportLoading(true);
      setParamFilter("all");
      setParamSearch("");

      const res = await axiosInstance.get(`v1/visits/${visitId}/detailed-report`);
      if (res.data.success) {
        setDetailedReport(res.data.data);
      }
    } catch (err) {
      toast.error("Failed to load full report details");
    } finally {
      setReportLoading(false);
    }
  };

  // Direct Print / Download of PDF Report
  const handlePrintReport = async (visitId) => {
    try {
      const res = await axiosInstance.post(`v1/visits/${visitId}/generate-pdf`, {
        lang: reportLang,
      });
      const win = window.open("", "_blank");
      if (!win) return;
      win.document.write(res.data.html);
      win.document.close();

      // inject print-friendly styles to reduce blank margins
      const injectPrintStyles = () => {
        try {
          const style = win.document.createElement("style");
          style.innerHTML = `@page { size: A4; margin: 10mm; } body { margin: 0; } .report-container, .report { width: 190mm; margin: 0 auto; }`;
          win.document.head && win.document.head.appendChild(style);
        } catch (e) {}
      };

      win.focus();
      setTimeout(() => {
        injectPrintStyles();
        setTimeout(() => win.print(), 200);
      }, 350);
    } catch (err) {
      toast.error("Failed to prepare report for printing");
    }
  };

  const handleDownloadReport = async (visitId) => {
    try {
      const res = await axiosInstance.post(`v1/visits/${visitId}/generate-pdf`, {
        lang: reportLang,
      });
      const blob = new Blob([res.data.html], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `HealthReport_${patientData?.patient_code || "Patient"}_${visitId.slice(-6)}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Report file downloaded successfully");
    } catch (err) {
      toast.error("Failed to download report");
    }
  };

  const handleWhatsAppShare = async (reportId) => {
    if (!reportId) {
      toast.info("Please generate the PDF report preview first to share via WhatsApp");
      return;
    }
    try {
      const res = await axiosInstance.post(`v1/visits/reports/${reportId}/share/whatsapp`);
      window.open(res.data.whatsappUrl, "_blank");
    } catch (err) {
      toast.error("Failed to generate WhatsApp share link");
    }
  };

  // BMI Calculation
  const calculateBMI = (weight, height) => {
    if (!weight || !height) return null;
    const heightInMeters = Number(height) / 100;
    if (heightInMeters <= 0) return null;
    const bmi = (Number(weight) / (heightInMeters * heightInMeters)).toFixed(1);
    let category = "Normal";
    let color = "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800";
    if (bmi < 18.5) {
      category = "Underweight";
      color = "text-amber-600 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800";
    } else if (bmi >= 25 && bmi < 30) {
      category = "Overweight";
      color = "text-orange-600 bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-800";
    } else if (bmi >= 30) {
      category = "Obese";
      color = "text-rose-600 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800";
    }
    return { value: bmi, category, color };
  };

  const bmiInfo = patientData ? calculateBMI(patientData.weight, patientData.height) : null;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] space-y-4">
        <div className="h-10 w-10 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
        <p className="text-sm font-medium text-slate-500">Loading comprehensive patient record...</p>
      </div>
    );
  }

  if (!patientData) {
    return (
      <div className="text-center py-16 space-y-4">
        <AlertCircle className="h-12 w-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Patient Record Not Found</h2>
        <Button onClick={() => navigate("/patients")} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Patient List
        </Button>
      </div>
    );
  }

  // Filter parameters inside detailed report modal
  const filteredParameters = (detailedReport?.parameters || []).filter((p) => {
    if (paramFilter === "abnormal" && p.result_type === "NORMAL") return false;
    if (paramFilter === "normal" && p.result_type !== "NORMAL") return false;
    if (paramSearch) {
      const q = paramSearch.toLowerCase();
      return (
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.name_hi && p.name_hi.toLowerCase().includes(q)) ||
        (p.code && p.code.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q))
      );
    }
    return true;
  });
  const headers = [
    {
      key: "_id",
      label: "Visit ID",
      sortable: true,
      render: (v) => (
        <span className="font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50/80 dark:bg-indigo-950/50 px-2 py-1 rounded">
          #{v._id.slice(-6).toUpperCase()}
        </span>
      ),
    },
    {
      key: "visit_date",
      label: "Visit Date",
      sortable: true,
      render: (v) => (
        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-300">
          <Calendar className="h-3.5 w-3.5 text-slate-400" />
          {new Date(v.visit_date || v.createdAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </div>
      ),
    },
    {
      key: "next_visit_date",
      label: "Next Visit",
      sortable: true,
      render: (v) =>
        v.next_visit_date ? (
          <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-300">
            <Calendar className="h-3.5 w-3.5" />
            {new Date(v.next_visit_date).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </div>
        ) : (
          <span className="text-xs text-slate-400 italic">—</span>
        ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (v) =>
        v.status === "SHARED" ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="h-3 w-3" /> Shared
          </span>
        ) : v.status === "REPORT_READY" ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
            <FileText className="h-3 w-3" /> Report Ready
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <Clock className="h-3 w-3" /> In Progress
          </span>
        ),
    },
    {
      key: "parameters",
      label: "Parameters",
      render: (v) => (
        <div className="flex items-center gap-1.5 text-xs">
          <span className="font-bold text-slate-800 dark:text-slate-200">{v.total_parameters}</span>
          {v.abnormal_parameters > 0 && (
            <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300">
              {v.abnormal_parameters} Abn.
            </span>
          )}
          {v.normal_parameters > 0 && (
            <span className="text-[11px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
              {v.normal_parameters} Norm.
            </span>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (v) => (
        <div className="flex items-center gap-1.5 flex-wrap">
          <Button
            size="sm"
            variant="outline"
            onClick={() => openReportModal(v._id)}
            className="h-8 px-2.5 text-xs font-semibold text-indigo-600 border-indigo-200 hover:bg-indigo-50 dark:text-indigo-300 dark:border-indigo-800 dark:hover:bg-indigo-950"
            title="View Full Report Breakdown"
          >
            <Eye className="h-3.5 w-3.5 mr-1" /> View Report
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => navigate(`/report-pdf/${v._id}`)}
            className="h-8 w-8 p-0 text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
            title="Open PDF Document Preview"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleDownloadReport(v._id)}
            className="h-8 w-8 p-0 text-slate-600 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400"
            title="Download Report File"
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handlePrintReport(v._id)}
            className="h-8 w-8 p-0 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
            title="Print Report"
          >
            <Printer className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ]
  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border shadow-xs">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/patients")}
            className="rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Back to Patient List"
          >
            <ArrowLeft className="h-5 w-5 text-slate-600 dark:text-slate-300" />
          </Button>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="font-mono font-bold text-xs bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 px-2.5 py-0.5 rounded-md">
                {patientData.patient_code}
              </span>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                {patientData.name}
              </h1>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {patientData.age} Yrs · {patientData.gender}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-slate-400" />
              Registered on {new Date(patientData.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            onClick={openEditDialog}
            variant="outline"
            size="sm"
            className="font-medium text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700"
          >
            <Pencil className="h-4 w-4 mr-1.5 text-slate-500" /> Edit Profile
          </Button>
          <Button
            onClick={startNewScan}
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" /> Start New Scan
          </Button>
        </div>
      </div>

      {/* Main Grid: Demographics + Consultation Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient Demographics & Vitals Card */}
        <Card className="lg:col-span-2 shadow-xs border border-slate-200/80 dark:border-slate-800">
          <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-800 dark:text-slate-100">
                <User className="h-4 w-4 text-indigo-600" />
                Patient Information & Vitals
              </CardTitle>
              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                Complete Profile
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Patient Code</p>
                <p className="text-base font-mono font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
                  {patientData.patient_code}
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Full Name</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
                  {patientData.name}
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Age / Gender</p>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                  {patientData.age} Years / {patientData.gender}
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Phone className="h-3 w-3 text-slate-400" /> Mobile Number
                </p>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                  {patientData.mobile}
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Mail className="h-3 w-3 text-slate-400" /> Email Address
                </p>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5 truncate" title={patientData.email || "Not Provided"}>
                  {patientData.email || "—"}
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-slate-400" /> Date of Birth
                </p>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                  {patientData.dob
                    ? new Date(patientData.dob).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                    : "—"}
                </p>
              </div>

              {/* Physical Vitals */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Scale className="h-3 w-3 text-indigo-500" /> Weight
                </p>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                  {patientData.weight ? `${patientData.weight} ${patientData.weight_unit || "kg"}` : "—"}
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Ruler className="h-3 w-3 text-violet-500" /> Height
                </p>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                  {patientData.height ? `${patientData.height} ${patientData.height_unit || "cm"}` : "—"}
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <HeartPulse className="h-3 w-3 text-emerald-500" /> Calculated BMI
                </p>
                {bmiInfo ? (
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{bmiInfo.value}</span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${bmiInfo.color}`}>
                      {bmiInfo.category}
                    </span>
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 mt-0.5">—</p>
                )}
              </div>
            </div>

            {/* Address */}
            <div className="mt-4 p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-slate-400" /> Residential Address
              </p>
              <p className="text-sm text-slate-700 dark:text-slate-300 mt-1 whitespace-pre-line">
                {patientData.address || "No address recorded on file."}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Consultation & Center Overview Card */}
        <Card className="shadow-xs border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-800 dark:text-slate-100">
                <Stethoscope className="h-4 w-4 text-violet-600" />
                Consultation Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <p className="text-xs font-semibold text-slate-400">Consultant / Registered By</p>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                    {patientData.registered_by?.fullName || patientData.registered_by?.username || "Franchise Consultant"}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {patientData.registered_by?.email || patientData.registered_by?.role || "Healthcare Specialist"}
                  </p>
                </div>
                <span className="p-2 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl text-indigo-600 dark:text-indigo-400">
                  <User className="h-5 w-5" />
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-xl border border-indigo-100 dark:border-indigo-900/50">
                  <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">Total Scans</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                    {visits.length}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Sessions logged</p>
                </div>

                <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/30 rounded-xl border border-emerald-100 dark:border-emerald-900/50">
                  <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Latest Status</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-2 truncate">
                    {visits.length > 0
                      ? visits[0].status === "SHARED"
                        ? "Report Shared"
                        : visits[0].status === "REPORT_READY"
                          ? "Report Ready"
                          : "In Progress"
                      : "Registered"}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Current state</p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl text-xs space-y-1.5 border border-slate-100 dark:border-slate-800">
                <div className="flex justify-between text-slate-500">
                  <span>First Registration:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {new Date(patientData.createdAt).toLocaleDateString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Last Visit Date:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {visits.length > 0
                      ? new Date(visits[0].visit_date || visits[0].createdAt).toLocaleDateString("en-IN")
                      : "—"}
                  </span>
                </div>
              </div>
            </CardContent>
          </div>

          <div className="p-5 pt-0">
            <Button
              onClick={startNewScan}
              className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold py-2.5 rounded-xl shadow-sm"
            >
              <Plus className="h-4 w-4 mr-2" /> Start New Quantum Scan
            </Button>
          </div>
        </Card>
      </div>

      {/* Previous Reports / Report History Section */}
      <Card className="shadow-xs border border-slate-200/80 dark:border-slate-800">
        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-900 dark:text-slate-100">
                <FileText className="h-4 w-4 text-indigo-600" />
                Previous Reports & Visit History
              </CardTitle>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                All previously generated health analysis scans and clinical reports for this patient.
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              {visits.length} Historical {visits.length === 1 ? "Session" : "Sessions"}
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-5">
          <ReusableTable
            headers={headers}
            data={visits}
            emptyMessage={
              <div className="text-center py-12 space-y-3 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                <Activity className="h-10 w-10 text-indigo-400 mx-auto" />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No Previous Reports Yet</p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  No scan sessions or clinical reports have been generated for {patientData?.name ?? "this patient"} yet. Click below to start the first scan session.
                </p>
                <Button onClick={startNewScan} size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white mt-2">
                  <Plus className="h-4 w-4 mr-1.5" /> Start First Scan Session
                </Button>
              </div>
            }
          />
        </CardContent>
      </Card>

      {/* Comprehensive Report Details Modal */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 md:p-6 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-150 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-sm">
                  <Activity className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                      Quantum Health Analysis Report
                    </h3>
                    {selectedVisitId && (
                      <span className="font-mono text-xs bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 px-2 py-0.5 rounded font-bold">
                        #{selectedVisitId.slice(-6).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">
                    Patient: <strong className="text-slate-700 dark:text-slate-300">{patientData.name}</strong> ({patientData.patient_code}) · {patientData.age} Yrs / {patientData.gender}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Language Switcher */}
                <div className="flex items-center rounded-lg border bg-white dark:bg-slate-800 p-0.5 text-xs">
                  <button
                    onClick={() => setReportLang("en")}
                    className={`px-2.5 py-1 rounded font-semibold transition-all ${reportLang === "en"
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "text-slate-500 hover:text-slate-700"
                      }`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => setReportLang("hi")}
                    className={`px-2.5 py-1 rounded font-semibold transition-all ${reportLang === "hi"
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "text-slate-500 hover:text-slate-700"
                      }`}
                  >
                    हिंदी
                  </button>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handlePrintReport(selectedVisitId)}
                  className="hidden sm:flex items-center gap-1 text-xs"
                >
                  <Printer className="h-3.5 w-3.5" /> Print
                </Button>

                <Button
                  size="sm"
                  onClick={() => navigate(`/report-pdf/${selectedVisitId}`)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold"
                >
                  <ExternalLink className="h-3.5 w-3.5 mr-1" /> Open Full PDF
                </Button>

                <button
                  onClick={() => setReportModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-full hover:bg-slate-200/60 dark:hover:bg-slate-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {reportLoading ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-3">
                  <div className="h-8 w-8 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
                  <p className="text-xs font-semibold text-slate-500">Compiling detailed report evaluation...</p>
                </div>
              ) : !detailedReport ? (
                <div className="text-center py-12 text-slate-500">
                  Failed to load report data.
                </div>
              ) : (
                <>
                  {/* Report Summary Scorecards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                    <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                      <p className="text-xs font-semibold text-slate-400">Total Evaluated</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                        {detailedReport.summary?.total || 0}
                      </p>
                      <p className="text-[11px] text-slate-500">Quantum parameters</p>
                    </div>

                    <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800">
                      <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Normal Parameters</p>
                      <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300 mt-1">
                        {detailedReport.summary?.normal || 0}
                      </p>
                      <p className="text-[11px] text-emerald-600/70">Within healthy limits</p>
                    </div>

                    <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-800">
                      <p className="text-xs font-semibold text-rose-600 dark:text-rose-400">Abnormal / Alerts</p>
                      <p className="text-2xl font-bold text-rose-700 dark:text-rose-300 mt-1">
                        {detailedReport.summary?.abnormal || 0}
                      </p>
                      <p className="text-[11px] text-rose-600/70">
                        {detailedReport.summary?.high || 0} High · {detailedReport.summary?.low || 0} Low
                      </p>
                    </div>

                    <div className="p-3.5 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl border border-indigo-200 dark:border-indigo-800">
                      <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">Selected Guidance</p>
                      <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-300 mt-1">
                        {detailedReport.summary?.selected_points_count || 0}
                      </p>
                      <p className="text-[11px] text-indigo-600/70">Clinical guidance points</p>
                    </div>
                  </div>

                  {/* Evaluated Parameters Section */}
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                          <Activity className="h-4 w-4 text-indigo-600" />
                          Evaluated Parameter Values & Health Ranges
                        </h4>
                        <p className="text-xs text-slate-500">
                          Comprehensive analysis of all machine parameters evaluated during this session.
                        </p>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Filter Tabs */}
                        <div className="flex items-center rounded-lg border bg-slate-100 dark:bg-slate-800 p-0.5 text-xs">
                          <button
                            onClick={() => setParamFilter("all")}
                            className={`px-2.5 py-1 rounded font-semibold transition-all ${paramFilter === "all"
                                ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs"
                                : "text-slate-500"
                              }`}
                          >
                            All ({detailedReport.parameters?.length || 0})
                          </button>
                          <button
                            onClick={() => setParamFilter("abnormal")}
                            className={`px-2.5 py-1 rounded font-semibold transition-all ${paramFilter === "abnormal"
                                ? "bg-white dark:bg-slate-700 text-rose-600 shadow-xs"
                                : "text-slate-500"
                              }`}
                          >
                            Abnormal ({detailedReport.summary?.abnormal || 0})
                          </button>
                          <button
                            onClick={() => setParamFilter("normal")}
                            className={`px-2.5 py-1 rounded font-semibold transition-all ${paramFilter === "normal"
                                ? "bg-white dark:bg-slate-700 text-emerald-600 shadow-xs"
                                : "text-slate-500"
                              }`}
                          >
                            Normal ({detailedReport.summary?.normal || 0})
                          </button>
                        </div>

                        {/* Search */}
                        <input
                          type="text"
                          placeholder="Search parameters..."
                          value={paramSearch}
                          onChange={(e) => setParamSearch(e.target.value)}
                          className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 w-36 sm:w-44 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                    </div>

                    {/* Parameters Table */}
                    <div className="border rounded-xl overflow-hidden shadow-2xs">
                      <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50 dark:bg-slate-800/80 sticky top-0 z-10 text-slate-500 font-semibold border-b">
                            <tr>
                              <th className="py-2.5 px-3.5">Code</th>
                              <th className="py-2.5 px-3.5">Parameter Name</th>
                              <th className="py-2.5 px-3.5">Category</th>
                              <th className="py-2.5 px-3.5">Observed Value</th>
                              <th className="py-2.5 px-3.5">Normal Reference Range</th>
                              <th className="py-2.5 px-3.5">Evaluation Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {filteredParameters.map((p) => {
                              const isAbnormal = p.result_type === "LOW" || p.result_type === "HIGH";
                              const displayName = reportLang === "hi" && p.name_hi ? p.name_hi : p.name;

                              return (
                                <tr
                                  key={p._id}
                                  className={
                                    isAbnormal
                                      ? "bg-rose-50/40 dark:bg-rose-950/20 hover:bg-rose-50/70"
                                      : "hover:bg-slate-50 dark:hover:bg-slate-800/40"
                                  }
                                >
                                  <td className="py-2.5 px-3.5 font-mono font-bold text-slate-500">
                                    {p.code || "—"}
                                  </td>
                                  <td className="py-2.5 px-3.5 font-semibold text-slate-800 dark:text-slate-200">
                                    {displayName}
                                    {reportLang === "hi" && p.name && (
                                      <span className="block text-[10px] text-slate-400 font-normal">
                                        {p.name}
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-2.5 px-3.5 text-slate-500">{p.category || "General"}</td>
                                  <td className="py-2.5 px-3.5 font-bold font-mono text-slate-900 dark:text-slate-100">
                                    {p.raw_value} <span className="text-[10px] font-normal text-slate-500">{p.unit}</span>
                                  </td>
                                  <td className="py-2.5 px-3.5 text-slate-500 font-mono">
                                    {p.normal_min !== undefined && p.normal_max !== undefined
                                      ? `${p.normal_min} – ${p.normal_max} ${p.unit || ""}`
                                      : "—"}
                                  </td>
                                  <td className="py-2.5 px-3.5">
                                    {p.result_type === "HIGH" ? (
                                      <span className="inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                                        <TrendingUp className="h-3 w-3" /> HIGH
                                      </span>
                                    ) : p.result_type === "LOW" ? (
                                      <span className="inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                                        <TrendingDown className="h-3 w-3" /> LOW
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                                        <CheckCircle2 className="h-3 w-3" /> NORMAL
                                      </span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* Selected Report Content & Clinical Recommendations */}
                  <div className="space-y-4 pt-2">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-amber-500" />
                        Selected Clinical & Ayurvedic Recommendations in Report
                      </h4>
                      <p className="text-xs text-slate-500">
                        The specific guidance points and remedies chosen for inclusion in this patient's final report.
                      </p>
                    </div>

                    {(detailedReport.abnormal_analysis || []).length === 0 ? (
                      <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                        All evaluated parameters are within the normal range for this session. No abnormal alerts triggered.
                      </div>
                    ) : (
                      <div className="space-y-3.5">
                        {detailedReport.abnormal_analysis.map((item, idx) => {
                          const p = item.parameter;
                          const paramName = reportLang === "hi" && p.name_hi ? p.name_hi : p.name;

                          // Only show sections that have selected items
                          const validSections = (item.sections || []).filter(
                            (sec) => (sec.items || []).some((it) => it.is_selected)
                          );

                          if (validSections.length === 0) return null;

                          return (
                            <div
                              key={p._id || idx}
                              className="p-4 bg-slate-50/70 dark:bg-slate-800/40 rounded-xl border border-slate-200/80 dark:border-slate-700/80 space-y-3"
                            >
                              <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-700/60">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-bold text-xs bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 px-2 py-0.5 rounded">
                                    {p.code}
                                  </span>
                                  <h5 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                                    {paramName}
                                  </h5>
                                </div>
                                <span
                                  className={`text-xs font-bold px-2 py-0.5 rounded ${item.result_type === "HIGH"
                                      ? "bg-rose-100 text-rose-700"
                                      : "bg-amber-100 text-amber-700"
                                    }`}
                                >
                                  {item.result_type}: {item.raw_value} {p.unit || ""} (Range: {p.normal_min}–{p.normal_max})
                                </span>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {validSections.map((sec) => {
                                  const secTitle = reportLang === "hi" && sec.title_hi ? sec.title_hi : sec.title_en;
                                  const selectedItems = (sec.items || []).filter((it) => it.is_selected);

                                  return (
                                    <div
                                      key={sec.id}
                                      className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700/60 text-xs space-y-1.5"
                                    >
                                      <p className="font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wide text-[11px]">
                                        {secTitle}
                                      </p>
                                      <ul className="space-y-1 text-slate-700 dark:text-slate-300 pl-3 list-disc">
                                        {selectedItems.map((it) => (
                                          <li key={it.id} className="leading-relaxed">
                                            {reportLang === "hi" && it.text_hi ? it.text_hi : it.text_en}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 flex items-center justify-between">
              <Button variant="outline" size="sm" onClick={() => setReportModalOpen(false)}>
                Close Viewer
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDownloadReport(selectedVisitId)}
                >
                  <Download className="h-4 w-4 mr-1.5" /> Download Report
                </Button>
                <Button
                  size="sm"
                  onClick={() => navigate(`/report-pdf/${selectedVisitId}`)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                >
                  <ExternalLink className="h-4 w-4 mr-1.5" /> Open Full PDF Report
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Patient Dialog */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-lg space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold">
                <Pencil className="h-5 w-5" />
                <h3 className="text-lg">Edit Patient Profile ({patientData.patient_code})</h3>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
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
                    value={editForm.age}
                    onChange={(e) => setEditForm({ ...editForm, age: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white dark:bg-slate-800 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Gender *
                  </label>
                  <select
                    value={editForm.gender}
                    onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
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
                    maxLength={10}
                    value={editForm.mobile}
                    onChange={(e) => setEditForm({ ...editForm, mobile: e.target.value.replace(/\D/g, "") })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white dark:bg-slate-800 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="patient@example.com"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
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
                  value={editForm.dob}
                  onChange={(e) => setEditForm({ ...editForm, dob: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white dark:bg-slate-800 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0.5"
                    max="300"
                    placeholder="e.g. 68"
                    value={editForm.weight}
                    onChange={(e) => setEditForm({ ...editForm, weight: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white dark:bg-slate-800 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="20"
                    max="300"
                    placeholder="e.g. 172"
                    value={editForm.height}
                    onChange={(e) => setEditForm({ ...editForm, height: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white dark:bg-slate-800 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Full Residential Address
                </label>
                <textarea
                  rows={2}
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white dark:bg-slate-800 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowEditModal(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submittingEdit}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5"
                >
                  {submittingEdit ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
