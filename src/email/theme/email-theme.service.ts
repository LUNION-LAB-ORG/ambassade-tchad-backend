import { Injectable } from '@nestjs/common';
import { EmailTheme } from '../interfaces/email-theme.interface';

@Injectable()
export class EmailThemeService {
  public readonly theme: EmailTheme = {
    colors: {
      primary: '#1e3a8a', // #1e3a8a ≈ bleu foncé
      secondary: '#f26522', // #f26522 ≈ orange vif
      accent: '#f4f4f5', // #f4f4f5 ≈ gris clair
      background: '#ffffff', // #ffffff ≈ blanc
      surface: '#f8fafc', // inchangé
      text: {
        primary: '#0a0a0a', // #0a0a0a ≈ noir très foncé
        secondary: '#6b7280', // #6b7280 ≈ gris moyen
        muted: '#a0aec0', // #a0aec0 ≈ gris clair
        inverse: '#ffffff', // #ffffff ≈ blanc
      },
      status: {
        success: '#10b981', // #10b981 ≈ vert foncé
        warning: '#f59e0b', // #f59e0b ≈ orange vif
        error: '#ef4444', // #ef4444 ≈ rouge vif
        info: '#3b82f6', // #3b82f6 ≈ bleu foncé
      },
      gradients: {
        primary: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)', // #1e3a8a ≈ bleu foncé
        secondary: 'linear-gradient(135deg, #f26522 0%, #fcbf49 100%)', // #f26522 ≈ orange vif
        accent: 'linear-gradient(135deg, #f4f4f5 0%, #e5e7eb 100%)', // #f4f4f5 ≈ gris clair
      },
    },
    typography: {
      fontFamily: "'Inter', 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif",
      fontSize: {
        xs: '12px',
        sm: '14px',
        base: '16px',
        lg: '18px',
        xl: '20px',
        '2xl': '24px',
        '3xl': '30px',
      },
      fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },
      lineHeight: {
        tight: '1.25',
        normal: '1.5',
        relaxed: '1.75',
      },
    },
    spacing: {
      xs: '4px',
      sm: '8px',
      md: '16px',
      lg: '24px',
      xl: '32px',
      '2xl': '48px',
      '3xl': '64px',
    },
    borderRadius: {
      sm: '4px',
      md: '8px',
      lg: '12px',
      xl: '16px',
      full: '9999px',
    },
    shadows: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    },
    animation: {
      duration: {
        fast: '150ms',
        normal: '300ms',
        slow: '500ms',
      },
      easing: {
        default: 'cubic-bezier(0.4, 0, 0.2, 1)',
        bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        smooth: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      },
    },
  };
}
