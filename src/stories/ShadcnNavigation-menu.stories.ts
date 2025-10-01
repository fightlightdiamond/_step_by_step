import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { fn } from 'storybook/test';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { CircleCheckIcon, CircleHelpIcon, CircleIcon } from 'lucide-react';
import { createElement } from 'react';

type NavigationMenuStoryArgs = {
  // Menu visibility
  showHomeMenu: boolean;
  showComponentsMenu: boolean;
  showDocsLink: boolean;
  showListMenu: boolean;
  showSimpleMenu: boolean;
  showIconMenu: boolean;
  
  // Menu text customization
  homeMenuText: string;
  componentsMenuText: string;
  docsLinkText: string;
  listMenuText: string;
  simpleMenuText: string;
  iconMenuText: string;
  
  // Home menu content
  brandTitle: string;
  brandDescription: string;
  introTitle: string;
  introDescription: string;
  installationTitle: string;
  installationDescription: string;
  typographyTitle: string;
  typographyDescription: string;
  
  // List Menu Items
  listItem1Title: string;
  listItem1Description: string;
  listItem2Title: string;
  listItem2Description: string;
  listItem3Title: string;
  listItem3Description: string;
  
  // Simple Menu Items
  simpleItem1: string;
  simpleItem2: string;
  simpleItem3: string;
  simpleItem4: string;
  
  // Components Menu Items
  comp1Title: string;
  comp1Description: string;
  comp2Title: string;
  comp2Description: string;
  comp3Title: string;
  comp3Description: string;
  comp4Title: string;
  comp4Description: string;
  comp5Title: string;
  comp5Description: string;
  comp6Title: string;
  comp6Description: string;
  
  // Components
  componentsData: string;
  componentsSeparator: string;
  
  // Custom menus
  customMenus: string;
  customMenusEnabled: boolean;
  menuSeparator: string;
  
  // Layout options
  viewport: boolean;
  orientation: 'horizontal' | 'vertical';
  className: string;
};

const defaultComponents = [
  {
    title: "Alert Dialog",
    href: "/docs/primitives/alert-dialog",
    description: "A modal dialog that interrupts the user with important content and expects a response.",
  },
  {
    title: "Hover Card",
    href: "/docs/primitives/hover-card",
    description: "For sighted users to preview content available behind a link.",
  },
  {
    title: "Progress",
    href: "/docs/primitives/progress",
    description: "Displays an indicator showing the completion progress of a task, typically displayed as a progress bar.",
  },
  {
    title: "Scroll-area",
    href: "/docs/primitives/scroll-area",
    description: "Visually or semantically separates content.",
  },
  {
    title: "Tabs",
    href: "/docs/primitives/tabs",
    description: "A set of layered sections of content—known as tab panels—that are displayed one at a time.",
  },
  {
    title: "Tooltip",
    href: "/docs/primitives/tooltip",
    description: "A popup that displays information related to an element when the element receives keyboard focus or the mouse hovers over it.",
  },
];

const meta: Meta<NavigationMenuStoryArgs> = {
  title: 'Shadcn UI/NavigationMenu',
  component: NavigationMenu,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    // Menu visibility
    showHomeMenu: { control: 'boolean', description: 'Show Home menu with featured content' },
    showComponentsMenu: { control: 'boolean', description: 'Show Components menu with grid layout' },
    showDocsLink: { control: 'boolean', description: 'Show Docs direct link' },
    showListMenu: { control: 'boolean', description: 'Show List menu with descriptions' },
    showSimpleMenu: { control: 'boolean', description: 'Show Simple menu with basic links' },
    showIconMenu: { control: 'boolean', description: 'Show menu with icons' },
    
    // Menu text
    homeMenuText: { control: 'text', description: 'Home menu trigger text' },
    componentsMenuText: { control: 'text', description: 'Components menu trigger text' },
    docsLinkText: { control: 'text', description: 'Docs link text' },
    listMenuText: { control: 'text', description: 'List menu trigger text' },
    simpleMenuText: { control: 'text', description: 'Simple menu trigger text' },
    iconMenuText: { control: 'text', description: 'Icon menu trigger text' },
    
    // Home menu content
    brandTitle: { control: 'text', description: 'Brand title in home menu' },
    brandDescription: { control: 'text', description: 'Brand description in home menu' },
    introTitle: { control: 'text', description: 'Introduction item title' },
    introDescription: { control: 'text', description: 'Introduction item description' },
    installationTitle: { control: 'text', description: 'Installation item title' },
    installationDescription: { control: 'text', description: 'Installation item description' },
    typographyTitle: { control: 'text', description: 'Typography item title' },
    typographyDescription: { control: 'text', description: 'Typography item description' },
    
    // Components
    componentsData: { control: 'text', description: 'Components data (JSON string or comma separated)' },
    componentsSeparator: { control: 'text', description: 'Components separator character' },
    
    // Custom menus
    customMenus: { control: 'text', description: 'Custom menu names (comma separated)' },
    customMenusEnabled: { control: 'boolean', description: 'Enable custom menus' },
    menuSeparator: { control: 'text', description: 'Menu separator character' },
    
    // Layout
    viewport: { control: 'boolean', description: 'Show navigation viewport' },
    orientation: { control: 'select', options: ['horizontal', 'vertical'], description: 'Menu orientation' },
    className: { control: 'text', description: 'Additional CSS classes' },
  },
  args: {
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Helper function to create ListItem
const createListItem = (title: string, href: string, description: string) => {
  return createElement('li', null,
    createElement(NavigationMenuLink, { asChild: true },
      createElement('a', { 
        href,
        className: 'block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground'
      },
        createElement('div', { className: 'text-sm font-medium leading-none' }, title),
        createElement('p', { className: 'line-clamp-2 text-sm leading-snug text-muted-foreground' }, description)
      )
    )
  );
};

// NavigationMenuDemo equivalent - Default story
export const Default: Story = {
  args: {
    showHomeMenu: true,
    showComponentsMenu: true,
    showDocsLink: true,
    showListMenu: true,
    showSimpleMenu: true,
    showIconMenu: true,
    
    homeMenuText: 'Home',
    componentsMenuText: 'Components',
    docsLinkText: 'Docs',
    listMenuText: 'List',
    simpleMenuText: 'Simple',
    iconMenuText: 'With Icon',
    
    brandTitle: 'shadcn/ui',
    brandDescription: 'Beautifully designed components built with Tailwind CSS.',
    introTitle: 'Introduction',
    introDescription: 'Re-usable components built using Radix UI and Tailwind CSS.',
    installationTitle: 'Installation',
    installationDescription: 'How to install dependencies and structure your app.',
    typographyTitle: 'Typography',
    typographyDescription: 'Styles for headings, paragraphs, lists...etc',
    
    // List Menu Items
    listItem1Title: 'Components',
    listItem1Description: 'Browse all components in the library.',
    listItem2Title: 'Documentation',
    listItem2Description: 'Learn how to use the library.',
    listItem3Title: 'Blog',
    listItem3Description: 'Read our latest blog posts.',
    
    // Simple Menu Items
    simpleItem1: 'Getting Started',
    simpleItem2: 'Installation',
    simpleItem3: 'Examples',
    simpleItem4: 'API Reference',
    
    // Components Menu Items (first 6 items)
    comp1Title: 'Alert Dialog',
    comp1Description: 'A modal dialog that interrupts the user with important content.',
    comp2Title: 'Hover Card',
    comp2Description: 'For sighted users to preview content available behind a link.',
    comp3Title: 'Progress',
    comp3Description: 'Displays an indicator showing the completion progress of a task.',
    comp4Title: 'Scroll-area',
    comp4Description: 'Visually or semantically separates content.',
    comp5Title: 'Tabs',
    comp5Description: 'A set of layered sections of content—known as tab panels.',
    comp6Title: 'Tooltip',
    comp6Description: 'A popup that displays information related to an element.',
    
    componentsData: '',
    componentsSeparator: ',',
    customMenus: '',
    customMenusEnabled: false,
    menuSeparator: ',',
    
    viewport: false,
    orientation: 'horizontal',
    className: '',
  },
  argTypes: {
    // Existing argTypes...
    
    // List Menu Items
    listItem1Title: { control: 'text', description: 'List menu item 1 title', table: { category: 'List Menu Content' } },
    listItem1Description: { control: 'text', description: 'List menu item 1 description', table: { category: 'List Menu Content' } },
    listItem2Title: { control: 'text', description: 'List menu item 2 title', table: { category: 'List Menu Content' } },
    listItem2Description: { control: 'text', description: 'List menu item 2 description', table: { category: 'List Menu Content' } },
    listItem3Title: { control: 'text', description: 'List menu item 3 title', table: { category: 'List Menu Content' } },
    listItem3Description: { control: 'text', description: 'List menu item 3 description', table: { category: 'List Menu Content' } },
    
    // Simple Menu Items
    simpleItem1: { control: 'text', description: 'Simple menu item 1', table: { category: 'Simple Menu Content' } },
    simpleItem2: { control: 'text', description: 'Simple menu item 2', table: { category: 'Simple Menu Content' } },
    simpleItem3: { control: 'text', description: 'Simple menu item 3', table: { category: 'Simple Menu Content' } },
    simpleItem4: { control: 'text', description: 'Simple menu item 4', table: { category: 'Simple Menu Content' } },
    
    // Components Menu Items
    comp1Title: { control: 'text', description: 'Component 1 title', table: { category: 'Components Menu Content' } },
    comp1Description: { control: 'text', description: 'Component 1 description', table: { category: 'Components Menu Content' } },
    comp2Title: { control: 'text', description: 'Component 2 title', table: { category: 'Components Menu Content' } },
    comp2Description: { control: 'text', description: 'Component 2 description', table: { category: 'Components Menu Content' } },
    comp3Title: { control: 'text', description: 'Component 3 title', table: { category: 'Components Menu Content' } },
    comp3Description: { control: 'text', description: 'Component 3 description', table: { category: 'Components Menu Content' } },
    comp4Title: { control: 'text', description: 'Component 4 title', table: { category: 'Components Menu Content' } },
    comp4Description: { control: 'text', description: 'Component 4 description', table: { category: 'Components Menu Content' } },
    comp5Title: { control: 'text', description: 'Component 5 title', table: { category: 'Components Menu Content' } },
    comp5Description: { control: 'text', description: 'Component 5 description', table: { category: 'Components Menu Content' } },
    comp6Title: { control: 'text', description: 'Component 6 title', table: { category: 'Components Menu Content' } },
    comp6Description: { control: 'text', description: 'Component 6 description', table: { category: 'Components Menu Content' } },
  },
  render: (args) => {
    // Use custom component data if provided, otherwise use args
    const components = args.componentsData 
      ? args.componentsData.split(args.componentsSeparator).map(item => {
          const parts = item.trim().split('|');
          return {
            title: parts[0] || 'Component',
            href: parts[1] || '#',
            description: parts[2] || 'Component description'
          };
        })
      : [
          { title: args.comp1Title, href: '#', description: args.comp1Description },
          { title: args.comp2Title, href: '#', description: args.comp2Description },
          { title: args.comp3Title, href: '#', description: args.comp3Description },
          { title: args.comp4Title, href: '#', description: args.comp4Description },
          { title: args.comp5Title, href: '#', description: args.comp5Description },
          { title: args.comp6Title, href: '#', description: args.comp6Description },
        ];

    const customMenusList = args.customMenusEnabled && args.customMenus
      ? args.customMenus.split(args.menuSeparator).map(m => m.trim()).filter(m => m.length > 0)
      : [];

    return createElement(NavigationMenu, { 
      viewport: args.viewport,
      orientation: args.orientation,
      className: args.className
    },
      createElement(NavigationMenuList, null,
        // Home Menu
        args.showHomeMenu && createElement(NavigationMenuItem, null,
          createElement(NavigationMenuTrigger, null, args.homeMenuText),
          createElement(NavigationMenuContent, null,
            createElement('ul', { className: 'grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]' },
              createElement('li', { className: 'row-span-3' },
                createElement(NavigationMenuLink, { asChild: true },
                  createElement('a', {
                    className: 'flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md',
                    href: '/',
                    style: { backgroundColor: '#dddddd' }
                  },
                    createElement('div', { className: 'mb-2 mt-4 text-lg font-medium' }, args.brandTitle),
                    createElement('p', { className: 'text-sm leading-tight text-muted-foreground' }, args.brandDescription)
                  )
                )
              ),
              createListItem(args.introTitle, '/docs', args.introDescription),
              createListItem(args.installationTitle, '/docs/installation', args.installationDescription),
              createListItem(args.typographyTitle, '/docs/primitives/typography', args.typographyDescription)
            )
          )
        ),
        
        // Components Menu
        args.showComponentsMenu && createElement(NavigationMenuItem, null,
          createElement(NavigationMenuTrigger, null, args.componentsMenuText),
          createElement(NavigationMenuContent, null,
            createElement('ul', { className: 'grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]' },
              ...components.map((component, index) => 
                createListItem(component.title, component.href, component.description)
              )
            )
          )
        ),
        
        // Docs Link
        args.showDocsLink && createElement(NavigationMenuItem, null,
          createElement(NavigationMenuLink, { 
            asChild: true,
            className: navigationMenuTriggerStyle()
          },
            createElement('a', { href: '/docs' }, args.docsLinkText)
          )
        ),
        
        // List Menu
        args.showListMenu && createElement(NavigationMenuItem, null,
          createElement(NavigationMenuTrigger, null, args.listMenuText),
          createElement(NavigationMenuContent, null,
            createElement('ul', { className: 'grid w-[300px] gap-3 p-4' },
              createElement('li', null,
                createElement(NavigationMenuLink, { asChild: true },
                  createElement('a', { 
                    href: '#',
                    className: 'block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground'
                  },
                    createElement('div', { className: 'text-sm font-medium leading-none' }, args.listItem1Title),
                    createElement('div', { className: 'text-sm text-muted-foreground' }, args.listItem1Description)
                  )
                ),
                createElement(NavigationMenuLink, { asChild: true },
                  createElement('a', { 
                    href: '#',
                    className: 'block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground'
                  },
                    createElement('div', { className: 'text-sm font-medium leading-none' }, args.listItem2Title),
                    createElement('div', { className: 'text-sm text-muted-foreground' }, args.listItem2Description)
                  )
                ),
                createElement(NavigationMenuLink, { asChild: true },
                  createElement('a', { 
                    href: '#',
                    className: 'block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground'
                  },
                    createElement('div', { className: 'text-sm font-medium leading-none' }, args.listItem3Title),
                    createElement('div', { className: 'text-sm text-muted-foreground' }, args.listItem3Description)
                  )
                )
              )
            )
          )
        ),
        
        // Simple Menu
        args.showSimpleMenu && createElement(NavigationMenuItem, null,
          createElement(NavigationMenuTrigger, null, args.simpleMenuText),
          createElement(NavigationMenuContent, null,
            createElement('ul', { className: 'grid w-[200px] gap-3 p-4' },
              createElement('li', null,
                createElement(NavigationMenuLink, { asChild: true },
                  createElement('a', { href: '#' }, args.simpleItem1)
                )
              ),
              createElement('li', null,
                createElement(NavigationMenuLink, { asChild: true },
                  createElement('a', { href: '#' }, args.simpleItem2)
                )
              ),
              createElement('li', null,
                createElement(NavigationMenuLink, { asChild: true },
                  createElement('a', { href: '#' }, args.simpleItem3)
                )
              ),
              createElement('li', null,
                createElement(NavigationMenuLink, { asChild: true },
                  createElement('a', { href: '#' }, args.simpleItem4)
                )
              )
            )
          )
        ),
        
        // Icon Menu
        args.showIconMenu && createElement(NavigationMenuItem, null,
          createElement(NavigationMenuTrigger, null, args.iconMenuText),
          createElement(NavigationMenuContent, null,
            createElement('ul', { className: 'grid w-[200px] gap-3 p-4' },
              createElement('li', null,
                createElement(NavigationMenuLink, { asChild: true },
                  createElement('a', { 
                    href: '#',
                    className: 'flex select-none items-center gap-2 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground'
                  },
                    createElement(CircleHelpIcon, { className: 'h-4 w-4' }),
                    'Backlog'
                  )
                ),
                createElement(NavigationMenuLink, { asChild: true },
                  createElement('a', { 
                    href: '#',
                    className: 'flex select-none items-center gap-2 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground'
                  },
                    createElement(CircleIcon, { className: 'h-4 w-4' }),
                    'To Do'
                  )
                ),
                createElement(NavigationMenuLink, { asChild: true },
                  createElement('a', { 
                    href: '#',
                    className: 'flex select-none items-center gap-2 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground'
                  },
                    createElement(CircleCheckIcon, { className: 'h-4 w-4' }),
                    'Done'
                  )
                )
              )
            )
          )
        ),
        
        // Custom Menus
        ...customMenusList.map((menuName, index) => 
          createElement(NavigationMenuItem, { key: `custom-${index}` },
            createElement(NavigationMenuTrigger, null, menuName),
            createElement(NavigationMenuContent, null,
              createElement('ul', { className: 'grid w-[200px] gap-3 p-4' },
                createElement('li', null,
                  createElement(NavigationMenuLink, { asChild: true },
                    createElement('a', { 
                      href: '#',
                      className: 'block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground'
                    }, `${menuName} Item 1`)
                  ),
                  createElement(NavigationMenuLink, { asChild: true },
                    createElement('a', { 
                      href: '#',
                      className: 'block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground'
                    }, `${menuName} Item 2`)
                  ),
                  createElement(NavigationMenuLink, { asChild: true },
                    createElement('a', { 
                      href: '#',
                      className: 'block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground'
                    }, `${menuName} Item 3`)
                  )
                )
              )
            )
          )
        )
      )
    );
  },
};

export const SimpleNavigation: Story = {
  args: {
    showHomeMenu: false,
    showComponentsMenu: false,
    showDocsLink: true,
    showListMenu: false,
    showSimpleMenu: true,
    showIconMenu: false,
    
    docsLinkText: 'Documentation',
    simpleMenuText: 'Products',
    
    viewport: true,
  },
  render: (args) => createElement(NavigationMenu, { viewport: args.viewport },
    createElement(NavigationMenuList, null,
      createElement(NavigationMenuItem, null,
        createElement(NavigationMenuLink, { 
          asChild: true,
          className: navigationMenuTriggerStyle()
        },
          createElement('a', { href: '/docs' }, args.docsLinkText)
        )
      ),
      createElement(NavigationMenuItem, null,
        createElement(NavigationMenuTrigger, null, args.simpleMenuText),
        createElement(NavigationMenuContent, null,
          createElement('ul', { className: 'grid w-[200px] gap-3 p-4' },
            createElement('li', null,
              createElement(NavigationMenuLink, { asChild: true },
                createElement('a', { 
                  href: '#',
                  className: 'block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground'
                }, 'Web Apps')
              ),
              createElement(NavigationMenuLink, { asChild: true },
                createElement('a', { 
                  href: '#',
                  className: 'block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground'
                }, 'Mobile Apps')
              ),
              createElement(NavigationMenuLink, { asChild: true },
                createElement('a', { 
                  href: '#',
                  className: 'block select-none rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground'
                }, 'Desktop Apps')
              )
            )
          )
        )
      ),
      createElement(NavigationMenuItem, null,
        createElement(NavigationMenuLink, { 
          asChild: true,
          className: navigationMenuTriggerStyle()
        },
          createElement('a', { href: '/pricing' }, 'Pricing')
        )
      )
    )
  ),
};

// export const WithCustomComponents: Story = {
//   args: {
//     showHomeMenu: false,
//     showComponentsMenu: true,
//     showDocsLink: false,
//     showListMenu: false,
//     showSimpleMenu: false,
//     showIconMenu: false,
    
//     componentsMenuText: 'UI Components',
//     componentsData: 'Button|/docs/button|Interactive button component,Input|/docs/input|Text input field component,Card|/docs/card|Container component for content,Modal|/docs/modal|Overlay dialog component',
//     componentsSeparator: ',',
    
//     viewport: true,
//   },
// };

// export const IconNavigation: Story = {
//   args: {
//     showHomeMenu: false,
//     showComponentsMenu: false,
//     showDocsLink: false,
//     showListMenu: false,
//     showSimpleMenu: false,
//     showIconMenu: true,
    
//     iconMenuText: 'Status',
//     customMenusEnabled: true,
//     customMenus: 'Projects,Team,Settings',
//     menuSeparator: ',',
    
//     viewport: true,
//   },
//   render: (args) => createElement(NavigationMenu, { viewport: args.viewport },
//     createElement(NavigationMenuList, { className: 'space-x-1' },
//       createElement(NavigationMenuItem, null,
//         createElement(NavigationMenuLink, { 
//           asChild: true,
//           className: navigationMenuTriggerStyle()
//         },
//           createElement('a', { 
//             href: '/', 
//             className: 'flex items-center justify-center gap-2 min-w-fit'
//           },
//             createElement(HomeIcon, { className: 'h-4 w-4 flex-shrink-0' }),
//             createElement('span', { className: 'whitespace-nowrap' }, 'Home')
//           )
//         )
//       ),
      
//       createElement(NavigationMenuItem, null,
//         createElement(NavigationMenuTrigger, null,
//           createElement('span', { className: 'flex items-center gap-2' },
//             createElement(ComponentIcon, { className: 'h-4 w-4 flex-shrink-0' }),
//             createElement('span', { className: 'whitespace-nowrap' }, 'Projects')
//           )
//         ),
//         createElement(NavigationMenuContent, null,
//           createElement('ul', { className: 'grid w-[280px] gap-2 p-4' },
//             createElement('li', null,
//               createElement(NavigationMenuLink, { asChild: true },
//                 createElement('a', { 
//                   href: '#',
//                   className: 'flex select-none items-center gap-3 rounded-lg p-3 leading-none no-underline outline-none transition-all hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground hover:shadow-sm'
//                 },
//                   createElement(CircleHelpIcon, { className: 'h-5 w-5 text-yellow-500 flex-shrink-0' }),
//                   createElement('div', { className: 'flex-1 space-y-1' },
//                     createElement('div', { className: 'text-sm font-semibold leading-none' }, 'Website Redesign'),
//                     createElement('div', { className: 'text-xs text-muted-foreground' }, 'In progress')
//                   )
//                 )
//               )
//             ),
//             createElement('li', null,
//               createElement(NavigationMenuLink, { asChild: true },
//                 createElement('a', { 
//                   href: '#',
//                   className: 'flex select-none items-center gap-3 rounded-lg p-3 leading-none no-underline outline-none transition-all hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground hover:shadow-sm'
//                 },
//                   createElement(CircleIcon, { className: 'h-5 w-5 text-blue-500 flex-shrink-0' }),
//                   createElement('div', { className: 'flex-1 space-y-1' },
//                     createElement('div', { className: 'text-sm font-semibold leading-none' }, 'Mobile App'),
//                     createElement('div', { className: 'text-xs text-muted-foreground' }, 'Planning')
//                   )
//                 )
//               )
//             ),
//             createElement('li', null,
//               createElement(NavigationMenuLink, { asChild: true },
//                 createElement('a', { 
//                   href: '#',
//                   className: 'flex select-none items-center gap-3 rounded-lg p-3 leading-none no-underline outline-none transition-all hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground hover:shadow-sm'
//                 },
//                   createElement(CircleCheckIcon, { className: 'h-5 w-5 text-green-500 flex-shrink-0' }),
//                   createElement('div', { className: 'flex-1 space-y-1' },
//                     createElement('div', { className: 'text-sm font-semibold leading-none' }, 'API Documentation'),
//                     createElement('div', { className: 'text-xs text-muted-foreground' }, 'Completed')
//                   )
//                 )
//               )
//             )
//           )
//         )
//       ),

//       createElement(NavigationMenuItem, null,
//         createElement(NavigationMenuTrigger, null,
//           createElement('span', { className: 'flex items-center gap-2' },
//             createElement(BookOpenIcon, { className: 'h-4 w-4 flex-shrink-0' }),
//             createElement('span', { className: 'whitespace-nowrap' }, 'Team')
//           )
//         ),
//         createElement(NavigationMenuContent, null,
//           createElement('ul', { className: 'grid w-[280px] gap-2 p-4' },
//             createElement('li', null,
//               createElement(NavigationMenuLink, { asChild: true },
//                 createElement('a', { 
//                   href: '#',
//                   className: 'flex select-none items-center gap-3 rounded-lg p-3 leading-none no-underline outline-none transition-all hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground hover:shadow-sm'
//                 },
//                   createElement(CircleIcon, { className: 'h-5 w-5 text-blue-500 flex-shrink-0' }),
//                   createElement('div', { className: 'flex-1 space-y-1' },
//                     createElement('div', { className: 'text-sm font-semibold leading-none' }, 'Team Members'),
//                     createElement('div', { className: 'text-xs text-muted-foreground' }, 'Manage team')
//                   )
//                 )
//               )
//             ),
//             createElement('li', null,
//               createElement(NavigationMenuLink, { asChild: true },
//                 createElement('a', { 
//                   href: '#',
//                   className: 'flex select-none items-center gap-3 rounded-lg p-3 leading-none no-underline outline-none transition-all hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground hover:shadow-sm'
//                 },
//                   createElement(CircleHelpIcon, { className: 'h-5 w-5 text-yellow-500 flex-shrink-0' }),
//                   createElement('div', { className: 'flex-1 space-y-1' },
//                     createElement('div', { className: 'text-sm font-semibold leading-none' }, 'Permissions'),
//                     createElement('div', { className: 'text-xs text-muted-foreground' }, 'Access control')
//                   )
//                 )
//               )
//             )
//           )
//         )
//       ),
      
//       createElement(NavigationMenuItem, null,
//         createElement(NavigationMenuLink, { 
//           asChild: true,
//           className: navigationMenuTriggerStyle()
//         },
//           createElement('a', { 
//             href: '/settings', 
//             className: 'flex items-center justify-center gap-2 min-w-fit'
//           },
//             createElement(SettingsIcon, { className: 'h-4 w-4 flex-shrink-0' }),
//             createElement('span', { className: 'whitespace-nowrap' }, 'Settings')
//           )
//         )
//       )
//     )
//   ),
// };










