// End-to-end smoke test for the MeshAI API.
//
// Unlike the TripleTen-provided tests/lesson-XX.js files, this isn't an
// official checkpoint with a hidden verification code — it's a convenience
// script that walks the entire pipeline (auth -> chats -> upload -> embed
// -> query -> message) in one run, so you don't have to manually curl
// through all twelve steps by hand every time you want to confirm
// everything still works.
//
// Usage:
//   1. Start the server in another terminal: npm run dev
//   2. Make sure .env has a real NEBIUS_API_KEY (needed for steps 9-12)
//   3. node scripts/verify-live.mjs

import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';

const BASE_URL = `http://localhost:${process.env.PORT || 3000}`;
const testEmail = `smoketest_${Date.now()}@example.com`;
const testPassword = 'password123';
const SECRET_PHRASE = 'BLUEBERRY42';

let passed = 0;
let failed = 0;
let token = null;
let chatId = null;
let documentId = null;

async function test(name, fn) {
  try {
    await fn();
    console.log(`✅ ${name}`);
    passed++;
  } catch (err) {
    console.log(`❌ ${name} — ${err.message}`);
    failed++;
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

// Builds a minimal, valid, hand-rolled PDF containing a distinctive fact.
// Used to confirm the RAG pipeline is actually grounding its answer in the
// uploaded document, rather than hallucinating a plausible-sounding one.
function buildTestPdf() {
  const bodyText = `The secret onboarding code is ${SECRET_PHRASE}.`;
  const stream = `BT /F1 12 Tf 72 720 Td (${bodyText}) Tj ET`;
  const obj1 = '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n';
  const obj2 = '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n';
  const obj3 =
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792]' +
    ' /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n';
  const obj4 = `4 0 obj\n<< /Length ${stream.length} >>\nstream\n${stream}\nendstream\nendobj\n`;
  const obj5 =
    '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n';

  const header = '%PDF-1.4\n';
  let pos = header.length;
  const o1 = pos;
  pos += obj1.length;
  const o2 = pos;
  pos += obj2.length;
  const o3 = pos;
  pos += obj3.length;
  const o4 = pos;
  pos += obj4.length;
  const o5 = pos;
  pos += obj5.length;
  const xrefStart = pos;

  const pad = (n) => String(n).padStart(10, '0');
  const xref =
    'xref\n0 6\n' +
    '0000000000 65535 f \n' +
    `${pad(o1)} 00000 n \n` +
    `${pad(o2)} 00000 n \n` +
    `${pad(o3)} 00000 n \n` +
    `${pad(o4)} 00000 n \n` +
    `${pad(o5)} 00000 n \n`;

  const trailer = `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`;
  return Buffer.from(
    header + obj1 + obj2 + obj3 + obj4 + obj5 + xref + trailer,
  );
}

console.log('\nMeshAI — End-to-End Smoke Test\n');

// --- Health ---
await test('GET /health returns 200', async () => {
  const res = await fetch(`${BASE_URL}/health`);
  assert(res.status === 200, `expected 200, got ${res.status}`);
});

// --- Auth ---
await test('POST /auth/register creates a user', async () => {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      password: testPassword,
      name: 'Smoke Test',
    }),
  });
  assert(res.status === 201, `expected 201, got ${res.status}`);
  const body = await res.json();
  assert(body.success === true, 'expected success: true');
  assert(!body.data.password, 'password should never be in the response');
});

await test('POST /auth/register rejects a short password', async () => {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: `short_${Date.now()}@example.com`,
      password: 'short',
      name: 'Short',
    }),
  });
  assert(res.status === 400, `expected 400, got ${res.status}`);
});

await test('POST /auth/login returns a token', async () => {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, password: testPassword }),
  });
  assert(res.status === 200, `expected 200, got ${res.status}`);
  const body = await res.json();
  token = body.data?.token ?? null;
  assert(token, 'expected a token in the response');
});

await test('POST /auth/login rejects a wrong password', async () => {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, password: 'wrongpassword' }),
  });
  assert(res.status === 401, `expected 401, got ${res.status}`);
});

await test('GET /chats without a token returns 401', async () => {
  const res = await fetch(`${BASE_URL}/chats`);
  assert(res.status === 401, `expected 401, got ${res.status}`);
});

if (!token) {
  console.log(
    '\n⚠️  No token acquired — skipping every remaining test (auth is broken).\n',
  );
  console.log(`${passed} passed, ${failed} failed`);
  process.exit(1);
}

const authHeaders = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
};

// --- Chats ---
await test('POST /chats creates a chat', async () => {
  const res = await fetch(`${BASE_URL}/chats`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ title: 'Smoke Test Chat' }),
  });
  assert(res.status === 201, `expected 201, got ${res.status}`);
  const body = await res.json();
  chatId = body.data?._id ?? null;
  assert(chatId, 'expected a chat _id in the response');
});

await test('GET /chats includes the created chat', async () => {
  const res = await fetch(`${BASE_URL}/chats`, { headers: authHeaders });
  assert(res.status === 200, `expected 200, got ${res.status}`);
  const body = await res.json();
  assert(
    body.data.some((c) => c._id === chatId),
    'expected the created chat in the list',
  );
});

await test('GET /chats/:id returns { chat, messages: [] }', async () => {
  const res = await fetch(`${BASE_URL}/chats/${chatId}`, {
    headers: authHeaders,
  });
  assert(res.status === 200, `expected 200, got ${res.status}`);
  const body = await res.json();
  assert(body.data.chat._id === chatId, 'expected the matching chat');
  assert(Array.isArray(body.data.messages), 'expected a messages array');
});

await test('GET /chats/:id returns 404 for a nonexistent chat', async () => {
  const res = await fetch(
    `${BASE_URL}/chats/000000000000000000000001`,
    { headers: authHeaders },
  );
  assert(res.status === 404, `expected 404, got ${res.status}`);
});

// --- Documents (requires a real NEBIUS_API_KEY from here on) ---
await test('POST /documents uploads a PDF and creates chunks with real embeddings', async () => {
  const form = new FormData();
  form.append(
    'file',
    new Blob([buildTestPdf()], { type: 'application/pdf' }),
    'smoke-test.pdf',
  );
  form.append('title', 'Smoke Test Document');

  const res = await fetch(`${BASE_URL}/documents`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  assert(res.status === 201, `expected 201, got ${res.status}`);
  const body = await res.json();
  documentId = body.data?._id ?? null;
  assert(documentId, 'expected a document _id in the response');

  // Check MongoDB directly for real chunks with real embeddings.
  await mongoose.connect(process.env.MONGO_URI);
  const Chunk = mongoose.model(
    'Chunk',
    new mongoose.Schema({}, { strict: false }),
  );
  const chunks = await Chunk.find({ documentId });
  await mongoose.disconnect();

  assert(chunks.length > 0, 'expected at least one chunk to be saved');
  assert(
    chunks.every((c) => Array.isArray(c.embedding) && c.embedding.length > 0),
    'expected every chunk to have a non-empty embedding array',
  );
});

await test('GET /documents includes the uploaded document', async () => {
  const res = await fetch(`${BASE_URL}/documents`, { headers: authHeaders });
  assert(res.status === 200, `expected 200, got ${res.status}`);
  const body = await res.json();
  assert(
    body.data.some((d) => d._id === documentId),
    'expected the uploaded document in the list',
  );
});

// --- Query & message generation ---
await test('POST /query returns an answer grounded in the uploaded PDF', async () => {
  const res = await fetch(`${BASE_URL}/query`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ question: 'What is the secret onboarding code?' }),
  });
  assert(res.status === 200, `expected 200, got ${res.status}`);
  const body = await res.json();
  const answer = body.data?.answer ?? '';
  console.log(`   → answer: ${answer.slice(0, 200)}`);
  assert(
    answer.includes(SECRET_PHRASE),
    `expected the answer to mention ${SECRET_PHRASE} (proves it's reading your PDF, not guessing)`,
  );
});

await test('POST /chats/:id/messages saves and returns both messages', async () => {
  const res = await fetch(`${BASE_URL}/chats/${chatId}/messages`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({ question: 'What is the secret onboarding code?' }),
  });
  assert(res.status === 201, `expected 201, got ${res.status}`);
  const body = await res.json();
  assert(Array.isArray(body.data) && body.data.length === 2, 'expected [userMessage, assistantMessage]');
  assert(body.data[0].role === 'user', 'expected first message to have role "user"');
  assert(body.data[1].role === 'assistant', 'expected second message to have role "assistant"');
});

await test('GET /chats/:id now shows the full message history', async () => {
  const res = await fetch(`${BASE_URL}/chats/${chatId}`, {
    headers: authHeaders,
  });
  const body = await res.json();
  assert(body.data.messages.length === 2, 'expected 2 messages in history');
});

console.log(`\n${passed} passed, ${failed} failed\n`);
process.exit(failed > 0 ? 1 : 0);
