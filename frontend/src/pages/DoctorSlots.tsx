import { useState } from "react";
import { motion } from "framer-motion";
import { Users, Search, Clock, MapPin, IndianRupee } from "lucide-react";
import { Input } from "@/components/ui/input";
import { doctors, departments } from "@/lib/doctors";

export default function DoctorSlots() {
  const [search, setSearch] = useState("");
  const [dept, setDept] = useState("");

  const filtered = doctors.filter(d => {
    const matchSearch = d.Doctor_Name.toLowerCase().includes(search.toLowerCase()) || d.Department.toLowerCase().includes(search.toLowerCase());
    const matchDept = !dept || d.Department === dept;
    return matchSearch && matchDept;
  });

  return (
    <div className="page-container">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <Users className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h1 className="page-title">Doctor Slots</h1>
            <p className="page-subtitle">Browse our specialists and their availability</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search doctors..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setDept("")} className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${!dept ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>All</button>
            {departments.map(d => (
              <button key={d} onClick={() => setDept(d)} className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${dept === d ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>{d}</button>
            ))}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((doc, i) => (
            <motion.div
              key={doc.Doctor_ID}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="form-section hover:shadow-[var(--shadow-elevated)] transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-foreground">{doc.Doctor_Name}</h3>
                  <p className="text-sm text-muted-foreground">{doc.Department}</p>
                </div>
                <span className="status-active">{doc.Status}</span>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2"><Clock className="w-3.5 h-3.5" /> {doc.Available_Days} · {doc.Start_Time}–{doc.End_Time}</div>
                <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5" /> Room {doc.Room_No}</div>
                <div className="flex items-center gap-2"><IndianRupee className="w-3.5 h-3.5" /> ₹{doc.Consultation_Fee}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
