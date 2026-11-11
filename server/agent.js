import 'dotenv/config';
import { z } from 'zod';
import {
  FunctionTool,
  Gemini,
  InMemoryRunner,
  LlmAgent,
  isFinalResponse,
  stringifyContent,
} from '@google/adk';

// ---------------------------------------------------------------
// 1. Mail tool (Brevo HTTPS API, no SMTP, no nodemailer)
// ---------------------------------------------------------------
const sendEmailTool = new FunctionTool({
  name: 'sendEmail',
  description: 'Sends an email to a recipient with a specified subject and body content.',
  parameters: z.object({
    recipientEmail: z.string().describe('The recipient email address from the user instruction.'),
    subject: z.string().describe('A clear, professional subject line.'),
    body: z.string().describe('The complete plain-text body of the email.'),
  }),
  execute: async ({ recipientEmail, subject, body }) => {
    try {
      const res = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': process.env.BREVO_API_KEY,
          'Content-Type': 'application/json',
          accept: 'application/json',
        },
        body: JSON.stringify({
          sender: {
            name: process.env.MAIL_FROM_NAME || 'Mail Agent',
            email: process.env.MAIL_FROM,
          },
          to: [{ email: recipientEmail }],
          subject,
          textContent: body,
        }),
      });

      const data = await res.json().catch(() => ({}));

      // An HTTP API doesn't throw on failure, so check the status explicitly
      if (!res.ok) {
        console.error('Brevo error:', data);
        return {
          status: 'error',
          message: `Failed to deliver email: ${data.message ?? res.statusText}`,
        };
      }

      return {
        status: 'success',
        message: `Email successfully sent to ${recipientEmail}`,
        messageId: data.messageId,
      };
    } catch (error) {
      console.error('Brevo request failed:', error.message);
      return { status: 'error', message: `Failed to deliver email: ${error.message}` };
    }
  },
});

// ---------------------------------------------------------------
// 2. Agent
// ---------------------------------------------------------------
export const agent = new LlmAgent({
  name: 'email_dispatch_agent',
  model: new Gemini({
    model: process.env.GEMINI_MODEL || 'gemini-3.5-flash',
    apiKey: process.env.GEMINI_API_KEY,
  }),
  instruction: `
    You are an intelligent email drafting and dispatch assistant.
    When a user gives you an instruction:
    1. Parse the request to identify the context, intent, and target recipient email address.
    2. If there is no recipient email address, do NOT call the tool; ask the user for it.
    3. Draft a complete, well-structured, professional email body based on the instructions.
       Do not invent facts the user did not mention.
    4. Determine a relevant, professional subject line.
    5. Call the 'sendEmail' tool exactly once with the recipient's email address, subject, and body.
    6. Summarize what action was taken once the tool finishes. Never claim the email was sent
       unless the tool returned status "success".
  `,
  tools: [sendEmailTool],
});

const APP_NAME = 'email_agent_app';
const USER_ID = 'demo_user';
const runner = new InMemoryRunner({ agent, appName: APP_NAME });

// ---------------------------------------------------------------
// 3. Function used by index.js
// ---------------------------------------------------------------
export async function handleUserRequest(prompt) {
  if (!prompt || typeof prompt !== 'string') {
    throw new Error('Prompt parameter must be a non-empty string.');
  }

  const session = await runner.sessionService.createSession({
    appName: APP_NAME,
    userId: USER_ID,
  });

  let reply = '';
  let emailSent = false;
  let toolError = null;
  let email = null; // what the agent generated: recipient, subject, body

  for await (const event of runner.runAsync({
    userId: USER_ID,
    sessionId: session.id,
    newMessage: { role: 'user', parts: [{ text: prompt }] },
  })) {
    // Stop and report model-level failures (bad key, quota, model not found, safety block)
    if (event.errorCode || event.errorMessage) {
      throw new Error(
        `Model error: ${event.errorCode ?? ''} ${event.errorMessage ?? ''}`.trim()
      );
    }

    for (const part of event.content?.parts ?? []) {
      // The model's request to call the tool, with the content it generated
      const fc = part.functionCall;
      if (fc?.name === 'sendEmail') {
        email = {
          recipientEmail: fc.args?.recipientEmail ?? null,
          subject: fc.args?.subject ?? null,
          body: fc.args?.body ?? null,
        };
      }

      // The tool's real result
      const fr = part.functionResponse;
      if (fr?.name === 'sendEmail') {
        if (fr.response?.status === 'success') emailSent = true;
        else toolError = fr.response?.message ?? 'Unknown tool error';
      }
    }

    if (isFinalResponse(event)) {
      reply = stringifyContent(event).trim();
    }
  }

  return { reply, emailSent, toolError, email };
}