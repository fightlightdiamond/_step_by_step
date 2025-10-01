import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { createElement } from 'react';

type AvatarStoryArgs = {
  className?: string;
  fallbackText: string;
  src: string;
  alt: string;
};

const meta: Meta<AvatarStoryArgs> = {
  title: 'Shadcn UI/Avatar',
  component: Avatar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    className: {
      control: { type: 'text' },
      description: 'CSS class names for styling',
    },
    fallbackText: {
      control: { type: 'text' },
      description: 'Fallback text to display',
    },
    src: {
      control: { type: 'text' },
      description: 'Image source URL',
    },
    alt: {
      control: { type: 'text' },
      description: 'Alt text for image',
    },
  },
  args: {
    className: '',
    fallbackText: 'CN',
    src: 'https://github.com/shadcn.png',
    alt: '@shadcn',
  },
};

export default meta;
type Story = StoryObj<AvatarStoryArgs>;

export const Default: Story = {
  render: (args) => createElement(Avatar, { className: args.className },
    createElement(AvatarImage, {
      src: args.src,
      alt: args.alt
    }),
    createElement(AvatarFallback, null, args.fallbackText)
  ),
};

export const WithFallback: Story = {
  args: {
    src: 'https://broken-link.jpg',
    alt: 'Broken image',
    fallbackText: 'JD',
  },
  render: (args) => createElement(Avatar, { className: args.className },
    createElement(AvatarImage, {
      src: args.src,
      alt: args.alt
    }),
    createElement(AvatarFallback, null, args.fallbackText)
  ),
};

export const FallbackOnly: Story = {
  args: {
    fallbackText: 'AB',
    src: '',
    alt: '',
  },
  render: (args) => createElement(Avatar, { className: args.className },
    createElement(AvatarFallback, null, args.fallbackText)
  ),
};

export const Small: Story = {
  args: {
    className: 'h-6 w-6',
    src: 'https://github.com/nextjs.png',
    alt: '@nextjs',
    fallbackText: 'NJ',
  },
  render: (args) => createElement(Avatar, { className: args.className },
    createElement(AvatarImage, {
      src: args.src,
      alt: args.alt
    }),
    createElement(AvatarFallback, { className: 'text-xs' }, args.fallbackText)
  ),
};

export const Large: Story = {
  args: {
    className: 'h-16 w-16',
    src: 'https://github.com/vercel.png',
    alt: '@vercel',
    fallbackText: 'VL',
  },
  render: (args) => createElement(Avatar, { className: args.className },
    createElement(AvatarImage, {
      src: args.src,
      alt: args.alt
    }),
    createElement(AvatarFallback, { className: 'text-lg' }, args.fallbackText)
  ),
};

export const ExtraLarge: Story = {
  args: {
    className: 'h-24 w-24',
    src: 'https://github.com/facebook.png',
    alt: '@facebook',
    fallbackText: 'FB',
  },
  render: (args) => createElement(Avatar, { className: args.className },
    createElement(AvatarImage, {
      src: args.src,
      alt: args.alt
    }),
    createElement(AvatarFallback, { className: 'text-2xl' }, args.fallbackText)
  ),
};

export const ColoredFallback: Story = {
  render: () => createElement('div', { className: 'flex space-x-4' },
    createElement(Avatar, null,
      createElement(AvatarFallback, { 
        className: 'bg-red-500 text-white' 
      }, 'RD')
    ),
    createElement(Avatar, null,
      createElement(AvatarFallback, { 
        className: 'bg-blue-500 text-white' 
      }, 'BL')
    ),
    createElement(Avatar, null,
      createElement(AvatarFallback, { 
        className: 'bg-green-500 text-white' 
      }, 'GR')
    ),
    createElement(Avatar, null,
      createElement(AvatarFallback, { 
        className: 'bg-purple-500 text-white' 
      }, 'PR')
    )
  ),
};

export const GradientFallback: Story = {
  render: () => createElement('div', { className: 'flex space-x-4' },
    createElement(Avatar, { className: 'h-12 w-12' },
      createElement(AvatarFallback, { 
        className: 'bg-gradient-to-r from-pink-500 to-violet-500 text-white' 
      }, 'PV')
    ),
    createElement(Avatar, { className: 'h-12 w-12' },
      createElement(AvatarFallback, { 
        className: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white' 
      }, 'BC')
    ),
    createElement(Avatar, { className: 'h-12 w-12' },
      createElement(AvatarFallback, { 
        className: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' 
      }, 'GE')
    )
  ),
};

export const AvatarGroup: Story = {
  render: () => createElement('div', { className: 'flex -space-x-2' },
    createElement(Avatar, { className: 'border-2 border-background' },
      createElement(AvatarImage, {
        src: 'https://github.com/shadcn.png',
        alt: 'User 1'
      }),
      createElement(AvatarFallback, null, 'U1')
    ),
    createElement(Avatar, { className: 'border-2 border-background' },
      createElement(AvatarImage, {
        src: 'https://github.com/vercel.png',
        alt: 'User 2'
      }),
      createElement(AvatarFallback, null, 'U2')
    ),
    createElement(Avatar, { className: 'border-2 border-background' },
      createElement(AvatarImage, {
        src: 'https://github.com/nextjs.png',
        alt: 'User 3'
      }),
      createElement(AvatarFallback, null, 'U3')
    ),
    createElement(Avatar, { className: 'border-2 border-background' },
      createElement(AvatarFallback, { 
        className: 'bg-muted text-muted-foreground' 
      }, '+5')
    )
  ),
};

export const WithStatus: Story = {
  render: () => createElement('div', { className: 'flex space-x-6' },
    createElement('div', { className: 'relative' },
      createElement(Avatar, null,
        createElement(AvatarImage, {
          src: 'https://github.com/shadcn.png',
          alt: 'Online user'
        }),
        createElement(AvatarFallback, null, 'ON')
      ),
      createElement('div', { 
        className: 'absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-background rounded-full' 
      })
    ),
    createElement('div', { className: 'relative' },
      createElement(Avatar, null,
        createElement(AvatarImage, {
          src: 'https://github.com/vercel.png',
          alt: 'Away user'
        }),
        createElement(AvatarFallback, null, 'AW')
      ),
      createElement('div', { 
        className: 'absolute bottom-0 right-0 h-3 w-3 bg-yellow-500 border-2 border-background rounded-full' 
      })
    ),
    createElement('div', { className: 'relative' },
      createElement(Avatar, null,
        createElement(AvatarImage, {
          src: 'https://github.com/nextjs.png',
          alt: 'Offline user'
        }),
        createElement(AvatarFallback, null, 'OF')
      ),
      createElement('div', { 
        className: 'absolute bottom-0 right-0 h-3 w-3 bg-gray-500 border-2 border-background rounded-full' 
      })
    )
  ),
};

export const DifferentSizes: Story = {
  render: () => createElement('div', { className: 'flex items-center space-x-4' },
    createElement(Avatar, { className: 'h-6 w-6' },
      createElement(AvatarImage, {
        src: 'https://github.com/shadcn.png',
        alt: 'Extra small'
      }),
      createElement(AvatarFallback, { className: 'text-xs' }, 'XS')
    ),
    createElement(Avatar, { className: 'h-8 w-8' },
      createElement(AvatarImage, {
        src: 'https://github.com/vercel.png',
        alt: 'Small'
      }),
      createElement(AvatarFallback, { className: 'text-sm' }, 'SM')
    ),
    createElement(Avatar, null,
      createElement(AvatarImage, {
        src: 'https://github.com/nextjs.png',
        alt: 'Default'
      }),
      createElement(AvatarFallback, null, 'MD')
    ),
    createElement(Avatar, { className: 'h-12 w-12' },
      createElement(AvatarImage, {
        src: 'https://github.com/facebook.png',
        alt: 'Large'
      }),
      createElement(AvatarFallback, { className: 'text-lg' }, 'LG')
    ),
    createElement(Avatar, { className: 'h-16 w-16' },
      createElement(AvatarImage, {
        src: 'https://github.com/microsoft.png',
        alt: 'Extra large'
      }),
      createElement(AvatarFallback, { className: 'text-xl' }, 'XL')
    )
  ),
};

export const SquareAvatar: Story = {
  render: () => createElement('div', { className: 'flex space-x-4' },
    createElement(Avatar, { className: 'rounded-md' },
      createElement(AvatarImage, {
        src: 'https://github.com/shadcn.png',
        alt: 'Square avatar'
      }),
      createElement(AvatarFallback, { className: 'rounded-md' }, 'SQ')
    ),
    createElement(Avatar, { className: 'rounded-lg h-12 w-12' },
      createElement(AvatarImage, {
        src: 'https://github.com/vercel.png',
        alt: 'Rounded square'
      }),
      createElement(AvatarFallback, { className: 'rounded-lg' }, 'RS')
    ),
    createElement(Avatar, { className: 'rounded-none h-10 w-10' },
      createElement(AvatarImage, {
        src: 'https://github.com/nextjs.png',
        alt: 'No rounded'
      }),
      createElement(AvatarFallback, { className: 'rounded-none' }, 'NR')
    )
  ),
};