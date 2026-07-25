import axiosInstance from "@/lib/axios";

const ENDPOINT = "dashboard";

export const getTotalCount = async () => {
  try {
    const response = await axiosInstance.get(`${ENDPOINT}/getTotalCount`);
    return {
      data: response.data.data,
    };
  } catch (error) {
    console.error("Error fetching count:", error);
    throw error;
  }
};

export const getMonthlyBookings = async () => {
  try {
    const response = await axiosInstance.get(`${ENDPOINT}/getMonthlyBookings`);
    return {
      data: response.data.data,
    };
  } catch (error) {
    console.error("Error fetching count:", error);
    throw error;
  }
};

export const getServiceOverview = async () => {
  try {
    const response = await axiosInstance.get(`${ENDPOINT}/getServiceOverview`);
    return {
      data: response.data.data,
    };
  } catch (error) {
    console.error("Error fetching count:", error);
    throw error;
  }
};

// export const getTotalCount = async (data) => {
//   try {
//     const response = await axiosInstance.get(
//       `${ENDPOINT}/getTotalCount`,
//       data
//         ? {
//             params: data,
//           }
//         : {}
//     );
//     return {
//       data: response.data.data,
//     };
//   } catch (error) {
//     console.error("Error fetching count:", error);
//     throw error;
//   }
// };

// export const getMonthlyBookings = async (data) => {
//   try {
//     const response = await axiosInstance.get(
//       `${ENDPOINT}/getMonthlyBookings`,
//       data
//         ? {
//             params: data,
//           }
//         : {}
//     );
//     return {
//       data: response.data.data,
//     };
//   } catch (error) {
//     console.error("Error fetching count:", error);
//     throw error;
//   }
// };

// export const getServiceOverview = async (data) => {
//   try {
//     const response = await axiosInstance.get(
//       `${ENDPOINT}/getServiceOverview`,
//       data
//         ? {
//             params: data,
//           }
//         : {}
//     );
//     return {
//       data: response.data.data,
//     };
//   } catch (error) {
//     console.error("Error fetching count:", error);
//     throw error;
//   }
// };

export const getNotificationUserWise = async (data) => {
  try {
    const response = await axiosInstance.get(
      `notification/getNotificationByUserId`,
      data
        ? {
            params: data,
          }
        : {}
    );
    return {
      data: response.data.data,
    };
  } catch (error) {
    console.error("Error fetching count:", error);
    throw error;
  }
};

export const updateNotification = async (notificationId) => {
  try {
    // Always send as array
    const payload = {
      notificationId: Array.isArray(notificationId)
        ? notificationId
        : [notificationId],
    };
    const response = await axiosInstance.post(
      "notification/updateNotification",
      payload
    );
    return response.data;
  } catch (error) {
    console.error("Error updating notification:", error);
    throw error;
  }
};

export const getDashboardLists = async ({
  page = 1,
  limit = 10,
  search = "",
} = {}) => {
  try {
    const response = await axiosInstance.get(`${ENDPOINT}/getDashboardLists`, {
      params: { page, limit, search },
    });
    // debugger
    return {
      data:
        response.data.data?.serviceCities?.map((data, index) => {
          const serialNumber = (page - 1) * limit + index + 1;
          return {
            ...data,
            sNo: serialNumber,
            id: data._id,
          };
        }) || [],
      total: response.data.data?.pagination.total,
    };
  } catch (error) {
    throw new Error(error?.response?.data?.message || "Failed to fetch List");
  }
};

export const getTotalUsers = async () => {
  try {
    const response = await axiosInstance.get(`${ENDPOINT}/getTotalCount`, {});
    return {
      data:
        response.data.data?.topUsers?.map((data, index) => {
          return {
            ...data,
            sNo: index + 1,
            id: data._id,
          };
        }) || [],
    };
  } catch (error) {
    throw new Error(error?.response?.data?.message || "Failed to fetch List");
  }
};
