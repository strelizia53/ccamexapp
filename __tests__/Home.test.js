import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Home from '@/app/page';

jest.mock('@/components/TrainingCard', () => ({
  __esModule: true,
  default: ({ program }) => <div data-testid="card">{program.trainingArea}</div>,
}));

const mockGetDocs = jest.fn();
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  getDocs: (...args) => mockGetDocs(...args),
}));

describe('Home page', () => {
  beforeEach(() => {
    mockGetDocs.mockResolvedValue({
      docs: Array.from({ length: 10 }, (_, i) => ({
        id: String(i + 1),
        data: () => ({
          trainingArea: `Area ${i + 1}`,
          trainerName: `Trainer ${i + 1}`,
          schedule: new Date().toISOString(),
          venue: `Venue ${i + 1}`,
        }),
      })),
    });
  });

  it('paginates programs', async () => {
    render(<Home />);
    expect(await screen.findAllByTestId('card')).toHaveLength(9);
    fireEvent.click(screen.getByRole('button', { name: '2' }));
    await waitFor(() => expect(screen.getAllByTestId('card')).toHaveLength(1));
  });

  it('filters programs based on search query', async () => {
    render(<Home />);
    const input = await screen.findByPlaceholderText('Search by training area...');
    fireEvent.change(input, { target: { value: 'Area 10' } });
    await waitFor(() => expect(screen.getAllByTestId('card')).toHaveLength(1));
    expect(screen.getByText('Area 10')).toBeInTheDocument();
  });
});
