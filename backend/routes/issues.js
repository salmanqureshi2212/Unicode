import express from "express";
import multer from "multer";
import path from "path";
import Issue from "../models/Issue.js";
import User from "../models/User.js";
import auth from "../middleware/auth.js";
import fs from "fs";
// import fetch from "node-fetch"; // or axios
const router = express.Router();
const AIURL = "http://192.168.32.213:8000";
import { fileURLToPath } from "url";

// Define __dirname manually for ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ZONE_EXPOSURE = {
  school_zone: 30,
  hospital_zone: 30,
  main_road: 20,
  residential: 10,
  industrial: 10,
  low_traffic: 5,
};
const INFRA_CRITICALITY = {
  bridge: 40,
  road: 30,
  water: 25,
  street_light: 15,
};
const RISK_WEIGHT = {
  Safe: 10,
  Warning: 40,
  Critical: 80,
};
const MAX_TOTAL = 150;
// const uploadPath = path.join(__dirname, 'uploads');

// // Ensure directory exists
// if (!fs.existsSync(uploadPath)) {
//   fs.mkdirSync(uploadPath, { recursive: true });
// }
// Configure multer for file uploads
const uploadPath = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase(),
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

const DIGIPIN_GRID = [
  ["F", "C", "9", "8"],
  ["J", "3", "2", "7"],
  ["K", "4", "5", "6"],
  ["L", "M", "P", "T"],
];

const BOUNDS = {
  minLat: 2.5,
  maxLat: 38.5,
  minLon: 63.5,
  maxLon: 99.5,
};

function getDigiPin(lat, lon) {
  if (lat < BOUNDS.minLat || lat > BOUNDS.maxLat)
    throw new Error("Latitude out of range");
  if (lon < BOUNDS.minLon || lon > BOUNDS.maxLon)
    throw new Error("Longitude out of range");

  let minLat = BOUNDS.minLat;
  let maxLat = BOUNDS.maxLat;
  let minLon = BOUNDS.minLon;
  let maxLon = BOUNDS.maxLon;

  let digiPin = "";

  for (let level = 1; level <= 10; level++) {
    const latDiv = (maxLat - minLat) / 4;
    const lonDiv = (maxLon - minLon) / 4;

    // REVERSED row logic (to match original)
    let row = 3 - Math.floor((lat - minLat) / latDiv);
    let col = Math.floor((lon - minLon) / lonDiv);

    row = Math.max(0, Math.min(row, 3));
    col = Math.max(0, Math.min(col, 3));

    digiPin += DIGIPIN_GRID[row][col];

    if (level === 3 || level === 6) digiPin += "-";

    // Update bounds (reverse logic for row)
    maxLat = minLat + latDiv * (4 - row);
    minLat = minLat + latDiv * (3 - row);

    minLon = minLon + lonDiv * col;
    maxLon = minLon + lonDiv;
  }

  return digiPin;
}

function getLatLngFromDigiPin(digiPin) {
  const pin = digiPin.replace(/-/g, "");
  if (pin.length !== 10) throw new Error("Invalid DIGIPIN");

  let minLat = BOUNDS.minLat;
  let maxLat = BOUNDS.maxLat;
  let minLon = BOUNDS.minLon;
  let maxLon = BOUNDS.maxLon;

  for (let i = 0; i < 10; i++) {
    const char = pin[i];
    let found = false;
    let ri = -1,
      ci = -1;

    // Locate character in DIGIPIN grid
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (DIGIPIN_GRID[r][c] === char) {
          ri = r;
          ci = c;
          found = true;
          break;
        }
      }
      if (found) break;
    }

    if (!found) throw new Error("Invalid character in DIGIPIN");

    const latDiv = (maxLat - minLat) / 4;
    const lonDiv = (maxLon - minLon) / 4;

    const lat1 = maxLat - latDiv * (ri + 1);
    const lat2 = maxLat - latDiv * ri;
    const lon1 = minLon + lonDiv * ci;
    const lon2 = minLon + lonDiv * (ci + 1);

    // Update bounding box for next level
    minLat = lat1;
    maxLat = lat2;
    minLon = lon1;
    maxLon = lon2;
  }

  const centerLat = (minLat + maxLat) / 2;
  const centerLon = (minLon + maxLon) / 2;

  return {
    latitude: centerLat.toFixed(6),
    longitude: centerLon.toFixed(6),
  };
}

// Create new issue
router.post("/", auth, upload.single("image"), async (req, res) => {
  try {
    const { title, description, category, latitude, longitude, address, zone } =
      req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Image is required" });
    }
    const tempdigipin = getDigiPin(parseFloat(latitude), parseFloat(longitude));
    const digipin = tempdigipin.slice(0, -1);
    const issue = new Issue({
      userId: req.userId,
      title,
      description,
      category,
      digipin: digipin,
      location: {
        type: "Point",
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
      },
      address,
      imageUrl: `/uploads/${req.file.filename}`,
      zone,
    });

    await issue.save();
    await issue.populate("userId", "username avatar");

    // Update user's issues reported count and karma
    await User.findByIdAndUpdate(req.userId, {
      $inc: { issuesReported: 1, karma: 10 },
    });

    res.status(201).json({
      message: "Issue created successfully",
      issue,
    });

    const imgres = await fetch(`http://localhost:5000/uploads/${req.file.filename}`);
    const imageBytes = Buffer.from(await imgres.arrayBuffer());
    const imageBase64 = imageBytes.toString("base64");
    const data = {
      image: imageBase64,
      infra_type: issue.category,
      zone_type: zone||"residential",
      lat: issue.location.coordinates[1],
      lng: issue.location.coordinates[0],
    };

    const response = await fetch(`${AIURL}/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    issue.aiAnalysis = result;
    const { risk_level, inferred_infra_type } = result;
    const priority_score = Math.round(
      ((RISK_WEIGHT[risk_level] || 0) +
        (INFRA_CRITICALITY[inferred_infra_type] || 0 )+
        (ZONE_EXPOSURE[issue.zone] || 0)) /
        MAX_TOTAL * 100,
    );
    issue.priority = priority_score;
    await issue.save();
  } catch (error) {
    console.error("Create issue error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get issues with optional filters
router.get("/", async (req, res) => {
  try {
    const {
      lat,
      lng,
      radius = 10,
      category,
      status,
      sortBy = "createdAt",
    } = req.query;

    let query = {};

    // Add location filter if provided
    if (lat && lng) {
      query.location = {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          $maxDistance: parseFloat(radius) * 1000, // Convert km to meters
        },
      };
    }

    // Add category filter
    if (category && category !== "all") {
      query.category = category;
    }

    // Add status filter
    if (status && status !== "all") {
      query.status = status;
    }

    // Define sort options
    let sortOptions = {};
    switch (sortBy) {
      case "newest":
        sortOptions = { createdAt: -1 };
        break;
      case "oldest":
        sortOptions = { createdAt: 1 };
        break;
      case "upvotes":
        sortOptions = { upvotes: -1 };
        break;
      default:
        sortOptions = { createdAt: -1 };
    }

    const issues = await Issue.find(query)
      .populate("userId", "username avatar")
      .sort(sortOptions)
      .limit(100);

    res.json(issues);
  } catch (error) {
    console.error("Get issues error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get single issue
router.get("/:id", async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate("userId", "username avatar")
      .populate("resolvedProof.resolvedBy", "username avatar");

    if (!issue) {
      return res.status(404).json({ message: "Issue not found" });
    }
    console.log(issue);
    res.json(issue);
  } catch (error) {
    console.error("Get issue error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Upvote issue
router.post("/:id/upvote", auth, async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({ message: "Issue not found" });
    }

    // Check if user already upvoted
    const hasUpvoted = issue.upvotes.includes(req.userId);

    if (hasUpvoted) {
      // Remove upvote
      issue.upvotes = issue.upvotes.filter(
        (id) => id.toString() !== req.userId,
      );
      await User.findByIdAndUpdate(issue.userId, { $inc: { karma: -5 } });
    } else {
      // Add upvote
      issue.upvotes.push(req.userId);
      await User.findByIdAndUpdate(issue.userId, { $inc: { karma: 5 } });
    }

    await issue.save();
    await issue.populate("userId", "username avatar");

    res.json({
      message: hasUpvoted ? "Upvote removed" : "Issue upvoted",
      issue,
    });
  } catch (error) {
    console.error("Upvote error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Resolve issue
// router.post('/:id/resolve', auth, upload.single('proofImage'), async (req, res) => {
//   try {
//     const { description } = req.body;
//     const issue = await Issue.findById(req.params.id);

//     if (!issue) {
//       return res.status(404).json({ message: 'Issue not found' });
//     }

//     // Check if user owns the issue or is admin
//     if (issue.userId.toString() !== req.userId) {
//       return res.status(403).json({ message: 'Not authorized' });
//     }

//     issue.status = 'resolved';
//     issue.resolvedProof = {
//       imageUrl: req.file ? `/uploads/${req.file.filename}` : '',
//       description,
//       resolvedAt: new Date(),
//       resolvedBy: req.userId
//     };

//     await issue.save();
//     await issue.populate('userId', 'username avatar');

//     // Update user's resolved count and karma
//     await User.findByIdAndUpdate(req.userId, {
//       $inc: { issuesResolved: 1, karma: 15 }
//     });

//     res.json({
//       message: 'Issue marked as resolved',
//       issue
//     });
//   } catch (error) {
//     console.error('Resolve issue error:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });
router.post(
  "/:id/resolve",
  auth,
  upload.single("proofImage"),
  async (req, res) => {
    try {
      const { description } = req.body;
      const issue = await Issue.findById(req.params.id);

      if (!issue) {
        return res.status(404).json({ message: "Issue not found" });
      }

      //NEW: Allow any authenticated user to resolve issues, not just the reporter
      if (!req.file) {
        return res.status(400).json({ message: "Proof image is required" });
      }

      issue.status = "resolved";
      issue.resolvedProof = {
        imageUrl: req.file ? `/uploads/${req.file.filename}` : "",
        description,
        resolvedAt: new Date(),
        resolvedBy: req.userId,
      };

      await issue.save();
      await issue.populate("userId", "username avatar");
      //NEW: Populate resolver information
      await issue.populate("resolvedProof.resolvedBy", "username avatar");

      //NEW: Give karma points to the resolver, not the reporter
      await User.findByIdAndUpdate(req.userId, {
        $inc: { issuesResolved: 1, karma: 15 },
      });

      res.json({
        message: "Issue marked as resolved",
        issue,
      });
    } catch (error) {
      console.error("Resolve issue error:", error);
      res.status(500).json({ message: "Server error" });
    }
  },
);

export default router;
