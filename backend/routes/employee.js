import express from "express";
import User from "../models/User.js";
import Issue from "../models/Issue.js";
import organisation from "../models/organisation.js";



const router = express.Router();



router.get("/", async (req, res) => {
try {
    const employees = await User.find({ typeOfUser: "Employee" }).select("-password");
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
    const issue = await Issue.findById(req.params.issueId);
    
    if (!employee || employee.typeOfUser !== "Employee") {
      return res.status(404).json({ message: "Employee not found" });
    }
    if (!issue) {
      return res.status(404).json({ message: "Issue not found" });
    }

    // Check if issue is already assigned
    if (issue.assignedTo && !issue.assignedTo.equals(employee._id)) {
      return res.status(400).json({ message: "Issue is already assigned to another employee" });
    }

    // Assign issue to employee
    issue.assignedTo = employee._id;
    issue.status = "assigned";
    await issue.save();

    // Add issue to employee's assignedIssues if not already there
    if (!employee.assignedIssues.includes(req.params.issueId)) {
      employee.assignedIssues.push(req.params.issueId);
      await employee.save();
    }

    res.json({ 
      message: "Employee assigned successfully",
      issue: await issue.populate("assignedTo", "username avatar")
    });
  } catch (error) {
    console.error("Error assigning employee:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Complete/Resolve an assigned issue
router.put("/employee/complete/:id/:issueId", async (req, res) => {
  try {
    const employee = await User.findById(req.params.id);
    const issue = await Issue.findById(req.params.issueId);
    
    if (!employee || employee.typeOfUser !== "Employee") {
      return res.status(404).json({ message: "Employee not found" });
    }
    if (!issue) {
      return res.status(404).json({ message: "Issue not found" });
    }

    // Verify employee is assigned to this issue
    if (!issue.assignedTo || !issue.assignedTo.equals(employee._id)) {
      return res.status(400).json({ message: "This issue is not assigned to you" });
    }

    // Mark issue as completed
    issue.status = "completed";
    issue.resolvedProof = {
      resolvedAt: new Date(),
      resolvedBy: employee._id,
    };
    await issue.save();

    // Remove from assignedIssues and add to solvedIssues
    employee.assignedIssues = employee.assignedIssues.filter(
      (issueId) => !issueId.equals(req.params.issueId)
    );
    if (!employee.solvedIssues.includes(req.params.issueId)) {
      employee.solvedIssues.push(req.params.issueId);
      employee.issuesResolved = (employee.issuesResolved || 0) + 1;
    }
    await employee.save();

    res.json({ 
      message: "Issue completed successfully",
      issue: await issue.populate("assignedTo", "username avatar")
    });
  } catch (error) {
    console.error("Error completing issue:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Unassign an issue from employee
router.put("/employee/unassign/:id/:issueId", async (req, res) => {
  try {
    const employee = await User.findById(req.params.id);
    const issue = await Issue.findById(req.params.issueId);
    
    if (!employee || employee.typeOfUser !== "Employee") {
      return res.status(404).json({ message: "Employee not found" });
    }
    if (!issue) {
      return res.status(404).json({ message: "Issue not found" });
    }

    // Verify employee is assigned to this issue
    if (!issue.assignedTo || !issue.assignedTo.equals(employee._id)) {
      return res.status(400).json({ message: "This issue is not assigned to you" });
    }

    // Unassign issue
    issue.assignedTo = null;
    issue.status = "open";
    await issue.save();

    // Remove from employee's assignedIssues
    employee.assignedIssues = employee.assignedIssues.filter(
      (issueId) => !issueId.equals(req.params.issueId)
    );
    await employee.save();

    res.json({ 
      message: "Issue unassigned successfully",
      issue: await issue.populate("assignedTo", "username avatar")
    });
  } catch (error) {
    console.error("Error unassigning issue:", error);
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