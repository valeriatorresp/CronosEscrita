// Google Drive integration for book promotional material & marketing planning

export interface DriveFolderInfo {
  id: string;
  name: string;
  webViewLink?: string;
}

export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  iconLink?: string;
  thumbnailLink?: string;
  modifiedTime?: string;
}

/**
 * Searches for a folder or creates it if it doesn't exist
 */
export const findOrCreateBookMarketingFolder = async (
  accessToken: string,
  bookTitle: string
): Promise<DriveFolderInfo> => {
  const folderName = `📁 MKT & Promoção - ${bookTitle.trim()}`;

  // 1. Search if folder already exists in Drive
  const q = `mimeType = 'application/vnd.google-apps.folder' and name = '${folderName.replace(/'/g, "\\'")}' and trashed = false`;
  const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
    q
  )}&fields=files(id,name,webViewLink)&pageSize=1`;

  const searchRes = await fetch(searchUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!searchRes.ok) {
    const errorData = await searchRes.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || 'Falha ao buscar pasta no Google Drive'
    );
  }

  const searchData = await searchRes.json();
  if (searchData.files && searchData.files.length > 0) {
    return searchData.files[0];
  }

  // 2. Folder does not exist, create it
  const createRes = await fetch(
    'https://www.googleapis.com/drive/v3/files?fields=id,name,webViewLink',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        description: `Pasta de material promocional e plano de marketing gerada pelo CronosEscrita para o livro "${bookTitle}".`,
      }),
    }
  );

  if (!createRes.ok) {
    const err = await createRes.json().catch(() => ({}));
    throw new Error(
      err.error?.message || 'Falha ao criar pasta no Google Drive'
    );
  }

  const folder = await createRes.json();

  // Create an initial README doc/marketing brief inside this folder
  try {
    await fetch(
      'https://www.googleapis.com/drive/v3/files?fields=id,name,webViewLink',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: `📋 Planejamento de Marketing - ${bookTitle}.txt`,
          mimeType: 'text/plain',
          parents: [folder.id],
          description: 'Documento base de diretrizes para divulgação e lançamentos.',
        }),
      }
    );
  } catch {
    // Non-blocking optional helper
  }

  return folder;
};

/**
 * List files inside the book's marketing folder
 */
export const listFolderFiles = async (
  accessToken: string,
  folderId: string
): Promise<DriveFileItem[]> => {
  const q = `'${folderId}' in parents and trashed = false`;
  const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
    q
  )}&fields=files(id,name,mimeType,webViewLink,iconLink,thumbnailLink,modifiedTime)&orderBy=modifiedTime desc&pageSize=30`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Não foi possível carregar os arquivos do Drive');
  }

  const data = await response.json();
  return data.files || [];
};

/**
 * Creates a marketing brief or asset note directly into the folder
 */
export const createMarketingNoteInFolder = async (
  accessToken: string,
  folderId: string,
  fileName: string,
  content: string
): Promise<DriveFileItem> => {
  // Using multipart upload or standard text file creation
  const metadata = {
    name: fileName.endsWith('.txt') ? fileName : `${fileName}.txt`,
    mimeType: 'text/plain',
    parents: [folderId],
  };

  const boundary = 'foo_bar_baz';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: text/plain; charset=UTF-8\r\n\r\n' +
    content +
    closeDelimiter;

  const res = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,webViewLink,modifiedTime',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartRequestBody,
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Erro ao criar nota no Google Drive');
  }

  return await res.json();
};
