import { NextResponse } from "next/server"
import { getDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

// GET all issues
export async function GET() {
  try {
    const db = await getDatabase()
    const issues = await db.collection("issues").find({}).toArray()
    
    // Transform MongoDB _id to id for frontend compatibility
    const transformedIssues = issues.map((issue) => ({
      ...issue,
      id: issue._id.toString(),
      _id: undefined,
    }))
    
    return NextResponse.json(transformedIssues)
  } catch (error) {
    console.error("Failed to fetch issues:", error)
    return NextResponse.json({ error: "Failed to fetch issues" }, { status: 500 })
  }
}

// POST create new issue
export async function POST(request: Request) {
  try {
    const db = await getDatabase()
    const body = await request.json()
    
    const newIssue = {
      ...body,
      reportedAt: new Date().toISOString(),
      status: "pending",
      assignedTo: null,
    }
    
    const result = await db.collection("issues").insertOne(newIssue)
    
    return NextResponse.json({
      ...newIssue,
      id: result.insertedId.toString(),
    })
  } catch (error) {
    console.error("Failed to create issue:", error)
    return NextResponse.json({ error: "Failed to create issue" }, { status: 500 })
  }
}
