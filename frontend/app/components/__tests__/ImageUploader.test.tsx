import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ImageUploader from '../ImageUploader';

describe('ImageUploader', () => {
  const mockOnImageUpload = jest.fn();

  beforeEach(() => {
    mockOnImageUpload.mockClear();
  });

  it('renders upload area with default state', () => {
    render(<ImageUploader onImageUpload={mockOnImageUpload} />);

    expect(screen.getByText('Click to upload or drag and drop')).toBeInTheDocument();
    expect(screen.getByText('PNG, JPG, GIF up to 10MB')).toBeInTheDocument();
  });

  it('opens file dialog when clicking on upload area', async () => {
    const user = userEvent.setup();
    const { container } = render(<ImageUploader onImageUpload={mockOnImageUpload} />);

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const clickSpy = jest.spyOn(fileInput, 'click');

    const uploadArea = container.querySelector('.border-dashed') as HTMLElement;

    if (uploadArea) {
      await user.click(uploadArea);
    }

    expect(clickSpy).toHaveBeenCalled();
  });

  it('handles file upload via input change', async () => {
    render(<ImageUploader onImageUpload={mockOnImageUpload} />);

    const file = new File(['test'], 'test.png', { type: 'image/png' });
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

    Object.defineProperty(fileInput, 'files', {
      value: [file],
      writable: false,
    });

    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(mockOnImageUpload).toHaveBeenCalledWith(
        file,
        expect.stringContaining('data:image/png')
      );
    });
  });

  it('only processes image files', async () => {
    render(<ImageUploader onImageUpload={mockOnImageUpload} />);

    const nonImageFile = new File(['test'], 'test.txt', { type: 'text/plain' });
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

    Object.defineProperty(fileInput, 'files', {
      value: [nonImageFile],
      writable: false,
    });

    fireEvent.change(fileInput);

    // Wait a bit to ensure the callback is not called
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(mockOnImageUpload).not.toHaveBeenCalled();
  });

  it('handles drag over event', () => {
    const { container } = render(<ImageUploader onImageUpload={mockOnImageUpload} />);

    const uploadArea = container.querySelector('.border-dashed') as HTMLElement;

    if (uploadArea) {
      fireEvent.dragOver(uploadArea);
      expect(uploadArea).toHaveClass('border-blue-500');
    }
  });

  it('handles drag leave event', () => {
    const { container } = render(<ImageUploader onImageUpload={mockOnImageUpload} />);

    const uploadArea = container.querySelector('.border-dashed') as HTMLElement;

    if (uploadArea) {
      fireEvent.dragOver(uploadArea);
      fireEvent.dragLeave(uploadArea);
      expect(uploadArea).not.toHaveClass('border-blue-500');
    }
  });

  it('handles file drop', async () => {
    const { container } = render(<ImageUploader onImageUpload={mockOnImageUpload} />);

    const uploadArea = container.querySelector('.border-dashed') as HTMLElement;
    const file = new File(['test'], 'test.png', { type: 'image/png' });

    if (uploadArea) {
      fireEvent.dragOver(uploadArea);
      fireEvent.drop(uploadArea, {
        dataTransfer: {
          files: [file],
        },
      });

      await waitFor(() => {
        expect(mockOnImageUpload).toHaveBeenCalledWith(
          file,
          expect.stringContaining('data:image/png')
        );
      });
    }
  });

  it('handles multiple files upload', async () => {
    render(<ImageUploader onImageUpload={mockOnImageUpload} />);

    const file1 = new File(['test1'], 'test1.png', { type: 'image/png' });
    const file2 = new File(['test2'], 'test2.jpg', { type: 'image/jpeg' });
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

    Object.defineProperty(fileInput, 'files', {
      value: [file1, file2],
      writable: false,
    });

    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(mockOnImageUpload).toHaveBeenCalledTimes(2);
    });
  });

  it('shows preview after file upload', async () => {
    render(<ImageUploader onImageUpload={mockOnImageUpload} />);

    const file = new File(['test'], 'test.png', { type: 'image/png' });
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;

    Object.defineProperty(fileInput, 'files', {
      value: [file],
      writable: false,
    });

    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(screen.getByAltText('Preview')).toBeInTheDocument();
    });
  });
});
