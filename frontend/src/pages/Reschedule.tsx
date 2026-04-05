import { useState } from "react";
import { motion } from "framer-motion";
import { Clock, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { rescheduleAppointment } from "@/lib/n8n";
import { toast } from "sonner";

const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const minutes = ["00", "15", "30", "45"];

export default function Reschedule() {
  const [appointmentId, setAppointmentId] = useState("");
  const [date, setDate] = useState("");
  const [hour, setHour] = useState("");
  const [minute, setMinute] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!appointmentId || !date || !hour || !minute) {
      toast.error("Please fill all fields");
      return;
    }
    const timeStr = `${hour}:${minute}`;
    setLoading(true);
    try {
      await rescheduleAppointment({ Appointment_ID: appointmentId, New_Appointment_Date: date, New_Appointment_Time: timeStr });
      setSuccess(true);
      toast.success("Appointment rescheduled successfully!");
      setAppointmentId(""); setDate(""); setHour(""); setMinute("");
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to reschedule. Please try again.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container max-w-lg">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h1 className="page-title">Reschedule Appointment</h1>
            <p className="page-subtitle">Change your appointment date & time</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="form-section space-y-5">
          <div className="space-y-2">
            <Label>Appointment ID</Label>
            <Input placeholder="e.g. APT-001" value={appointmentId} onChange={e => setAppointmentId(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>New Preferred Date</Label>
            <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>New Preferred Time</Label>
            <div className="grid grid-cols-2 gap-2">
              <Select value={hour} onValueChange={setHour}>
                <SelectTrigger><SelectValue placeholder="Hour" /></SelectTrigger>
                <SelectContent>
                  {hours.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={minute} onValueChange={setMinute}>
                <SelectTrigger><SelectValue placeholder="Min" /></SelectTrigger>
                <SelectContent>
                  {minutes.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Rescheduling...</> :
             success ? <><CheckCircle2 className="w-4 h-4 mr-2" /> Done!</> :
             "Reschedule Appointment"}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
