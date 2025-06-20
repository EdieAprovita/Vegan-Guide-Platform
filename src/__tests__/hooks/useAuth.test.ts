import { renderHook, act } from '@testing-library/react'
import { useAuthWithRouter } from '@/hooks/useAuth'
import { useAuthStore } from '@/lib/store/auth'
import * as authApi from '@/lib/api/auth'
import { signIn } from 'next-auth/react'

jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
  useSession: jest.fn(() => ({ data: null, status: 'unauthenticated' })),
}))

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}))

jest.mock('react-hot-toast', () => ({
  __esModule: true,
  default: { success: jest.fn(), error: jest.fn() },
}))

jest.mock('@/lib/api/auth', () => ({
  register: jest.fn(),
}))

describe('useAuthWithRouter login', () => {
  beforeEach(() => {
    const state = useAuthStore.getState()
    state.setIsLoggingIn(false)
    state.setAuthModalOpen(true)
    jest.clearAllMocks()
  })

  it('logs in successfully', async () => {
    ;(signIn as jest.Mock).mockResolvedValue({ ok: true })

    const { result } = renderHook(() => useAuthWithRouter())

    await act(async () => {
      await result.current.login({ email: 'test@example.com', password: 'Password1' })
    })

    expect(signIn).toHaveBeenCalledWith('credentials', {
      email: 'test@example.com',
      password: 'Password1',
      redirect: false,
    })
    expect(useAuthStore.getState().isLoggingIn).toBe(false)
    expect(useAuthStore.getState().authModalOpen).toBe(false)
  })

  it('handles login error', async () => {
    ;(signIn as jest.Mock).mockResolvedValue({ error: 'Invalid credentials' })

    const { result } = renderHook(() => useAuthWithRouter())

    await act(async () => {
      await result.current.login({ email: 'x@x.com', password: 'bad' })
    })

    await expect(result.current.login({ email: 'x@x.com', password: 'bad' })).rejects.toThrow('Invalid credentials')
    expect(useAuthStore.getState().isLoggingIn).toBe(false)
    expect(useAuthStore.getState().authModalOpen).toBe(true)
  })
})

describe('useAuthWithRouter register', () => {
  beforeEach(() => {
    const state = useAuthStore.getState()
    state.setIsRegistering(false)
    state.setAuthModalOpen(true)
    jest.clearAllMocks()
  })

  it('registers successfully', async () => {
    ;(authApi.register as jest.Mock).mockResolvedValue({ _id: '1', username: 'test', email: 't@e.com', role: 'user', createdAt: '', isAdmin: false })

    const { result } = renderHook(() => useAuthWithRouter())

    await act(async () => {
      await result.current.register({ username: 'test', email: 't@e.com', password: 'Password1', confirmPassword: 'Password1', role: 'user' })
    })

    expect(authApi.register).toHaveBeenCalled()
    expect(useAuthStore.getState().isRegistering).toBe(false)
    expect(useAuthStore.getState().authModalOpen).toBe(false)
  })

  it('handles register error', async () => {
    ;(authApi.register as jest.Mock).mockRejectedValue(new Error('fail'))

    const { result } = renderHook(() => useAuthWithRouter())

    await expect(
      act(async () => {
        await result.current.register({ username: 'test', email: 't@e.com', password: 'Password1', confirmPassword: 'Password1', role: 'user' })
      })
    ).rejects.toThrow('fail')

    expect(useAuthStore.getState().isRegistering).toBe(false)
    expect(useAuthStore.getState().authModalOpen).toBe(true)
  })
})
