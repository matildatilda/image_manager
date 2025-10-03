import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Home from '../page';

// Mock crypto.randomUUID
const mockRandomUUID = jest.fn(() => 'test-uuid');
global.crypto = {
  randomUUID: mockRandomUUID,
} as unknown as Crypto;

describe('Home Page', () => {
  it('renders the page title', () => {
    render(<Home />);
    expect(screen.getByText('Image Manager')).toBeInTheDocument();
  });

  it('renders the page description', () => {
    render(<Home />);
    expect(screen.getByText('Upload, preview, and manage your images')).toBeInTheDocument();
  });

  it('renders ImageUploader component', () => {
    render(<Home />);
    expect(screen.getByText('Click to upload or drag and drop')).toBeInTheDocument();
  });

  it('renders ImageGallery component with empty state', () => {
    render(<Home />);
    expect(screen.getByText('No images uploaded yet')).toBeInTheDocument();
  });

  it('adds image to gallery when uploaded', async () => {
    render(<Home />);

    const file = new File(['test'], 'test.png', { type: 'image/png' });
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

    Object.defineProperty(fileInput, 'files', {
      value: [file],
      writable: false,
    });

    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(screen.getByText('Uploaded Images (1)')).toBeInTheDocument();
    });
  });

  it('displays uploaded image in gallery', async () => {
    render(<Home />);

    const file = new File(['test'], 'test.png', { type: 'image/png' });
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

    Object.defineProperty(fileInput, 'files', {
      value: [file],
      writable: false,
    });

    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(screen.getByAltText('test.png')).toBeInTheDocument();
    });
  });

  it('handles multiple image uploads', async () => {
    render(<Home />);

    const file1 = new File(['test1'], 'test1.png', { type: 'image/png' });
    const file2 = new File(['test2'], 'test2.jpg', { type: 'image/jpeg' });
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

    Object.defineProperty(fileInput, 'files', {
      value: [file1, file2],
      writable: false,
    });

    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(screen.getByText('Uploaded Images (2)')).toBeInTheDocument();
    });
  });

  it('deletes image when delete button is clicked', async () => {
    render(<Home />);

    const file = new File(['test'], 'test.png', { type: 'image/png' });
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

    Object.defineProperty(fileInput, 'files', {
      value: [file],
      writable: false,
    });

    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(screen.getByText('Uploaded Images (1)')).toBeInTheDocument();
    });

    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByText('No images uploaded yet')).toBeInTheDocument();
    });
  });

  it('assigns unique IDs to uploaded images', async () => {
    const uuids = ['uuid-1', 'uuid-2'];
    let callCount = 0;
    mockRandomUUID.mockImplementation(() => uuids[callCount++]);

    render(<Home />);

    const file1 = new File(['test1'], 'test1.png', { type: 'image/png' });
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

    Object.defineProperty(fileInput, 'files', {
      value: [file1],
      configurable: true,
    });

    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(screen.getByAltText('test1.png')).toBeInTheDocument();
    });

    const file2 = new File(['test2'], 'test2.jpg', { type: 'image/jpeg' });

    Object.defineProperty(fileInput, 'files', {
      value: [file2],
      configurable: true,
    });

    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(screen.getByText('Uploaded Images (2)')).toBeInTheDocument();
    });
  });

  it('renders Upload Image section header', () => {
    render(<Home />);
    expect(screen.getByText('Upload Image')).toBeInTheDocument();
  });
});
