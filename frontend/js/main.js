document.addEventListener("DOMContentLoaded", () => {
    const API_BASE_URL = "http://127.0.0.1:8000";

    // 1. Setup Mobile Navigation Toggle
    const mobileMenuBtn = document.getElementById("mobile-menu-btn");
    const mobileNav = document.getElementById("mobile-nav");
    
    if (mobileMenuBtn && mobileNav) {
        mobileMenuBtn.addEventListener("click", () => {
            if (mobileNav.style.display === "block") {
                mobileNav.style.display = "none";
            } else {
                mobileNav.style.display = "block";
            }
        });
    }

    // 2. Active Link Highlighting
    const currentPath = window.location.pathname.split("/").pop() || "index.html";
    const navLinks = document.querySelectorAll(".nav-links a, .mobile-nav-links a");
    
    navLinks.forEach(link => {
        const linkPath = link.getAttribute("href");
        if (linkPath === currentPath) {
            link.classList.add("active");
        }
    });

    // 3. Initialize Lucide Icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // 4. Handle Book Appointment Form via Backend
    const bookingForm = document.getElementById("booking-form");
    const departmentSelect = document.getElementById("department");
    const doctorSelect = document.getElementById("doctor_name");

    const doctorsByDepartment = {
        "cardiology": ["Dr. Sarah Johnson"],
        "dermatology": ["Dr. Maria Garcia"],
        "ent": ["Dr. Robert Taylor"],
        "general-medicine": ["Dr. David Lee"],
        "gynecology": ["Dr. Lisa Anderson"],
        "neurology": ["Dr. Michael Chen"]
    };

    if (departmentSelect && doctorSelect) {
        departmentSelect.addEventListener("change", (e) => {
            const dept = e.target.value;
            doctorSelect.innerHTML = '<option value="">-- Choose a Doctor --</option>';
            if (dept && doctorsByDepartment[dept]) {
                doctorsByDepartment[dept].forEach(doc => {
                    const option = document.createElement("option");
                    option.value = doc;
                    option.textContent = doc;
                    doctorSelect.appendChild(option);
                });
                doctorSelect.disabled = false;
            } else {
                doctorSelect.innerHTML = '<option value="">-- First Choose a Department --</option>';
                doctorSelect.disabled = true;
            }
        });
    }

    if (bookingForm) {
        bookingForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const btn = document.getElementById("submit-btn");
            const spinner = document.getElementById("btn-spinner");
            const text = document.getElementById("btn-text");
            
            btn.disabled = true;
            spinner.style.display = "inline-block";
            text.textContent = "Booking...";

            const payload = {
                patient_name: document.getElementById("fullName").value,
                phone: document.getElementById("phone").value,
                gmail: document.getElementById("gmail").value,
                department: document.getElementById("department").value,
                doctor_name: document.getElementById("doctor_name").value,
                appointment_date: document.getElementById("appointment_date").value,
                appointment_time: document.getElementById("appointment_time").value,
                notes: document.getElementById("reason") ? document.getElementById("reason").value : ""
            };

            try {
                const res = await fetch(`${API_BASE_URL}/book-appointment`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });
                const data = await res.json();

                if (res.ok) {
                    alert(`Appointment Booked Successfully! ID: ${data.appointment_id}`);
                    bookingForm.reset();
                } else {
                    alert(`Failed to book appointment: ${data.detail || 'Unknown error'}`);
                }
            } catch (err) {
                console.error(err);
                alert("Error connecting to server. Is the backend running?");
            } finally {
                spinner.style.display = "none";
                text.textContent = "Book Appointment";
                btn.disabled = false;
            }
        });
    }
    
    // 5. Handle Reschedule Form via Backend
    const rescheduleForm = document.getElementById("reschedule-form");
    if (rescheduleForm) {
        rescheduleForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const btn = document.getElementById("reschedule-btn");
            const spinner = document.getElementById("reschedule-spinner");
            const text = document.getElementById("reschedule-text");
            
            btn.disabled = true;
            spinner.style.display = "inline-block";
            text.textContent = "Rescheduling...";

            const payload = {
                appointment_id: document.getElementById("app-id").value,
                new_appointment_date: document.getElementById("new-date").value,
                new_appointment_time: document.getElementById("new-time").value
            };

            try {
                const res = await fetch(`${API_BASE_URL}/reschedule-appointment`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });
                const data = await res.json();

                if (res.ok) {
                    alert("Appointment Rescheduled Successfully!");
                    rescheduleForm.reset();
                } else {
                    alert(`Failed to reschedule: ${data.detail || 'Unknown error'}`);
                }
            } catch (err) {
                console.error(err);
                alert("Error connecting to server. Is the backend running?");
            } finally {
                spinner.style.display = "none";
                text.textContent = "Reschedule Appointment";
                btn.disabled = false;
            }
        });
    }

    // 6. Handle Chatbot via Backend
    const chatInput = document.getElementById("chat-input");
    const chatSendBtn = document.getElementById("chat-send-btn");
    const chatMessages = document.getElementById("chat-messages");

    if (chatInput && chatSendBtn && chatMessages) {
        // Generate or retrieve session ID
        let sessionId = sessionStorage.getItem("chat_session_id");
        if (!sessionId) {
            sessionId = "sess_" + Math.random().toString(36).substring(2, 10);
            sessionStorage.setItem("chat_session_id", sessionId);
        }

        chatSendBtn.addEventListener("click", async () => {
            const text = chatInput.value.trim();
            if (!text) return;

            // Add user message
            const userBubble = document.createElement("div");
            userBubble.className = "chat-bubble user";
            userBubble.textContent = text;
            chatMessages.appendChild(userBubble);

            chatInput.value = "";
            chatMessages.scrollTop = chatMessages.scrollHeight;

            chatSendBtn.disabled = true;

            const payload = {
                message: text,
                session_id: sessionId
            };

            try {
                const res = await fetch(`${API_BASE_URL}/chat`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });
                
                let botText = "";
                if (res.ok) {
                    const data = await res.json();
                    // Depending on n8n webhook response structure, it could be a nested object
                    botText = data.response || data.output || JSON.stringify(data);
                } else {
                    const data = await res.json().catch(() => ({}));
                    botText = `Error: ${data.detail || 'Failed to reach AI'}`;
                }

                const formattedText = typeof marked !== 'undefined' ? marked.parse(botText) : botText
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\n/g, '<br>');

                const botBubble = document.createElement("div");
                botBubble.className = "chat-bubble bot markdown-body";
                botBubble.innerHTML = formattedText;
                chatMessages.appendChild(botBubble);
            } catch (err) {
                console.error(err);
                const botBubble = document.createElement("div");
                botBubble.className = "chat-bubble bot";
                botBubble.textContent = "Error connecting to server.";
                chatMessages.appendChild(botBubble);
            } finally {
                chatSendBtn.disabled = false;
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }
        });
    }
});
