import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { createElement } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

const meta: Meta<typeof Carousel> = {
  title: 'Shadcn UI/Carousel',
  component: Carousel,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    orientation: {
      control: { type: 'select' },
      options: ['horizontal', 'vertical'],
      description: 'Carousel orientation',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => createElement('div', { className: 'w-full max-w-xs' },
    createElement(Carousel, { 
      orientation: args.orientation,
      className: 'w-full'
    },
      createElement(CarouselContent, { className: '-ml-1' },
        Array.from({ length: 5 }).map((_, index) =>
          createElement(CarouselItem, { key: index, className: 'pl-1 basis-full' },
            createElement('div', { className: 'p-1' },
              createElement(Card, null,
                createElement(CardContent, { className: 'flex aspect-square items-center justify-center p-6' },
                  createElement('span', { className: 'text-3xl font-semibold' }, index + 1)
                )
              )
            )
          )
        )
      ),
      createElement(CarouselPrevious),
      createElement(CarouselNext)
    )
  ),
  args: {
    orientation: 'horizontal',
  },
};

export const Multiple: Story = {
  render: (args) => createElement('div', { className: 'w-full max-w-sm' },
    createElement(Carousel, { 
      orientation: args.orientation,
      className: 'w-full'
    },
      createElement(CarouselContent, { className: '-ml-1' },
        Array.from({ length: 6 }).map((_, index) =>
          createElement(CarouselItem, { key: index, className: 'pl-1 md:basis-1/2 lg:basis-1/3' },
            createElement('div', { className: 'p-1' },
              createElement(Card, null,
                createElement(CardContent, { className: 'flex aspect-square items-center justify-center p-6' },
                  createElement('span', { className: 'text-2xl font-semibold' }, index + 1)
                )
              )
            )
          )
        )
      ),
      createElement(CarouselPrevious),
      createElement(CarouselNext)
    )
  ),
  args: {
    orientation: 'horizontal',
  },
};

export const Vertical: Story = {
  render: () => createElement('div', { className: 'mx-auto w-full max-w-xs' },
    createElement(Carousel, { 
      orientation: 'vertical', 
      className: 'w-full max-w-sm',
      opts: { align: 'start' }
    },
      createElement(CarouselContent, { className: '-mt-1 h-[200px]' },
        Array.from({ length: 5 }).map((_, index) =>
          createElement(CarouselItem, { key: index, className: 'pt-1 md:basis-1/2' },
            createElement('div', { className: 'p-1' },
              createElement(Card, null,
                createElement(CardContent, { className: 'flex aspect-square items-center justify-center p-6' },
                  createElement('span', { className: 'text-2xl font-semibold' }, index + 1)
                )
              )
            )
          )
        )
      ),
      createElement(CarouselPrevious),
      createElement(CarouselNext)
    )
  ),
};

export const WithLoop: Story = {
  render: () => createElement('div', { className: 'w-full max-w-xs' },
    createElement(Carousel, { 
      opts: { loop: true },
      className: 'w-full'
    },
      createElement(CarouselContent, { className: '-ml-1' },
        Array.from({ length: 5 }).map((_, index) =>
          createElement(CarouselItem, { key: index, className: 'pl-1 basis-full' },
            createElement('div', { className: 'p-1' },
              createElement(Card, null,
                createElement(CardContent, { className: 'flex aspect-square items-center justify-center p-6' },
                  createElement('span', { className: 'text-3xl font-semibold' }, index + 1)
                )
              )
            )
          )
        )
      ),
      createElement(CarouselPrevious),
      createElement(CarouselNext)
    )
  ),
};

export const WithoutControls: Story = {
  render: () => createElement('div', { className: 'w-full max-w-xs' },
    createElement(Carousel, { className: 'w-full' },
      createElement(CarouselContent, { className: '-ml-1' },
        Array.from({ length: 5 }).map((_, index) =>
          createElement(CarouselItem, { key: index, className: 'pl-1 basis-full' },
            createElement('div', { className: 'p-1' },
              createElement(Card, null,
                createElement(CardContent, { className: 'flex aspect-square items-center justify-center p-6' },
                  createElement('span', { className: 'text-3xl font-semibold' }, index + 1)
                )
              )
            )
          )
        )
      )
    )
  ),
};

export const Sizes: Story = {
  render: () => createElement('div', { className: 'space-y-4' },
    createElement('div', { className: 'text-center' },
      createElement('h3', { className: 'text-lg font-semibold mb-2' }, 'Small'),
      createElement('div', { className: 'w-full max-w-[200px] mx-auto' },
        createElement(Carousel, { className: 'w-full' },
          createElement(CarouselContent, { className: '-ml-1' },
            Array.from({ length: 3 }).map((_, index) =>
              createElement(CarouselItem, { key: index, className: 'pl-1 basis-full' },
                createElement('div', { className: 'p-1' },
                  createElement(Card, null,
                    createElement(CardContent, { className: 'flex aspect-square items-center justify-center p-4' },
                      createElement('span', { className: 'text-xl font-semibold' }, index + 1)
                    )
                  )
                )
              )
            )
          ),
          createElement(CarouselPrevious),
          createElement(CarouselNext)
        )
      )
    ),
    createElement('div', { className: 'text-center' },
      createElement('h3', { className: 'text-lg font-semibold mb-2' }, 'Large'),
      createElement('div', { className: 'w-full max-w-lg mx-auto' },
        createElement(Carousel, { className: 'w-full' },
          createElement(CarouselContent, { className: '-ml-1' },
            Array.from({ length: 3 }).map((_, index) =>
              createElement(CarouselItem, { key: index, className: 'pl-1 basis-full' },
                createElement('div', { className: 'p-1' },
                  createElement(Card, null,
                    createElement(CardContent, { className: 'flex aspect-square items-center justify-center p-8' },
                      createElement('span', { className: 'text-4xl font-semibold' }, index + 1)
                    )
                  )
                )
              )
            )
          ),
          createElement(CarouselPrevious),
          createElement(CarouselNext)
        )
      )
    )
  ),
};

export const AutoPlay: Story = {
  render: () => createElement('div', { className: 'w-full max-w-xs' },
    createElement(Carousel, { 
      opts: { 
        loop: true,
        duration: 20
      },
      className: 'w-full'
    },
      createElement(CarouselContent, { className: '-ml-1' },
        Array.from({ length: 4 }).map((_, index) =>
          createElement(CarouselItem, { key: index, className: 'pl-1 basis-full' },
            createElement('div', { className: 'p-1' },
              createElement(Card, { className: 'bg-gradient-to-br from-blue-500 to-purple-600' },
                createElement(CardContent, { className: 'flex aspect-square items-center justify-center p-6' },
                  createElement('span', { className: 'text-3xl font-semibold text-white' }, `Slide ${index + 1}`)
                )
              )
            )
          )
        )
      ),
      createElement(CarouselPrevious),
      createElement(CarouselNext)
    )
  ),
};