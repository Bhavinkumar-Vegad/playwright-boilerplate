import dotenv from 'dotenv';
dotenv.config();

import mysql from 'mysql2/promise';

let connection: mysql.Connection;

export async function connectToDatabase() {
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });
    console.log('Connected to MySQL database');
  } catch (error) {
    console.error('Error connecting to database:', error);
    throw error;
  }
}

export async function executeQuery<T>(sql: string, values?: any[]): Promise<T[]> {
  if (!connection) {
    await connectToDatabase();
  }
  try {
    const [rows] = await connection.execute(sql, values);
    return rows as T[];
  } catch (error) {
    console.error('Error executing query:', error);
    throw error;
  }
}

export async function closeDatabaseConnection() {
  if (connection) {
    await connection.end();
    console.log('MySQL database connection closed');
  }
}

export async function getOtpByEmail(email: string): Promise<string | null> {
  if (!connection) {
    await connectToDatabase();
  }
  try {
    const [rows]: any = await connection.execute(
      `SELECT otp FROM otp_verification WHERE email = ? ORDER BY created_at DESC LIMIT 1`,
      [email]
    );
    if (rows.length > 0) {
      return rows[0].otp;
    }
    return null;
  } catch (error) {
    console.error('Error fetching OTP by email:', error);
    throw error;
  }
}