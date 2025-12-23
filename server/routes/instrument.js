import { keysToCamel } from "@/common/utils";
import express from "express";


import { db } from "../db/db-pgp";


const instrumentRouter = express.Router();
instrumentRouter.use(express.json());


instrumentRouter.post("/", async (req, res) => {
 try {
   const { name } = req.body;
   const newInstrument = await db.query(
     `INSERT INTO instrument (name)
     VALUES ($1)
     RETURNING *;`,
     [name]
   );
   res.status(201).json(keysToCamel(newInstrument[0]));
 } catch (err) {
   console.error(err);
   res.status(500).send("Internal Server Error");
 }
});


instrumentRouter.get("/", async (req, res) => {
 try {
   const instruments = await db.query(`SELECT * FROM instrument;`);
   res.status(200).json(keysToCamel(instruments));
 } catch (err) {
   console.error(err);
   res.status(500).send("Internal Server Error");
 }
});


instrumentRouter.get("/:id", async (req, res) => {
 try {
   const { id } = req.params;
   const instrument = await db.query(
     `SELECT ALL * FROM instrument WHERE id = $1;`,
     [id]
   );


   if (instrument.length === 0) {
     res.status(404).send("No Instrument Found");
   }
   res.status(200).json(keysToCamel(instrument[0]));
 } catch (err) {
   console.error(err);
   res.status(500).send("Internal Server Error");
 }
});


instrumentRouter.put("/:id", async (req, res) => {
 try {
   const { id } = req.params;
   const { name } = req.body;
   const updateInstrument = await db.query(
     `UPDATE instrument
     SET name = COALESCE($2, name)
     WHERE id = $1
     RETURNING *;`,
     [id, name]
   );


   if (updateInstrument.length === 0) {
     res.status(404).send("Instrument Not Found");
   }


   res.status(200).json(keysToCamel(updateInstrument[0]));
 } catch (err) {
   console.error(err);
   res.status(500).send("Internal Server Error");
 }
});


instrumentRouter.delete("/:id", async (req, res) => {
 try {
   const { id } = req.params;
   const deleteInstrument = await db.query(
     `DELETE FROM instrument WHERE id = $1 RETURNING *;`,
     [id]
   );


   if (deleteInstrument.length === 0) {
     res.status(404).json("No Instrument Found");
   }


   res.status(200).json(keysToCamel(deleteInstrument[0]));
 } catch (err) {
   console.error(err);
   res.status(500).send("Internal Server Error");
 }
});


export { instrumentRouter };