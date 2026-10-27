import { NextRequest, NextResponse } from 'next/server';
import { getPool, ensureSchema } from '@/lib/db';
import { sanitizePlainText, sanitizeEmail, isValidEmail } from '@/lib/sanitize';

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (entry.count >= 5) {
    return false;
  }
  entry.count += 1;
  return true;
}

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      'local';

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a minute before sending another message.' },
        { status: 429 }
      );
    }

    const body = await req.json();

    // 1. Honeypot check (bots fill hidden fields)
    if (body.website && String(body.website).trim().length > 0) {
      return NextResponse.json({ error: 'Bot submission rejected.' }, { status: 400 });
    }

    // 2. Anti-robot checkbox & challenge verification
    const notRobotChecked = Boolean(body.notRobotChecked);
    const numA = Number(body.numA);
    const numB = Number(body.numB);
    const challengeAnswer = Number(body.challengeAnswer);

    if (
      !notRobotChecked ||
      !Number.isFinite(numA) ||
      !Number.isFinite(numB) ||
      challengeAnswer !== numA + numB
    ) {
      return NextResponse.json(
        { error: 'Please complete the human verification check correctly.' },
        { status: 400 }
      );
    }

    // 3. Sanitize all fields strictly
    const name = sanitizePlainText(body.name, 100);
    const email = sanitizeEmail(body.email);
    const subject = sanitizePlainText(body.subject || 'General Concierge Inquiry', 140);
    const message = sanitizePlainText(body.message, 1500);

    if (name.length < 2) {
      return NextResponse.json({ error: 'Please enter a valid full name.' }, { status: 400 });
    }
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }
    if (message.length < 10) {
      return NextResponse.json(
        { error: 'Please enter a message of at least 10 characters.' },
        { status: 400 }
      );
    }

    await ensureSchema();
    const pool = getPool();

    await pool.query(`
      CREATE TABLE IF NOT EXISTS kgl_inquiries (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        subject TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    const inquiryId = `INQ-${Date.now()}`;
    await pool.query(
      `INSERT INTO kgl_inquiries (id, name, email, subject, message, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())`,
      [inquiryId, name, email, subject, message]
    );

    return NextResponse.json({
      ok: true,
      inquiryId,
      sanitized: { name, email, subject },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to send inquiry';
    console.error('[POST /api/contact] Error:', message);
    return NextResponse.json({ error: 'Unable to process inquiry at this time.' }, { status: 500 });
  }
}

