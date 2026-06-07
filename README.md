# MXDWN (mixdown)

**MXDWN** is a full-stack, asynchronous audio collaboration and review platform. Built for audio engineers, producers, and artists, it allows users to upload mix iterations, stream high-fidelity audio directly in the browser, and leave time-stamped feedback directly on an interactive waveform.

## 🏗 Architecture
This project is structured as a **Monorepo**, housing both the client and server applications to streamline full-stack feature development and synchronized version control.

* `mxdwn-client/`: The React frontend UI.
* `mxdwn-backend/`: The Spring Boot REST API.

## 💻 Tech Stack

**Frontend**
* **React 18** (Bootstrapped with Vite)
* **React Router** for client-side navigation
* **Wavesurfer.js** (Canvas-based audio waveform visualization)
* **Axios** for API communication

**Backend**
* **Java 17 / Spring Boot 3**
* **Spring Data JPA / Hibernate**
* **PostgreSQL** (Containerized via Docker for local development)

**Cloud & Infrastructure**
* **AWS S3:** Direct-to-cloud audio storage using securely generated Presigned URLs.
* **Docker:** Database and backend containerization.

## ✨ Current Functionality

* **Project Dashboard:** A dynamic grid displaying active audio projects.
* **High-Performance Audio Player:** Utilizes Wavesurfer.js to draw interactive waveforms and stream audio binary directly from AWS S3 without CORS blocking.
* **Interactive Time-Stamped Feedback:** Users can pause a track and "drop a pin." The application captures the exact millisecond of the playhead, saves the comment to the database, and renders a visual marker directly on the waveform.
* **Direct-to-S3 Upload Pipeline:** A robust, split-architecture file uploader.
    1. Frontend requests a secure Presigned URL from the Spring Boot API.
    2. Frontend streams the raw audio binary directly to the AWS S3 bucket (bypassing the backend server to save bandwidth).
    3. Upon a 100% successful upload, metadata is securely committed to the PostgreSQL database, preventing "ghost records."
 

<img width="1128" height="931" alt="Screenshot 2026-06-07 at 2 24 32 PM" src="https://github.com/user-attachments/assets/f8847716-1240-4c42-890a-a823432695d3" />



## 🗺 Roadmap

* **Bidirectional Seeking:** Clicking on a comment in the feedback list will instantly snap the audio playhead to the exact millisecond of the marker.
* **Authentication & Authorization:** Transitioning from the current soft-auth model (`artist_123`) to a secure JWT-based authentication system.
* **UI Redesign:** Redesigning the UI for a modern and intuitive look/feel 
* **Cloud Deployment (The Modern Split):**
    * Deploying the React client to a global edge network via **Vercel**.
    * Deploying the containerized Spring Boot API to a platform like **Railway** or **Render**.
    * Migrating the local Docker PostgreSQL database to a managed cloud provider.

## 🚀 Getting Started (Local Development)

### 1. Environment Variables
Ensure you have an active AWS IAM user configured with S3 access. You will need to provide your AWS credentials and S3 bucket name in the backend application.properties file.

### 2. Start the Database & Backend
Start the Database & Backend
Navigate to the root workspace directory and spin up the PostgreSQL database (and optionally the Spring Boot server) using Docker:
```bash
docker-compose up -d
```
(Alternatively, run the Spring Boot application directly from your IDE).

### 3. Start the Frontend
Navigate to the client directory, install dependencies, and start the Vite development server:
```bash
cd mxdwn-client
npm install
npm run dev
```
