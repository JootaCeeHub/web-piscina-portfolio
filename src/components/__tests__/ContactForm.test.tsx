import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import ContactForm from '../Forms/ContactForm';
import { AppProvider } from '../../context/AppContext';
import { NotificationProvider } from '../Notification/NotificationSystem';
import { ABTestProvider } from '../ABTesting/ABTestProvider';

// Mock dependencies
jest.mock('../../hooks/useFormspree', () => ({
  useFormspree: jest.fn(() => ({
    submitForm: jest.fn().mockResolvedValue({}),
    isSubmitting: false,
    succeeded: false,
    errors: []
  }))
}));

jest.mock('../../hooks/useAnalytics', () => ({
  useAnalytics: () => ({
    trackCTAClick: jest.fn(),
    trackFormStart: jest.fn(),
    trackFormComplete: jest.fn()
  })
}));

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <AppProvider>
        <ABTestProvider>
          <NotificationProvider>
            {component}
          </NotificationProvider>
        </ABTestProvider>
      </AppProvider>
    </BrowserRouter>
  );
};

describe('ContactForm - Critical Component Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Form Rendering', () => {
    test('renders all required form fields', () => {
      renderWithProviders(<ContactForm />);
      
      expect(screen.getByLabelText(/nombre completo/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/teléfono/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/ubicación del proyecto/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/detalles del proyecto/i)).toBeInTheDocument();
    });

    test('renders optional fields correctly', () => {
      renderWithProviders(<ContactForm />);
      
      expect(screen.getByLabelText(/modelo de interés/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/presupuesto estimado/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/timeline del proyecto/i)).toBeInTheDocument();
    });

    test('renders action buttons', () => {
      renderWithProviders(<ContactForm />);
      
      expect(screen.getByRole('button', { name: /enviar solicitud/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /whatsapp directo/i })).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    test('validates required fields on submission', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ContactForm />);
      
      const submitButton = screen.getByRole('button', { name: /enviar solicitud/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/por favor completa todos los campos obligatorios/i)).toBeInTheDocument();
      });
    });

    test('validates email format', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ContactForm />);
      
      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'invalid-email');
      await user.tab();
      
      expect(emailInput).toHaveAttribute('aria-invalid', 'true');
    });

    test('validates phone format', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ContactForm />);
      
      const phoneInput = screen.getByLabelText(/teléfono/i);
      await user.type(phoneInput, '123');
      await user.tab();
      
      expect(phoneInput).toHaveAttribute('aria-invalid', 'true');
    });
  });

  describe('Form Submission', () => {
    test('submits form with valid data', async () => {
      const mockSubmitForm = jest.fn().mockResolvedValue({});
      const useFormspree = require('../../hooks/useFormspree').useFormspree;
      useFormspree.mockReturnValue({
        submitForm: mockSubmitForm,
        isSubmitting: false,
        succeeded: false,
        errors: []
      });

      const user = userEvent.setup();
      renderWithProviders(<ContactForm />);
      
      // Fill form with valid data
      await user.type(screen.getByLabelText(/nombre completo/i), 'Cliente de Prueba');
      await user.type(screen.getByLabelText(/email/i), 'cliente@example.com');
      await user.type(screen.getByLabelText(/teléfono/i), '+56900000000');
      await user.type(screen.getByLabelText(/ubicación del proyecto/i), 'Santiago, Chile');
      await user.type(screen.getByLabelText(/detalles del proyecto/i), 'Necesito una piscina de 8x4 metros');
      
      const submitButton = screen.getByRole('button', { name: /enviar solicitud/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(mockSubmitForm).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Cliente de Prueba',
            email: 'cliente@example.com',
            phone: '+56900000000',
            location: 'Santiago, Chile',
            message: 'Necesito una piscina de 8x4 metros'
          })
        );
      });
    });

    test('handles submission errors gracefully', async () => {
      const mockSubmitForm = jest.fn().mockRejectedValue(new Error('Network error'));
      const useFormspree = require('../../hooks/useFormspree').useFormspree;
      useFormspree.mockReturnValue({
        submitForm: mockSubmitForm,
        isSubmitting: false,
        succeeded: false,
        errors: [{ message: 'Network error' }]
      });

      const user = userEvent.setup();
      renderWithProviders(<ContactForm />);
      
      // Fill and submit form
      await user.type(screen.getByLabelText(/nombre completo/i), 'Cliente de Prueba');
      await user.type(screen.getByLabelText(/email/i), 'cliente@example.com');
      await user.type(screen.getByLabelText(/teléfono/i), '+56900000000');
      await user.type(screen.getByLabelText(/ubicación del proyecto/i), 'Las Condes');
      await user.type(screen.getByLabelText(/detalles del proyecto/i), 'Test message');
      
      const submitButton = screen.getByRole('button', { name: /enviar solicitud/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/error al enviar el formulario/i)).toBeInTheDocument();
      });
    });
  });

  describe('WhatsApp Integration', () => {
    test('opens WhatsApp with correct message', async () => {
      const user = userEvent.setup();
      const mockOpen = jest.fn();
      global.open = mockOpen;
      
      renderWithProviders(<ContactForm />);
      
      const whatsappButton = screen.getByRole('button', { name: /whatsapp directo/i });
      await user.click(whatsappButton);
      
      expect(mockOpen).toHaveBeenCalledWith(
        expect.stringContaining('wa.me/56900000000'),
        '_blank'
      );
    });
  });

  describe('Accessibility', () => {
    test('has proper ARIA attributes', () => {
      renderWithProviders(<ContactForm />);
      
      const nameInput = screen.getByLabelText(/nombre completo/i);
      const emailInput = screen.getByLabelText(/email/i);
      const phoneInput = screen.getByLabelText(/teléfono/i);
      
      expect(nameInput).toHaveAttribute('aria-required', 'true');
      expect(emailInput).toHaveAttribute('aria-required', 'true');
      expect(phoneInput).toHaveAttribute('aria-required', 'true');
    });

    test('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      renderWithProviders(<ContactForm />);
      
      const nameInput = screen.getByLabelText(/nombre completo/i);
      nameInput.focus();
      
      expect(nameInput).toHaveFocus();
      
      await user.tab();
      expect(screen.getByLabelText(/email/i)).toHaveFocus();
      
      await user.tab();
      expect(screen.getByLabelText(/teléfono/i)).toHaveFocus();
    });
  });

  describe('Success State', () => {
    test('shows success message after successful submission', () => {
      const useFormspree = require('../../hooks/useFormspree').useFormspree;
      useFormspree.mockReturnValue({
        submitForm: jest.fn(),
        isSubmitting: false,
        succeeded: true,
        errors: []
      });
      
      renderWithProviders(<ContactForm />);
      
      expect(screen.getByText(/solicitud recibida/i)).toBeInTheDocument();
      expect(screen.getByText(/nuestro equipo de especialistas se contactará contigo/i)).toBeInTheDocument();
    });
  });
});