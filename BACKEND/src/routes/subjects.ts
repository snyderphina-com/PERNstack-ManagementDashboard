import express from "express";
import {ilike, or, sql, eq, getTableColumns, desc, and } from "drizzle-orm";
import {departments,subjects} from "../db/schema/app.js";
import { db } from "../db/index.js";
import { user } from "../db/schema/auth.js";
import { classes, enrollments } from "../db/schema/index.js";

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

    const subject = await db.query.subjects.findFirst({
      where: eq(subjects.id, id),
      with: {
        department: true,
        classes: true,
      },
    });

    if (!subject) {
      return res.status(404).json({
        error: "Subject not found",
      });
    }

    res.status(200).json({
      data: {
        subject,
        totals: {
          classes: subject.classes.length,
        },
      },
    });

  } catch (error) {
    console.error("GET /subjects/:id error:", error);

    res.status(500).json({
      error: "Failed to fetch subject",
    });
  }
});

router.get("/:id/users", async (req, res) => {
  try {
    const subjectId = Number(req.params.id);
    const role = req.query.role;

    if (!role || !["teacher", "student"].includes(role as string)) {
      return res.status(400).json({
        message: "role must be teacher or student",
      });
    }


    // Teachers assigned to classes under this subject
    if (role === "teacher") {
      const teachers = await db
        .selectDistinct({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          image: user.image,
        })
        .from(classes)
        .innerJoin(user, eq(classes.teacherId, user.id))
        .where(eq(classes.subjectId, subjectId));


      return res.json({
        data: teachers,
      });
    }


    // Students enrolled in classes under this subject
    const students = await db
      .selectDistinct({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        image: user.image,
      })
      .from(enrollments)
      .innerJoin(classes, eq(enrollments.classId, classes.id))
      .innerJoin(user, eq(enrollments.studentId, user.id))
      .where(eq(classes.subjectId, subjectId));


    return res.json({
      data: students,
    });


  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch subject users",
    });
  }
});


router.get("/:id/classes", async (req, res) => {
  try {
    const subjectId = Number(req.params.id);

    const classesData = await db.query.classes.findMany({
      where: eq(classes.subjectId, subjectId),
      with: {
        teacher: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.json({
      data: classesData,
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch subject classes",
    });
  }
});

export default router;