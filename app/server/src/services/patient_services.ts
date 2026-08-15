import pool from "../config/db.js";
import type { PatientReferences } from "../types/query_types.js";

//need to count how many identifiers are present if any
const count_patient_identifiers = (patient: PatientReferences): number => {
  return [patient.initials, patient.dob, patient.hcn].filter(
    (identifier) =>
      identifier !== undefined && identifier !== null && identifier !== "",
  ).length;
};

//if identifier is given then require 2 of 3 identifiers in total (if any at all)
const validate_patient_refs = (patient?: PatientReferences): void => {
  if (!patient) return; //optional

  const ref_count = count_patient_identifiers(patient);

  if (ref_count === 0) return; //if empty then ok as this is optional
  if (ref_count === 1) {
    throw new Error(
      "Invalid patient identifiers - require two patient identifiers",
    );
  }
};

//find patient from already existing identifiers OR create new patient record using identifiers
const find_or_create_patient = async (patient?: PatientReferences) => {
  validate_patient_refs(patient);
  if (!patient || count_patient_identifiers(patient) === 0) {
    return null;
  }

  // HCN is unique when present, so it's the most reliable match
  // falls back to initials+DOB only when HCN is absent
  if (patient.hcn) {
    const patient_record = await pool.query(
      `SELECT id
        FROM patients
        WHERE hcn = $1`,
      [patient.hcn],
    );

    if (patient_record.rows.length > 0) {
      return patient_record.rows[0].id;
    }
  } else {
    //try matching initials and DOB instead
    const patient_record = await pool.query(
      `SELECT id
        FROM patients
        WHERE initials = $1
        AND dob = $2
        AND hcn IS NULL`,
      [patient.initials ?? null, patient.dob ?? null],
    );

    if (patient_record.rows.length > 0) {
      return patient_record.rows[0].id;
    }
  }
  // create new record
  const insert_new = await pool.query(
    `INSERT INTO patients
    (initials, dob, hcn)
    VALUES ($1, $2, $3)
    RETURNING id`,
    [patient.initials ?? null, patient.dob ?? null, patient.hcn ?? null],
  );

  return insert_new.rows[0].id;
};

export default { validate_patient_refs, find_or_create_patient };
