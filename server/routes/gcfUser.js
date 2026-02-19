import { keysToCamel } from "@/common/utils";
import express from "express";
import { admin } from "../config/firebase";
import { db } from "../db/db-pgp";

const gcfUserRouter = express.Router();
gcfUserRouter.use(express.json());
gcfUserRouter.post("/", async (req, res) => {
  try {
    const { id, role, first_name, last_name, created_by } = req.body;

    const newGcfUser = await db.query(
      `INSERT INTO gcf_user (id, role, first_name, last_name, created_by) 
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING *`,
      [id, role, first_name, last_name, created_by]
    );
    res.status(201).json(keysToCamel(newGcfUser[0]));
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

gcfUserRouter.get("/admin/get-user/:targetUserId", async (req, res) => {
  try {
    const {targetUserId} = req.params;
    const user = await admin.auth().getUser(targetUserId);
    res.status(200).json(
      {
        email: user.email
      }
    );
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

gcfUserRouter.post("/admin/create-user", async (req, res) => {
  try {
    const { email, password, firstName, lastName, role, currentUserId, programId, regionId } = req.body;

    const userRecord = await admin.auth().createUser({
      email: email,
      password: password,
      displayName: `${firstName} ${lastName}`
    });

    const firebaseUid = userRecord.uid;

    const newGcfUser = await db.query(
      `INSERT INTO gcf_user (id, role, first_name, last_name, created_by) 
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING *`,
      [firebaseUid, role, firstName, lastName, currentUserId]
    );

    if (role === 'Program Director' && programId) {
      await db.query(
        `INSERT INTO program_director (user_id, program_id) 
        VALUES ($1, $2)`,
        [firebaseUid, programId]
      );
    }

    if (role === 'Regional Director' && regionId) {
      await db.query(
        `INSERT INTO regional_director (user_id, region_id) 
        VALUES ($1, $2)`,
        [firebaseUid, regionId]
      );
    }

    res.status(201).json({ 
      uid: firebaseUid, 
      user: keysToCamel(newGcfUser[0]),
      message: 'User created successfully' 
    });

  } catch (err) {
    console.error("Error creating user:", err);
    res.status(500).json({ error: err.message });
  }
});

gcfUserRouter.put("/admin/update-user", async (req, res) => {
  try {
    const { email, password, firstName, lastName, role, targetId, programId, regionId } = req.body;

    await admin.auth().updateUser(targetId, {
      email: email,
      password: password,
      displayName: `${firstName} ${lastName}`
    });

    const oldRoleResponse = await db.query(
      `SELECT role FROM gcf_user WHERE id = $1`,
      [targetId]
    );
    
    const oldRole = oldRoleResponse[0].role;
    
    const updatedGcfUser = await db.query(
      `UPDATE gcf_user SET 
        role =  COALESCE($1, role),
        first_name = COALESCE($2, first_name),
        last_name = COALESCE($3, last_name)
        WHERE id = $4
        RETURNING *;`,
        [role, firstName, lastName, targetId]
    );

    
    if (role !== oldRole) {
      if (oldRole === 'Program Director') {
        await db.query(
          `DELETE FROM program_director WHERE user_id = $1 RETURNING *`,
          [targetId]
        )
      }
      if (oldRole === 'Regional Director') {
        await db.query(
          `DELETE FROM regional_director WHERE user_id = $1 RETURNING *`,
          [targetId]
        )
      }
      
      if (role === 'Program Director' && programId) {
        await db.query(
          `INSERT INTO program_director (user_id, program_id) 
          VALUES ($1, $2)`,
          [targetId, programId]
        )
      }
      if (role === 'Regional Director' && regionId) {
        await db.query(
          `INSERT INTO regional_director (user_id, region_id) 
          VALUES ($1, $2)`,
          [targetId, regionId]
        )
      }
    } else {
      // Update existing assignments if role hasn't changed
      if (role === 'Program Director' && programId) {
        await db.query(
          `UPDATE program_director SET program_id = $1 WHERE user_id = $2`,
          [programId, targetId]
        )
      }
      if (role === 'Regional Director' && regionId) {
        await db.query(
          `UPDATE regional_director SET region_id = $1 WHERE user_id = $2`,
          [regionId, targetId]
        )
      }
    }
    
    res.status(201).json({ 
      uid: targetId, 
      user: keysToCamel(updatedGcfUser[0]),
      message: 'User updated successfully' 
    });

  } catch (err) {
    console.error("Error creating user:", err);
    res.status(500).json({ error: err.message });
  }
});

gcfUserRouter.get("/", async (req, res) => {
  try {
    const data = await db.query(`SELECT * FROM gcf_user`);
    res.status(200).json(keysToCamel(data));
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

gcfUserRouter.get("/role/:role", async (req, res) => {
  try {
    const { role } = req.params;
    const gcfUser = await db.query(
      `SELECT ALL * FROM gcf_user WHERE role = $1`,
      [role]
    );

    if (gcfUser.length === 0){
      return res.status(404).send("Item not found");
    }

    res.status(200).json(keysToCamel(gcfUser));
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

gcfUserRouter.get("/:id/accounts", async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.query;

    let accounts;

    // Admin: RDs and PDs with their associated programs; can no longer view other Admins
    if (role === "Admin") {
      accounts = await db.query(
        `SELECT 
          u.id,
          u.first_name,
          u.last_name,
          u.role,
          COALESCE(
            array_cat(
              COALESCE(
                array_agg(DISTINCT p_rd.name) FILTER (WHERE p_rd.id IS NOT NULL),
                '{}'
              ),
              COALESCE(
                array_agg(DISTINCT p_pd.name) FILTER (WHERE p_pd.id IS NOT NULL),
                '{}'
              )
            ),
            '{}'
          ) AS programs
        FROM gcf_user u
        LEFT JOIN regional_director rd ON u.id = rd.user_id
        LEFT JOIN country c ON rd.region_id = c.region_id
        LEFT JOIN program p_rd ON c.id = p_rd.country
        LEFT JOIN program_director pd ON u.id = pd.user_id
        LEFT JOIN program p_pd ON pd.program_id = p_pd.id
        WHERE u.role == 'RD' OR u.role == 'PD'
        GROUP BY u.id, u.first_name, u.last_name, u.role
        ORDER BY u.last_name ASC`
      );
    }
    // Regional Director: only program directors in their region with their programs
    else if (role === "Regional Director") {
      accounts = await db.query(
        `SELECT 
          u.id,
          u.first_name,
          u.last_name,
          u.role,
          COALESCE(
            array_agg(DISTINCT p.name) FILTER (WHERE p.id IS NOT NULL),
            '{}'
          ) AS programs
        FROM regional_director rd
        JOIN country c ON rd.region_id = c.region_id
        JOIN program p ON c.id = p.country
        JOIN program_director pd ON p.id = pd.program_id
        JOIN gcf_user u ON pd.user_id = u.id
        WHERE rd.user_id = $1
        GROUP BY u.id, u.first_name, u.last_name, u.role
        ORDER BY u.last_name ASC`,
        [id]
      );
    }

    // Fetch emails for each user in one batch (faster than N client requests)
    if (accounts?.length > 0) {
      const auth = admin.auth();
      const identifiers = accounts.map((row) => ({ uid: row.id }));
      const batchSize = 100; // Firebase getUsers limit
      const emailByUid = {};
      for (let i = 0; i < identifiers.length; i += batchSize) {
        const chunk = identifiers.slice(i, i + batchSize);
        const result = await auth.getUsers(chunk);
        for (const user of result.users) {
          emailByUid[user.uid] = user.email ?? null;
        }
      }
      accounts = accounts.map((row) => ({
        ...row,
        email: emailByUid[row.id] ?? null,
      }));
    }

    res.status(200).json(keysToCamel(accounts));
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

gcfUserRouter.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const gcfUser = await db.query(`SELECT ALL * FROM gcf_user WHERE id = $1`, [
      id,
    ]);

    if (gcfUser.length === 0) {
      return res.status(404).send("Item not found");
    }

    res.status(200).json(keysToCamel(gcfUser[0]));
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

gcfUserRouter.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { role, first_name, last_name } = req.body;
    const updatedGcfUser = await db.query(
      `UPDATE gcf_user SET
        role = COALESCE($1, role),
        first_name = COALESCE($2, first_name),
        last_name = COALESCE($3, last_name)    
        WHERE id = $4
        RETURNING *;`,
      [role, first_name, last_name, id]
    );

    if (updatedGcfUser.length === 0) {
      return res.status(404).send("Item not found");
    }

    res.status(200).json(keysToCamel(updatedGcfUser[0]));
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

gcfUserRouter.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedGcfUser = await db.query(
      `DELETE FROM gcf_user WHERE id = $1 RETURNING *`,
      [id]
    );

    if (deletedGcfUser.length === 0) {
      return res.status(404).send("Item not found");
    }

    res.status(200).json(keysToCamel(deletedGcfUser[0]));
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

export { gcfUserRouter };
