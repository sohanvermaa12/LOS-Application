const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://los-backend-355v.onrender.com";

const sampleBankProfile = {
  success: true,
  message: "Operation completed successfully",
  data: {
    name: "Axis Bank Limited",
    type: "COMMERCIAL_BANK",
    id: "427775a5-81d8-402d-84a4-fd2cac160566",
    pkid: 5,
    bank_code: "AXISBA01",
    bank_name: "Axis Bank Limited",
    legal_name: "Axis Bank Ltd",
    bank_type: "COMMERCIAL_BANK",
    license_number: "REG-MH-2024-9988",
    registration_number: "REG-MH-2024-9988",
    PAN: "AAACA9876K",
    gst_number: "L65110GJ1993PLC020769",
    gst_no: "L65110GJ1993PLC020769",
    CIN: "L65110GJ1993PLC020769",
    website: "https://www.axisbank.com",
    regulatory_authority_id: "b5a76e2d-3c9f-4321-9e87-654321fedcba",
    regulatory_status: "ACTIVE",
    country: "India",
    status: "ACTIVE",
    contact_email: "support@axisbank.com",
    contact_phone: "+912224252525",
    db_name: "los_axisba01_db",
    db_host: "localhost",
    db_port: 5432,
    created_at: "2026-09-28T10:16:18.39665",
    updated_at: "2026-09-28T10:16:18.39665",
  },
};

export async function getBankProfile() {
  const endpoints = [
    "/api/v1/bank-profile",
    "/api/v1/bank-profile/detail",
    "/api/v1/banks/profile",
    "/api/v1/banks/summary",
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        continue;
      }

      const result = await response.json();
      if (result && result.data) {
        return result;
      }
    } catch {
      // Continue to the next endpoint if the current one is unavailable.
    }
  }

  return sampleBankProfile;
}

export { sampleBankProfile };
