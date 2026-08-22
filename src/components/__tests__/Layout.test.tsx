import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Layout from '../Layout';
import { AppProvider } from '../../context/AppContext';

// Mock useAnalytics hook
jest.mock('../../hooks/useAnalytics', () => ({
  useAnalytics: () => ({
    trackWhatsAppClick: jest.fn(),
    trackPhoneClick: jest.fn(),
    trackEmailClick: jest.fn()
  })
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <AppProvider>
        {component}
      </AppProvider>
    </BrowserRouter>
  );
};

describe('Layout', () => {
  test('renders header with navigation', () => {
    renderWithRouter(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );
    
    expect(screen.getByText('Piscinas Andinas')).toBeInTheDocument();
    expect(screen.getByText('Inicio')).toBeInTheDocument();
    expect(screen.getByText('Servicios')).toBeInTheDocument();
    expect(screen.getByText('Nosotros')).toBeInTheDocument();
    expect(screen.getByText('Contacto')).toBeInTheDocument();
  });

  test('renders contact information in header', () => {
    renderWithRouter(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );
    
    expect(screen.getByText('+56 9 0000 0000')).toBeInTheDocument();
    expect(screen.getByText('contacto@piscinasandinas.example.com')).toBeInTheDocument();
  });

  test('mobile menu toggles correctly', async () => {
    const user = userEvent.setup();
    renderWithRouter(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );
    
    const menuButton = screen.getByRole('button', { name: /abrir menú/i });
    expect(menuButton).toBeInTheDocument();
    
    await user.click(menuButton);
    
    // Menu should be expanded
    expect(menuButton).toHaveAttribute('aria-expanded', 'true');
  });

  test('WhatsApp button opens correct URL', async () => {
    const user = userEvent.setup();
    const mockOpen = jest.fn();
    global.open = mockOpen;
    
    renderWithRouter(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );
    
    const whatsappButton = screen.getByRole('button', { name: /contactar por whatsapp/i });
    await user.click(whatsappButton);
    
    expect(mockOpen).toHaveBeenCalledWith(
      expect.stringContaining('wa.me/56900000000'),
      '_blank'
    );
  });

  test('scroll to top button appears after scrolling', () => {
    renderWithRouter(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );
    
    // Mock scroll position
    Object.defineProperty(window, 'pageYOffset', {
      writable: true,
      value: 400
    });
    
    fireEvent.scroll(window);
    
    const scrollButton = screen.getByRole('button', { name: /volver arriba/i });
    expect(scrollButton).toBeInTheDocument();
  });

  test('renders footer with company information', () => {
    renderWithRouter(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );
    
    expect(screen.getByText(/especialistas en fabricación e instalación/i)).toBeInTheDocument();
    expect(screen.getByText(/2024 piscinasandinas l.a./i)).toBeInTheDocument();
  });

  test('accessibility: skip links are present', () => {
    renderWithRouter(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );
    
    const skipLinks = screen.getByText('Saltar al contenido principal');
    expect(skipLinks).toBeInTheDocument();
    expect(skipLinks.closest('a')).toHaveAttribute('href', '#main-content');
  });

  test('navigation has proper ARIA attributes', () => {
    renderWithRouter(
      <Layout>
        <div>Test Content</div>
      </Layout>
    );
    
    const navigation = screen.getByRole('navigation');
    expect(navigation).toHaveAttribute('id', 'navigation');
    
    const mainContent = screen.getByRole('main');
    expect(mainContent).toHaveAttribute('id', 'main-content');
  });
});