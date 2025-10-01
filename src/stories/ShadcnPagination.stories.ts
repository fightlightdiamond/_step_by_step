import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { createElement } from 'react';

type PaginationStoryArgs = {
  // Pagination controls
  showPrevious: boolean;
  showNext: boolean;
  showEllipsis: boolean;
  totalPages: number;
  currentPage: number;
  
  // Text customization
  previousText: string;
  nextText: string;
  
  // Page links (first 5 pages)
  page1Text: string;
  page2Text: string;
  page3Text: string;
  page4Text: string;
  page5Text: string;
  
  // Custom pages
  customPages: string;
  customPagesEnabled: boolean;
  pagesSeparator: string;
  
  // Layout options
  className: string;
  size: 'default' | 'sm' | 'lg' | 'icon';
  variant: 'default' | 'outline' | 'ghost';
};

const meta: Meta<PaginationStoryArgs> = {
  title: 'Shadcn UI/Pagination',
  component: Pagination,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    // Pagination controls
    showPrevious: { 
      control: 'boolean', 
      description: 'Show Previous button',
      table: { category: 'Controls' }
    },
    showNext: { 
      control: 'boolean', 
      description: 'Show Next button',
      table: { category: 'Controls' }
    },
    showEllipsis: { 
      control: 'boolean', 
      description: 'Show ellipsis',
      table: { category: 'Controls' }
    },
    totalPages: { 
      control: { type: 'number', min: 1, max: 20 }, 
      description: 'Total number of pages',
      table: { category: 'Controls' }
    },
    currentPage: { 
      control: { type: 'number', min: 1, max: 20 }, 
      description: 'Current active page',
      table: { category: 'Controls' }
    },
    
    // Text customization
    previousText: { 
      control: 'text', 
      description: 'Previous button text',
      table: { category: 'Text Customization' }
    },
    nextText: { 
      control: 'text', 
      description: 'Next button text',
      table: { category: 'Text Customization' }
    },
    
    // Page links
    page1Text: { 
      control: 'text', 
      description: 'Page 1 text',
      table: { category: 'Page Links' }
    },
    page2Text: { 
      control: 'text', 
      description: 'Page 2 text',
      table: { category: 'Page Links' }
    },
    page3Text: { 
      control: 'text', 
      description: 'Page 3 text',
      table: { category: 'Page Links' }
    },
    page4Text: { 
      control: 'text', 
      description: 'Page 4 text',
      table: { category: 'Page Links' }
    },
    page5Text: { 
      control: 'text', 
      description: 'Page 5 text',
      table: { category: 'Page Links' }
    },
    
    // Custom pages
    customPages: { 
      control: 'text', 
      description: 'Custom pages (comma separated)',
      table: { category: 'Custom Pages' }
    },
    customPagesEnabled: { 
      control: 'boolean', 
      description: 'Enable custom pages',
      table: { category: 'Custom Pages' }
    },
    pagesSeparator: { 
      control: 'text', 
      description: 'Pages separator character',
      table: { category: 'Custom Pages' }
    },
    
    // Layout
    className: { 
      control: 'text', 
      description: 'Additional CSS classes',
      table: { category: 'Layout' }
    },
    size: { 
      control: 'select', 
      options: ['default', 'sm', 'lg', 'icon'],
      description: 'Button size',
      table: { category: 'Layout' }
    },
    variant: { 
      control: 'select', 
      options: ['default', 'outline', 'ghost'],
      description: 'Button variant',
      table: { category: 'Layout' }
    },
  },
  args: {
    onClick: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    showPrevious: true,
    showNext: true,
    showEllipsis: true,
    totalPages: 5,
    currentPage: 2,
    
    previousText: 'Previous',
    nextText: 'Next',
    
    page1Text: '1',
    page2Text: '2',
    page3Text: '3',
    page4Text: '4',
    page5Text: '5',
    
    customPages: '',
    customPagesEnabled: false,
    pagesSeparator: ',',
    
    className: '',
    size: 'default',
    variant: 'outline',
  },
  render: (args) => {
    // Use custom pages if provided, otherwise use args
    const pages = args.customPagesEnabled && args.customPages
      ? args.customPages.split(args.pagesSeparator).map(page => page.trim()).filter(page => page.length > 0)
      : [args.page1Text, args.page2Text, args.page3Text, args.page4Text, args.page5Text].filter(page => page.length > 0);

    return createElement(Pagination, { className: args.className },
      createElement(PaginationContent, null,
        // Previous button
        args.showPrevious && createElement(PaginationItem, null,
          createElement(PaginationPrevious, { 
            href: '#',
            size: args.size
          }, args.previousText)
        ),
        
        // Page links
        ...pages.slice(0, args.totalPages).map((pageText, index) => 
          createElement(PaginationItem, { key: `page-${index}` },
            createElement(PaginationLink, { 
              href: '#',
              isActive: (index + 1) === args.currentPage,
              size: args.size
            }, pageText)
          )
        ),
        
        // Ellipsis
        args.showEllipsis && createElement(PaginationItem, null,
          createElement(PaginationEllipsis)
        ),
        
        // Next button
        args.showNext && createElement(PaginationItem, null,
          createElement(PaginationNext, { 
            href: '#',
            size: args.size
          }, args.nextText)
        )
      )
    );
  },
};

export const Simple: Story = {
  args: {
    showPrevious: true,
    showNext: true,
    showEllipsis: false,
    totalPages: 3,
    currentPage: 1,
    
    previousText: 'Prev',
    nextText: 'Next',
    
    page1Text: '1',
    page2Text: '2',
    page3Text: '3',
    page4Text: '',
    page5Text: '',
    
    customPagesEnabled: false,
    size: 'sm',
    variant: 'outline',
  },
  render: (args) => {
    const pages = [args.page1Text, args.page2Text, args.page3Text].filter(page => page.length > 0);

    return createElement(Pagination, { className: args.className },
      createElement(PaginationContent, null,
        args.showPrevious && createElement(PaginationItem, null,
          createElement(PaginationPrevious, { 
            href: '#',
            size: args.size
          }, args.previousText)
        ),
        
        ...pages.map((pageText, index) => 
          createElement(PaginationItem, { key: `page-${index}` },
            createElement(PaginationLink, { 
              href: '#',
              isActive: (index + 1) === args.currentPage,
              size: args.size
            }, pageText)
          )
        ),
        
        args.showNext && createElement(PaginationItem, null,
          createElement(PaginationNext, { 
            href: '#',
            size: args.size
          }, args.nextText)
        )
      )
    );
  },
};

export const WithEllipsis: Story = {
  args: {
    showPrevious: true,
    showNext: true,
    showEllipsis: true,
    totalPages: 3,
    currentPage: 2,
    
    previousText: 'Previous',
    nextText: 'Next',
    
    page1Text: '1',
    page2Text: '2',
    page3Text: '3',
    page4Text: '',
    page5Text: '',
    
    customPagesEnabled: false,
    size: 'default',
    variant: 'outline',
  },
  render: (args) => {
    const pages = [args.page1Text, args.page2Text, args.page3Text].filter(page => page.length > 0);

    return createElement(Pagination, { className: args.className },
      createElement(PaginationContent, null,
        args.showPrevious && createElement(PaginationItem, null,
          createElement(PaginationPrevious, { 
            href: '#',
            size: args.size
          }, args.previousText)
        ),
        
        ...pages.map((pageText, index) => 
          createElement(PaginationItem, { key: `page-${index}` },
            createElement(PaginationLink, { 
              href: '#',
              isActive: (index + 1) === args.currentPage,
              size: args.size
            }, pageText)
          )
        ),
        
        args.showEllipsis && createElement(PaginationItem, null,
          createElement(PaginationEllipsis)
        ),
        
        args.showNext && createElement(PaginationItem, null,
          createElement(PaginationNext, { 
            href: '#',
            size: args.size
          }, args.nextText)
        )
      )
    );
  },
};

// export const CustomPages: Story = {
//   args: {
//     showPrevious: true,
//     showNext: true,
//     showEllipsis: true,
//     totalPages: 5,
//     currentPage: 3,
    
//     previousText: 'Trước',
//     nextText: 'Sau',
    
//     customPagesEnabled: true,
//     customPages: 'Trang 1,Trang 2,Trang 3,Trang 4,Trang 5',
//     pagesSeparator: ',',
    
//     size: 'default',
//     variant: 'outline',
//   },
//   render: (args) => {
//     const pages = args.customPagesEnabled && args.customPages
//       ? args.customPages.split(args.pagesSeparator).map(page => page.trim()).filter(page => page.length > 0)
//       : [args.page1Text, args.page2Text, args.page3Text, args.page4Text, args.page5Text].filter(page => page.length > 0);

//     return createElement(Pagination, { className: args.className },
//       createElement(PaginationContent, null,
//         args.showPrevious && createElement(PaginationItem, null,
//           createElement(PaginationPrevious, { 
//             href: '#',
//             size: args.size
//           }, args.previousText)
//         ),
        
//         ...pages.slice(0, args.totalPages).map((pageText, index) => 
//           createElement(PaginationItem, { key: `page-${index}` },
//             createElement(PaginationLink, { 
//               href: '#',
//               isActive: (index + 1) === args.currentPage,
//               size: args.size
//             }, pageText)
//           )
//         ),
        
//         args.showEllipsis && createElement(PaginationItem, null,
//           createElement(PaginationEllipsis)
//         ),
        
//         args.showNext && createElement(PaginationItem, null,
//           createElement(PaginationNext, { 
//             href: '#',
//             size: args.size
//           }, args.nextText)
//         )
//       )
//     );
//   },
// };

// export const LargePagination: Story = {
//   args: {
//     showPrevious: true,
//     showNext: true,
//     showEllipsis: true,
//     totalPages: 5,
//     currentPage: 3,
    
//     previousText: 'Previous Page',
//     nextText: 'Next Page',
    
//     page1Text: 'First',
//     page2Text: 'Second',
//     page3Text: 'Third',
//     page4Text: 'Fourth',
//     page5Text: 'Fifth',
    
//     customPagesEnabled: false,
//     size: 'lg',
//     variant: 'default',
//   },
//   render: (args) => {
//     const pages = [args.page1Text, args.page2Text, args.page3Text, args.page4Text, args.page5Text].filter(page => page.length > 0);

//     return createElement(Pagination, { className: args.className },
//       createElement(PaginationContent, null,
//         args.showPrevious && createElement(PaginationItem, null,
//           createElement(PaginationPrevious, { 
//             href: '#',
//             size: args.size
//           }, args.previousText)
//         ),
        
//         ...pages.slice(0, args.totalPages).map((pageText, index) => 
//           createElement(PaginationItem, { key: `page-${index}` },
//             createElement(PaginationLink, { 
//               href: '#',
//               isActive: (index + 1) === args.currentPage,
//               size: args.size
//             }, pageText)
//           )
//         ),
        
//         args.showEllipsis && createElement(PaginationItem, null,
//           createElement(PaginationEllipsis)
//         ),
        
//         args.showNext && createElement(PaginationItem, null,
//           createElement(PaginationNext, { 
//             href: '#',
//             size: args.size
//           }, args.nextText)
//         )
//       )
//     );
//   },
// };