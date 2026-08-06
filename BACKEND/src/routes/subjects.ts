import express from "express";
import {ilike, or, sql, eq, getTableColumns, desc, and } from "drizzle-orm";
import {departments,subjects} from "../db/schema/app.js";
import { db } from "../db/index.js";

const router = express.Router();

// GET all subjects with optional query parameters for filtering, sorting, and pagination
router.get("/", async (req, res) => {
try{
const { search, department, page = 1,limit = 10 } = req.query;

const currentPage = Math.max(1, parseInt(String(page), 10) || 1);
const limitPerPage = Math.min(Math.max(1, parseInt(String(limit), 10) || 10), 100);

const offset = (currentPage - 1) * limitPerPage; //how many records to skip to go to the next page

const filterConditions = [];

//if search query parameter is provided, add a filter condition for name or code
if (search) {
  filterConditions.push(
    or(
      ilike(subjects.name, `%${search}%`),
      ilike(subjects.code, `%${search}%`)
    )
  ); }


//if department query parameter is provided, add a filter condition for departmentId
if (department) {
  const deptPattern = `%${String(department).replace(/[%_]/g, '\\$&')}%`; //prevents sql injections
  filterConditions.push(ilike(departments.name, deptPattern));
}


//Combibe the filter conditions using AND operator
const whereClause = filterConditions.length > 0 ? and(...filterConditions) : undefined;

const countResult = await db
.select({ count: sql<number>`count(*)` })
.from(subjects)
.leftJoin(departments, eq(subjects.departmentId, departments.id))
.where(whereClause);


const totalCount = countResult[0]?.count ?? 0;

const subjectList = await db 
.select({
    ...getTableColumns(subjects),
    department: { ...getTableColumns(departments) }
}).from(subjects).leftJoin(departments, eq(subjects.departmentId, departments.id))
.where(whereClause)
.orderBy(desc(subjects.createdAt))
.limit(limitPerPage)
.offset(offset);


res.status(200).json({
data: subjectList,
pagination: {
   page: currentPage,
   limit: limitPerPage,
   total: totalCount,
   totalPages: Math.ceil(totalCount / limitPerPage)
}

})

}catch (error) {
    console.error(`GET /subjects error: ${error}`);
    res.status(500).json({ error: "Failed to fetch subjects" });
}


});

router.post("/", async (req, res) => {
  try {
    const { name, code, description, departmentId } = req.body;

    const [newSubject] = await db
      .insert(subjects)
      .values({
        name,
        code,
        description,
        departmentId,
      })
      .returning();

    res.status(201).json({
      data: newSubject,
    });
  } catch (error) {
    console.error("POST /subjects error:", error);
    res.status(500).json({
      error: "Failed to create subject",
    });
  }
});


router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({
        error: "Invalid subject ID",
      });
    }

    const [subject] = await db
      .select({
        ...getTableColumns(subjects),
        department: {
          ...getTableColumns(departments),
        },
      })
      .from(subjects)
      .leftJoin(departments, eq(subjects.departmentId, departments.id))
      .where(eq(subjects.id, id));

    if (!subject) {
      return res.status(404).json({
        error: "Subject not found",
      });
    }

    res.status(200).json({
      data: subject,
    });
  } catch (error) {
    console.error("GET /subjects/:id error:", error);
    res.status(500).json({
      error: "Failed to fetch subject",
    });
  }
});


export default router;