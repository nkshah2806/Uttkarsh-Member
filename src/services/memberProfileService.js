import axiosInstance from "@/lib/axios";

export const memberProfileService = {
  /**
   * Fetch current member profile
   */
  getProfile: async () => {
    const response = await axiosInstance.get("member/profile");
    return response.data;
  },

  /**
   * Save or update member profile
   */
  saveProfile: async (payload) => {
    const response = await axiosInstance.post("member/profile", payload);
    return response.data;
  },
};
