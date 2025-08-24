import { render, screen, fireEvent } from '@testing-library/react';
import SearchBar from '@/components/SearchBar';

describe('SearchBar', () => {
  it('calls setSearchQuery on input change', () => {
    const setSearchQuery = jest.fn();
    render(<SearchBar searchQuery="" setSearchQuery={setSearchQuery} />);
    const input = screen.getByPlaceholderText('Search by training area...');
    fireEvent.change(input, { target: { value: 'cardio' } });
    expect(setSearchQuery).toHaveBeenCalledWith('cardio');
  });
});
