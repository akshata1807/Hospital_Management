// Frontend API URLs
const API_BASE_URL = "http://127.0.0.1:8000";

const URLS = {
  bookAppointment: `${API_BASE_URL}/book-appointment`,
  rescheduleAppointment: `${API_BASE_URL}/reschedule-appointment`,
  chatbot: `${API_BASE_URL}/chat`,
};

async function postJSON(url: string, data: Record<string, unknown>) {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify(data),
  });

  let json;
  try {
    json = await res.json();
  } catch {
    json = null;
  }

  if (!res.ok) {
    const msg =
      json?.detail ||
      json?.message ||
      json?.error ||
      `Request failed with status ${res.status}`;
    throw new Error(msg);
  }

  return json;
}

export async function bookAppointment(data: {
  Patient_Name: string;
  Phone: string;
  Gmail: string;
  Department: string;
  Doctor_Name: string;
  Appointment_Date: string;
  Appointment_Time: string;
  Notes?: string;
}) {
  const payload = {
    patient_name: data.Patient_Name,
    phone: data.Phone,
    gmail: data.Gmail,
    department: data.Department,
    doctor_name: data.Doctor_Name,
    appointment_date: data.Appointment_Date,
    appointment_time: data.Appointment_Time,
    notes: data.Notes || "",
  };

  return postJSON(URLS.bookAppointment, payload);
}

export async function rescheduleAppointment(data: {
  Appointment_ID: string;
  New_Appointment_Date: string;
  New_Appointment_Time: string;
}) {
  const payload = {
    appointment_id: data.Appointment_ID,
    new_appointment_date: data.New_Appointment_Date,
    new_appointment_time: data.New_Appointment_Time,
  };

  return postJSON(URLS.rescheduleAppointment, payload);
}

export async function sendChatMessage(message: string, sessionId: string) {
  return postJSON(URLS.chatbot, {
    message,
    session_id: sessionId,
  });
}