from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from database import appointments_collection, client
from dotenv import load_dotenv
import os
import requests
import webbrowser
import threading
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
BOOKING_WEBHOOK_URL = os.getenv("BOOKING_WEBHOOK_URL")
RESCHEDULE_WEBHOOK_URL = os.getenv("RESCHEDULE_WEBHOOK_URL")
CHATBOT_WEBHOOK_URL = os.getenv("CHATBOT_WEBHOOK_URL")

app = FastAPI()

@app.on_event("startup")
def open_browser():
    def _open():
        project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        frontend_path = os.path.join(project_root, "frontend", "index.html")
        frontend_uri = "file:///" + frontend_path.replace("\\", "/")
        webbrowser.open(frontend_uri)
    
    # Wait slightly to ensure the backend server has started successfully before opening the frontend.
    threading.Timer(1.5, _open).start()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class AppointmentRequest(BaseModel):
    patient_name: str
    phone: str
    gmail: EmailStr
    department: str
    doctor_name: str
    appointment_date: str
    appointment_time: str
    notes: Optional[str] = None


class RescheduleRequest(BaseModel):
    appointment_id: str
    new_appointment_date: str
    new_appointment_time: str


class ChatRequest(BaseModel):
    message: str
    session_id: str


@app.get("/")
def home():
    try:
        client.admin.command("ping")
        return {"message": "Hospital Backend Running with MongoDB Atlas"}
    except Exception as e:
        return {"message": "MongoDB connection failed", "error": str(e)}


@app.post("/book-appointment")
def book_appointment(data: AppointmentRequest):
    try:
        appointment_id = f"APT-{datetime.now().strftime('%Y%m%d%H%M%S')}"

        appointment_data = {
            "appointment_id": appointment_id,
            "patient_name": data.patient_name,
            "phone": data.phone,
            "gmail": data.gmail,
            "department": data.department,
            "doctor_name": data.doctor_name,
            "appointment_date": data.appointment_date,
            "appointment_time": data.appointment_time,
            "notes": data.notes,
            "status": "Confirmed",
            "created_at": datetime.now().isoformat()
        }

        appointments_collection.insert_one(appointment_data)

        webhook_data = {
            "Patient_Name": data.patient_name,
            "patient_name": data.patient_name,
            "Phone": data.phone,
            "phone": data.phone,
            "Email": data.gmail,
            "email": data.gmail,
            "Gmail": data.gmail,
            "gmail": data.gmail,
            "Department": data.department,
            "department": data.department,
            "Doctor_Name": data.doctor_name,
            "doctor_name": data.doctor_name,
            "Appointment_Date": data.appointment_date,
            "appointment_date": data.appointment_date,
            "Appointment_Time": data.appointment_time,
            "appointment_time": data.appointment_time,
            "Notes": data.notes,
            "notes": data.notes,
            "Appointment_ID": appointment_id,
            "appointment_id": appointment_id
        }

        response = requests.post(
            BOOKING_WEBHOOK_URL,
            json=webhook_data,
            timeout=10
        )

        print("Booking payload:", webhook_data)
        print("Booking n8n status:", response.status_code)
        print("Booking n8n response:", response.text)

        if response.status_code >= 400:
            raise HTTPException(
                status_code=500,
                detail=f"n8n booking webhook failed: {response.status_code} - {response.text}"
            )

        return {
            "success": True,
            "message": "Appointment booked successfully",
            "appointment_id": appointment_id
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/reschedule-appointment")
def reschedule_appointment(data: RescheduleRequest):
    try:
        existing_appointment = appointments_collection.find_one(
            {"appointment_id": data.appointment_id}
        )

        if existing_appointment:
            appointments_collection.update_one(
                {"appointment_id": data.appointment_id},
                {
                    "$set": {
                        "appointment_date": data.new_appointment_date,
                        "appointment_time": data.new_appointment_time,
                        "status": "Rescheduled"
                    }
                }
            )

            webhook_data = {
                "Appointment_ID": data.appointment_id,
                "appointmentId": data.appointment_id,
                "appointment_id": data.appointment_id,
                "New_Appointment_Date": data.new_appointment_date,
                "newDate": data.new_appointment_date,
                "new_appointment_date": data.new_appointment_date,
                "New_Appointment_Time": data.new_appointment_time,
                "newTime": data.new_appointment_time,
                "new_appointment_time": data.new_appointment_time,
                "Patient_Name": existing_appointment.get("patient_name"),
                "patient_name": existing_appointment.get("patient_name"),
                "Doctor_Name": existing_appointment.get("doctor_name"),
                "doctor_name": existing_appointment.get("doctor_name"),
                "Department": existing_appointment.get("department"),
                "department": existing_appointment.get("department"),
                "Email": existing_appointment.get("gmail"),
                "email": existing_appointment.get("gmail"),
                "Gmail": existing_appointment.get("gmail"),
                "gmail": existing_appointment.get("gmail")
            }
        else:
            webhook_data = {
                "Appointment_ID": data.appointment_id,
                "appointmentId": data.appointment_id,
                "appointment_id": data.appointment_id,
                "New_Appointment_Date": data.new_appointment_date,
                "newDate": data.new_appointment_date,
                "new_appointment_date": data.new_appointment_date,
                "New_Appointment_Time": data.new_appointment_time,
                "newTime": data.new_appointment_time,
                "new_appointment_time": data.new_appointment_time
            }

        response = requests.post(
            RESCHEDULE_WEBHOOK_URL,
            json=webhook_data,
            timeout=10
        )

        print("Reschedule payload:", webhook_data)
        print("Reschedule n8n status:", response.status_code)
        print("Reschedule n8n response:", response.text)

        if response.status_code >= 400:
            raise HTTPException(
                status_code=500,
                detail=f"n8n reschedule webhook failed: {response.status_code} - {response.text}"
            )

        return {
            "success": True,
            "message": "Appointment rescheduled successfully",
            "appointment_id": data.appointment_id,
            "new_appointment_date": data.new_appointment_date,
            "new_appointment_time": data.new_appointment_time,
            "status": "Rescheduled"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/chat")
def chat_with_bot(data: ChatRequest):
    try:
        payload = {
            "chatInput": data.message,
            "chat_input": data.message,
            "message": data.message,
            "sessionId": data.session_id,
            "session_id": data.session_id
        }

        response = requests.post(
            CHATBOT_WEBHOOK_URL,
            json=payload,
            timeout=20
        )

        print("Chatbot payload:", payload)
        print("Chatbot n8n status:", response.status_code)
        print("Chatbot n8n response:", response.text)

        if response.status_code >= 400:
            raise HTTPException(
                status_code=500,
                detail=f"n8n chatbot webhook failed: {response.status_code} - {response.text}"
            )

        try:
            return response.json()
        except Exception:
            return {"response": response.text}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/appointment/{appointment_id}")
def get_appointment(appointment_id: str):
    try:
        appointment = appointments_collection.find_one(
            {"appointment_id": appointment_id},
            {"_id": 0}
        )

        if not appointment:
            raise HTTPException(status_code=404, detail="Appointment not found")

        return appointment

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))