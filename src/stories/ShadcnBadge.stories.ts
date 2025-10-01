import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Badge } from '@/components/ui/badge';
import { createElement } from 'react';

type BadgeStoryArgs = {
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
  children: string;
  className?: string;
};

const meta: Meta<BadgeStoryArgs> = {
  title: 'Shadcn UI/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'secondary', 'destructive', 'outline'],
    },
    children: {
      control: { type: 'text' },
    },
    className: {
      control: { type: 'text' },
    },
  },
  args: {
    variant: 'default',
    children: 'Badge',
    className: '',
  },
};

export default meta;
type Story = StoryObj<BadgeStoryArgs>;

export const Default: Story = {
  render: (args) => createElement(Badge, {
    variant: args.variant,
    className: args.className
  }, args.children),
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary',
  },
};

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    children: 'Destructive',
  },
};

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Outline',
  },
};