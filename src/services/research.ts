import type { GroundingSource } from '../types';

export interface ResearchRequestParams {
  query: string;
  category?: string;
  bookContext?: {
    title?: string;
    genre?: string;
    setting?: string;
    premise?: string;
  };
}

export interface ResearchResponse {
  answer: string;
  sources: GroundingSource[];
  searchQueries?: string[];
}

export async function performLiteraryResearch(
  params: ResearchRequestParams
): Promise<ResearchResponse> {
  const response = await fetch('/api/research', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error || `Erro na pesquisa (${response.status}): ${response.statusText}`
    );
  }

  return response.json();
}
