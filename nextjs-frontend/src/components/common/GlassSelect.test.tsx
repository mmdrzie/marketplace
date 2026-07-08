import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GlassSelect } from './GlassSelect';

const options = [
  { value: '1', label: 'تهران' },
  { value: '2', label: 'اصفهان' },
  { value: '3', label: 'شیراز' },
];

describe('GlassSelect', () => {
  it('renders with placeholder', () => {
    render(<GlassSelect value="" onChange={() => {}} options={options} />);
    expect(screen.getByText('انتخاب کنید')).toBeInTheDocument();
  });

  it('shows selected label', () => {
    render(<GlassSelect value="2" onChange={() => {}} options={options} />);
    expect(screen.getByText('اصفهان')).toBeInTheDocument();
  });

  it('opens dropdown on click', async () => {
    const user = userEvent.setup();
    render(<GlassSelect value="" onChange={() => {}} options={options} />);
    await user.click(screen.getByRole('button'));
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getByText('تهران')).toBeInTheDocument();
    expect(screen.getByText('اصفهان')).toBeInTheDocument();
    expect(screen.getByText('شیراز')).toBeInTheDocument();
  });

  it('calls onChange when an option is selected', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<GlassSelect value="" onChange={onChange} options={options} />);
    await user.click(screen.getByRole('button'));
    await user.click(screen.getByText('شیراز'));
    expect(onChange).toHaveBeenCalledWith('3');
  });

  it('closes dropdown after selection', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<GlassSelect value="" onChange={onChange} options={options} />);
    await user.click(screen.getByRole('button'));
    await user.click(screen.getByText('تهران'));
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('closes dropdown on outside click', async () => {
    const user = userEvent.setup();
    render(<div><GlassSelect value="" onChange={() => {}} options={options} /><span data-testid="outside">outside</span></div>);
    await user.click(screen.getByRole('button'));
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    await user.click(screen.getByTestId('outside'));
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('disables button when disabled prop is true', () => {
    render(<GlassSelect value="" onChange={() => {}} options={options} disabled />);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
