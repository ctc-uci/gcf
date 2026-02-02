import { keysToCamel } from "@/common/utils";
import { admin } from "@/config/firebase";
import { db } from "@/db/db-pgp"; // TODO: replace this db with
import { Router } from "express";

const directorRouter = Router();

directorRouter.get("/me/program", async (req, res) => {
    try {
        const decodedToken = res.locals?.decodedToken ?? await admin.auth().verifyIdToken(req.cookies?.accessToken);
        const users = await db.query("SELECT id FROM users WHERE firebase_uid = $1 LIMIT 1", [decodedToken.uid]);
        if (!users?.length) return res.status(404).json({ error: "User not found" });
        const director = await db.query("SELECT program_id FROM program_director WHERE user_id = $1 LIMIT 1", [users[0].id]);
        if (!director?.length) return res.status(404).json({ error: "Program director not found" });
        const program = await db.query("SELECT * FROM program WHERE id = $1", [director[0].program_id]);
        if (!program?.length) return res.status(404).json({ error: "Program not found" });
        res.status(200).json(keysToCamel(program[0]));
    } catch (err) {
        res.status(401).json({ error: "Unauthorized" });
    }
});

directorRouter.get("/me/stats", async (req, res) => {
    try {
        const decodedToken = res.locals?.decodedToken ?? await admin.auth().verifyIdToken(req.cookies?.accessToken);
        const users = await db.query("SELECT id FROM users WHERE firebase_uid = $1 LIMIT 1", [decodedToken.uid]);
        if (!users?.length) return res.status(404).json({ error: "User not found" });
        const director = await db.query("SELECT program_id FROM program_director WHERE user_id = $1 LIMIT 1", [users[0].id]);
        if (!director?.length) return res.status(404).json({ error: "Program director not found" });
        const programId = director[0].program_id;
        const stats = await db.query(
            `SELECT
                (SELECT COALESCE(SUM(ec.enrollment_change), 0) FROM enrollment_change ec
                 JOIN program_update pu ON pu.id = ec.update_id WHERE pu.program_id = $1) AS students,
                (SELECT COALESCE(SUM(ic.amount_changed), 0) FROM instrument_change ic
                 JOIN program_update pu ON pu.id = ic.update_id WHERE pu.program_id = $1) AS instruments`,
            [programId]
        );
        const row = stats[0];
        res.status(200).json(keysToCamel(row));
    } catch (err) {
        res.status(401).json({ error: "Unauthorized" });
    }
});

// create program director
directorRouter.post("/", async (req, res) => {
    try {
        const { userId, programId } = req.body;

        const director = await db.query(
            "INSERT INTO program_director (user_id, program_id) VALUES ($1, $2) RETURNING *",
            [userId, programId]
        );

        res.status(200).json(keysToCamel(director));
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// read all program directors
directorRouter.get("/", async (req, res) => {
    try {
        const directors = await db.query(`SELECT * FROM program_director ORDER BY user_id ASC`);

        res.status(200).json(keysToCamel(directors));
    } catch (err) {
        res.status(400).send(err.message)
    }
});

// read one program director
directorRouter.get("/:userId", async (req, res) => {
    try {
        const { userId } = req.params;

        const director = await db.query("SELECT * FROM program_director WHERE user_id = $1",
            [userId]
        );

        res.status(200).json(keysToCamel(director));
    } catch (err) {
        res.status(400).send(err.message);
    }
});

// update a program director
directorRouter.put("/:userId", async (req, res) => {
    try {
        const { userId, programId } = req.body;

        const director = await db.query(
            "UPDATE program_director SET program_id = $2 WHERE user_id = $1 RETURNING *",
            [userId, programId]
        );

        res.status(200).json(keysToCamel(director));
    } catch (err) {
        res.status(400).send(err.message);
    }
});

// delete a program director
directorRouter.delete("/:userId", async (req, res) => {
    try {
        const { userId } = req.params;

        const director = await db.query("DELETE FROM program_director WHERE user_id = $1 RETURNING *",
            [userId]
        );

        res.status(200).json(keysToCamel(director));
    } catch (err) {
        res.status(400).send(err.message);
    }
});

export { directorRouter };