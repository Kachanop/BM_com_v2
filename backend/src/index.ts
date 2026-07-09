import { Hono } from 'hono';
import { cors } from 'hono/cors';

const app = new Hono<{ Bindings: Env }>();

// Enable CORS for all routes
app.use('/*', cors());

app.get('/', (c) => {
  return c.text('Welcome to BM_com_v2 API');
});

// Mock Products endpoint
app.get('/api/products', (c) => {
  return c.json([
    {
      id: 1,
      name: 'เซ็ตสุดคุ้ม Beginner',
      price: 15900,
    },
    {
      id: 2,
      name: 'เซ็ตยอดฮิต Gamer',
      price: 25900,
    },
  ]);
});

// Mock Payment verify endpoint
app.post('/api/payments/verify', async (c) => {
  const body = await c.req.json();
  // Simulate EasySlip check
  if (body.amount === 15900) {
    return c.json({ success: true, message: 'Payment verified' });
  }
  return c.json({ success: false, message: 'Invalid amount' }, 400);
});

export default app;
