// src/services/userService.js
import axiosInstance from "@/lib/axios";
import { Config } from "@/lib/Config";

const ENDPOINT = "user";

// GET ALL USERS (with filters, search, pagination, sorting)
export const getAllUsers = async ({
  page = 1,
  limit = 10,
  search = "",
  isActive,
  startDate,
  endDate,
  sort = { key: "name", direction: "asc" },
}) => {
  try {
    const params = {
      search,
      ...(isActive !== undefined && { isActive }),
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
      page,
      limit,
      // ...(isActive !== undefined && { isActive }),
      "sort[key]": sort.key,
      "sort[direction]": sort.direction,
    };

    const response = await axiosInstance.get(`${ENDPOINT}`, {
      // params,
    });
    return {
      data: response.data.data.map((user, index) => {
        const serialNumber = (page - 1) * limit + index + 1;
        return {
          ...user,
          sNo: serialNumber,
          id: user._id,
          fullName: `${user.firstname} ${user.lastname}`,
          // joinedOn: new Date(user.createdAt).toLocaleString(),
          isActive: user.isActive,
          profileUrl: user.image
            ? Config.API_URL + user.image
            : "default-profile.png", // Fallback to a default image if none exists
          createdAt: user.createdAt
            ? `${new Date(user.createdAt).toLocaleString()}`
            : "N/A",
        };
      }),
      total: response.data.data.count,
    };
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

// TOGGLE ACTIVE STATUS (soft delete)
export const toggleUserStatus = (id, body) =>
  axiosInstance.put(`${ENDPOINT}/deleteUser`, body);

// GET USER BY ID
export const getUserById = async (id) => {
  const response = await axiosInstance.get(`${ENDPOINT}/${id}`);
  return response.data.data;
};

// UPDATE USER
export const updateUser = async (userId, data) => {
  const payload = { userId, ...data };
  const response = await axiosInstance.put("auth/update", payload);
  return response.data;
};
