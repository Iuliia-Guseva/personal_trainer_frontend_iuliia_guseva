import type { Customer } from '../../types/CustomerTypes';

interface CustomerListProps {
  customers: Customer[];
}

function CustomerList({ customers }: CustomerListProps) {
  return (
    <section>
      <h1>Customers</h1>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>First name</th>
            <th>Last name</th>
            <th>Address</th>
            <th>Postcode</th>
            <th>City</th>
            <th>Email</th>
            <th>Phone</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer) => (
            <tr key={customer.id}>
              <td>{customer.id}</td>
              <td>{customer.firstname}</td>
              <td>{customer.lastname}</td>
              <td>{customer.streetaddress}</td>
              <td>{customer.postcode}</td>
              <td>{customer.city}</td>
              <td>{customer.email}</td>
              <td>{customer.phone}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

export default CustomerList;