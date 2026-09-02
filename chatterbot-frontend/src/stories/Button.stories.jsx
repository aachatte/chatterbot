import { Button } from '@/components/ui/button'

export default {
  title: 'UI/Button',
  component: Button,
  args: {
    children: 'Save changes',
  },
}

export const Default = {}

export const Outline = {
  args: {
    variant: 'outline',
    children: 'Secondary action',
  },
}
