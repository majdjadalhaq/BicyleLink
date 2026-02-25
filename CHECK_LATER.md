# Production Setup Checklist: Google Login

> [!IMPORTANT]
> These steps must be completed once the application is deployed to production (e.g., Heroku) for Google Login to work outside of localhost.

## 1. Google Cloud Console Configuration

Update your [Google Cloud Console](https://console.cloud.google.com/) settings for your Client ID:

- **Authorized JavaScript origins**: Add your production URL (e.g., `https://your-app-name.herokuapp.com`).
- **Authorized redirect URIs**: Add your production URL with `/login` (e.g., `https://your-app-name.herokuapp.com/login`).

## 2. Production Environment Variables

Set the Google Client ID in your production environment settings (e.g., Heroku Config Vars):

- **Key**: `VITE_GOOGLE_CLIENT_ID`
- **Value**: `369155814257-s993o9g84baul767l2ol3c6p80f3k5js.apps.googleusercontent.com`

> [!TIP]
> Make sure to set this variable **before** your final deployment, as Vite "bakes in" these variables during the build process.
