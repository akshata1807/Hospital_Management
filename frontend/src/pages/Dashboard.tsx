import { Link } from "react-router-dom";
import { Calendar, Users, Clock, MessageCircle, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  { to: "/book-appointment", title: "Book Appointment", desc: "Schedule a new appointment with our specialists", icon: Calendar, color: "bg-primary/10 text-primary" },
  { to: "/doctor-slots", title: "Doctor Slots", desc: "View available doctors and their schedules", icon: Users, color: "bg-accent/10 text-accent" },
  { to: "/reschedule", title: "Reschedule", desc: "Change your existing appointment date & time", icon: Clock, color: "bg-amber-500/10 text-amber-600" },
  { to: "/chatbot", title: "AI Health Assistant", desc: "Get instant answers to your health queries", icon: MessageCircle, color: "bg-violet-500/10 text-violet-600" },
];

export default function Dashboard() {
  return (
    <div className="page-container">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-8 md:p-12 mb-10"
        style={{ background: "var(--gradient-hero)" }}
      >
        <h1 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-3">
          Welcome to MediCare
        </h1>
        <p className="text-primary-foreground/80 max-w-lg text-lg">
          Your trusted hospital management platform. Book appointments, consult doctors, and manage your health — all in one place.
        </p>
        <Link
          to="/book-appointment"
          className="inline-flex items-center gap-2 mt-6 px-6 py-3 rounded-xl bg-card text-primary font-semibold hover:shadow-lg transition-shadow"
        >
          Book an Appointment <ArrowRight className="w-4 h-4" />
        </Link>
      </motion.div>

      {/* Feature cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {features.map((f, i) => (
          <motion.div
            key={f.to}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Link
              to={f.to}
              className="form-section flex flex-col gap-4 hover:shadow-[var(--shadow-elevated)] transition-shadow group"
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${f.color}`}>
                <f.icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{f.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{f.desc}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
