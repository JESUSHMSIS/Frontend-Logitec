import { render, screen } from '@testing-library/react';
import TransportesTable from '@/app/(dashboard)/grupos/components/TransportesTable';

describe('TransportesTable', () => {
  it('renders without crashing', () => {
    render(<TransportesTable />);
    expect(screen.getByRole('table')).toBeInTheDocument();
  });
}); 