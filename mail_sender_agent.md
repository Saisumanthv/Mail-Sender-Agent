## Step 1) Install Git:

- Go to `https://git-scm.com/install/` and select your operating system and click on 'Click here to download' button and install the downloaded .exe file, once the Git is installed, you'll be able to see Git Bash app in your system
- Open Git Bash app and run `git -v` to confirm the installed Git version
- Now, you have to configure your GitHub username and email by using these commands: (i) `git config --global user.name "Your Name"` (ii) `git config --global user.email "your.email@example.com"`
- Run command `git config --list` to check if the credentials configured correctly

---

## Step 2) Install Node.js:

- Go to `https://nodejs.org/en` and select the relevant operating system and click on download button and double click on the installer to install node
- Open Git Bash app and run command `node -v` to check the installed node version and run `npm -v` to check the installed node package manager version

---

### Step 3) Generate Gemini API Key

1. **Access Google AI Studio:** Navigate to [aistudio.google.com](https://aistudio.google.com) and sign in with your Google account credentials.
2. **Initiate Key Creation:** Click **Get API key** located in the bottom-left navigation sidebar.
3. **Provision API Key:** Click **Create API key**, select or create your Google Cloud project, assign a key label, and click **Create Key**.
4. **Secure API Key:** Copy the generated API key string (e.g., `AIzaSy...`) and store it securely for environment configuration.

---

## Step 4) Initializing React application

- Create a new folder on the Desktop and open it with VSCode.
- Open terminal and run command `npm create vite@latest .` (We have used ' .' here because we wanted to build the app directly inside our current folder instead of creating a nested subfolder)

> **Note:** Vite is a modern frontend build tool and development server. During development, it serves your code natively using ES Modules (ESM) to deliver near-instant startup times and lightning-fast Hot Module Replacement (HMR) as you save changes. When you are ready for deployment, Vite acts as a bundler, packaging and optimizing your HTML, CSS, JavaScript, and assets into production-ready static files.

- Select `React` framework in the next step
- Select the preferred variant in the next step, for e.g., `JavaScript + React Compiler`
- Select Linter in the next step, for e.g., ESLint
- Click Yes to install with npm and start the application and your application will start running on the port 5173 by default, i.e., http://localhost:5173/
- Whenever the frontend stops running, you can restart by running the command `npm run dev` in the terminal.

---

## Step 5) Setup Backend Server (Node.js & Express)

- Create a folder named 'server' in the root directory of your project
- Navigate to 'server' folder in VSCode terminal
- Run command `npm init -y` in the terminal
- Install all the required tools/packages using 'npm install ...' command, for e.g., `npm install @google/adk zod express cors dotenv nodemailer`. @google/adk is the agent framework. zod defines the tool’s input schema, which ADK shows to the model. nodemailer sends the mail through SMTP. You can check all the installed dependencies in the '.server/package.json' file.
- Next, run `npm install -D @google/adk-devtools` if you want a ready made local web chat UI or else ignore it.
- Create a file named 'agent.js' inside the 'server' directory
- Now, open 'agent.js' file and write your complete agent logic which includes tool calling, LLM API call and finally sends the email to the mail id received by the endpoint
- Now, create a file named 'index.js' in the 'server' directory and write an endpoint which takes input from the frontend and calls the agent in the 'agent.js' file and sends back the 200 status code as the endpoint response.
- Initiate the express server using express package which we have installed using npm before. You can use 3000 port to listen to the API calls.
- Open server/package.json and add `"type": "module"` so the import syntax works.
- To run this server, you need to run `node index.js` command in the terminal in 'server' directory path, then the server will start running at localhost port number 3000.
- But whenever you make changes, you need to stop the server and run it again. To make the running server track the changes automatically, we need to install 'nodemon' package as dev dependency using the command `npm install --save-dev nodemon` and run the server using command `npx nodemon index.js` which will restart the server automatically whenever file changes in the project directory.
- Create server/.env:

```env
PORT=3000

# Gemini API Key (get from https://aistudio.google.com/)
GEMINI_API_KEY=your_actual_gemini_api_key_here

# Email Configuration (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_16_digit_app_password
```

- SMTP_EMAIL is simply your full Gmail address (e.g., youremail@gmail.com), while SMTP_APP_PASSWORD is a dedicated 16-character passcode generated by Google to let applications bypass two-factor authentication safely without using your personal Google account password.

- **Step 1: Ensure 2-Step Verification Is Enabled**
  - Google will not allow you to generate an App Password unless 2-Step Verification is turned on:
  - Open your Google Account settings (https://myaccount.google.com/).
  - Select Security from the left-hand navigation panel.
  - Under the How you sign in to Google section, check 2-Step Verification. If it is off, click it and follow the on-screen steps to set it up.

- **Step 2: Generate the 16-Character App Password**
  - Go directly to the Google App Passwords page (https://myaccount.google.com/apppasswords?rapt=AEjHL4MVONEnzg3lr3WZmEDS1ZqVgHphKK9MQ0woRgGcKUskM9AYuza0T_cHcDFInQN40bEoCMRq8_Wo3WZWKuC6QnsKSkFoxcfuzHs34mHjkpKSKtw8yTo).
  - Enter a descriptive name for the application in the App name field (e.g., NodeMailer, Portfolio App, or Backend Server).
  - Click Create.
  - A modal will appear displaying a 16-character code (typically shown in four blocks of four letters, such as 'abcd efgh ijkl mnop').
  - Copy this code immediately—Google will not display it to you again once the window is closed.

- **Step 3: Add Them to Your Environment File**
  - Paste the values into your .env configuration. You can paste the App Password either with or without spaces (most libraries, like Nodemailer, handle it seamlessly, but removing spaces is standard practice):

```
SMTP_EMAIL=yourname@gmail.com
SMTP_APP_PASSWORD=abcdefghijklmnop
Security Note: Never commit your .env file to public version control (like GitHub). Ensure .env is listed inside your .gitignore file. If the key is ever leaked, return to the App Passwords page and click the trash can icon next to the app name to revoke it immediately.
```

---

## Step 6) Database configuration:

- Now, we need to configure a database as we intended to store the existing user details and their chat history. For my application, I'm going to use Supabase as my database.
- Run command `npm install @supabase/supabase-js` in the terminal inside 'server' directory path and you can find that Supabase package has been added to dependencies in 'package.json' file
- Now, go to 'supabase.com' and Signup/Signin into your account
- Create an organization in the next step followed by a project creation --> give a Project name, Database password, and check in the 'Enable automatic RLS' option and create the project.
- Copy project URL in the project home page and go to your project's ./server/.env file paste it with the variable name 'SUPABASE_URL'
- Go to Project Settings in the sidebar and open API Keys option. Click on View legacy API keys option in the first section, now copy anon key and service_role key and paste them in ./server/.env file under variables 'SUPABASE_ANON_KEY' & 'SUPABASE_SERVICE_ROLE_KEY' accordingly.
- Go to supabase and create tables you wanted to use for your app, for my project I only want one table to store the 'email_logs' such as mail_id, content and sent_status (True, False)
- Go to supabase, open SQL Editor in the sidebar & enter your table creation query and click on Run button to create the table. (https://medium.com/@aiwithsumanth/create-table-email-logs-be8afacd9b6e?postPublishedType=initial)
- Now you can go to Table Editor tab from the sidebar and check if the table has been created.
- Now, go to `agent.js` and edit it so it can also reads the tool call the model makes, so it captures the recipient and email body Gemini generated, instead of only whether the send succeeded. It should return those along with the existing results, so `index.js` can save them to Supabase.
- Now, go to your app's backend at './server/index.js' and configure the supabase connection (instructions in next step).
- First, import 'createClient' function from the supabase package which we have already installed.
- Now, initialize supabase by loading project url and service role key from .env file
- Finally, before sending the LLM response to frontend, save it inside your 'email_logs' table in the supabase. That's how you can make your data persistent through out multiple re-renders. And now it's time to work on frontend part.

---

## Step 7) Build user interface

- Clear the predefined code in App.jsx file and just keep the boilerplate.
- Before building the frontend, first we need to allow the frontend to read the database. To do that, open 'supabase.com > SQL Editor > and run this command there (https://medium.com/@aiwithsumanth/allow-the-frontend-anon-key-to-read-only-successfully-sent-mails-create-policy-public-read-01e8af50f313?postPublishedType=initial). Now, our frontend is allowed to fetch data from the database.
- Now, we need to setup the CORS compatibility. Without this, the browser blocks the request with a CORS error. For that, run command `npm install cors` in the terminal in 'server' path and now we need to add the cors import and middle in thw 'index.js' file.
- Now, in the root directory, run command `npm install @supabase/supabase-js` to work with database from our frontend
- Create '.env' file in the root directory and add backend URL, supabase project URL and Supabase anon key. Use the anon key here, never the service role key, because anything with a VITE_ prefix is public.
- Now, start building frontend for your application. For my app I just need a input field for user query, send button which makes an API call to endpoint which is defined in my backend and the use of paragraph tag to show the user if the mail has been sent.
- And also I want to include a sidebar which shows the previous mails history, for that I need to make API call to database using supabase package we previously installed.
- Now, run `npm run dev` to see your complete application
- Add styles in the 'App.css' if required and import it in the 'App.jsx' file using syntax `import "./App.css"`

---

## Step 8) Push the project to GitHub

- Before pushing this project to GitHub, first we need to secure our environment variables in .env files which includes Gemini API key, supabase URL, anon key and service role key. For that, open the .gitignore file, or create one in the root directory if it doesn't exist in your project and include your .env file in there.
- Now, run command `git init` in the root directory path in terminal to initialize an empty git repository
- And now we need to rename the branch name from 'master' to 'main' because many of the platforms already moved from 'master' to 'main'. To rename the branch, run command `git branch -M main`
- Now, we need to add the modified files to the staging area, because the commit command only commits the staged changes (staged files). Run command `git add .` to add all the modified files to the staging area.
- Run command `git status` to check the current status of the repository. You can run this command anytime you wanted to see the repo status.
- Now, run command `git commit -m 'commit_message'` to commit all the staged files. Commit means saving the current snapshot of the repository.
- Now, go to GitHub and create a repository and copy the repo URL
- Open the IDE and run the command `git remote add origin <repo_url>` to connect the local repo with the GitHub repo.
- Finally, run command `git push -u origin main` to push the local repo to the GitHub.

---

## Step 9) Deploying our application

- Before deploying our application, we need to check if we're hardcoding any values in our project. For example, if the backend URL is hardcoded as localhost inside our frontend/backend code in 'App.jsx'/'index.js' file, it won't work when deployed. To solve this issue, create a new environment variable named as 'VITE_API_URL'/FRONTEND_URL with backend/frontend localhost URL as value in respected .env file.
- Now, go to the 'App.jsx'/'index.js' file and replace the hardcoded frontend/backend localhost URL with the URL stored in the .env file by importing it.
- But, Gmail SMTP is blocked on Render’s free tier. This is the big one. Free Render web services block outbound traffic to SMTP ports 25, 465 and 587. You use port 465, so locally everything works but on Render the send would time out. Your sendEmail tool would return an error and the row would be saved as false. Render support says ports 465 and 587 work on paid instances, while port 25 stays blocked for everyone. Our options are: Upgrade the backend to paid instance, Switch to an email service that sends over HTTPS instead of SMTP, such as Brevo, SendGrid, Mailgun, Postmark or Resend
- I'm going to use Brevo for my application, open Brevo.com and register your account. And verify the mobile number.
- Go to settings > Senders, domains, IPs > Click on 'Add sender' button and continue with your details and click on 'Add this sender anyway' button and verify the sender with the code received in the mail.
- Now, under settings > SMTP & API > select API keys & MCP > click on '+ Generate API key' button. Give name, expiry date and Access to your key and click on 'Generate' button and enter the verification code received at your mail and click on 'Verify' button. Copy the API key right away cause it won't be visible later, and click on 'I've saved my key' button.
- Now, open 'server/.env' file and replace all the SMTP_* variables with Brevo variables such as BREVO_API_KEY, MAIL_FROM, MAIL_FROM_NAME
- Now, go to 'server/agent.js' file and replace the old syntax with Brevo compatible syntax.
- Now, push the modified files to the GitHub again by using the commands described in the previous step.

### Deploy Backend (Render): 
- Navigate to render.com and sign in (or create an account using your GitHub credentials).
- Click + New in the dashboard and select Web Service.
- Authorize your GitHub account, locate your project repository (e.g., Mail-Sender-Agent), and select it.
- Set Language to Node as our project's backend is written in Node.
- Select Branch as Main
- Root Directory should be server
- Build Command: npm install
- Start Command: node index.js
- Instance Type: Select Free (or your preferred instance plan)
- Now, go to your project in the IDE and open the /server/.env file and copy all the environment variables. And now, go to Render again and paste everything in the first field and everything will be automatically tracked.
- Scroll to the bottom of the page and click Deploy Web Service. Render will compile, build, and deploy your live backend API.

### Deploy Frontend (Vercel):
- Navigate to vercel.com, click Log In / Sign Up and complete the verification
- And now, click on Create New button and select Project option
- And select Continue with GitHub under the Import Git Repository section. Click on Install to install the Vercel GitHub Application and complete account email verification if prompted.
- Now, click Import next to your project repository (e.g., Mail-Sender-Agent).
- Assign a project name and scroll down to find our frontend file named as 'app', click on 'Import single project' right side to it and the Root Directory and Application Present will be set automatically.
- Now, expand Environment Variables section and go to the project in your IDE and open .env file in the root directory, copy everything and paste it in the first field and everything will be automatically tracked.
- As our backend has already been deployed, we need to change the VITE_API_URL to the real backend deployed URL.
- Go to the Render and the deployed backend dashboard, and now select the Deploys option in the sidebar, where you'll find the backend deployed URL, copy that URL.
- Again, go to Vercel now and replace the VITE_API_URL localhost value with the backend deployed URL.
- Finally, scroll down to find the Deploy button, click on it to deploy our frontend.
- Once it's deployed, you can find the deployed URL which you can share with others or submit your project.
- Finally, copy the frontend deployed URL and go to Render and open the deployed URL project, got to Environment option in the sidebar and replace the FRONTEND_URL localhost URL with the frontend deployed URL and click on 'Save, rebuild, and deploy' button to complete the CORS compatibility feature.
