import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Wild Child Fabrications title', () => {
  render(<App />);
  const titleElement = screen.getByText(/Wild Child Fabrications/i);
  expect(titleElement).toBeInTheDocument();
});
