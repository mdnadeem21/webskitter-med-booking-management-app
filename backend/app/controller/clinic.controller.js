const Clinic = require("../model/clinic.model");

class clinicController {
  async createClinic(req, res) {
    try {
      const { name, address, phone, email, services, openingHours } = req.body;

      if (!name || !address || !phone || !email || !services || !openingHours) {
        return res.status(400).json({
          status: false,
          message: "Missing required fields",
        });
      }

      const existingClinic = await Clinic.findOne({ email });
      if (existingClinic) {
        return res.status(400).json({
          status: false,
          message: "Clinic with this email already exists",
        });
      }

      const servicesArr = Array.isArray(services)
        ? services
        : services
        ? String(services)
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [];

      const hoursArr = Array.isArray(openingHours)
        ? openingHours
        : openingHours
        ? String(openingHours)
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [];

      const newClinic = new Clinic({
        name,
        address,
        phone,
        email,
        services: servicesArr,
        openingHours: hoursArr,
      });

      await newClinic.save();

      res.status(201).json({
        status: true,
        message: "Clinic created successfully",
        clinic: newClinic,
      });
    } catch (error) {
      res.status(500).json({
        status: false,
        message: error.message,
      });
    }
  }

  async getClinics(req, res) {
    try {
      const clinics = await Clinic.find({ isDeleted: false });
    //   if (clinics.length === 0) {
    //     return res.status(404).json({
    //       status: false,
    //       message: "No clinics found",
    //     });
    //   }
      res.status(200).json({
        status: true,
        size: clinics.length,
        message: "Clinics fetched successfully",
        clinics,
      });
    } catch (error) {
      res.status(500).json({
        status: false,
        message: error.message,
      });
    }
  }

  async getClinicById(req, res) {
    try {
      const clinicId = req.params.id;
      if (!clinicId) {
        return res.status(400).json({
          status: false,
          message: "Clinic ID is required",
        });
      }
      const clinic = await Clinic.findById(clinicId);
      if (!clinic || clinic.isDeleted) {
        return res.status(404).json({
          status: false,
          message: "Clinic not found",
        });
      }
      res.status(200).json({
        status: true,
        message: "Clinic fetched successfully",
        clinic,
      });
    } catch (error) {
      res.status(500).json({
        status: false,
        message: error.message,
      });
    }
  }

  async updateClinic(req, res) {
    try {
      const clinicId = req.params.id;
      if (!clinicId) {
        return res.status(400).json({
          status: false,
          message: "Clinic ID is required",
        });
      }
      const clinic = await Clinic.findById(clinicId);
      if (!clinic || clinic.isDeleted) {
        return res.status(404).json({
          status: false,
          message: "Clinic not found",
        });
      }

      const { name, address, phone, email, services, openingHours } = req.body;

      if (name) clinic.name = name;
      if (address) clinic.address = address;
      if (phone) clinic.phone = phone;
      if (email) clinic.email = email;
      if (services) clinic.services = services;
      if (openingHours) clinic.openingHours = openingHours;

      await clinic.save();

      res.status(200).json({
        status: true,
        message: "Clinic updated successfully",
        clinic,
      });
    } catch (error) {
      res.status(500).json({
        status: false,
        message: error.message,
      });
    }
  }
  async deleteClinic(req, res) {
    try {
      const clinicId = req.params.id;
      if (!clinicId) {
        return res.status(400).json({
          status: false,
          message: "Clinic ID is required",
        });
      }
      const clinic = await Clinic.findById(clinicId);
      if (!clinic || clinic.isDeleted) {
        return res.status(404).json({
          status: false,
          message: "Clinic not found",
        });
      }
      clinic.isDeleted = true;
      await clinic.save();
      res.status(200).json({
        status: true,
        message: "Clinic deleted successfully",
        clinic,
      });
    } catch (error) {
      res.status(500).json({
        status: false,
        message: error.message,
      });
    }
  }
}

module.exports = new clinicController();
