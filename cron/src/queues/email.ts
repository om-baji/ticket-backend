import nodemailer from "nodemailer";

const SMTP_HOST = process.env.SMTP_HOST!;
const SMTP_PORT = Number(process.env.SMTP_PORT!);

export const transport = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

type Passenger = {
  seatNo: string;
  berth : string;
  status: string;
  info : {
    name : string,
    berth : string,
    age : number;
  }
};

export const generateEmailTemplate = (pnr: string, passengers: Passenger[]) => {
  const passengerRows = passengers
    .map(
      (p) => `
      <tr>
        <td>${p.info.name}</td>
        <td>${p.info.berth}</td>
        <td>${p.seatNo}</td>
        <td>${p.status}</td>
        <td>${p.info.age}</td>
      </tr>
    `
    )
    .join("");

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <title>Train Ticket Confirmation</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #f7f9fc;
        padding: 20px;
      }
      .container {
        background-color: white;
        max-width: 600px;
        margin: auto;
        padding: 25px;
        border-radius: 10px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      }
      h2 {
        color: #2c3e50;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 20px;
      }
      th, td {
        padding: 12px;
        border: 1px solid #ddd;
        text-align: left;
      }
      th {
        background-color: #f1f1f1;
      }
      .footer {
        margin-top: 30px;
        font-size: 12px;
        color: #888;
        text-align: center;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h2>Booking Confirmed</h2>
      <p>Hello,</p>
      <p>Your train ticket has been successfully booked. Below are the booking details:</p>

      <p><strong>PNR:</strong> ${pnr}</p>

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Berth</th>
            <th>Seat No</th>
            <th>Status</th>
            <th>Age</th>
          </tr>
        </thead>
        <tbody>
          ${passengerRows}
        </tbody>
      </table>

      <p>If you have any issues or need to cancel your ticket, please contact our support.</p>

      <div class="footer">
        &copy; 2025 TrainBooking Co. All rights reserved.
      </div>
    </div>
  </body>
  </html>
  `;
};

