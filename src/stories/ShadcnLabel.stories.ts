import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { createElement } from 'react';

type LabelStoryArgs = {
  htmlFor: string;
  children: string;
  className?: string;
  required?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'destructive' | 'muted';
};

const meta: Meta<LabelStoryArgs> = {
  title: 'Shadcn UI/Label',
  component: Label,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    htmlFor: {
      control: { type: 'text' },
      description: 'ID của element được liên kết',
    },
    children: {
      control: { type: 'text' },
      description: 'Nội dung text của label',
    },
    className: {
      control: { type: 'text' },
      description: 'CSS class tùy chỉnh',
    },
    required: {
      control: { type: 'boolean' },
      description: 'Hiển thị dấu * bắt buộc',
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Trạng thái vô hiệu hóa',
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'default', 'lg'],
      description: 'Kích thước label',
    },
    variant: {
      control: { type: 'select' },
      options: ['default', 'destructive', 'muted'],
      description: 'Kiểu hiển thị',
    },
  },
  args: {
    htmlFor: 'example',
    children: 'Label text',
    className: '',
    required: false,
    disabled: false,
    size: 'default',
    variant: 'default',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Helper function to get label classes
const getLabelClasses = (args: LabelStoryArgs) => {
  const baseClasses = 'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70';
  
  const sizeClasses = {
    sm: 'text-xs',
    default: 'text-sm',
    lg: 'text-base',
  };
  
  const variantClasses = {
    default: 'text-foreground',
    destructive: 'text-destructive',
    muted: 'text-muted-foreground',
  };
  
  const disabledClasses = args.disabled ? 'opacity-50 cursor-not-allowed' : '';
  
  return `${baseClasses} ${sizeClasses[args.size || 'default']} ${variantClasses[args.variant || 'default']} ${disabledClasses} ${args.className || ''}`.trim();
};

export const Default: Story = {
  render: (args) => createElement(Label, {
    htmlFor: args.htmlFor,
    className: getLabelClasses(args),
  }, 
    args.children,
    args.required && createElement('span', { className: 'text-destructive ml-1' }, '*')
  ),
};

// LabelDemo equivalent - Checkbox with Label
export const WithCheckbox: Story = {
  args: {
    htmlFor: 'terms',
    children: 'Accept terms and conditions',
  },
  render: (args) => createElement('div', { className: 'flex items-center space-x-2' },
    createElement(Checkbox, { 
      id: args.htmlFor,
      disabled: args.disabled 
    }),
    createElement(Label, { 
      htmlFor: args.htmlFor,
      className: getLabelClasses(args)
    }, 
      args.children,
      args.required && createElement('span', { className: 'text-destructive ml-1' }, '*')
    )
  ),
};

export const WithInput: Story = {
  args: {
    htmlFor: 'email',
    children: 'Email address',
    required: true,
  },
  render: (args) => createElement('div', { className: 'grid w-full max-w-sm items-center gap-1.5' },
    createElement(Label, { 
      htmlFor: args.htmlFor,
      className: getLabelClasses(args)
    }, 
      args.children,
      args.required && createElement('span', { className: 'text-destructive ml-1' }, '*')
    ),
    createElement(Input, { 
      type: 'email',
      id: args.htmlFor,
      placeholder: 'Enter your email',
      disabled: args.disabled
    })
  ),
};

export const WithRadioGroup: Story = {
  args: {
    children: 'Choose your plan',
    required: true,
  },
  render: (args) => createElement('div', { className: 'space-y-3' },
    createElement(Label, { 
      className: getLabelClasses(args)
    }, 
      args.children,
      args.required && createElement('span', { className: 'text-destructive ml-1' }, '*')
    ),
    createElement(RadioGroup, { 
      defaultValue: 'basic',
      disabled: args.disabled,
      className: 'space-y-2'
    },
      createElement('div', { className: 'flex items-center space-x-2' },
        createElement(RadioGroupItem, { value: 'basic', id: 'basic' }),
        createElement(Label, { htmlFor: 'basic' }, 'Basic Plan')
      ),
      createElement('div', { className: 'flex items-center space-x-2' },
        createElement(RadioGroupItem, { value: 'pro', id: 'pro' }),
        createElement(Label, { htmlFor: 'pro' }, 'Pro Plan')
      ),
      createElement('div', { className: 'flex items-center space-x-2' },
        createElement(RadioGroupItem, { value: 'enterprise', id: 'enterprise' }),
        createElement(Label, { htmlFor: 'enterprise' }, 'Enterprise Plan')
      )
    )
  ),
};

export const WithSwitch: Story = {
  args: {
    htmlFor: 'notifications',
    children: 'Enable notifications',
  },
  render: (args) => createElement('div', { className: 'flex items-center space-x-2' },
    createElement(Switch, { 
      id: args.htmlFor,
      disabled: args.disabled 
    }),
    createElement(Label, { 
      htmlFor: args.htmlFor,
      className: getLabelClasses(args)
    }, 
      args.children,
      args.required && createElement('span', { className: 'text-destructive ml-1' }, '*')
    )
  ),
};

export const Sizes: Story = {
  args: {
    children: 'Label text',
  },
  render: (args) => createElement('div', { className: 'space-y-4' },
    createElement('div', { className: 'space-y-2' },
      createElement(Label, { 
        className: getLabelClasses({ ...args, size: 'sm' })
      }, 'Small Label'),
      createElement(Input, { placeholder: 'Small input', className: 'h-8 text-xs' })
    ),
    createElement('div', { className: 'space-y-2' },
      createElement(Label, { 
        className: getLabelClasses({ ...args, size: 'default' })
      }, 'Default Label'),
      createElement(Input, { placeholder: 'Default input' })
    ),
    createElement('div', { className: 'space-y-2' },
      createElement(Label, { 
        className: getLabelClasses({ ...args, size: 'lg' })
      }, 'Large Label'),
      createElement(Input, { placeholder: 'Large input', className: 'h-12 text-base' })
    )
  ),
};

export const Variants: Story = {
  args: {
    children: 'Label text',
  },
  render: (args) => createElement('div', { className: 'space-y-4' },
    createElement('div', { className: 'space-y-2' },
      createElement(Label, { 
        className: getLabelClasses({ ...args, variant: 'default' })
      }, 'Default Label'),
      createElement(Input, { placeholder: 'Default variant' })
    ),
    createElement('div', { className: 'space-y-2' },
      createElement(Label, { 
        className: getLabelClasses({ ...args, variant: 'destructive' })
      }, 'Error Label'),
      createElement(Input, { placeholder: 'Error state', className: 'border-destructive' })
    ),
    createElement('div', { className: 'space-y-2' },
      createElement(Label, { 
        className: getLabelClasses({ ...args, variant: 'muted' })
      }, 'Muted Label'),
      createElement(Input, { placeholder: 'Muted variant', disabled: true })
    )
  ),
};

export const Required: Story = {
  args: {
    children: 'Required field',
    required: true,
  },
  render: (args) => createElement('div', { className: 'space-y-4' },
    createElement('div', { className: 'space-y-2' },
      createElement(Label, { 
        htmlFor: 'required-input',
        className: getLabelClasses(args)
      }, 
        args.children,
        args.required && createElement('span', { className: 'text-destructive ml-1' }, '*')
      ),
      createElement(Input, { 
        id: 'required-input',
        placeholder: 'This field is required',
        required: true
      })
    ),
    createElement('div', { className: 'flex items-center space-x-2' },
      createElement(Checkbox, { id: 'required-checkbox', required: true }),
      createElement(Label, { 
        htmlFor: 'required-checkbox',
        className: getLabelClasses(args)
      }, 
        'I agree to the terms',
        args.required && createElement('span', { className: 'text-destructive ml-1' }, '*')
      )
    )
  ),
};

export const Disabled: Story = {
  args: {
    children: 'Disabled label',
    disabled: true,
  },
  render: (args) => createElement('div', { className: 'space-y-4' },
    createElement('div', { className: 'space-y-2' },
      createElement(Label, { 
        htmlFor: 'disabled-input',
        className: getLabelClasses(args)
      }, args.children),
      createElement(Input, { 
        id: 'disabled-input',
        placeholder: 'Disabled input',
        disabled: true
      })
    ),
    createElement('div', { className: 'flex items-center space-x-2' },
      createElement(Checkbox, { id: 'disabled-checkbox', disabled: true }),
      createElement(Label, { 
        htmlFor: 'disabled-checkbox',
        className: getLabelClasses(args)
      }, 'Disabled checkbox')
    )
  ),
};

export const FormExample: Story = {
  args: {
    children: 'Contact Form',
  },
  render: (args) => createElement('form', { className: 'space-y-6 w-full max-w-md' },
    createElement('div', { className: 'text-center space-y-2' },
      createElement('h2', { className: 'text-2xl font-bold' }, 'Liên hệ với chúng tôi'),
      createElement('p', { className: 'text-muted-foreground' }, 'Điền thông tin bên dưới để gửi tin nhắn')
    ),
    
    createElement('div', { className: 'space-y-2' },
      createElement(Label, { 
        htmlFor: 'name',
        className: getLabelClasses({ ...args, children: 'Họ và tên', required: true })
      }, 
        'Họ và tên',
        createElement('span', { className: 'text-destructive ml-1' }, '*')
      ),
      createElement(Input, { 
        id: 'name',
        placeholder: 'Nhập họ và tên của bạn',
        required: true
      })
    ),
    
    createElement('div', { className: 'space-y-2' },
      createElement(Label, { 
        htmlFor: 'email-form',
        className: getLabelClasses({ ...args, children: 'Email', required: true })
      }, 
        'Email',
        createElement('span', { className: 'text-destructive ml-1' }, '*')
      ),
      createElement(Input, { 
        id: 'email-form',
        type: 'email',
        placeholder: 'Nhập địa chỉ email',
        required: true
      })
    ),
    
    createElement('div', { className: 'space-y-2' },
      createElement(Label, { 
        htmlFor: 'phone',
        className: getLabelClasses({ ...args, children: 'Số điện thoại' })
      }, 'Số điện thoại'),
      createElement(Input, { 
        id: 'phone',
        type: 'tel',
        placeholder: 'Nhập số điện thoại (tùy chọn)'
      })
    ),
    
    createElement('div', { className: 'space-y-2' },
      createElement(Label, { 
        htmlFor: 'message',
        className: getLabelClasses({ ...args, children: 'Tin nhắn', required: true })
      }, 
        'Tin nhắn',
        createElement('span', { className: 'text-destructive ml-1' }, '*')
      ),
      createElement('textarea', {
        id: 'message',
        placeholder: 'Nhập tin nhắn của bạn...',
        className: 'flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
        required: true
      })
    ),
    
    createElement('div', { className: 'flex items-center space-x-2' },
      createElement(Checkbox, { id: 'newsletter', defaultChecked: true }),
      createElement(Label, { 
        htmlFor: 'newsletter',
        className: 'text-sm font-normal'
      }, 'Đăng ký nhận bản tin qua email')
    ),
    
    createElement('div', { className: 'flex items-center space-x-2' },
      createElement(Checkbox, { id: 'terms-form', required: true }),
      createElement(Label, { 
        htmlFor: 'terms-form',
        className: 'text-sm font-normal'
      }, 
        'Tôi đồng ý với ',
        createElement('a', { 
          href: '#',
          className: 'text-primary hover:underline'
        }, 'điều khoản sử dụng'),
        createElement('span', { className: 'text-destructive ml-1' }, '*')
      )
    ),
    
    createElement(Button, { 
      type: 'submit',
      className: 'w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300'
    }, 'Gửi tin nhắn')
  ),
};

export const AccessibilityExample: Story = {
  args: {
    children: 'Accessibility Features',
  },
  render: (args) => createElement('div', { className: 'space-y-6 w-full max-w-md' },
    createElement('div', { className: 'text-center space-y-2' },
      createElement('h2', { className: 'text-xl font-bold' }, 'Tính năng trợ năng'),
      createElement('p', { className: 'text-sm text-muted-foreground' }, 'Các label được liên kết đúng cách với form controls')
    ),
    
    // Proper label association
    createElement('div', { className: 'space-y-2' },
      createElement(Label, { 
        htmlFor: 'accessible-input',
        className: 'text-sm font-medium'
      }, 'Input có label liên kết'),
      createElement(Input, { 
        id: 'accessible-input',
        placeholder: 'Nhấn Tab để focus',
        'aria-describedby': 'input-description'
      }),
      createElement('p', { 
        id: 'input-description',
        className: 'text-xs text-muted-foreground'
      }, 'Label này được liên kết với input thông qua htmlFor và id')
    ),
    
    // Screen reader friendly
    createElement('fieldset', { className: 'space-y-3 border rounded-md p-4' },
      createElement('legend', { className: 'text-sm font-medium px-2' }, 'Tùy chọn thông báo'),
      
      createElement('div', { className: 'flex items-center space-x-2' },
        createElement(Checkbox, { 
          id: 'email-notifications',
          'aria-describedby': 'email-desc'
        }),
        createElement(Label, { 
          htmlFor: 'email-notifications',
          className: 'text-sm'
        }, 'Thông báo qua email')
      ),
      createElement('p', { 
        id: 'email-desc',
        className: 'text-xs text-muted-foreground ml-6'
      }, 'Nhận thông báo về cập nhật quan trọng qua email'),
      
      createElement('div', { className: 'flex items-center space-x-2' },
        createElement(Checkbox, { 
          id: 'sms-notifications',
          'aria-describedby': 'sms-desc'
        }),
        createElement(Label, { 
          htmlFor: 'sms-notifications',
          className: 'text-sm'
        }, 'Thông báo qua SMS')
      ),
      createElement('p', { 
        id: 'sms-desc',
        className: 'text-xs text-muted-foreground ml-6'
      }, 'Nhận thông báo khẩn cấp qua tin nhắn SMS')
    )
  ),
};