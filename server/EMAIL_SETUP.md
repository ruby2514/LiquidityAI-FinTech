\# Email System — Setup \& Documentation



\## Overview

This project uses \*\*Nodemailer\*\* to send transactional emails triggered by 

user management actions in the dashboard. Emails are currently configured

to use \*\*Mailtrap\*\* for testing. This document covers the current setup 

and how to add new email types.



\---



\## Current Setup (Mailtrap — Testing)



\### What is Mailtrap?

Mailtrap is an email sandbox tool that catches all outgoing emails and 

displays them in a test inbox. No real emails are ever delivered to users.

It is used during development and testing only.



\### Files

```

server/

├── lib/

│   └── email.js          # Nodemailer config + 4 send functions

└── templates/

&#x20;   ├── signup-approved.html

&#x20;   ├── signup-denied.html

&#x20;   ├── password-reset.html

&#x20;   └── security-alert.html

```



\### Environment Variables (.env)

```env

MAILTRAP\_HOST=sandbox.smtp.mailtrap.io

MAILTRAP\_PORT=2525

MAILTRAP\_USER=your\_mailtrap\_username

MAILTRAP\_PASS=your\_mailtrap\_password

MAIL\_FROM=noreply@liquidity.ai

```



\### Getting Mailtrap Credentials

1\. Go to mailtrap.io and create a free account

2\. Create a sandbox inbox (e.g. "liquidity-dev")

3\. Click into the inbox → Integration tab

4\. Select \*\*Nodemailer\*\* from the dropdown

5\. Copy the `user` and `pass` values into your `.env`



\---



\## Email Triggers



| User Action | Function Called | Template Used |

|---|---|---|

| Admin approves a user | `sendSignupApproved(email, name)` | signup-approved.html |

| Admin denies a user | `sendSignupDenied(email, name, reason)` | signup-denied.html |

| Admin force resets password | `sendPasswordReset(email, name, resetLink)` | password-reset.html |

| 5 failed login attempts | `sendSecurityAlert(email, name, details)` | security-alert.html |



\### Where they are wired in

\- `server/routes/userRoutes.js` — approve and deny routes

\- `server/routes/authRoutes.js` — account lockout route



\---



\## How the Template System Works



Templates use `{{placeholder}}` syntax for dynamic values:

```html

<p>Hi <strong>{{name}}</strong>,</p>

```



The `fillTemplate()` function in `email.js` replaces all placeholders:

```js

function fillTemplate(html, variables) {

&#x20; let result = html;

&#x20; for (const \[key, value] of Object.entries(variables)) {

&#x20;   result = result.replaceAll(`{{${key}}}`, value);

&#x20; }

&#x20; return result;

}

```



\---



\## Testing Emails Individually

```bash

\# Test signup approved

node -e "import('./server/lib/email.js').then(m => 

&#x20; m.sendSignupApproved('test@example.com', 'Test User')

&#x20; .then(() => console.log('sent')).catch(console.error))"



\# Test signup denied

node -e "import('./server/lib/email.js').then(m => 

&#x20; m.sendSignupDenied('test@example.com', 'Test User', 'Incomplete documentation')

&#x20; .then(() => console.log('sent')).catch(console.error))"



\# Test password reset

node -e "import('./server/lib/email.js').then(m => 

&#x20; m.sendPasswordReset('test@example.com', 'Test User', 'http://localhost:5173/reset?token=abc123')

&#x20; .then(() => console.log('sent')).catch(console.error))"



\# Test security alert

node -e "import('./server/lib/email.js').then(m => 

&#x20; m.sendSecurityAlert('test@example.com', 'Test User', 'Login from unknown IP 192.168.1.1')

&#x20; .then(() => console.log('sent')).catch(console.error))"

```

\---



\## Adding a New Email Type



Follow these steps to add a new email notification:



\*\*Step 1 — Create the HTML template\*\*

Add a new file in `server/templates/` e.g. `my-new-email.html`

Use `{{placeholder}}` syntax for dynamic values.



\*\*Step 2 — Add a send function in `email.js`\*\*

```js

async function sendMyNewEmail(to, name) {

&#x20; const html = fillTemplate(loadTemplate('my-new-email'), { name });

&#x20; return sendEmail({ to, subject: 'Your subject here', html });

}

```



\*\*Step 3 — Export the function\*\*

Add it to the export block at the bottom of `email.js`:

```js

export {

&#x20; sendSignupApproved,

&#x20; sendSignupDenied,

&#x20; sendPasswordReset,

&#x20; sendSecurityAlert,

&#x20; sendMyNewEmail,  // ← add here

};

```



\*\*Step 4 — Import and call it in the relevant route\*\*

```js

import { sendMyNewEmail } from '../lib/email.js';



// Inside your route handler:

sendMyNewEmail(user.email, user.display\_name)

&#x20; .catch(err => console.error('Email failed:', err.message));

```

\---



\## Important Notes for Developers



\### .env is gitignored

The `.env` file is never committed to GitHub. Each developer needs their 

own `.env` file with their own credentials. See `.env.example` for the 

required variables.



\### Emails fail silently

Email sending uses `.catch()` instead of `await` so a failed email never 

breaks the main API response. Errors are logged to the server console. 

In production, consider sending these errors to a logging service.



