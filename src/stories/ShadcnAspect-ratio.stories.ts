import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { createElement } from 'react';

const meta: Meta<typeof AspectRatio> = {
  title: 'Shadcn UI/AspectRatio',
  component: AspectRatio,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    ratio: {
      control: { type: 'number', min: 0.1, max: 5, step: 0.1 },
      description: 'Aspect ratio (width/height)',
    },
  },
  args: {
    ratio: 16 / 9,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    ratio: 16 / 9,
  },
  render: (args) => createElement('div', { className: 'w-[450px]' },
    createElement(AspectRatio, { ratio: args.ratio },
      createElement('img', {
        src: 'https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=800&dpr=2&q=80',
        alt: 'Photo by Drew Beamer',
        className: 'rounded-md object-cover w-full h-full'
      })
    )
  ),
};

export const Square: Story = {
  args: {
    ratio: 1 / 1,
  },
  render: (args) => createElement('div', { className: 'w-[300px]' },
    createElement(AspectRatio, { ratio: args.ratio },
      createElement('img', {
        src: 'https://images.unsplash.com/photo-1492724441997-5dc865305da7?w=800&dpr=2&q=80',
        alt: 'Square image',
        className: 'rounded-md object-cover w-full h-full'
      })
    )
  ),
};

export const Portrait: Story = {
  args: {
    ratio: 3 / 4,
  },
  render: (args) => createElement('div', { className: 'w-[300px]' },
    createElement(AspectRatio, { ratio: args.ratio },
      createElement('img', {
        src: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=800&dpr=2&q=80',
        alt: 'Portrait image',
        className: 'rounded-md object-cover w-full h-full'
      })
    )
  ),
};

export const UltraWide: Story = {
  args: {
    ratio: 21 / 9,
  },
  render: (args) => createElement('div', { className: 'w-[600px]' },
    createElement(AspectRatio, { ratio: args.ratio },
      createElement('img', {
        src: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&dpr=2&q=80',
        alt: 'Ultra wide landscape',
        className: 'rounded-md object-cover w-full h-full'
      })
    )
  ),
};

export const WithVideo: Story = {
  args: {
    ratio: 16 / 9,
  },
  render: (args) => createElement('div', { className: 'w-[500px]' },
    createElement(AspectRatio, { ratio: args.ratio },
      createElement('iframe', {
        src: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        title: 'YouTube video player',
        className: 'rounded-md w-full h-full',
        frameBorder: '0',
        allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
        allowFullScreen: true
      })
    )
  ),
};

export const WithPlaceholder: Story = {
  args: {
    ratio: 16 / 9,
  },
  render: (args) => createElement('div', { className: 'w-[400px]' },
    createElement(AspectRatio, { ratio: args.ratio },
      createElement('div', {
        className: 'flex items-center justify-center w-full h-full bg-muted rounded-md'
      },
        createElement('div', { className: 'text-center' },
          createElement('svg', {
            className: 'mx-auto h-12 w-12 text-muted-foreground',
            fill: 'none',
            viewBox: '0 0 24 24',
            stroke: 'currentColor'
          },
            createElement('path', {
              strokeLinecap: 'round',
              strokeLinejoin: 'round',
              strokeWidth: 2,
              d: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2z'
            })
          ),
          createElement('p', { className: 'mt-2 text-sm text-muted-foreground' }, 'Ratio: ' + (args.ratio || 1).toFixed(2))
        )
      )
    )
  ),
};

export const GoldenRatio: Story = {
  args: {
    ratio: 1.618,
  },
  render: (args) => createElement('div', { className: 'w-[400px]' },
    createElement(AspectRatio, { ratio: args.ratio },
      createElement('div', {
        className: 'flex items-center justify-center w-full h-full bg-gradient-to-br from-yellow-400 to-orange-500 rounded-md text-white font-bold text-lg'
      }, 'Golden Ratio (1.618:1)')
    )
  ),
};

export const InstagramPost: Story = {
  args: {
    ratio: 1,
  },
  render: (args) => createElement('div', { className: 'w-[320px]' },
    createElement(AspectRatio, { ratio: args.ratio },
      createElement('div', {
        className: 'relative w-full h-full bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 rounded-md overflow-hidden'
      },
        createElement('div', {
          className: 'absolute inset-0 flex items-center justify-center text-white font-bold text-xl'
        }, 'Instagram Post'),
        createElement('div', {
          className: 'absolute bottom-4 left-4 right-4 text-white text-sm'
        }, 'Perfect square format for social media')
      )
    )
  ),
};

export const MoviePoster: Story = {
  args: {
    ratio: 2 / 3,
  },
  render: (args) => createElement('div', { className: 'w-[250px]' },
    createElement(AspectRatio, { ratio: args.ratio },
      createElement('div', {
        className: 'flex flex-col items-center justify-center w-full h-full bg-gradient-to-b from-gray-800 to-black rounded-md text-white p-4'
      },
        createElement('div', { className: 'text-center' },
          createElement('h3', { className: 'text-lg font-bold mb-2' }, 'Movie Title'),
          createElement('p', { className: 'text-sm opacity-75' }, 'Classic movie poster ratio'),
          createElement('div', { className: 'mt-4 text-xs opacity-50' }, '2:3 Aspect Ratio')
        )
      )
    )
  ),
};

export const ResponsiveGrid: Story = {
  args: {
    ratio: 16 / 9,
  },
  render: (args) => createElement('div', { className: 'grid grid-cols-2 gap-4 w-[600px]' },
    createElement('div', null,
      createElement(AspectRatio, { ratio: 4 / 3 },
        createElement('div', {
          className: 'flex items-center justify-center w-full h-full bg-blue-100 dark:bg-blue-900 rounded-md text-blue-800 dark:text-blue-200 font-medium'
        }, '4:3 Ratio')
      )
    ),
    createElement('div', null,
      createElement(AspectRatio, { ratio: args.ratio },
        createElement('div', {
          className: 'flex items-center justify-center w-full h-full bg-green-100 dark:bg-green-900 rounded-md text-green-800 dark:text-green-200 font-medium'
        }, 'Controllable Ratio')
      )
    ),
    createElement('div', null,
      createElement(AspectRatio, { ratio: 1 },
        createElement('div', {
          className: 'flex items-center justify-center w-full h-full bg-purple-100 dark:bg-purple-900 rounded-md text-purple-800 dark:text-purple-200 font-medium'
        }, '1:1 Ratio')
      )
    ),
    createElement('div', null,
      createElement(AspectRatio, { ratio: 3 / 2 },
        createElement('div', {
          className: 'flex items-center justify-center w-full h-full bg-orange-100 dark:bg-orange-900 rounded-md text-orange-800 dark:text-orange-200 font-medium'
        }, '3:2 Ratio')
      )
    )
  ),
};