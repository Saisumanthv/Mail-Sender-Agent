import 'dotenv/config';
import express from 'express';
import { createClient } from '@supabase/supabase-js';
import { handleUserRequest } from './agent.js';

const app = express();
const PORT = process.env.PORT || 3000;

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

import cors from 'cors';

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json());

// Saves one row in email_logs. Never throws, so a logging problem
// can't turn an already-sent email into an error response.
async function logEmail(record) {
  const { error } = await supabase.from('email_logs').insert(record);
  if (error) {
    console.error('Supabase insert failed:', error.message);
    return false;
  }
  return true;
}

app.post('/api/send-email', async (req, res) => {
  try {
    const { context } = req.body;

    if (!context || typeof context !== 'string' || context.trim() === '') {
      return res.status(400).json({
        error: 'A valid "context" string is required in the request body.',
      });
    }

    const result = await handleUserRequest(context.trim());

    // Store in Supabase before sending the response
    const logged = await logEmail({
      mail_id: result.email?.recipientEmail ?? null,
      content: result.email?.body ?? null,
      sent_status: result.emailSent,
    });

    return res.status(200).json({
      success: result.emailSent,
      data: result.reply,
      error: result.toolError,
      logged,
    });
  } catch (error) {
    console.error('Error executing email agent:', error);

    await logEmail({
      mail_id: null,
      content: null,
      sent_status: false,
    });

    return res.status(500).json({
      success: false,
      error: 'An error occurred while processing the request.',
      details: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});