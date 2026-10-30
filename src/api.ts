import type { Customer, CustomerCollection } from './types/CustomerTypes';
import type { Training } from './types/TrainingTypes';

const API_BASE_URL = 'https://customer-rest-service-frontend-personaltrainer.2.rahtiapp.fi/api';

async function request(path: string): Promise<Response> {
  const response = await fetch(`${API_BASE_URL}${path}`);

  if (!response.ok) {
    const details = await response.text();
    throw new Error(details || `Request failed (${response.status} ${response.statusText})`);
  }

  return response;
}

function getIdFromHref(href: string): number {
  const parts = new URL(href).pathname.split('/').filter(Boolean);
  const id = Number(parts[parts.length - 1]);
  if (!Number.isInteger(id)) {
    throw new Error(`The API returned an invalid resource link: ${href}`);
  }
  return id;
}

export async function getCustomers(): Promise<Customer[]> {
  const response = await request('/customers');
  const result: CustomerCollection = await response.json();

  return (result._embedded?.customers ?? []).map(({ _links, ...customer }) => ({
    ...customer,
    id: getIdFromHref(_links.self.href),
  }));
}

export async function getTrainings(): Promise<Training[]> {
  const response = await request('/gettrainings');
  const trainings: Training[] = await response.json();

  return trainings;
}
