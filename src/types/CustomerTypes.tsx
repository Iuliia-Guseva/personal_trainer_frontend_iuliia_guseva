export interface CustomerDetails {
  firstname: string;
  lastname: string;
  streetaddress: string;
  postcode: string;
  city: string;
  email: string;
  phone: string;
}

export interface Customer extends CustomerDetails {
  id: number;
}

export interface CustomerFromApi extends CustomerDetails {
  _links: {
    self: {
      href: string;
    };
  };
}

export interface CustomerCollection {
  _embedded?: {
    customers?: CustomerFromApi[];
  };
}
