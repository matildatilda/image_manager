import { render, screen, fireEvent } from '@testing-library/react';
import ImageGallery from '../ImageGallery';

describe('ImageGallery', () => {
  const mockImages = [
    {
      id: '1',
      preview: 'data:image/png;base64,test1',
      file: new File(['test1'], 'test1.png', { type: 'image/png' }),
    },
    {
      id: '2',
      preview: 'data:image/jpeg;base64,test2',
      file: new File(['test2'], 'test2.jpg', { type: 'image/jpeg' }),
    },
  ];

  it('renders empty state when no images', () => {
    render(<ImageGallery images={[]} />);
    expect(screen.getByText('No images uploaded yet')).toBeInTheDocument();
  });

  it('renders images when provided', () => {
    render(<ImageGallery images={mockImages} />);

    expect(screen.getByText('Uploaded Images (2)')).toBeInTheDocument();
    expect(screen.getByAltText('test1.png')).toBeInTheDocument();
    expect(screen.getByAltText('test2.jpg')).toBeInTheDocument();
  });

  it('displays image filename', () => {
    render(<ImageGallery images={mockImages} />);

    expect(screen.getByText('test1.png')).toBeInTheDocument();
    expect(screen.getByText('test2.jpg')).toBeInTheDocument();
  });

  it('renders download buttons for each image', () => {
    render(<ImageGallery images={mockImages} />);

    const downloadButtons = screen.getAllByText('Download');
    expect(downloadButtons).toHaveLength(2);
  });

  it('handles download button click', () => {
    render(<ImageGallery images={mockImages} />);

    // Mock document.createElement after render
    const mockLink = {
      href: '',
      download: '',
      click: jest.fn(),
    };
    const createElementSpy = jest.spyOn(document, 'createElement').mockReturnValue(mockLink as any);

    const downloadButtons = screen.getAllByText('Download');
    fireEvent.click(downloadButtons[0]);

    expect(mockLink.href).toBe('data:image/png;base64,test1');
    expect(mockLink.download).toBe('test1.png');
    expect(mockLink.click).toHaveBeenCalled();

    createElementSpy.mockRestore();
  });

  it('renders delete buttons when onDelete is provided', () => {
    const mockOnDelete = jest.fn();
    render(<ImageGallery images={mockImages} onDelete={mockOnDelete} />);

    const deleteButtons = screen.getAllByText('Delete');
    expect(deleteButtons).toHaveLength(2);
  });

  it('does not render delete buttons when onDelete is not provided', () => {
    render(<ImageGallery images={mockImages} />);

    const deleteButtons = screen.queryAllByText('Delete');
    expect(deleteButtons).toHaveLength(0);
  });

  it('calls onDelete with correct id when delete button is clicked', () => {
    const mockOnDelete = jest.fn();
    render(<ImageGallery images={mockImages} onDelete={mockOnDelete} />);

    const deleteButtons = screen.getAllByText('Delete');
    fireEvent.click(deleteButtons[0]);

    expect(mockOnDelete).toHaveBeenCalledWith('1');
  });

  it('renders correct image count', () => {
    render(<ImageGallery images={mockImages} />);
    expect(screen.getByText('Uploaded Images (2)')).toBeInTheDocument();
  });

  it('renders images with correct src', () => {
    render(<ImageGallery images={mockImages} />);

    const image1 = screen.getByAltText('test1.png') as HTMLImageElement;
    const image2 = screen.getByAltText('test2.jpg') as HTMLImageElement;

    expect(image1.src).toContain('data:image/png;base64,test1');
    expect(image2.src).toContain('data:image/jpeg;base64,test2');
  });

  it('renders image cards with proper structure', () => {
    const { container } = render(<ImageGallery images={mockImages} />);

    const gridContainer = container.querySelector('.grid');
    expect(gridContainer).toBeInTheDocument();
  });
});
