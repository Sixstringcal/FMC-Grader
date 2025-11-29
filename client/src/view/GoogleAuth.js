import React from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';


const CLIENT_ID = process.env.REACT_APP_GOOGLE_OAUTH_CLIENT_ID;

function GoogleAuth({ onAuth }) {
  return (
    <GoogleOAuthProvider clientId={CLIENT_ID}>
      <GoogleLogin
        onSuccess={credentialResponse => {
          if (credentialResponse.credential) {
            onAuth(credentialResponse.credential);
          }
        }}
        onError={() => {
          alert('Google Sign-In failed');
        }}
        useOneTap
        scope="https://www.googleapis.com/auth/cloud-platform"
        flow="auth-code"
      />
    </GoogleOAuthProvider>
  );
}

export default GoogleAuth;
