import crypto from 'crypto';
import { Store } from './store.js';
import { WhatsAppServerService } from './whatsappService.js';

const CONSULTATION_PRICE_INR = 199;
const CONSULTATION_PRICE_PAISE = 19900;

export async function handleApiRequest(req, res) {
  const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || '';
  const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';
  const CALENDLY_URL = process.env.CALENDLY_URL || 'https://calendly.com/zrinteriordesign/45min-consultation';

  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;
  const method = req.method;

  // Set standard JSON headers
  res.setHeader('Content-Type', 'application/json');

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  // Parse JSON Body for POST requests
  let body = {};
  if (method === 'POST') {
    try {
      body = await parseJsonBody(req);
    } catch (e) {
      res.statusCode = 400;
      res.end(JSON.stringify({ error: 'Invalid JSON request body' }));
      return;
    }
  }

  try {
    // 1. GET /api/status
    if (pathname === '/api/status' && method === 'GET') {
      const razorpayConfigured = Boolean(RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET);
      const isTestKey = RAZORPAY_KEY_ID.startsWith('rzp_test_');

      res.statusCode = 200;
      res.end(JSON.stringify({
        status: 'online',
        serverTime: new Date().toISOString(),
        integrations: {
          razorpay: {
            configured: razorpayConfigured,
            mode: isTestKey ? 'test' : (razorpayConfigured ? 'live' : 'unconfigured'),
            keyId: razorpayConfigured ? RAZORPAY_KEY_ID : null
          },
          calendly: {
            configured: Boolean(CALENDLY_URL),
            url: CALENDLY_URL
          },
          whatsapp: {
            configured: WhatsAppServerService.isConfigured(),
            businessPhone: '+91 78785 88859'
          }
        }
      }));
      return;
    }

    // 2. POST /api/create-order
    if (pathname === '/api/create-order' && method === 'POST') {
      const { leadData } = body;

      if (!leadData || !leadData.name || !leadData.phone || !leadData.propertyType) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: 'Missing required qualification details' }));
        return;
      }

      const bookingId = `ZR_BK_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

      // Create pending booking in store
      const booking = Store.saveBooking({
        id: bookingId,
        status: 'PENDING_PAYMENT',
        lead: leadData,
        payment: {
          amount: CONSULTATION_PRICE_INR,
          currency: 'INR',
          status: 'PENDING'
        }
      });

      // Check if Razorpay keys are configured
      const isRazorpayConfigured = Boolean(
        RAZORPAY_KEY_ID && 
        RAZORPAY_KEY_SECRET && 
        !RAZORPAY_KEY_ID.includes('placeholder') && 
        !RAZORPAY_KEY_SECRET.includes('placeholder')
      );

      if (process.env.RAZORPAY_MOCK_ORDERS === 'true') {
        const mockOrderId = `order_test_${Date.now()}`;
        const mockOrder = {
          id: mockOrderId,
          entity: 'order',
          amount: CONSULTATION_PRICE_PAISE,
          currency: 'INR',
          receipt: `rcpt_${bookingId}`,
          status: 'created'
        };
        Store.saveBooking({
          ...booking,
          payment: {
            ...booking.payment,
            orderId: mockOrderId,
            razorpayResponse: mockOrder
          }
        });
        res.statusCode = 200;
        res.end(JSON.stringify({
          status: 'ok',
          bookingId,
          orderId: mockOrderId,
          amount: CONSULTATION_PRICE_PAISE,
          currency: 'INR',
          keyId: RAZORPAY_KEY_ID
        }));
        return;
      }

      if (!isRazorpayConfigured) {
        res.statusCode = 200;
        res.end(JSON.stringify({
          status: 'awaiting_credentials',
          bookingId,
          amount: CONSULTATION_PRICE_INR,
          currency: 'INR',
          keyId: null,
          message: 'Razorpay Key ID and Secret are awaiting configuration in .env.'
        }));
        return;
      }

      // Create official Razorpay Order via REST API
      const authHeader = 'Basic ' + Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64');
      const rzpPayload = {
        amount: CONSULTATION_PRICE_PAISE,
        currency: 'INR',
        receipt: `rcpt_${bookingId}`,
        notes: {
          bookingId,
          clientName: leadData.name,
          phone: leadData.phone,
          email: leadData.email || '',
          propertyType: leadData.propertyType,
          budgetTier: leadData.budgetTier
        }
      };

      const rzpResponse = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(rzpPayload)
      });

      const rzpData = await rzpResponse.json();

      if (!rzpResponse.ok) {
        console.error('[Razorpay Order Creation Error]:', rzpData);
        res.statusCode = 502;
        res.end(JSON.stringify({
          error: 'Razorpay order creation failed',
          details: rzpData
        }));
        return;
      }

      // Update booking with Razorpay Order ID
      Store.saveBooking({
        ...booking,
        payment: {
          ...booking.payment,
          orderId: rzpData.id,
          razorpayResponse: rzpData
        }
      });

      res.statusCode = 200;
      res.end(JSON.stringify({
        status: 'ok',
        bookingId,
        orderId: rzpData.id,
        amount: CONSULTATION_PRICE_PAISE,
        currency: 'INR',
        keyId: RAZORPAY_KEY_ID
      }));
      return;
    }

    // 3. POST /api/verify-payment
    if (pathname === '/api/verify-payment' && method === 'POST') {
      const { bookingId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

      if (!bookingId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: 'Missing payment signature verification parameters' }));
        return;
      }

      const booking = Store.getBookingById(bookingId);
      if (!booking) {
        res.statusCode = 404;
        res.end(JSON.stringify({ error: 'Booking record not found' }));
        return;
      }

      // Check for duplicate verification
      if (booking.status === 'PAYMENT_VERIFIED' || booking.status === 'CONFIRMED') {
        res.statusCode = 200;
        res.end(JSON.stringify({
          verified: true,
          bookingId: booking.id,
          status: booking.status,
          message: 'Payment already verified (idempotent response)'
        }));
        return;
      }

      if (!RAZORPAY_KEY_SECRET) {
        res.statusCode = 500;
        res.end(JSON.stringify({
          error: 'Server cannot verify signature: RAZORPAY_KEY_SECRET is not configured'
        }));
        return;
      }

      // Compute HMAC SHA256 Signature
      const textToSign = `${razorpay_order_id}|${razorpay_payment_id}`;
      const expectedSignature = crypto
        .createHmac('sha256', RAZORPAY_KEY_SECRET)
        .update(textToSign)
        .digest('hex');

      const isSignatureValid = expectedSignature === razorpay_signature;

      if (!isSignatureValid) {
        console.error('[Payment Verification Failed] Signature mismatch');
        Store.saveBooking({
          ...booking,
          payment: {
            ...booking.payment,
            status: 'FAILED',
            failureReason: 'Signature mismatch'
          }
        });

        res.statusCode = 400;
        res.end(JSON.stringify({
          verified: false,
          error: 'Payment signature verification failed'
        }));
        return;
      }

      // Mark payment as verified
      const updatedBooking = Store.saveBooking({
        ...booking,
        status: 'PAYMENT_VERIFIED',
        payment: {
          ...booking.payment,
          status: 'PAID',
          paymentId: razorpay_payment_id,
          orderId: razorpay_order_id,
          signature: razorpay_signature,
          verifiedAt: new Date().toISOString()
        }
      });

      res.statusCode = 200;
      res.end(JSON.stringify({
        verified: true,
        bookingId: updatedBooking.id,
        amount: CONSULTATION_PRICE_INR,
        currency: 'INR'
      }));
      return;
    }

    // 4. POST /api/confirm-appointment
    if (pathname === '/api/confirm-appointment' && method === 'POST') {
      const { bookingId, calendlyEventUri, calendlyInviteeUri, eventTime, date, timeSlot, mode } = body;

      if (!bookingId) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: 'Missing bookingId' }));
        return;
      }

      const booking = Store.getBookingById(bookingId);
      if (!booking) {
        res.statusCode = 404;
        res.end(JSON.stringify({ error: 'Booking record not found' }));
        return;
      }

      // Ensure payment was verified first
      if (booking.status !== 'PAYMENT_VERIFIED' && booking.payment?.status !== 'PAID') {
        res.statusCode = 403;
        res.end(JSON.stringify({
          error: 'Cannot confirm appointment: payment has not been verified'
        }));
        return;
      }

      const confirmedBooking = Store.saveBooking({
        ...booking,
        status: 'CONFIRMED',
        appointment: {
          date: date || 'Scheduled Date',
          timeSlot: timeSlot || '45-Minute Slot',
          eventTime: eventTime || new Date().toISOString(),
          calendlyEventUri: calendlyEventUri || null,
          calendlyInviteeUri: calendlyInviteeUri || null,
          mode: mode || 'studio',
          durationMinutes: 45,
          confirmedAt: new Date().toISOString()
        }
      });

      // Dispatch WhatsApp confirmation and schedule reminders
      const waResult = await WhatsAppServerService.scheduleBookingNotifications(confirmedBooking);

      res.statusCode = 200;
      res.end(JSON.stringify({
        confirmed: true,
        booking: confirmedBooking,
        whatsapp: waResult
      }));
      return;
    }

    // 5. GET /api/booking/:id
    if (pathname.startsWith('/api/booking/') && method === 'GET') {
      const id = pathname.replace('/api/booking/', '');
      const booking = Store.getBookingById(id);
      if (!booking) {
        res.statusCode = 404;
        res.end(JSON.stringify({ error: 'Booking not found' }));
        return;
      }
      res.statusCode = 200;
      res.end(JSON.stringify(booking));
      return;
    }

    // Fallthrough 404 for unknown /api route
    res.statusCode = 404;
    res.end(JSON.stringify({ error: `API route not found: ${pathname}` }));
  } catch (err) {
    console.error('[API Server Error]:', err);
    res.statusCode = 500;
    res.end(JSON.stringify({ error: 'Internal Server Error', message: err.message }));
  }
}

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 1e6) {
        req.socket.destroy();
        reject(new Error('Request entity too large'));
      }
    });
    req.on('end', () => {
      if (!body) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(body));
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', (err) => reject(err));
  });
}
