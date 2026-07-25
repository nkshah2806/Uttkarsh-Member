import axiosInstance from "@/lib/axios";

const ENDPOINT = "booking";

// GET ALL USERS (with filters, search, pagination, sorting)
export const getAllBooking = async ({
  page = 1,
  limit = 10,
  search = "",
  isActive,
  startDate,
  endDate,
  status,
  sort = { key: "name", direction: "asc" },
}) => {
  try {
    const params = {
      search,
      ...(isActive !== undefined && { isActive }),
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
      ...(status && { status }),
      page,
      limit,
      // ...(isActive !== undefined && { isActive }),
      "sort[key]": sort.key,
      "sort[direction]": sort.direction,
    };

    const response = await axiosInstance.get(`${ENDPOINT}/getAll`, {
      params,
    });
    return {
      data: response.data.data.booking.map((data, index) => {
        const serialNumber = (page - 1) * limit + index + 1;
        return {
          ...data,
          sNo: serialNumber,
          id: data._id,
          dropoffDateTime: new Date(data.dropoffDateTime).toDateString(),
          pickupDateTime: new Date(data.pickupDateTime).toDateString(),
          createdAt: data.createdAt
            ? `${new Date(data.createdAt).toLocaleString()}`
            : "N/A",
        };
      }),
      total: response.data.data.total,
    };
  } catch (error) {
    console.error("Error fetching bookings:", error);
    throw error;
  }
};

export const getBookingById = async (bookingId) => {
  try {
    const response = await axiosInstance.get(
      `${ENDPOINT}/getbookingById/${bookingId}`
    );
    return response.data.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Error fetching booking by ID"
    );
  }
};

export const getUserBooking = async (bookingId) => {
  try {
    const response = await axiosInstance.get(
      `${ENDPOINT}/userBooking/${bookingId}`
    );
    return response.data.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Error fetching booking by ID"
    );
  }
};

export const updateBookingStatus = async (bookingId, status, reason) => {
  try {
    const response = await axiosInstance.put(
      `${ENDPOINT}/updateStatus/${bookingId}`,
      reason ? { status, reason } : { status }
    );
    return response.data.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Error updating booking status"
    );
  }
};

export const isShowApp = async (bookingId, bookingReviewId) => {
  try {
    const response = await axiosInstance.post(
      `${ENDPOINT}/isShowReview/${bookingId}`,
      { bookingReviewId }
    );
    return response.data.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Error updating Is Show App Side"
    );
  }
};

// function generateDummyData(count = 20) {
//   const dummyArray = [];

//   for (let i = 0; i < count; i++) {
//     const serialNumber = i + 1;
//     const now = new Date();
//     const dropoff = new Date(now.getTime() + 1000 * 60 * 60 * 24 * i); // i days from now
//     const pickup = new Date(dropoff.getTime() + 1000 * 60 * 60 * 2); // 2 hours later
//     const createdAt = new Date(now.getTime() - 1000 * 60 * 60 * 24 * i); // i days ago

//     const data = {
//       _id: `dummy_id_${i}`,
//       name: `Dummy Name ${i}`,
//       dropoffDateTime: dropoff.toISOString(),
//       pickupDateTime: pickup.toISOString(),
//       createdAt: createdAt.toISOString(),
//       otherField: `Some data ${i}` // Additional dummy fields if needed
//     };

//     dummyArray.push({
//       ...data,
//       sNo: serialNumber,
//       id: data._id,
//       dropoffDateTime: new Date(data.dropoffDateTime).toDateString(),
//       pickupDateTime: new Date(data.pickupDateTime).toDateString(),
//       createdAt: data.createdAt
//         ? `${new Date(data.createdAt).toLocaleString()}`
//         : "N/A",
//     });
//   }

//   return dummyArray;
// }
