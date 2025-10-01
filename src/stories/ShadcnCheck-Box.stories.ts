import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { createElement } from 'react';

const meta: Meta<typeof Checkbox> = {
  title: 'Shadcn UI/Checkbox',
  component: Checkbox,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    checked: {
      control: { type: 'boolean' },
    },
    disabled: {
      control: { type: 'boolean' },
    },
  },
  args: {
    onCheckedChange: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    checked: false,
  },
};

export const Checked: Story = {
  args: {
    checked: true,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    checked: false,
  },
};

export const WithLabel: Story = {
  args: {
    checked: false,
  },
  render: (args) => createElement('div', { className: 'flex items-center space-x-2' },
    createElement(Checkbox, { 
      id: 'terms',
      ...args 
    }),
    createElement(Label, { 
      htmlFor: 'terms'
    }, 'Accept terms and conditions')
  ),
};

export const FormExample: Story = {
  render: () => createElement('div', { className: 'space-y-3 w-[250px]' },
    createElement('h3', { className: 'font-medium' }, 'Preferences'),
    
    createElement('div', { className: 'flex items-center space-x-2' },
      createElement(Checkbox, { id: 'marketing' }),
      createElement(Label, { htmlFor: 'marketing' }, 'Marketing emails')
    ),
    
    createElement('div', { className: 'flex items-center space-x-2' },
      createElement(Checkbox, { id: 'security', defaultChecked: true }),
      createElement(Label, { htmlFor: 'security' }, 'Security updates')
    ),
    
    createElement('div', { className: 'flex items-center space-x-2' },
      createElement(Checkbox, { id: 'social', disabled: true }),
      createElement(Label, { htmlFor: 'social' }, 'Coming soon')
    )
  ),
};