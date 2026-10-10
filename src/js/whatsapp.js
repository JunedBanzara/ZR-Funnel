/**
 * ZR INTERIOR DESIGN — CLIENT WHATSAPP & CALENDAR SERVICE
 * Generates official WhatsApp messages, click-to-chat links, and calendar invites (.ics / Google Calendar)
 */

import { ZR_CONFIG } from './config.js';

export class WhatsAppService {
  /**
   * Generates the primary immediate WhatsApp confirmation text
   */
  static generateConfirmationMessage(booking) {
    const name = booking.name || 'Valued Client';
    const date = booking.date || 'Upcoming Date';
    const time = booking.timeSlot || '45-Minute Session';

    return `Hello ${name}, your consultation with ZR Interior Design has been confirmed.

Date: ${date}
Time: ${time}
Duration: 45 minutes

Please keep your floor plan, property details, and requirements ready for the conversation.

We look forward to speaking with you.
— ZR Interior Design, Vadodara (Designing Since 1990)`;
  }

  /**
   * Generates click-to-chat WhatsApp link to ZR's business number
   */
  static getWhatsAppUrl(booking) {
    const text = this.generateConfirmationMessage(booking);
    const phone = ZR_CONFIG.brand.whatsappNumber;
    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  }

  /**
   * Returns the verified 4-stage reminder schedule
   */
  static getReminderSchedule(booking) {
    const name = booking.name || 'Valued Client';
    const time = booking.timeSlot || 'your scheduled time';

    return [
      {
        stage: "Immediate",
        timing: "Sent immediately upon confirmation",
        title: "Official Booking Confirmation",
        message: `Hello ${name}, your consultation with ZR Interior Design has been confirmed. Date: ${booking.date}, Time: ${booking.timeSlot}. Please keep your floor plan and property details ready.`
      },
      {
        stage: "24 Hours Before",
        timing: "Sent 24 hours prior to appointment",
        title: "24-Hour Preparation Reminder",
        message: `Hello ${name}, this is a reminder of your ZR Interior Design consultation tomorrow at ${time}. Please keep your project details ready.`
      },
      {
        stage: "2 Hours Before",
        timing: "Sent 2 hours prior to appointment",
        title: "2-Hour Readiness Alert",
        message: `Hello ${name}, your ZR Interior Design consultation is scheduled for ${time} today. We look forward to speaking with you.`
      },
      {
        stage: "15 Minutes Before",
        timing: "Sent 15 minutes prior",
        title: "15-Minute Final Check-In",
        message: `Hello ${name}, your ZR Interior Design consultation starts in 15 minutes. We look forward to speaking with you.`
      }
    ];
  }

  /**
   * Generates Google Calendar event link
   */
  static getGoogleCalendarUrl(booking) {
    const title = encodeURIComponent("ZR Interior Design — 45-Minute Private Consultation");
    const details = encodeURIComponent(
      `45-Minute Focused Interior Consultation with ZR Interior Design.\nPrincipal Designer: Mr. Zuber Rafik Banzara\nProperty: ${booking.propertyType || 'Residential / Commercial'}\nLocation: ${booking.location || 'Vadodara'}\nScope: ${booking.budgetTier || 'Turnkey'}\nPlease have floor plans and requirements ready.`
    );
    const location = encodeURIComponent("ZR Interior Design Studio, Alkapuri, Vadodara");

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${location}`;
  }

  /**
   * Generates and triggers download of .ics calendar invite
   */
  static downloadIcsFile(booking) {
    const name = (booking.name || 'Client').replace(/[^\w\s-]/g, '');
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//ZR Interior Design//Consultation Booking//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
SUMMARY:ZR Interior Design — 45-Minute Consultation (${name})
DESCRIPTION:Private Interior Design Consultation with ZR Interior Design Vadodara.\\nPrincipal Designer: Mr. Zuber Rafik Banzara.\\nFee: ₹199 (Adjustable against project).
LOCATION:ZR Interior Design Studio, Vadodara
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `ZR-Consultation-${name.replace(/\s+/g, '-')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
