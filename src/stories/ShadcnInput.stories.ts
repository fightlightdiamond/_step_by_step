import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { createElement } from 'react';

const meta: Meta<typeof Input> = {
  title: 'Shadcn UI/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: { type: 'select' },
      options: ['text', 'email', 'password', 'number', 'tel', 'url', 'search', 'file'],
      description: 'Input type',
    },
    placeholder: {
      control: { type: 'text' },
      description: 'Placeholder text',
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Disable input',
    },
  },
  args: {
    onChange: fn(),
    onFocus: fn(),
    onBlur: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// InputDemo equivalent
export const Default: Story = {
  args: {
    type: 'email',
    placeholder: 'Email',
  },
};

// InputWithLabel equivalent
export const WithLabel: Story = {
  render: () => createElement('div', { className: 'grid w-full max-w-sm items-center gap-3' },
    createElement(Label, { htmlFor: 'email' }, 'Email'),
    createElement(Input, { type: 'email', id: 'email', placeholder: 'Email' })
  ),
};

// InputFile equivalent
export const FileInput: Story = {
  render: () => createElement('div', { className: 'grid w-full max-w-sm items-center gap-3' },
    createElement(Label, { htmlFor: 'picture' }, 'Picture'),
    createElement(Input, { id: 'picture', type: 'file' })
  ),
};

// InputDisabled equivalent
export const Disabled: Story = {
  args: {
    disabled: true,
    type: 'email',
    placeholder: 'Email',
  },
};

// InputWithButton equivalent
export const WithButton: Story = {
  render: () => createElement('div', { className: 'flex w-full max-w-sm items-center gap-2' },
    createElement(Input, { type: 'email', placeholder: 'Email' }),
    createElement(Button, { type: 'submit', variant: 'outline' }, 'Subscribe')
  ),
};

export const Password: Story = {
  args: {
    type: 'password',
    placeholder: 'Password',
  },
};

export const Number: Story = {
  args: {
    type: 'number',
    placeholder: 'Enter number',
  },
};

export const Search: Story = {
  args: {
    type: 'search',
    placeholder: 'Search...',
  },
};

export const WithError: Story = {
  render: () => createElement('div', { className: 'grid w-full max-w-sm items-center gap-1.5' },
    createElement(Label, { htmlFor: 'email-error' }, 'Email'),
    createElement(Input, { 
      type: 'email', 
      id: 'email-error', 
      placeholder: 'Email',
      className: 'border-destructive'
    }),
    createElement('p', { className: 'text-sm text-destructive' }, 'Invalid email address')
  ),
};

export const FormExample: Story = {
  render: () => createElement('form', { className: 'space-y-4 w-full max-w-sm' },
    createElement('div', { className: 'grid w-full items-center gap-1.5' },
      createElement(Label, { htmlFor: 'name' }, 'Name'),
      createElement(Input, { id: 'name', placeholder: 'Enter your name' })
    ),
    createElement('div', { className: 'grid w-full items-center gap-1.5' },
      createElement(Label, { htmlFor: 'email-form' }, 'Email'),
      createElement(Input, { id: 'email-form', type: 'email', placeholder: 'Enter your email' })
    ),
    createElement('div', { className: 'grid w-full items-center gap-1.5' },
      createElement(Label, { htmlFor: 'message' }, 'Message'),
      createElement('textarea', {
        id: 'message',
        placeholder: 'Type your message here.',
        className: 'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
      })
    ),
    createElement(Button, { type: 'submit',   className: 'bg-black text-white border border-white rounded px-4 py-2 hover:bg-gray-800 transition'}, 'Submit')
  ),
};