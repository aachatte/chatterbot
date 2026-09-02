import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { MessageCircleMore, Moon, Sun } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { useTheme } from 'next-themes'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useLoginMutation } from '@/hooks/use-auth-mutations.js'
import { loginSchema } from '@/lib/validation'

export default function Login() {
  const navigate = useNavigate()
  const loginMutation = useLoginMutation()
  const { resolvedTheme, setTheme } = useTheme()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = async (values) => {
    await loginMutation.mutateAsync(values)
    navigate('/dashboard')
  }

  const isDark = resolvedTheme === 'dark'

  return (
    <div className="min-h-screen bg-[color:var(--cb-bg)] px-4 py-8 text-[color:var(--cb-text-primary)]">
      <div className="mx-auto flex max-w-5xl justify-end">
        <Button
          variant="outline"
          className="mb-6"
          aria-label="Toggle color theme"
          onClick={() => setTheme(isDark ? 'light' : 'dark')}
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          {isDark ? 'Light mode' : 'Dark mode'}
        </Button>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="mx-auto flex min-h-[70vh] max-w-md items-center justify-center"
      >
        <Card className="glass-card w-full max-w-[420px]">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-[image:var(--cb-primary-gradient)] text-white shadow-glow">
              <MessageCircleMore className="h-6 w-6" aria-hidden="true" />
            </div>
            <h1 className="mb-2 text-3xl font-bold">Welcome back</h1>
            <p className="text-sm text-[color:var(--cb-text-secondary)]">
              Sign in to your Guardian Dashboard
            </p>
          </div>

          <form
            className="flex flex-col gap-5"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
          >
            <label
              className="block text-sm font-semibold text-[color:var(--cb-text-secondary)]"
              htmlFor="email"
            >
              Email
              <Input
                id="email"
                type="email"
                autoComplete="email"
                {...register('email')}
              />
              {errors.email && (
                <span className="mt-2 block text-sm text-[color:var(--cb-danger)]">
                  {errors.email.message}
                </span>
              )}
            </label>

            <label
              className="block text-sm font-semibold text-[color:var(--cb-text-secondary)]"
              htmlFor="password"
            >
              Password
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                {...register('password')}
              />
              {errors.password && (
                <span className="mt-2 block text-sm text-[color:var(--cb-danger)]">
                  {errors.password.message}
                </span>
              )}
            </label>

            <Button
              type="submit"
              disabled={loginMutation.isPending}
              className="mt-2 w-full"
            >
              {loginMutation.isPending ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-[color:var(--cb-text-secondary)]">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-semibold text-[color:var(--cb-primary)] no-underline"
            >
              Create one
            </Link>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}
