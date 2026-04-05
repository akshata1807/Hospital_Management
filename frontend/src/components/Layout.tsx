import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { Calendar, Clock, Users, MessageCircle, Menu, X, HeartPulse } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { to: "/", label: "Dashboard", icon: HeartPulse },
  { to: "/book-appointment", label: "Book Appointment", icon: Calendar },
  { to: "/doctor-slots", label: "Doctor Slots", icon: Users },
  { to: "/reschedule", label: "Reschedule", icon: Clock },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Top nav */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <HeartPulse className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-lg text-foreground">MediCare</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(item => {
              const active = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    active ? "nav-link-active bg-primary/10" : "nav-link"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <Link
              to="/chatbot"
              className={`ml-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                location.pathname === "/chatbot"
                  ? "bg-primary text-primary-foreground"
                  : "bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground"
              }`}
            >
              <span className="flex items-center gap-1.5"><MessageCircle className="w-4 h-4" /> AI Chat</span>
            </Link>
          </nav>

          <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden overflow-hidden border-t bg-card"
            >
              <div className="px-4 py-3 space-y-1">
                {[...navItems, { to: "/chatbot", label: "AI Chatbot", icon: MessageCircle }].map(item => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium ${
                      location.pathname === item.to ? "bg-primary/10 text-primary" : "text-muted-foreground"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main>{children}</main>
    </div>
  );
}
