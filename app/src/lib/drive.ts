import { google } from 'googleapis';
import { getGoogleAuth } from './sheets';

export const DRIVE_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID!;

export async function uploadImageToDrive(
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string
): Promise<string> {
  const auth = getGoogleAuth();
  const drive = google.drive({ version: 'v3', auth });

  const { Readable } = await import('stream');
  const stream = Readable.from(fileBuffer);

  const response = await drive.files.create({
    requestBody: {
      name: fileName,
      parents: [DRIVE_FOLDER_ID],
    },
    media: {
      mimeType,
      body: stream,
    },
    fields: 'id, webViewLink, webContentLink',
  });

  const fileId = response.data.id!;

  // Make the file publicly viewable
  await drive.permissions.create({
    fileId,
    requestBody: {
      role: 'reader',
      type: 'anyone',
    },
  });

  // Return a direct image URL
  return `https://drive.google.com/uc?export=view&id=${fileId}`;
}

export async function deleteFileFromDrive(fileId: string): Promise<void> {
  const auth = getGoogleAuth();
  const drive = google.drive({ version: 'v3', auth });
  await drive.files.delete({ fileId });
}

export function getDriveFileId(url: string): string | null {
  const match = url.match(/id=([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}
