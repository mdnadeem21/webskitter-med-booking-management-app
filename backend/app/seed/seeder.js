require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const Clinic = require("../model/clinic.model");           // manage-med-clinic
const Department = require("../model/department.model");   // manage-med-department
const Admin = require("../model/admin.model");
const Receptionist = require("../model/receptionist.model");
const Doctor = require("../model/doctor.model");
const Patient = require("../model/patient.model");

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI, {
    // agar options chahiye toh (new Mongoose versions me optional)
  });
  console.log("✅ MongoDB connected");
};

// ---------------- SEED DATA ----------------

// Passwords sab readable rakhe hain (dev only) — bcrypt yahin hash karenge
const PASSWORDS = {
  admin: "Admin@123",
  doctor: "Doctor@123",
  receptionist: "Recep@123",
  patient: "Patient@123",
};

const seed = async () => {
  try {
    await connectDB();

    // ============================================================
    // 0. PURANA DATA SAF (clean slate) — isDeleted pattern models me hai
    // ============================================================
    console.log("🧹 Cleaning old data...");
    await Promise.all([
      Admin.deleteMany({}),
      Receptionist.deleteMany({}),
      Doctor.deleteMany({}),
      Patient.deleteMany({}),
      Department.deleteMany({}),
      Clinic.deleteMany({}),
    ]);

    // ============================================================
    // 1. CLINIC (appointment schema me clinicId required hai)
    // ============================================================
    // ⚠️ Apne clinic model ke required fields ke hisaab se adjust karo
    const clinic = await Clinic.create({
      name: "MediCare Multi-Speciality Clinic",
      address: "MG Road, Bangalore, 560001",
      email: "clinicOne@medicare.com",
      phone: "+919876543210",
      // timings/email — jo bhi tumhare clinic model me ho, add karo
    });
    console.log("✅ Clinic created");

    // ============================================================
    // 2. DEPARTMENTS (doctor ke liye required)
    // ============================================================
    // ⚠️ Department model ka exact shape check karo — maine name + description maana
    const departments = await Department.insertMany([
      { name: "Cardiology", description: "Heart & vascular care" },
      { name: "Dermatology", description: "Skin & hair care"},
      { name: "Pediatrics", description: "Child healthcare"},
      { name: "Neurology", description: "Brain & nervous system"},
    ]);
    console.log(`✅ ${departments.length} departments created`);

    const dept = {
      cardiology: departments[0]._id,
      dermatology: departments[1]._id,
      pediatrics: departments[2]._id,
      neurology: departments[3]._id,
    };

    // ============================================================
    // 3. ADMIN (super admin — yahi sab kuch manage karega)
    // ============================================================
    const adminHash = await bcrypt.hash(PASSWORDS.admin, 10);
    const admin = await Admin.create({
      name: "Super Admin",
      email: "admin@medicare.com",
      password: adminHash,
      role: "admin",
      isActive: true,
    });
    console.log("✅ Admin created: admin@medicare.com / Admin@123",admin);

    // ============================================================
    // 4. RECEPTIONISTS
    // ============================================================
    const recepHash = await bcrypt.hash(PASSWORDS.receptionist, 10);
    const receptionists = await Receptionist.insertMany([
      {
        name: "Priya Sharma",
        email: "priya@medicare.com",
        phone: "9876543210",
        password: recepHash,
        role: "receptionist",
        isActive: true,
      },
      {
        name: "Vikram Singh",
        email: "vikram@medicare.com",
        phone: "9876500011",
        password: recepHash,
        role: "receptionist",
        isActive: true,
      },
    ]);
    console.log(`✅ ${receptionists.length} receptionists created`);

    // ============================================================
    // 5. DOCTORS (admin banayega — isVerified true for ready-to-use)
    // ============================================================
    const doctorHash = await bcrypt.hash(PASSWORDS.doctor, 10);
    const doctors = await Doctor.insertMany([
      {
        name: "Dr. Sonam Kapoor",
        email: "sonam@medicare.com",
        password: doctorHash,
        role: "doctor",
        departmentId: dept.cardiology,
        qualification: "MBBS, MD (Cardiology)",
        specialization: "Cardiologist",
        experience: 12,
        consultationFee: 500,
        consultationMode: ["IN_PERSON", "ONLINE"],
        about: "Senior cardiologist with 12+ years of experience in interventional cardiology.",
        isVerified: true,        // ✅ admin ne verify kar diya (seeded admin ka role)
        isActive: true,
        isDeleted: false,
      },
      {
        name: "Dr. Abid Hussain",
        email: "abid@medicare.com",
        password: doctorHash,
        role: "doctor",
        departmentId: dept.dermatology,
        qualification: "MBBS, MD (Dermatology)",
        specialization: "Dermatologist",
        experience: 8,
        consultationFee: 600,
        consultationMode: ["IN_PERSON"],
        about: "Skin specialist — acne, hairfall aur cosmetic dermatology.",
        isVerified: true,
        isActive: true,
        isDeleted: false,
      },
      {
        name: "Dr. Rehman Ali",
        email: "rehman@medicare.com",
        password: doctorHash,
        role: "doctor",
        departmentId: dept.neurology,
        qualification: "MBBS, DM (Neurology)",
        specialization: "Neurologist",
        experience: 15,
        consultationFee: 800,
        consultationMode: ["IN_PERSON", "ONLINE"],
        about: "Neurology consultant — migraine, epilepsy, stroke care.",
        isVerified: true,
        isActive: true,
        isDeleted: false,
      },
      {
        // Yeh wala PENDING hai — admin dashboard ka "Verify" button test karne ke liye!
        name: "Dr. Arif Khan",
        email: "arif@medicare.com",
        password: doctorHash,
        role: "doctor",
        departmentId: dept.pediatrics,
        qualification: "MBBS, DCH",
        specialization: "Pediatrician",
        experience: 5,
        consultationFee: 400,
        consultationMode: ["IN_PERSON"],
        about: "Child specialist — newborn care aur vaccinations.",
        isVerified: false,      // ⏳ PENDING — admin dashboard se verify karo
        isActive: true,
        isDeleted: false,
      },
    ]);
    console.log(`✅ ${doctors.length} doctors created (1 unverified — verify test ke liye)`);

    // ============================================================
    // 6. PATIENTS
    // ============================================================
    // ⚠️ Patient model: gender enum UPPER ("MALE") + phone regex [6-9] se start
    const patientHash = await bcrypt.hash(PASSWORDS.patient, 10);
    const patients = await Patient.insertMany([
      {
        name: "Rahul Kumar",
        email: "rahul@gmail.com",
        phone: "9876543210",
        password: patientHash,
        gender: "MALE",
        dateOfBirth: new Date("1995-06-15"),
        address: "Koramangala, Bangalore",
        bloodGroup: "O+",
        emergencyContact: {
            name: "Ramesh Kumar",
            phone: "9876500012",
            relation: "Father",
        },
        role: "patient",
        isVerified: true,
        isActive: true,
        isDeleted: false,
      },
      {
        name: "Sana Malik",
        email: "sana@gmail.com",
        phone: "9876500011",
        password: patientHash,
        gender: "FEMALE",
        dateOfBirth: new Date("1998-02-20"),
        address: "Indiranagar, Bangalore",
        bloodGroup: "A+",
        emergencyContact: {
            name: "Ayesha Malik",
            phone: "9876500013",
            relation: "Mother",
        },
        role: "patient",
        isVerified: true,
        isActive: true,
        isDeleted: false,
      },
      {
        name: "Imran Sheikh",
        email: "imran@gmail.com",
        phone: "9812312312",
        password: patientHash,
        gender: "MALE",
        dateOfBirth: new Date("1990-11-05"),
        address: "HSR Layout, Bangalore",
        bloodGroup: "B+",
        emergencyContact: {
            name: "Farah Sheikh",
            phone: "9812312313",
            relation: "Sister",
        },
        role: "patient",
        isVerified: true,
        isActive: true,
        isDeleted: false,
      },
    ]);
    console.log(`✅ ${patients.length} patients created`);

    // ============================================================
    // SUMMARY
    // ============================================================
    console.log("\n========== 🌱 SEEDING COMPLETE ==========");
    console.log("👤 Admin:        admin@medicare.com / Admin@123");
    console.log("👨‍⚕️ Doctors:      sonam@ / abid@ / rehman@ / arif@ medicare.com / Doctor@123");
    console.log("💁 Receptionists: priya@ / vikram@ medicare.com / Recep@123");
    console.log("🧑 Patients:     rahul@ / sana@ / imran@ gmail.com / Patient@123");
    console.log("⏳ Dr. Arif isVerified: false — admin dashboard verify test ke liye");
    console.log("==========================================\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error.message);
    if (error.errors) console.error(error.errors);   // mongoose validation details
    process.exit(1);
  }
};

seed();