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

  /**
   * Upload the logged-in member's profile picture.
   * Reuses the existing shared upload architecture (multer + /uploads/users)
   * exposed by the backend at POST /api/user/uploadProfileImage.
   *
   * @param {File} file - validated image file (jpeg/jpg/png)
   * @returns {Promise<{ image: string }>} server-relative image reference
   */
  uploadProfilePicture: async (file) => {
    const formData = new FormData();
    // The field name MUST match `uploadSingle("profileImage", { folder: "users" })`
    // in Uttkarsh-Backend/routes/userRoutes.js — otherwise multer reports
    // LIMIT_UNEXPECTED_FILE / no file.
    formData.append("profileImage", file);

    // Do NOT set "Content-Type" manually. Axios/browser must generate the
    // multipart boundary itself; hardcoding "multipart/form-data" produces a
    // header WITHOUT a boundary, so the server cannot parse the body.
    const response = await axiosInstance.post("user/uploadProfileImage", formData);
    return response.data;
  },

  /**
   * Persist the uploaded picture reference onto the member profile so the
   * admin review screens read it from MemberProfile too.
   *
   * @param {string} reference - server-relative image path ("" clears it)
   */
  saveProfilePicture: async (reference) => {
    const response = await axiosInstance.post("member/profile/picture", {
      profile_picture: reference,
    });
    return response.data;
  },
};
