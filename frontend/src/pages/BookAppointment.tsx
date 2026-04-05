import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Calendar, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { doctors, departments } from "@/lib/doctors";
import { bookAppointment } from "@/lib/n8n";
import { toast } from "sonner";

function getAvailableSlots(startTime: string, endTime: string) {
  const slots: { label: string; value: string }[] = [];
  const [startH] = startTime.split(":").map(Number);
  const [endH] = endTime.split(":").map(Number);

  for (let h = startH; h < endH; h++) {
    for (const m of [0, 15, 30, 45]) {
      const hour12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
      const ampm = h >= 12 ? "PM" : "AM";
      const label = `${String(hour12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${ampm}`;
      const value24 = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
      slots.push({ label, value: value24 });
    }
  }
  return slots;
}

function getAvailableDays(availableDays: string): number[] {
  const dayMap: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  if (availableDays === "Mon-Sun") return [0, 1, 2, 3, 4, 5, 6];
  if (availableDays === "Mon-Sat") return [1, 2, 3, 4, 5, 6];
  if (availableDays === "Mon-Fri") return [1, 2, 3, 4, 5];
  const parts = availableDays.split("-");
  if (parts.length === 2) {
    const start = dayMap[parts[0]] ?? 1;
    const end = dayMap[parts[1]] ?? 5;
    const days: number[] = [];
    for (let i = start; i <= end; i++) days.push(i);
    return days;
  }
  return [1, 2, 3, 4, 5];
}

export default function BookAppointment() {
  const [form, setForm] = useState({
    Patient_Name: "", Phone: "", Gmail: "", Department: "", Doctor_Name: "", Appointment_Date: "",
  });
  const [selectedTime, setSelectedTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const filteredDoctors = form.Department ? doctors.filter(d => d.Department === form.Department) : doctors;
  const selectedDoctor = doctors.find(d => d.Doctor_Name === form.Doctor_Name);

  const availableSlots = useMemo(() => {
    if (!selectedDoctor) return [];
    return getAvailableSlots(selectedDoctor.Start_Time, selectedDoctor.End_Time);
  }, [selectedDoctor]);

  const availableDays = useMemo(() => {
    if (!selectedDoctor) return [];
    return getAvailableDays(selectedDoctor.Available_Days);
  }, [selectedDoctor]);

  const minDate = new Date().toISOString().split("T")[0];

  const update = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));

  const isDateValid = (dateStr: string) => {
    if (!dateStr || availableDays.length === 0) return true;
    const day = new Date(dateStr).getDay();
    return availableDays.includes(day);
  };

  const handleDateChange = (val: string) => {
    update("Appointment_Date", val);
    if (!isDateValid(val)) {
      const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const allowed = availableDays.map(d => dayNames[d]).join(", ");
      toast.error(`Doctor is only available on: ${allowed}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.Patient_Name || !form.Phone || !form.Gmail || !form.Department || !form.Doctor_Name || !form.Appointment_Date || !selectedTime) {
      toast.error("Please fill all fields");
      return;
    }
    if (!isDateValid(form.Appointment_Date)) {
      toast.error("Selected date is not an available day for this doctor");
      return;
    }
    setLoading(true);
    try {
      await bookAppointment({ ...form, Appointment_Time: selectedTime });
      setSuccess(true);
      toast.success("Appointment booked successfully!");
      setForm({ Patient_Name: "", Phone: "", Gmail: "", Department: "", Doctor_Name: "", Appointment_Date: "" });
      setSelectedTime("");
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to book appointment. Please try again.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container max-w-2xl">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="page-title">Book Appointment</h1>
            <p className="page-subtitle">Schedule a visit with our specialists</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="form-section space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Patient Name</Label>
              <Input placeholder="Full name" value={form.Patient_Name} onChange={e => update("Patient_Name", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input placeholder="+91 XXXXXXXXXX" value={form.Phone} onChange={e => update("Phone", e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Gmail</Label>
            <Input type="email" placeholder="patient@gmail.com" value={form.Gmail} onChange={e => update("Gmail", e.target.value)} />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Department</Label>
              <Select value={form.Department} onValueChange={v => { update("Department", v); update("Doctor_Name", ""); setSelectedTime(""); }}>
                <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                <SelectContent>
                  {departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Doctor</Label>
              <Select value={form.Doctor_Name} onValueChange={v => { update("Doctor_Name", v); setSelectedTime(""); update("Appointment_Date", ""); }}>
                <SelectTrigger><SelectValue placeholder="Select doctor" /></SelectTrigger>
                <SelectContent>
                  {filteredDoctors.map(d => (
                    <SelectItem key={d.Doctor_ID} value={d.Doctor_Name}>
                      {d.Doctor_Name} ({d.Start_Time}–{d.End_Time})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedDoctor && (
            <div className="text-sm text-muted-foreground bg-secondary/50 rounded-lg p-3">
              <strong>{selectedDoctor.Doctor_Name}</strong> is available <strong>{selectedDoctor.Available_Days}</strong> from <strong>{selectedDoctor.Start_Time}</strong> to <strong>{selectedDoctor.End_Time}</strong> · Room {selectedDoctor.Room_No} · ₹{selectedDoctor.Consultation_Fee}
            </div>
          )}

          <div className="space-y-2">
            <Label>Date</Label>
            <Input type="date" min={minDate} value={form.Appointment_Date} onChange={e => handleDateChange(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label>Time Slot</Label>
            {availableSlots.length > 0 ? (
              <Select value={selectedTime} onValueChange={setSelectedTime}>
                <SelectTrigger><SelectValue placeholder="Select available time" /></SelectTrigger>
                <SelectContent>
                  {availableSlots.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-sm text-muted-foreground">Please select a doctor first to see available slots</p>
            )}
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Booking...</> :
             success ? <><CheckCircle2 className="w-4 h-4 mr-2" /> Booked!</> :
             "Book Appointment"}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}