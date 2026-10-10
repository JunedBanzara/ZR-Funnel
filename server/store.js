import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');
const BOOKINGS_FILE = path.join(DATA_DIR, 'bookings.json');
const REMINDERS_FILE = path.join(DATA_DIR, 'reminders.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(BOOKINGS_FILE)) {
  fs.writeFileSync(BOOKINGS_FILE, JSON.stringify([], null, 2));
}
if (!fs.existsSync(REMINDERS_FILE)) {
  fs.writeFileSync(REMINDERS_FILE, JSON.stringify([], null, 2));
}

function readJson(filePath) {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw || '[]');
  } catch (err) {
    console.error(`[Store] Error reading ${filePath}:`, err.message);
    return [];
  }
}

function writeJson(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(`[Store] Error writing ${filePath}:`, err.message);
  }
}

export const Store = {
  getAllBookings() {
    return readJson(BOOKINGS_FILE);
  },

  getBookingById(id) {
    const all = readJson(BOOKINGS_FILE);
    return all.find((b) => b.id === id) || null;
  },

  getBookingByOrderId(orderId) {
    const all = readJson(BOOKINGS_FILE);
    return all.find((b) => b.payment?.orderId === orderId) || null;
  },

  saveBooking(booking) {
    const all = readJson(BOOKINGS_FILE);
    const existingIndex = all.findIndex((b) => b.id === booking.id);
    if (existingIndex >= 0) {
      all[existingIndex] = { ...all[existingIndex], ...booking, updatedAt: new Date().toISOString() };
    } else {
      all.push({ ...booking, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    writeJson(BOOKINGS_FILE, all);
    return booking;
  },

  getAllReminders() {
    return readJson(REMINDERS_FILE);
  },

  saveReminder(reminder) {
    const all = readJson(REMINDERS_FILE);
    const existingIndex = all.findIndex((r) => r.id === reminder.id);
    if (existingIndex >= 0) {
      all[existingIndex] = { ...all[existingIndex], ...reminder };
    } else {
      all.push(reminder);
    }
    writeJson(REMINDERS_FILE, all);
    return reminder;
  }
};
