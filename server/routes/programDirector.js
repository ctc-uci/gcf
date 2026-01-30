import { keysToCamel } from "@/common/utils";
import { admin } from "@/config/firebase";
import { db } from "@/db/db-pgp"; // TODO: replace this db with
import { verifyRole } from "@/middleware";
import { Router } from "express";

const directorRouter = Router();

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

// read names of all program directors

directorRouter.get("/program-director-names", async (req, res) => {
    try {
        const director_names = await db.query(
            `SELECT pd.user_id, gu.first_name, gu.last_name
             FROM gcf_user as gu
                INNER JOIN program_director AS pd ON pd.user_id = gu.id
             ORDER BY first_name ASC, last_name ASC`)

            res.status(200).json(keysToCamel(director_names))
    }

    catch (err) {
        res.status(400).send(err.message)
    }
})

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