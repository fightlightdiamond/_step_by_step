import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { createElement } from 'react';

const meta: Meta<typeof Alert> = {
  title: 'Shadcn UI/Alert',
  component: Alert,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'destructive'],
      description: 'Alert variant style',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => createElement(Alert, null,
    createElement(AlertTitle, null, "Heads up!"),
    createElement(AlertDescription, null, "You can add components to your app using the cli.")
  ),
};

export const Destructive: Story = {
  render: () => createElement(Alert, { variant: 'destructive' },
    createElement(AlertTitle, null, "Error"),
    createElement(AlertDescription, null, "Your session has expired. Please log in again.")
  ),
};

export const WithIcon: Story = {
  render: () => createElement(Alert, null,
    createElement('svg', {
      className: 'h-4 w-4',
      fill: 'none',
      stroke: 'currentColor',
      viewBox: '0 0 24 24',
      xmlns: 'http://www.w3.org/2000/svg'
    },
      createElement('path', {
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        strokeWidth: 2,
        d: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
      })
    ),
    createElement(AlertTitle, null, "Information"),
    createElement(AlertDescription, null, "This is an informational alert with an icon.")
  ),
};

export const DestructiveWithIcon: Story = {
  render: () => createElement(Alert, { variant: 'destructive' },
    createElement('svg', {
      className: 'h-4 w-4',
      fill: 'none',
      stroke: 'currentColor',
      viewBox: '0 0 24 24',
      xmlns: 'http://www.w3.org/2000/svg'
    },
      createElement('path', {
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        strokeWidth: 2,
        d: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z'
      })
    ),
    createElement(AlertTitle, null, "Error"),
    createElement(AlertDescription, null, "Something went wrong! Please try again later.")
  ),
};

export const SuccessAlert: Story = {
  render: () => createElement(Alert, { 
    className: 'border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200' 
  },
    createElement('svg', {
      className: 'h-4 w-4',
      fill: 'none',
      stroke: 'currentColor',
      viewBox: '0 0 24 24',
      xmlns: 'http://www.w3.org/2000/svg'
    },
      createElement('path', {
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        strokeWidth: 2,
        d: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
      })
    ),
    createElement(AlertTitle, null, "Success"),
    createElement(AlertDescription, null, "Your changes have been saved successfully!")
  ),
};

export const WarningAlert: Story = {
  render: () => createElement(Alert, { 
    className: 'border-yellow-200 bg-yellow-50 text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-200' 
  },
    createElement('svg', {
      className: 'h-4 w-4',
      fill: 'none',
      stroke: 'currentColor',
      viewBox: '0 0 24 24',
      xmlns: 'http://www.w3.org/2000/svg'
    },
      createElement('path', {
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        strokeWidth: 2,
        d: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z'
      })
    ),
    createElement(AlertTitle, null, "Warning"),
    createElement(AlertDescription, null, "Please review your input before proceeding.")
  ),
};

export const InfoAlert: Story = {
  render: () => createElement(Alert, { 
    className: 'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200' 
  },
    createElement('svg', {
      className: 'h-4 w-4',
      fill: 'none',
      stroke: 'currentColor',
      viewBox: '0 0 24 24',
      xmlns: 'http://www.w3.org/2000/svg'
    },
      createElement('path', {
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        strokeWidth: 2,
        d: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
      })
    ),
    createElement(AlertTitle, null, "Information"),
    createElement(AlertDescription, null, "This feature is currently in beta. Please report any issues.")
  ),
};

export const LongContent: Story = {
  render: () => createElement(Alert, null,
    createElement(AlertTitle, null, "Terms and Conditions Updated"),
    createElement(AlertDescription, null, "We have updated our terms and conditions. The changes include new privacy policies, data handling procedures, and user agreement modifications. Please review the updated terms at your earliest convenience. These changes will take effect in 30 days from today.")
  ),
};

export const TitleOnly: Story = {
  render: () => createElement(Alert, null,
    createElement(AlertTitle, null, "System Maintenance Scheduled")
  ),
};

export const DescriptionOnly: Story = {
  render: () => createElement(Alert, null,
    createElement(AlertDescription, null, "The system will be under maintenance from 2:00 AM to 4:00 AM UTC.")
  ),
};