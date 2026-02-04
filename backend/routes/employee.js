import express from "express";
import User from "../models/User.js";
import organisation from "../models/organisation.js";



const router = express.Router();



router.get("/", async (req, res) => {
try {
    const employees = await User.find({ typeOfUser: "Employee" , organisation: req.query.organisationId }).select("-password");
    res.json(employees);
  } catch (error) {
    console.error("Error fetching employees:", error);
    res.status(500).json({ message: "Server error" });
  }

})

router.get("/employee/:id", async (req, res) => {
  try {
    const employee = await User.findById(req.params.id).select("-password").populate('assignedIssues');
    res.json(employee);
  } catch (error) {
    console.error("Error fetching employee:", error);
    res.status(500).json({ message: "Server error" });
  }
});
router.put("/employee/accept/:id", async (req, res) => {
  try {
    const employee = await User.findById(req.params.id);
    if (!employee || employee.typeOfUser !== "Employee") {
      return res.status(404).json({ message: "Employee not found" });
    }
    employee.accepted = true;
    await employee.save();
    res.json({ message: "Employee accepted successfully" });
  } catch (error) {
    console.error("Error accepting employee:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/employee/assign/:id/:issueId", async (req, res) => {
  try {
    const employee = await User.findById(req.params.id);
    if (!employee || employee.typeOfUser !== "Employee") {
      return res.status(404).json({ message: "Employee not found" });
    }
    employee.assignedIssues.push(req.params.issueId);
    await employee.save();
    res.json({ message: "Employee assigned successfully" });
  } catch (error) {
    console.error("Error assigning employee:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/unlock/:id", async (req, res) => {
     try {
    const employee = await User.findById(req.params.id);
    if (!employee || employee.typeOfUser !== "Employee") {
      return res.status(404).json({ message: "Employee not found" });
    }
    employee.assignedIssue = null;
    employee.accepted = false;
    await employee.save();
    res.json({ message: "Employee unlocked successfully" });
  } catch (error) {
    console.error("Error unlocking employee:", error);
    res.status(500).json({ message: "Server error" });
  }
})

export default router;