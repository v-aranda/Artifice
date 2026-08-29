import { getGoogleAuth } from '../auth/google-auth.js';

function endpoint(region) {
  const prefix = region === 'global' ? '' : `${region}-`;
  return `https://${prefix}discoveryengine.googleapis.com/v1alpha`;
}

export function notebookUrl({ projectNumber, location, notebookId }) {
  return `https://notebook.cloud.google.com/${location}/notebook/${notebookId}?project=${projectNumber}`;
}

export async function createNotebook({ projectNumber, location, endpointRegion, title }) {
  const auth = await getGoogleAuth();
  const token = await auth.getAccessToken();
  const response = await fetch(`${endpoint(endpointRegion)}/projects/${projectNumber}/locations/${location}/notebooks`, {
    method: 'POST', headers: { Authorization: `Bearer ${token.token || token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ title })
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error?.message || `Google API retornou ${response.status}.`);
  return { ...body, projectNumber, location, endpointRegion, notebookUrl: notebookUrl({ projectNumber, location, notebookId: body.notebookId }) };
}

export async function addWebSource(notebook, url, sourceName) {
  const auth = await getGoogleAuth();
  const token = await auth.getAccessToken();
  const response = await fetch(`${endpoint(notebook.endpointRegion)}/${notebook.name}/sources:batchCreate`, {
    method: 'POST', headers: { Authorization: `Bearer ${token.token || token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ userContents: [{ webContent: { url, sourceName } }] })
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error?.message || `Google API retornou ${response.status}.`);
  return body;
}
