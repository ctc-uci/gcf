import { keysToCamel } from "@/common/utils";
import express from "express";
import { db } from "../db/db-pgp";

const updatesPermissionsRouter = express.Router();
updatesPermissionsRouter.use(express.json());

updatesPermissionsRouter.get("/media-updates/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = await db.query(`SELECT *
                                FROM program_update
                                WHERE id = $1;`, [id]);
    
    if (data.length === 0){
      return res.status(404).send("Item not found");
    }

// updatesPermissionsRouter.get("/media-updates/:id", async (req, res) => {
//   try {
//     const { id } = req.params;
//     const data = await db.query(`SELECT program_update.update_date, program_update.note, program.name, gcf_user.first_name, gcf_user.last_name, program.status
//                                 FROM program_update
//                                 INNER JOIN media_change ON media_change.update_id = program_update.id
//                                 INNER JOIN program ON program_update.program_id = program.id
//                                 INNER JOIN gcf_user ON gcf_user.id = program.created_by
//                                 WHERE gcf_user.id = $1;`, [id]);
    
//     if (data.length === 0){
//       return res.status(404).send("Item not found");
//     }
    
    res.status(200).json(keysToCamel(data));
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
})

updatesPermissionsRouter.get("/program-account/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = await db.query(`SELECT program_update.update_date, program_update.note, program.name, gcf_user.first_name, gcf_user.last_name, program.status
                                FROM program_update
                                INNER JOIN program ON program_update.program_id = program.id
                                INNER JOIN gcf_user ON gcf_user.id = program.created_by
                                LEFT JOIN regional_director ON regional_director.user_id = gcf_user.id
                                LEFT JOIN region ON regional_director.region_id = region.id
                                WHERE gcf_user.id = $1;`, [id]);
    
    if (data.length === 0){
      return res.status(404).send("Item not found");
    }
    
    res.status(200).json(keysToCamel(data));
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
})

updatesPermissionsRouter.get("/program-updates/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = await db.query(`SELECT program_update.update_date, program_update.note, program.name, gcf_user.first_name, gcf_user.last_name, program.status
                                FROM program_update
                                INNER JOIN program ON program_update.program_id = program.id
                                INNER JOIN gcf_user on gcf_user.id = program.created_by
                                LEFT JOIN program_director ON program_director.program_id = program.id AND program_director.user_id = gcf_user.id
                                WHERE gcf_user.id = $1;`, [id])

    if (data.length === 0){
      return res.status(404).send("Item not found");
    }
    
    res.status(200).json(keysToCamel(data));
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
})

export { updatesPermissionsRouter };