import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import LiveChatWidget from '../LiveChat/LiveChatWidget';
import { AppProvider } from '../../context/AppContext';

// Mock useAnalytics
jest.mock('../../hooks/useAnalytics', () => ({
  useAnalytics: () => ({
    trackCTAClick: jest.fn()
  })
}));

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <AppProvider>
        {component}
      </AppProvider>
    </BrowserRouter>
  );
};

describe('LiveChatWidget', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders chat button initially', () => {
    renderWithProviders(<LiveChatWidget />);
    
    expect(screen.getByRole('button', { name: /abrir chat en vivo/i })).toBeInTheDocument();
  });

  test('opens chat when button is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LiveChatWidget />);
    
    const chatButton = screen.getByRole('button', { name: /abrir chat en vivo/i });
    await user.click(chatButton);
    
    expect(screen.getByText('Piscinas Andinas')).toBeInTheDocument();
    expect(screen.getByText(/hola! soy el asistente virtual/i)).toBeInTheDocument();
  });

  test('displays welcome message when chat opens', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LiveChatWidget />);
    
    const chatButton = screen.getByRole('button', { name: /abrir chat en vivo/i });
    await user.click(chatButton);
    
    expect(screen.getByText(/hola! soy el asistente virtual de piscinasandinas/i)).toBeInTheDocument();
  });

  test('shows quick reply buttons', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LiveChatWidget />);
    
    const chatButton = screen.getByRole('button', { name: /abrir chat en vivo/i });
    await user.click(chatButton);
    
    expect(screen.getByText('¿Cuánto cuesta una piscina?')).toBeInTheDocument();
    expect(screen.getByText('¿Cuánto demora la instalación?')).toBeInTheDocument();
  });

  test('sends message when user types and presses enter', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LiveChatWidget />);
    
    const chatButton = screen.getByRole('button', { name: /abrir chat en vivo/i });
    await user.click(chatButton);
    
    const input = screen.getByPlaceholderText('Escribe tu mensaje...');
    await user.type(input, 'Hola, necesito información');
    await user.keyboard('{Enter}');
    
    expect(screen.getByText('Hola, necesito información')).toBeInTheDocument();
  });

  test('responds to quick reply clicks', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LiveChatWidget />);
    
    const chatButton = screen.getByRole('button', { name: /abrir chat en vivo/i });
    await user.click(chatButton);
    
    const quickReply = screen.getByText('¿Cuánto cuesta una piscina?');
    await user.click(quickReply);
    
    await waitFor(() => {
      expect(screen.getByText(/nuestras piscinas van desde/i)).toBeInTheDocument();
    });
  });

  test('shows typing indicator', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LiveChatWidget />);
    
    const chatButton = screen.getByRole('button', { name: /abrir chat en vivo/i });
    await user.click(chatButton);
    
    const input = screen.getByPlaceholderText('Escribe tu mensaje...');
    await user.type(input, 'Test message');
    await user.keyboard('{Enter}');
    
    // Should show typing indicator briefly
    expect(screen.getByText(/escribiendo/i) || document.querySelector('.animate-bounce')).toBeTruthy();
  });

  test('minimizes and maximizes chat', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LiveChatWidget />);
    
    const chatButton = screen.getByRole('button', { name: /abrir chat en vivo/i });
    await user.click(chatButton);
    
    const minimizeButton = screen.getByRole('button', { name: /minimizar chat/i });
    await user.click(minimizeButton);
    
    // Chat should be minimized (input should not be visible)
    expect(screen.queryByPlaceholderText('Escribe tu mensaje...')).not.toBeInTheDocument();
    
    const maximizeButton = screen.getByRole('button', { name: /maximizar chat/i });
    await user.click(maximizeButton);
    
    // Chat should be maximized again
    expect(screen.getByPlaceholderText('Escribe tu mensaje...')).toBeInTheDocument();
  });

  test('closes chat when close button is clicked', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LiveChatWidget />);
    
    const chatButton = screen.getByRole('button', { name: /abrir chat en vivo/i });
    await user.click(chatButton);
    
    const closeButton = screen.getByRole('button', { name: /cerrar chat/i });
    await user.click(closeButton);
    
    // Chat should be closed
    expect(screen.queryByText('Piscinas Andinas')).not.toBeInTheDocument();
  });

  test('shows contact action buttons', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LiveChatWidget />);
    
    const chatButton = screen.getByRole('button', { name: /abrir chat en vivo/i });
    await user.click(chatButton);
    
    expect(screen.getByText('Llamar')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  test('handles phone call action', async () => {
    const user = userEvent.setup();
    
    // Mock window.location.href
    delete (window as any).location;
    window.location = { href: '' } as any;
    
    renderWithProviders(<LiveChatWidget />);
    
    const chatButton = screen.getByRole('button', { name: /abrir chat en vivo/i });
    await user.click(chatButton);
    
    const phoneButton = screen.getByText('Llamar');
    await user.click(phoneButton);
    
    expect(window.location.href).toBe('tel:+56900000000');
  });

  test('handles email action', async () => {
    const user = userEvent.setup();
    
    // Mock window.location.href
    delete (window as any).location;
    window.location = { href: '' } as any;
    
    renderWithProviders(<LiveChatWidget />);
    
    const chatButton = screen.getByRole('button', { name: /abrir chat en vivo/i });
    await user.click(chatButton);
    
    const emailButton = screen.getByText('Email');
    await user.click(emailButton);
    
    expect(window.location.href).toBe('mailto:contacto@piscinasandinas.example.com');
  });

  test('shows agent status', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LiveChatWidget />);
    
    const chatButton = screen.getByRole('button', { name: /abrir chat en vivo/i });
    await user.click(chatButton);
    
    expect(screen.getByText('En línea')).toBeInTheDocument();
  });

  test('disables send button when input is empty', async () => {
    const user = userEvent.setup();
    renderWithProviders(<LiveChatWidget />);
    
    const chatButton = screen.getByRole('button', { name: /abrir chat en vivo/i });
    await user.click(chatButton);
    
    const sendButton = screen.getByRole('button', { name: /enviar mensaje/i });
    expect(sendButton).toBeDisabled();
    
    const input = screen.getByPlaceholderText('Escribe tu mensaje...');
    await user.type(input, 'Test message');
    
    expect(sendButton).not.toBeDisabled();
  });
});