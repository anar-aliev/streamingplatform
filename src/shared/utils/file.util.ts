import { ReadStream } from 'fs';

export function validateFileFormat(
  filename: string,
  allowedFileFormats: string[],
) {
  const fileParts = filename.split('.');
  const extensions = fileParts[fileParts.length - 1];

  return allowedFileFormats.includes(extensions);
}

export async function validateFileSize(
  fileStream: ReadStream,
  allowedFileSizeBytes: number,
) {
  return new Promise((resolve, reject) => {
    let fileSizeInBytes = 0;

    fileStream
      .on('data', (data: Buffer) => {
        fileSizeInBytes = data.byteLength;
      })
      .on('end', () => {
        resolve(fileSizeInBytes <= allowedFileSizeBytes);
      })
      .on('error', (err) => {
        reject(err);
      });
  });
}
