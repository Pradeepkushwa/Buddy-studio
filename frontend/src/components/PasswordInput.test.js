import { render, screen, fireEvent } from '@testing-library/react';
import PasswordInput from './PasswordInput';

describe('PasswordInput', () => {
  const defaultProps = {
    id: 'password',
    name: 'password',
    value: 'secret123',
    onChange: jest.fn(),
    placeholder: 'Enter password',
  };

  test('renders as password type by default (text is hidden)', () => {
    render(<PasswordInput {...defaultProps} />);
    const input = screen.getByPlaceholderText('Enter password');
    expect(input).toHaveAttribute('type', 'password');
  });

  test('shows password when eye icon is clicked', () => {
    render(<PasswordInput {...defaultProps} />);
    const toggleBtn = screen.getByRole('button', { name: /show password/i });
    fireEvent.click(toggleBtn);
    const input = screen.getByPlaceholderText('Enter password');
    expect(input).toHaveAttribute('type', 'text');
  });

  test('hides password again on second click', () => {
    render(<PasswordInput {...defaultProps} />);
    const toggleBtn = screen.getByRole('button', { name: /show password/i });
    fireEvent.click(toggleBtn);
    const hideBtn = screen.getByRole('button', { name: /hide password/i });
    fireEvent.click(hideBtn);
    const input = screen.getByPlaceholderText('Enter password');
    expect(input).toHaveAttribute('type', 'password');
  });

  test('calls onChange when user types', () => {
    const onChange = jest.fn();
    render(<PasswordInput {...defaultProps} onChange={onChange} />);
    const input = screen.getByPlaceholderText('Enter password');
    fireEvent.change(input, { target: { value: 'newpass' } });
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
