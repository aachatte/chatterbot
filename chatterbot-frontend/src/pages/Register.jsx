import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { MessageCircleMore } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useRegisterMutation } from '@/hooks/use-auth-mutations.js'
import { registerSchema } from '@/lib/validation'

export default function Register() {
  const navigate = useNavigate()
  const registerMutation = useRegisterMutation()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
    },
  })

  const onSubmit = async (values) => {
    await registerMutation.mutateAsync(values)
    navigate('/dashboard')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[color:var(--cb-bg)] px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="w-full max-w-[460px]"
      >
        <Card className="glass-card w-full">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-[image:var(--cb-primary-gradient)] text-white shadow-glow">
              <MessageCircleMore className="h-6 w-6" aria-hidden="true" />
            </div>
            <h1 className="mb-2 text-3xl font-extrabold text-[color:var(--cb-text-primary)]">
              Create an account
            </h1>
            <p className="text-sm text-[color:var(--cb-text-secondary)]">
              Start protecting your family today
            </p>
          </div>

          <form
            className="flex flex-col gap-4"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
          >
            <div className="grid gap-4 md:grid-cols-2">
              <label
                className="block text-sm font-semibold text-[color:var(--cb-text-secondary)]"
                htmlFor="firstName"
              >
                First Name
                <Input
                  id="firstName"
                  autoComplete="given-name"
                  {...register('firstName')}
                />
                {errors.firstName && (
                  <span className="mt-2 block text-sm text-[color:var(--cb-danger)]">
                    {errors.firstName.message}
                  </span>
                )}
              </label>
              <label
                className="block text-sm font-semibold text-[color:var(--cb-text-secondary)]"
                htmlFor="lastName"
              >
                Last Name
                <Input
                  id="lastName"
                  autoComplete="family-name"
                  {...register('lastName')}
                />
                {errors.lastName && (
                  <span className="mt-2 block text-sm text-[color:var(--cb-danger)]">
                    {errors.lastName.message}
                  </span>
                )}
              </label>
            </div>

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
                autoComplete="new-password"
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
              disabled={registerMutation.isPending}
              className="mt-2 w-full"
            >
              {registerMutation.isPending
                ? 'Creating account...'
                : 'Create account'}
            </Button>
          </form>

          <div className="mt-5 text-center text-sm text-[color:var(--cb-text-secondary)]">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-bold text-[color:var(--cb-primary)] no-underline"
            >
              Sign in
            </Link>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}
