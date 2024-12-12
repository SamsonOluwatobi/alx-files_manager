/* eslint-disable no-unused-vars */
import fs from 'fs';
import readline from 'readline';
import { promisify } from 'util';
import mime from 'mime-types';
import { gmail_v1 as gmailV1, google } from 'googleapis';

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/gmail.send'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';
const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

/**
 * Gets and stores a new token after prompting for user authorization, and then
 * executes the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get the token for.
 * @param {Function} callback The callback for the authorized client.
 */
async function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) {
        console.error('Error retrieving access token', err);
        return;
      }
      oAuth2Client.setCredentials(token);
      writeFileAsync(TOKEN_PATH, JSON.stringify(token))
        .then(() => {
          console.log('Token stored to', TOKEN_PATH);
          callback(oAuth2Client);
        })
        .catch((writeErr) => console.error(writeErr));
    });
  });
}

/**
 * Creates an OAuth2 client with the given credentials, and then executes the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {Function} callback The callback to call with the authorized client.
 */
async function authorize(credentials, callback) {
  const clientSecret = credentials.web.client_secret;
  const clientId = credentials.web.client_id;
  const redirectURIs = credentials.web.redirect_uris;
  const oAuth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    redirectURIs[0],
  );
  console.log('Client authorization beginning');
  // Check if we have previously stored a token.
  await readFileAsync(TOKEN_PATH)
    .then((token) => {
      oAuth2Client.setCredentials(JSON.parse(token));
      callback(oAuth2Client);
    })
    .catch(async () => getNewToken(oAuth2Client, callback));
  console.log('Client authorization done');
}

/**
 * Delivers a mail through the user's account.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 * @param {gmailV1.Schema$Message} mail The message to send.
 */
function sendMailService(auth, mail) {
  const gmail = google.gmail({ version: 'v1', auth });

  gmail.users.messages.send({
    userId: 'me',
    requestBody: mail,
  }, (err, _res) => {
    if (err) {
      console.log(`The API returned an error: ${err.message || err.toString()}`);
      return;
    }
    console.log('Message sent successfully');
  });
}

/**
 * Contains routines for mail delivery with GMail.
 */
export default class Mailer {
  /**
   * Checks the OAuth2 client authorization.
   */
  static checkAuth() {
    readFileAsync('credentials.json')
      .then(async (content) => {
        await authorize(JSON.parse(content), (auth) => {
          if (auth) {
            console.log('Auth check was successful');
          }
        });
      })
      .catch((err) => {
        console.log('Error loading client secret file:', err);
      });
  }

  /**
   * Builds a MIME message for sending an email.
   * @param {string} dest The recipient's email address.
   * @param {string} subject The subject of the email.
   * @param {string} message The content of the email.
   * @returns {gmailV1.Schema$Message} The MIME message.
   */
  static buildMessage(dest, subject, message) {
    const senderEmail = process.env.GMAIL_SENDER;

    // Use mime-types for content type
    const contentType = mime.lookup('html') || 'text/html';

    const msgData = [
      `MIME-Version: 1.0`,
      `Content-Type: ${contentType}; charset=UTF-8`,
      `From: ${senderEmail}`,
      `To: ${dest}`,
      `Subject: ${subject}`,
      `Date: ${new Date().toUTCString()}`,
      '',
      message
    ].join('\r\n');

    if (!senderEmail) {
      throw new Error(`Invalid sender: ${senderEmail}`);
    }

    const base64EncodedMessage = Buffer.from(msgData)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    return { raw: base64EncodedMessage };
  }

  /**
   * Sends an email using the GMail API.
   * @param {gmailV1.Schema$Message} mail The message to send.
   */
  static sendMail(mail) {
    readFileAsync('credentials.json')
      .then(async (content) => {
        await authorize(
          JSON.parse(content),
          (auth) => sendMailService(auth, mail),
        );
      })
      .catch((err) => {
        console.log('Error loading client secret file:', err);
      });
  }
}
