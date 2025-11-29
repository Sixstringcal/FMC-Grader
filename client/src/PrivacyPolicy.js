import React from 'react';
import './App.css';

export default function PrivacyPolicy() {
  return (
    <div className="app-container">
      <h1>Privacy Policy</h1>
      <p><strong>Effective Date:</strong> November 28, 2025</p>

      <section>
        <h2>Introduction</h2>
        <p>
          This Privacy Policy explains how FMC Grader (the “App”) collects, uses, stores,
          and shares personal and usage information.
        </p>
      </section>

      <section>
        <h2>What We Collect</h2>
        <ul>
          <li><strong>User-provided Data:</strong> Profile information when you authenticate (e.g., via Google Sign-In).</li>
          <li><strong>Uploaded Content:</strong> Images you upload for OCR (solution sheets). By default the client sends images directly to the Google Vision API for OCR; the App itself does not persist images unless explicitly uploaded to the server endpoint.</li>
          <li><strong>Derived Data:</strong> OCR results (extracted scrambles and moves) and processing metadata produced while your session is active.</li>
        </ul>
        <p style={{ marginTop: 8 }}>
          <strong>Note:</strong> The App does not collect or store server-side logs, IP addresses, browser or operating system details, or diagnostics in its current configuration. Third-party services (see below) may collect request metadata when the client communicates with them.
        </p>
      </section>

      <section>
        <h2>How We Use Your Data</h2>
        <ul>
          <li>Provide and improve the OCR and grading service.</li>
          <li>Authenticate users and manage sessions.</li>
          <li>Comply with legal obligations when required.</li>
        </ul>
      </section>

      <section>
        <h2>Storage & Retention</h2>
        <p>
          By default, OCR is performed by the Google Vision API directly from the client, so images are transmitted to Google for processing and are not stored on this App's server.
          The server exposes a `/upload` endpoint that accepts images, but the server is intentionally configured to keep uploads in memory only and not write them to disk. The App will not persist uploaded images to server storage in the current configuration.
        </p>
        <p>
          Any derived OCR outputs or user data that the App stores will be retained only as long as necessary to provide the service or to satisfy legal obligations. If you wish to have data removed, contact the project owner and include verification details.
        </p>
      </section>

      <section>
        <h2>Third Parties & Sharing</h2>
        <p>
          The App integrates with third-party services:
        </p>
        <ul>
          <li><strong>Google Vision API:</strong> When you transcribe an image, the client sends the image to Google Vision for OCR. Google receives the image and associated request metadata as part of that call.</li>
          <li><strong>Google Sign-In:</strong> Authentication is handled via Google's OAuth flow; Google will provide basic profile information to authenticate you.</li>
        </ul>
        <p>
          We do not sell personal data. We may use other third-party service providers (hosting, optional analytics) who process data on our behalf; any such provider is required to protect data and follow our instructions.
        </p>
      </section>

      <section>
        <h2>Security</h2>
        <p>We use reasonable technical and organizational measures to protect data in transit and at rest.</p>
      </section>

      <section>
        <h2>Your Rights</h2>
        <ul>
          <li>Access, correction, and deletion of your personal data (subject to verification).</li>
          <li>Opt-out of analytics and promotional communications where applicable.</li>
        </ul>
        <p>Contact the project owner via the repository to exercise these rights.</p>
      </section>

      <p style={{ marginTop: 20 }}>
        <a href="/">← Back to FMC Grader</a>
      </p>
    </div>
  );
}
