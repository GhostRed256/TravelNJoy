import { google } from 'googleapis';
import { Readable, PassThrough } from 'stream';

let privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
if (privateKey) {
  privateKey = privateKey.trim().replace(/^["']|["']$/g, '').replace(/\\n/g, '\n');
}
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;

export const DRIVE_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID!;

function getGoogleAuth() {
  return new google.auth.GoogleAuth({
    credentials: {
      client_email: clientEmail,
      private_key: privateKey,
    },
    scopes: [
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/drive.file',
    ],
  });
}

export async function uploadImageToDrive(
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<string> {
  const auth = getGoogleAuth();
  const drive = google.drive({ version: 'v3', auth });

  const stream = new PassThrough();
  stream.end(fileBuffer);

  // supportsAllDrives allows writing to Shared Drives
  const response = await drive.files.create({
    supportsAllDrives: true,
    requestBody: {
      name: fileName,
      parents: [DRIVE_FOLDER_ID],
    },
    media: {
      mimeType,
      body: stream,
    },
    fields: 'id',
  });

  const fileId = response.data.id!;

  // Make the file publicly viewable
  await drive.permissions.create({
    fileId,
    supportsAllDrives: true,
    requestBody: {
      role: 'reader',
      type: 'anyone',
    },
  });

  // Return standard Drive view URL (works for both personal and shared drives)
  return `https://drive.google.com/uc?export=view&id=${fileId}`;
}

export async function deleteFileFromDrive(fileId: string): Promise<void> {
  const auth = getGoogleAuth();
  const drive = google.drive({ version: 'v3', auth });
  await drive.files.delete({ fileId, supportsAllDrives: true });
}

export function getDriveFileId(url: string): string | null {
  const match = url.match(/(?:id=|\/d\/)([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}
