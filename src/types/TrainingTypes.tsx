import type { Customer } from './CustomerTypes';

export interface Training {
  id: number;
  date: string;
  duration: number;
  activity: string;
  customer: Customer;
}
