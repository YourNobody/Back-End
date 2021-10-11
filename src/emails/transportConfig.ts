import { google } from "googleapis";

const oAuth2Client = new google.auth.OAuth2(process.env.OAUTH_CLIENT_ID, process.env.OAUTH_CLIENT_SECRET, process.env.OAUTH_REDIRECT_URI);
oAuth2Client.setCredentials({refresh_token: process.env.OAUTH_REFRESH_TOKEN});

let accessToken;

void async function() {
  try {
    accessToken = await oAuth2Client.getAccessToken();
  } catch (err) {
    console.error(err);
  }
}()

const oAuth2Config = {
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.OAUTH_EMAIL_FROM,
    clientId: process.env.OAUTH_CLIENT_ID,
    clientSecret: process.env.OAUTH_CLIENT_SECRET,
    refreshToken: process.env.OAUTH_REFRESH_TOKEN,
    accessToken
  }
};

export default oAuth2Config;