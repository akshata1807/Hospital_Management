export interface Doctor {
  Doctor_ID: string;
  Doctor_Name: string;
  Department: string;
  Available_Days: string;
  Start_Time: string;
  End_Time: string;
  Consultation_Fee: number;
  Room_No: number;
  Status: string;
}

export const doctors: Doctor[] = [
  { Doctor_ID: "DOC-001", Doctor_Name: "Dr. Sarah Johnson", Department: "Cardiology", Available_Days: "Mon-Fri", Start_Time: "09:00", End_Time: "17:00", Consultation_Fee: 500, Room_No: 101, Status: "Active" },
  { Doctor_ID: "DOC-002", Doctor_Name: "Dr. Maria Garcia", Department: "Dermatology", Available_Days: "Mon-Fri", Start_Time: "11:00", End_Time: "19:00", Consultation_Fee: 400, Room_No: 102, Status: "Active" },
  { Doctor_ID: "DOC-003", Doctor_Name: "Dr. Robert Taylor", Department: "ENT", Available_Days: "Mon-Sat", Start_Time: "10:00", End_Time: "18:00", Consultation_Fee: 450, Room_No: 103, Status: "Active" },
  { Doctor_ID: "DOC-004", Doctor_Name: "Dr. David Lee", Department: "General Medicine", Available_Days: "Mon-Sun", Start_Time: "08:00", End_Time: "20:00", Consultation_Fee: 300, Room_No: 104, Status: "Active" },
  { Doctor_ID: "DOC-005", Doctor_Name: "Dr. Lisa Anderson", Department: "Gynecology", Available_Days: "Mon-Fri", Start_Time: "09:00", End_Time: "17:00", Consultation_Fee: 500, Room_No: 105, Status: "Active" },
  { Doctor_ID: "DOC-006", Doctor_Name: "Dr. Michael Chen", Department: "Neurology", Available_Days: "Mon-Sat", Start_Time: "10:00", End_Time: "18:00", Consultation_Fee: 600, Room_No: 106, Status: "Active" },
];

export const departments = [...new Set(doctors.map(d => d.Department))];
