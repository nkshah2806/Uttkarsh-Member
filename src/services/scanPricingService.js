import axiosInstance from "@/lib/axios";

const BASE = "v1/scan-pricing";

export const scanPricingService = {
    // Returns array of active scan pricings
    // [{ _id, name, description, amount, is_active, is_default }]
    getActiveScanPricings: async () => {
        try {
            const res = await axiosInstance.get(`${BASE}/active`);
            return res.data?.data || [];
        } catch (err) {
            console.warn("Backend fetch failed for active scan pricings:", err.message);
            return [];
        }
    },
};
