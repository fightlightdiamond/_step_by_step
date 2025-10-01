import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { createElement } from 'react';

const meta: Meta<typeof ResizablePanelGroup> = {
  title: 'Shadcn UI/Resizable',
  component: ResizablePanelGroup,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    direction: {
      control: { type: 'select' },
      options: ['horizontal', 'vertical'],
      description: 'Panel group direction'
    },
    layout: {
      control: { type: 'select' },
      options: ['nested', 'simple', 'sidebar'],
      description: 'Layout type'
    },
    leftPanelSize: {
      control: { type: 'number', min: 10, max: 90, step: 5 },
      description: 'First panel size (%)'
    },
    rightPanelSize: {
      control: { type: 'number', min: 10, max: 90, step: 5 },
      description: 'Second panel size (%)'
    },
    topNestedSize: {
      control: { type: 'number', min: 10, max: 90, step: 5 },
      description: 'Top nested panel size (%)'
    },
    bottomNestedSize: {
      control: { type: 'number', min: 10, max: 90, step: 5 },
      description: 'Bottom nested panel size (%)'
    },
    withHandle: {
      control: { type: 'boolean' },
      description: 'Show resize handle grip'
    },
    firstPanelText: {
      control: { type: 'text' },
      description: 'First panel text'
    },
    secondPanelText: {
      control: { type: 'text' },
      description: 'Second panel text'
    },
    thirdPanelText: {
      control: { type: 'text' },
      description: 'Third panel text (nested only)'
    },
  },
  args: {
    direction: 'horizontal',
    layout: 'nested',
    leftPanelSize: 25,
    rightPanelSize: 75,
    topNestedSize: 25,
    bottomNestedSize: 75,
    withHandle: false,
    firstPanelText: 'Sidebar',
    secondPanelText: 'Content',
    thirdPanelText: 'Three',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    const containerClass = args.direction === 'vertical' 
      ? 'min-h-[200px] max-w-md rounded-lg border md:min-w-[450px]'
      : 'max-w-md rounded-lg border md:min-w-[450px]';

    if (args.layout === 'simple') {
      return createElement(ResizablePanelGroup, {
        direction: args.direction,
        className: containerClass
      },
        createElement(ResizablePanel, { defaultSize: args.leftPanelSize },
          createElement('div', { 
            className: args.direction === 'vertical' 
              ? 'flex h-full items-center justify-center p-6'
              : 'flex h-[200px] items-center justify-center p-6'
          },
            createElement('span', { className: 'font-semibold' }, args.firstPanelText)
          )
        ),
        createElement(ResizableHandle, { 
          withHandle: args.withHandle,
          className: 'bg-gray-300 dark:bg-gray-600'
        }),
        createElement(ResizablePanel, { defaultSize: args.rightPanelSize },
          createElement('div', { 
            className: args.direction === 'vertical' 
              ? 'flex h-full items-center justify-center p-6'
              : 'flex h-[200px] items-center justify-center p-6'
          },
            createElement('span', { className: 'font-semibold' }, args.secondPanelText)
          )
        )
      );
    }

    if (args.layout === 'sidebar') {
      return createElement(ResizablePanelGroup, {
        direction: 'horizontal',
        className: 'min-h-[200px] max-w-md rounded-lg border md:min-w-[450px]'
      },
        createElement(ResizablePanel, { defaultSize: args.leftPanelSize },
          createElement('div', { className: 'flex h-full items-center justify-center p-6' },
            createElement('span', { className: 'font-semibold' }, args.firstPanelText)
          )
        ),
        createElement(ResizableHandle, { 
          withHandle: true,
          className: 'bg-gray-300 dark:bg-gray-600'
        }),
        createElement(ResizablePanel, { defaultSize: args.rightPanelSize },
          createElement('div', { className: 'flex h-full items-center justify-center p-6' },
            createElement('span', { className: 'font-semibold' }, args.secondPanelText)
          )
        )
      );
    }

    // Nested layout
    return createElement(ResizablePanelGroup, {
      direction: args.direction,
      className: containerClass
    },
      createElement(ResizablePanel, { defaultSize: args.leftPanelSize },
        createElement('div', { className: 'flex h-[200px] items-center justify-center p-6' },
          createElement('span', { className: 'font-semibold' }, args.firstPanelText)
        )
      ),
      createElement(ResizableHandle, { 
        withHandle: args.withHandle,
        className: 'bg-gray-300 dark:bg-gray-600'
      }),
      createElement(ResizablePanel, { defaultSize: args.rightPanelSize },
        createElement(ResizablePanelGroup, { direction: args.direction === 'horizontal' ? 'vertical' : 'horizontal' },
          createElement(ResizablePanel, { defaultSize: args.topNestedSize },
            createElement('div', { className: 'flex h-full items-center justify-center p-6' },
              createElement('span', { className: 'font-semibold' }, args.secondPanelText)
            )
          ),
          createElement(ResizableHandle, { 
            withHandle: args.withHandle,
            className: 'bg-gray-300 dark:bg-gray-600'
          }),
          createElement(ResizablePanel, { defaultSize: args.bottomNestedSize },
            createElement('div', { className: 'flex h-full items-center justify-center p-6' },
              createElement('span', { className: 'font-semibold' }, args.thirdPanelText)
            )
          )
        )
      )
    );
  },
};





