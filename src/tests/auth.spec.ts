import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { supabase } from '../integrations/supabase/client';

// Mock Supabase
vi.mock('../integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
    })),
  },
}));

describe('useCurrentUser Role Switching', () => {
  it('should allow admin to switch roles and persist in localStorage', async () => {
    const mockAdminProfile = { id: '123', role: 'admin', full_name: 'Admin Test' };
    
    (supabase.auth.getUser as any).mockResolvedValue({ data: { user: { id: '123' } } });
    (supabase.from as any)().select().eq().single.mockResolvedValue({ data: mockAdminProfile, error: null });

    const { result } = renderHook(() => useCurrentUser());

    // Wait for initial fetch
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.isAdmin).toBe(true);
    expect(result.current.role).toBe('admin');

    // Switch to student
    act(() => {
      result.current.switchViewRole('aluno');
    });

    expect(result.current.role).toBe('aluno');
    expect(localStorage.getItem('admin_view_role')).toBe('aluno');
    
    // Check if effective user role is normalized for pages
    expect(result.current.user?.role).toBe('student');
  });

  it('should not allow non-admin to switch roles', async () => {
    const mockStudentProfile = { id: '456', role: 'student', full_name: 'Student Test' };
    
    (supabase.auth.getUser as any).mockResolvedValue({ data: { user: { id: '456' } } });
    (supabase.from as any)().select().eq().single.mockResolvedValue({ data: mockStudentProfile, error: null });

    const { result } = renderHook(() => useCurrentUser());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.isAdmin).toBe(false);
    
    act(() => {
      result.current.switchViewRole('admin');
    });

    // Should still be student (aluno normalized)
    expect(result.current.role).toBe('aluno');
  });
});
