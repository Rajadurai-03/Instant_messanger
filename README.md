# Zync — Real-Time Chat Application

> A WhatsApp-style real-time messaging app built with React, Spring Boot, WebSocket, and MySQL.

---

## Prerequisites — Install These First

You only need **4 things** installed before running this project.

---

### 1. Node.js (for the frontend)

- Download from: **https://nodejs.org**
- Choose the **LTS** version
- Run the installer, click Next on everything
- Verify in terminal:
  ```
  node -v
  npm -v
  ```

---

### 2. Java 17 (for the backend)

- Download from: **https://adoptium.net**
- Click **Latest LTS Release** → download `.msi` for Windows
- During install, check **"Set JAVA_HOME variable"**
- Verify:
  ```
  java -version
  ```

---

### 3. Maven (to build and run the backend)

- Download from: **https://maven.apache.org/download.cgi**
- Download `apache-maven-3.x.x-bin.zip`
- Extract to `C:\Program Files\Maven\`
- Add to PATH:
  1. Press `Win + S` → search **Environment Variables**
  2. System Variables → `Path` → Edit → New
  3. Add: `C:\Program Files\Maven\apache-maven-3.x.x\bin`
  4. Click OK on everything
- Open a **new** terminal and verify:
  ```
  mvn -v
  ```

---

### 4. MySQL (database)

- Download from: **https://dev.mysql.com/downloads/installer/**
- Download the larger installer (~400 MB)
- Run it → choose **Developer Default** → Next
- During configuration:
  - Port: `3306` (keep default)
  - Set a **root password** — write it down, you will need it
- Verify by opening **MySQL Command Line Client** from Start Menu:
  ```sql
  SHOW DATABASES;
  ```

---

## Get the Project

### Option A — Download ZIP (no Git needed)

1. Go to the GitHub repository page
2. Click green **Code** button → **Download ZIP**
3. Right-click the ZIP → **Extract All**
4. Open the extracted folder in VS Code:
   `File → Open Folder → select the folder`

### Option B — Git Clone

If you have Git installed:
```bash
git clone https://github.com/YOUR_USERNAME/zync.git
cd zync
```
Then open the folder in VS Code.

---

## One-Time Setup

### Step 1 — Create the database

Open **MySQL Command Line Client** from Start Menu and run:
```sql
CREATE DATABASE chatconnect;
```

### Step 2 — Set your database password

Open this file in VS Code:
```
chatconnect-backend/src/main/resources/application.properties
```

Find this line:
```properties
spring.datasource.password=your_password
```

Replace `your_password` with the MySQL root password you set during install. Save the file.

---

## Run the Project

You need **two terminals open at the same time** — one for backend, one for frontend.

### Terminal 1 — Start the Backend

In VS Code, open a terminal (`Ctrl + `` ` ``) and run:
```bash
cd chatconnect-backend
mvn spring-boot:run
```

First time takes 2–3 minutes to download dependencies.

**Wait until you see:**
```
Started BackendApplication in x.xxx seconds
```

**Do not close this terminal.** All database tables are created automatically on first run.

---

### Terminal 2 — Start the Frontend

Open a second terminal in VS Code (`Ctrl + Shift + `` ` ``) and run:
```bash
cd chatconnect-frontend
npm install
```

`npm install` is only needed **once** after downloading the project. After that:
```bash
npm start
```

The app opens automatically in your browser at:
```
http://localhost:3000
```

---

## Login Credentials

### Admin Account

```
Phone:    9876543210
Password: Raja@2003
```

Admin can:
- View all registered users and delete them
- Approve password reset requests (via notification bell)
- Change admin phone number and password
- View profile info

### Regular Users

Click **Sign Up** on the login screen and create your own account with:
- Any name
- Any 10-digit phone number
- Password minimum 8 characters

---

## Test Real-Time Messaging

1. Open **Chrome** → go to `http://localhost:3000` → login as **User A**
2. Open **Incognito window** (`Ctrl + Shift + N`) → go to `http://localhost:3000` → login as **User B**
3. User A clicks **New Chat (+)** → selects User B
4. Send a message — User B sees it instantly

---

## Access from Phone or Other Devices

The app auto-detects your network IP — no code changes needed.

1. Find your PC's IP address:
   ```
   ipconfig
   ```
   Look for **IPv4 Address** under Wi-Fi. Example: `192.168.1.73`

2. Start frontend with network access:
   ```bash
   set HOST=0.0.0.0 && npm start
   ```

3. On your phone (same Wi-Fi), open:
   ```
   http://192.168.1.73:3000
   ```

4. If your phone cannot connect, allow ports through Windows Firewall:
   - `Win + S` → **Windows Defender Firewall** → Advanced Settings
   - Inbound Rules → New Rule → Port → TCP → `3000, 8080` → Allow → Finish

---

## Features

- Real-time messaging with WebSocket (STOMP)
- Messages stored in MySQL — survive page refresh
- Login, Signup, Forgot Password with admin approval flow
- Profile photo upload with circular crop
- Online status, typing indicator, double-tick read receipts
- Group chat — create, rename (any member), delete (creator only)
- Admin panel — user management, notifications, settings
- Mobile responsive — WhatsApp-style navigation

---

## Common Problems

**Backend won't start**
```
Make sure MySQL is running.
Open Services (Win+R → services.msc) → MySQL → Start
```

**"Access denied for user root"**
```
Wrong password in application.properties — double-check it
```

**"Port 8080 already in use"**
```
Open Task Manager → find Java → End Task → restart backend
```

**Messages disappear after refresh**
```
Run in MySQL:
  USE chatconnect;
  DROP TABLE IF EXISTS messages;
Restart backend — table is recreated automatically
```

**npm install fails**
```
Make sure Node.js is installed: node -v
If version is below 16, reinstall from https://nodejs.org
```

**Phone cannot reach app**
```
1. Both phone and PC must be on the same Wi-Fi
2. Use: set HOST=0.0.0.0 && npm start  (not just npm start)
3. Allow ports 3000 and 8080 in Windows Firewall
```

---

## Tech Stack

| | Technology |
|---|---|
| Frontend | React 18, SockJS, STOMP.js |
| Backend | Spring Boot 3, Spring WebSocket |
| Database | MySQL 8 |
| ORM | Spring Data JPA / Hibernate |
| Build | Maven (backend), npm (frontend) |

---

## Project Structure

```
zync/
├── chatconnect-frontend/        React app
│   └── src/
│       ├── pages/
│       │   ├── LoginPage.jsx    Login, Signup, Forgot/Reset Password
│       │   ├── ChatPage.jsx     Main chat (orchestrates everything)
│       │   └── AdminPage.jsx    Admin panel
│       ├── components/
│       │   ├── chat/
│       │   │   ├── ChatSidebar.jsx    Contacts and groups list
│       │   │   ├── ChatWindow.jsx     Message area
│       │   │   └── GroupModals.jsx    Create group / new chat popups
│       │   └── shared/
│       │       └── SharedComponents.jsx   Avatar, Toast, CropModal
│       └── utils/
│           ├── constants.js     API base URL (auto network detection)
│           ├── icons.js         SVG icons
│           └── useIsMobile.js   Mobile breakpoint hook
│
└── chatconnect-backend/         Spring Boot server
    └── src/main/java/backend/
        ├── model/               User, Message, Group, AdminConfig
        ├── repository/          JPA database queries
        ├── controller/          REST API + WebSocket handlers
        └── config/              WebSocket + CORS configuration
```
