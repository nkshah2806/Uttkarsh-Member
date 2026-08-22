import React, { createContext, useContext, useState } from "react";

const translations = {
  en: {
    dashboard: "Dashboard",
    quantumModule: "Quantum Health Analysis",
    patientReg: "Patient Registration",
    quantumEntry: "Quantum Machine Scan",
    reportHistory: "Report History",
    registerPatient: "Register New Patient",
    patientName: "Patient Name",
    age: "Age",
    gender: "Gender",
    mobile: "Mobile Number",
    saveProceed: "Save & Proceed to Scan",
    quantumScanTitle: "Quantum Machine Parameter Entry",
    normalRange: "Normal Range",
    rawInput: "Value",
    status: "Status",
    bulkCSV: "CSV Upload",
    runAutoAnalysis: "Save & Run Analysis",
    autoReportTitle: "Report Content Review",
    prioritySelectNotice: "Auto-selected content shown. Toggle items to include or exclude from the final report.",
    problem: "Health Problems Identified",
    cause: "Possible Causes",
    precaution: "Precautions",
    pathya: "Pathya (Do's)",
    parhej: "Parhej (Don'ts)",
    medicine: "Ayurvedic Medicines",
    diet: "Diet Chart",
    generatePDF: "Generate Final Report",
    shareWhatsApp: "Share via WhatsApp",
    downloadPDF: "Download PDF",
    printView: "Print",
    language: "Language",
  },
  hi: {
    dashboard: "डैशबोर्ड",
    quantumModule: "क्वांटम स्वास्थ्य विश्लेषण",
    patientReg: "रोगी पंजीकरण",
    quantumEntry: "क्वांटम मशीन स्कैन",
    reportHistory: "रिपोर्ट इतिहास",
    registerPatient: "नया रोगी पंजीकृत करें",
    patientName: "रोगी का नाम",
    age: "आयु",
    gender: "लिंग",
    mobile: "मोबाइल नंबर",
    saveProceed: "सहेजें और स्कैन शुरू करें",
    quantumScanTitle: "क्वांटम मशीन पैरामीटर प्रविष्टि",
    normalRange: "सामान्य सीमा",
    rawInput: "मान",
    status: "स्थिति",
    bulkCSV: "सीएसवी अपलोड",
    runAutoAnalysis: "सहेजें और विश्लेषण करें",
    autoReportTitle: "रिपोर्ट सामग्री समीक्षा",
    prioritySelectNotice: "स्वचालित रूप से चुनी गई सामग्री दिखाई जा रही है। अंतिम रिपोर्ट से पहले समीक्षा करें।",
    problem: "पहचानी गई स्वास्थ्य समस्याएं",
    cause: "संभावित कारण",
    precaution: "सावधानियां",
    pathya: "पथ्य (क्या खाएं)",
    parhej: "परहेज (क्या न खाएं)",
    medicine: "आयुर्वेदिक औषधि सुझाव",
    diet: "आहार सारणी",
    generatePDF: "अंतिम रिपोर्ट तैयार करें",
    shareWhatsApp: "व्हाट्सएप पर शेयर करें",
    downloadPDF: "पीडीएफ डाउनलोड करें",
    printView: "प्रिंट",
    language: "भाषा",
  },
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem("app_lang") || "en");

  const toggleLanguage = () => {
    const next = lang === "en" ? "hi" : "en";
    setLang(next);
    localStorage.setItem("app_lang", next);
  };

  const t = (key) => translations[lang]?.[key] || translations["en"]?.[key] || key;

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
