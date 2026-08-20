import { a11yUtils, ariaUtils } from '../accessibility';

describe('Accessibility Utils', () => {
  describe('a11yUtils', () => {
    test('announces messages to screen readers', () => {
      const mockAppendChild = jest.fn();
      const mockRemoveChild = jest.fn();
      const mockCreateElement = jest.fn(() => ({
        setAttribute: jest.fn(),
        textContent: '',
        className: ''
      }));
      
      document.body.appendChild = mockAppendChild;
      document.body.removeChild = mockRemoveChild;
      document.createElement = mockCreateElement;
      
      a11yUtils.announce('Test message', 'assertive');
      
      expect(mockCreateElement).toHaveBeenCalledWith('div');
      expect(mockAppendChild).toHaveBeenCalled();
    });

    test('checks color contrast ratios', () => {
      const result = a11yUtils.checkContrast('rgb(0,0,0)', 'rgb(255,255,255)');
      
      expect(result.ratio).toBeGreaterThan(4.5);
      expect(result.AA).toBe(true);
      expect(result.AAA).toBe(true);
    });

    test('detects reduced motion preference', () => {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
        })),
      });
      
      const prefersReduced = a11yUtils.prefersReducedMotion();
      expect(typeof prefersReduced).toBe('boolean');
    });

    test('handles arrow navigation correctly', () => {
      const mockItems = [
        document.createElement('button'),
        document.createElement('button'),
        document.createElement('button')
      ];
      
      mockItems.forEach(item => {
        item.focus = jest.fn();
      });
      
      const mockOnIndexChange = jest.fn();
      const mockEvent = {
        key: 'ArrowDown',
        preventDefault: jest.fn()
      } as any;
      
      a11yUtils.handleArrowNavigation(mockEvent, mockItems, 0, mockOnIndexChange);
      
      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(mockOnIndexChange).toHaveBeenCalledWith(1);
    });
  });

  describe('ariaUtils', () => {
    test('generates unique IDs', () => {
      const id1 = ariaUtils.generateId('test');
      const id2 = ariaUtils.generateId('test');
      
      expect(id1).toMatch(/^test-/);
      expect(id2).toMatch(/^test-/);
      expect(id1).not.toBe(id2);
    });

    test('sets ARIA attributes correctly', () => {
      const mockElement = {
        setAttribute: jest.fn()
      } as any;
      
      ariaUtils.setAttributes(mockElement, {
        'aria-label': 'Test label',
        'aria-expanded': 'false'
      });
      
      expect(mockElement.setAttribute).toHaveBeenCalledWith('aria-label', 'Test label');
      expect(mockElement.setAttribute).toHaveBeenCalledWith('aria-expanded', 'false');
    });

    test('toggles expanded state correctly', () => {
      const mockTrigger = {
        getAttribute: jest.fn().mockReturnValue('false'),
        setAttribute: jest.fn()
      } as any;
      
      const mockTarget = {
        setAttribute: jest.fn()
      } as any;
      
      ariaUtils.toggleExpanded(mockTrigger, mockTarget);
      
      expect(mockTrigger.setAttribute).toHaveBeenCalledWith('aria-expanded', 'true');
      expect(mockTarget.setAttribute).toHaveBeenCalledWith('aria-hidden', 'false');
    });

    test('creates live region for announcements', () => {
      const mockElement = {
        setAttribute: jest.fn(),
        textContent: '',
        className: ''
      };
      
      const mockAppendChild = jest.fn();
      const mockRemoveChild = jest.fn();
      
      document.createElement = jest.fn().mockReturnValue(mockElement);
      document.body.appendChild = mockAppendChild;
      document.body.removeChild = mockRemoveChild;
      
      const liveRegion = ariaUtils.createLiveRegion('assertive');
      
      expect(mockElement.setAttribute).toHaveBeenCalledWith('aria-live', 'assertive');
      expect(mockElement.setAttribute).toHaveBeenCalledWith('aria-atomic', 'true');
      expect(mockAppendChild).toHaveBeenCalledWith(mockElement);
      
      liveRegion.announce('Test message');
      expect(mockElement.textContent).toBe('Test message');
      
      liveRegion.destroy();
      expect(mockRemoveChild).toHaveBeenCalledWith(mockElement);
    });
  });
});