import { z } from "zod";

export const INDIA_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi NCR",
  "Jammu & Kashmir",
  "Ladakh",
];

export const FRANCHISE_TYPES = [
  "Standard Distributor",
  "District Franchise",
  "State Franchise",
  "Panchayat Franchise",
  "Store Partner",
];

export const UNDER_GROUPS = [
  "General Group",
  "Group A",
  "Group B",
  "Group C",
];

export const ACCOUNT_TYPES = [
  "Savings",
  "Current",
  "Salary",
  "NRE/NRO",
];

export const memberProfileSchema = z
  .object({
    distributor_id: z.string().optional(),
    franchise_code: z.string().optional(),

    member_name: z.string().min(2, "Member Name is required"),
    branch_name: z.string().optional(),
    store_name: z.string().optional(),
    state: z.string().min(1, "Please select a State"),
    city: z.string().min(2, "City is required"),
    district: z.string().min(2, "District is required"),
    area: z.string().optional(),
    franchise_type: z.string().min(1, "Please select Franchise Type"),
    under_group: z.string().min(1, "Please select Under Group"),

    contact_person: z.string().min(2, "Contact Person Name is required"),
    phone: z
      .string()
      .regex(/^[0-9]{10}$/, "Phone number must be exactly 10 digits"),
    email: z.string().email("Invalid email address"),
    address: z.string().min(5, "Full Address is required"),
    pincode: z
      .string()
      .regex(/^[0-9]{6}$/, "PIN Code must be exactly 6 digits"),

    // Bank Details
    account_name: z.string().min(2, "Account Holder Name is required"),
    bank_name: z.string().min(2, "Bank Name is required"),
    account_number: z.string().min(5, "Valid Account Number is required"),
    account_type: z.string().min(1, "Please select Account Type"),
    ifsc_code: z
      .string()
      .regex(
        /^[A-Za-z]{4}0[A-Za-z0-9]{6}$/,
        "Invalid IFSC format (e.g. SBIN0001234)"
      ),
    branch_address: z.string().optional(),

    // Login Details (Optional updates)
    password: z
      .string()
      .optional()
      .refine(
        (val) => !val || val.length >= 8,
        "Password must be at least 8 characters"
      ),
    confirm_password: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.password && data.password.trim() !== "") {
      if (data.password !== data.confirm_password) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Passwords do not match",
          path: ["confirm_password"],
        });
      }
    }
  });
