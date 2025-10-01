import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from '@/components/ui/breadcrumb';
import { createElement } from 'react';

type BreadcrumbStoryArgs = {
  showEllipsis: boolean;
  customSeparator: boolean;
  pathLength: 'short' | 'medium' | 'long';
  currentPage: string;
};

const meta: Meta<BreadcrumbStoryArgs> = {
  title: 'Shadcn UI/Breadcrumb',
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    showEllipsis: {
      control: { type: 'boolean' },
      description: 'Show ellipsis in breadcrumb',
    },
    customSeparator: {
      control: { type: 'boolean' },
      description: 'Use custom arrow separator',
    },
    pathLength: {
      control: { type: 'select' },
      options: ['short', 'medium', 'long'],
      description: 'Length of breadcrumb path',
    },
    currentPage: {
      control: { type: 'text' },
      description: 'Current page name',
    },
  },
  args: {
    showEllipsis: false,
    customSeparator: false,
    pathLength: 'medium',
    currentPage: 'Current Page',
  },
};

export default meta;
type Story = StoryObj<BreadcrumbStoryArgs>;

const renderSeparator = (customSeparator: boolean) => {
  if (customSeparator) {
    return createElement(BreadcrumbSeparator, {},
      createElement('svg', {
        className: 'h-4 w-4',
        fill: 'currentColor',
        viewBox: '0 0 20 20'
      },
        createElement('path', {
          fillRule: 'evenodd',
          d: 'M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z',
          clipRule: 'evenodd'
        })
      )
    );
  }
  return createElement(BreadcrumbSeparator, {});
};

const getPathItems = (pathLength: string) => {
  switch (pathLength) {
    case 'short':
      return [
        { href: '/', label: 'Home' },
      ];
    case 'medium':
      return [
        { href: '/', label: 'Home' },
        { href: '/components', label: 'Components' },
      ];
    case 'long':
      return [
        { href: '/', label: 'Home' },
        { href: '/products', label: 'Products' },
        { href: '/products/electronics', label: 'Electronics' },
        { href: '/products/electronics/laptops', label: 'Laptops' },
      ];
    default:
      return [
        { href: '/', label: 'Home' },
        { href: '/components', label: 'Components' },
      ];
  }
};

const renderBreadcrumb = (args: BreadcrumbStoryArgs) => {
  const pathItems = getPathItems(args.pathLength);
  
  return createElement(Breadcrumb, {},
    createElement(BreadcrumbList, {},
      ...pathItems.map((item, index) => [
        createElement(BreadcrumbItem, { key: `item-${index}` },
          createElement(BreadcrumbLink, { href: item.href }, item.label)
        ),
        renderSeparator(args.customSeparator)
      ]).flat(),
      args.showEllipsis && createElement(BreadcrumbItem, { key: 'ellipsis' },
        createElement(BreadcrumbEllipsis, {})
      ),
      args.showEllipsis && renderSeparator(args.customSeparator),
      createElement(BreadcrumbItem, { key: 'current' },
        createElement(BreadcrumbPage, {}, args.currentPage)
      )
    )
  );
};

export const Default: Story = {
  render: renderBreadcrumb,
};

export const Simple: Story = {
  render: renderBreadcrumb,
  args: {
    pathLength: 'short',
    currentPage: 'About',
    showEllipsis: false,
    customSeparator: false,
  },
};

export const WithEllipsis: Story = {
  render: renderBreadcrumb,
  args: {
    pathLength: 'medium',
    currentPage: 'Breadcrumb',
    showEllipsis: true,
    customSeparator: false,
  },
};

export const CustomSeparator: Story = {
  render: renderBreadcrumb,
  args: {
    pathLength: 'medium',
    currentPage: 'Documentation',
    showEllipsis: false,
    customSeparator: true,
  },
};

export const LongPath: Story = {
  render: renderBreadcrumb,
  args: {
    pathLength: 'long',
    currentPage: 'MacBook Pro',
    showEllipsis: false,
    customSeparator: false,
  },
};