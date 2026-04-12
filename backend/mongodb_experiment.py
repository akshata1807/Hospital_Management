import os
import certifi
from pymongo import MongoClient
from dotenv import load_dotenv

# 1. Load environment variables (make sure your .env file is in the same directory)
load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")

if not MONGO_URI:
    print("Error: MONGO_URI not found in the .env file.")
    exit(1)

# 2. Connect to MongoDB
# tlsCAFile=certifi.where() is used to prevent SSL/TLS certificate errors when connecting to MongoDB Atlas
print("Connecting to MongoDB...")
client = MongoClient(MONGO_URI, tlsCAFile=certifi.where())

# 3. Select a database and a collection
# We'll use a temporary database 'experiment_db' and collection 'experiment_appointments' so it won't affect the real hospital app data
db = client["experiment_db"]
collection = db["experiment_appointments"]

# Clear any previous data from previous experiment runs for a clean slate
collection.delete_many({})

print("\n--- MongoDB Core Logic Experiment Starts Here ---\n")

# ==========================================
# C: CREATE (Insert Data)
# ==========================================
print("1. Inserting a single appointment...\n")
appointment = {
    "appointment_id": "APT-20240501-1",
    "patient_name": "Alice Smith",
    "department": "Cardiology",
    "doctor_name": "Dr. Aditi Sharma",
    "appointment_date": "2024-05-01",
    "appointment_time": "10:00 AM",
    "status": "Confirmed"
}
result = collection.insert_one(appointment)
print(f"Inserted single appointment with auto-generated _id: {result.inserted_id}\n")

print("Inserting multiple appointments...\n")
appointments = [
    {
        "appointment_id": "APT-20240501-2",
        "patient_name": "Bob Johnson",
        "department": "Neurology",
        "doctor_name": "Dr. Rohan Gupta",
        "appointment_date": "2024-05-02",
        "appointment_time": "11:30 AM",
        "status": "Confirmed"
    },
    {
        "appointment_id": "APT-20240501-3",
        "patient_name": "Charlie Brown",
        "department": "Orthopedics",
        "doctor_name": "Dr. Vikram Singh",
        "appointment_date": "2024-05-03",
        "appointment_time": "02:00 PM",
        "status": "Confirmed"
    },
    {
        "appointment_id": "APT-20240501-4",
        "patient_name": "Diana Ross",
        "department": "Cardiology",
        "doctor_name": "Dr. Aditi Sharma",
        "appointment_date": "2024-05-04",
        "appointment_time": "09:00 AM",
        "status": "Pending"
    }
]
result_many = collection.insert_many(appointments)
print(f"Inserted multiple appointments with _ids: {result_many.inserted_ids}\n")


# ==========================================
# R: READ (Find/Query Data)
# ==========================================
print("\n2. Querying appointments...\n")

print("- Fetching all appointments:")
# .find() returns a cursor (an iterator). We can loop through it.
for doc in collection.find():
    print(doc)

print("\n- Fetching all appointments for the 'Cardiology' department:")
cardio_appointments = collection.find({"department": "Cardiology"})
for doc in cardio_appointments:
    print(doc)

print("\n- Fetching a single specific appointment (Bob Johnson):")
# .find_one() returns exactly one document (a Python dictionary) or None
bob = collection.find_one({"patient_name": "Bob Johnson"})
print(bob)


# ==========================================
# U: UPDATE (Modify Data)
# ==========================================
print("\n\n3. Updating an appointment...\n")

# Let's reschedule Bob's appointment date and change his status to Rescheduled
# $set is an update operator. If we don't use it, we would replace the entire document!
update_result = collection.update_one(
    {"patient_name": "Bob Johnson"}, # Filter: Which document to update
    {"$set": {"appointment_date": "2024-05-15", "status": "Rescheduled"}} # Action: What to change
)
print(f"Matched {update_result.matched_count} document(s) and modified {update_result.modified_count} document(s).\n")

print("Checking Bob's updated appointment data:")
print(collection.find_one({"patient_name": "Bob Johnson"}))


# ==========================================
# D: DELETE (Remove Data)
# ==========================================
print("\n\n4. Deleting an appointment...\n")

# Let's delete Charlie's appointment (maybe he cancelled)
delete_result = collection.delete_one({"patient_name": "Charlie Brown"})
print(f"Deleted {delete_result.deleted_count} document(s).\n")

print("Checking remaining appointments after deletion:")
for doc in collection.find():
    print(doc)

# ==========================================
# Cleanup (Optional)
# ==========================================
# Uncomment the line below to destroy the collection after the experiment
# collection.drop()

print("\n--- MongoDB Core Logic Experiment Finished ---")
