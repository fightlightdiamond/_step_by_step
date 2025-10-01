import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { createElement } from 'react';

const meta: Meta<typeof AlertDialog> = {
  title: 'Shadcn UI/AlertDialog',
  component: AlertDialog,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    open: {
      control: { type: 'boolean' },
      description: 'Controls the open state of the dialog',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => createElement(AlertDialog, null,
    createElement(AlertDialogTrigger, { 
      className: "inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2" 
    }, "Open Dialog"),
    createElement(AlertDialogContent, null,
      createElement(AlertDialogHeader, null,
        createElement(AlertDialogTitle, null, "Are you absolutely sure?"),
        createElement(AlertDialogDescription, null, "This action cannot be undone. This will permanently delete your account and remove your data from our servers.")
      ),
      createElement(AlertDialogFooter, null,
        createElement(AlertDialogCancel, null, "Từ Chối"),
        createElement(AlertDialogAction, null, "Tiếp tục")
      )
    )
  ),
};

export const DeleteConfirmation: Story = {
  render: () => createElement(AlertDialog, null,
    createElement(AlertDialogTrigger, { 
      className: "inline-flex items-center justify-center rounded-md text-sm font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90 h-10 px-4 py-2" 
    }, "Delete Item"),
    createElement(AlertDialogContent, null,
      createElement(AlertDialogHeader, null,
        createElement(AlertDialogTitle, null, "Dele Item"),
        createElement(AlertDialogDescription, null, "Bạn có chắc chắn muốn xóa mục này không? Hành động này không thể hoàn tác.")
      ),
      createElement(AlertDialogFooter, null,
        createElement(AlertDialogCancel, null, "Từ Chối"),
        createElement(AlertDialogAction, { 
          className: "bg-destructive text-destructive-foreground hover:bg-destructive/90" 
        }, "Xóa")
      )
    )
  ),
};

export const BlueBackground: Story = {
  render: () => createElement(AlertDialog, null,
    createElement(AlertDialogTrigger, { 
      className: "inline-flex items-center justify-center rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2" 
    }, "Blue Theme"),
    createElement(AlertDialogContent, {
      className: "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800"
    },
      createElement(AlertDialogHeader, null,
        createElement(AlertDialogTitle, { className: "text-blue-900 dark:text-blue-100" }, "Blue Theme Dialog"),
        createElement(AlertDialogDescription, { className: "text-blue-700 dark:text-blue-300" }, "This dialog has a custom blue background theme.")
      ),
      createElement(AlertDialogFooter, null,
        createElement(AlertDialogCancel, { className: "border-blue-300 text-blue-700 hover:bg-blue-100" }, "Từ Chối"),
        createElement(AlertDialogAction, { className: "bg-blue-600 text-white hover:bg-blue-700" }, "Tiếp Tục")
      )
    )
  ),
};

export const GreenBackground: Story = {
  render: () => createElement(AlertDialog, null,
    createElement(AlertDialogTrigger, { 
      className: "inline-flex items-center justify-center rounded-md text-sm font-medium bg-green-600 text-white hover:bg-green-700 h-10 px-4 py-2" 
    }, "Green Theme"),
    createElement(AlertDialogContent, {
      className: "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800"
    },
      createElement(AlertDialogHeader, null,
        createElement(AlertDialogTitle, { className: "text-green-900 dark:text-green-100" }, "Success Confirmation"),
        createElement(AlertDialogDescription, { className: "text-green-700 dark:text-green-300" }, "Thay đổi của bạn đã được lưu thành công. Bạn có muốn tiếp tục không?")
      ),
      createElement(AlertDialogFooter, null,
        createElement(AlertDialogCancel, { className: "border-green-300 text-green-700 hover:bg-green-100" }, "Từ Chối"),
        createElement(AlertDialogAction, { className: "bg-green-600 text-white hover:bg-green-700" }, "Tiếp Tục")
      )
    )
  ),
};

export const PurpleGradient: Story = {
  render: () => createElement(AlertDialog, null,
    createElement(AlertDialogTrigger, { 
      className: "inline-flex items-center justify-center rounded-md text-sm font-medium bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 h-10 px-4 py-2" 
    }, "Gradient Theme"),
    createElement(AlertDialogContent, {
      className: "bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 dark:from-purple-950 dark:via-pink-950 dark:to-purple-950 border-purple-200 dark:border-purple-800"
    },
      createElement(AlertDialogHeader, null,
        createElement(AlertDialogTitle, { className: "text-purple-900 dark:text-purple-100" }, "Tính Năng Premium"),
        createElement(AlertDialogDescription, { className: "text-purple-700 dark:text-purple-300" }, "Đây là tính năng premium. Bạn có muốn nâng cấp tài khoản của mình không?")
      ),
      createElement(AlertDialogFooter, null,
        createElement(AlertDialogCancel, { className: "border-purple-300 text-purple-700 hover:bg-purple-100" }, "Maybe Later"),
        createElement(AlertDialogAction, { className: "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700" }, "Upgrade Now")
      )
    )
  ),
};

export const DarkTheme: Story = {
  render: () => createElement(AlertDialog, null,
    createElement(AlertDialogTrigger, { 
      className: "inline-flex items-center justify-center rounded-md text-sm font-medium bg-gray-800 text-white hover:bg-gray-900 h-10 px-4 py-2" 
    }, "Dark Theme"),
    createElement(AlertDialogContent, {
      className: "bg-gray-900 text-white border-gray-700"
    },
      createElement(AlertDialogHeader, null,
        createElement(AlertDialogTitle, { className: "text-white" }, "Dark Mode Dialog"),
        createElement(AlertDialogDescription, { className: "text-gray-300" }, "This dialog uses a dark theme with custom styling.")
      ),
      createElement(AlertDialogFooter, null,
        createElement(AlertDialogCancel, { className: "bg-gray-700 text-white border-gray-600 hover:bg-gray-600" }, "Từ Chối"),
        createElement(AlertDialogAction, { className: "bg-white text-gray-900 hover:bg-gray-100" }, "Tiếp Tục")
      )
    )
  ),
};

export const WarningRed: Story = {
  render: () => createElement(AlertDialog, null,
    createElement(AlertDialogTrigger, { 
      className: "inline-flex items-center justify-center rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-700 h-10 px-4 py-2" 
    }, "Warning"),
    createElement(AlertDialogContent, {
      className: "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800"
    },
      createElement(AlertDialogHeader, null,
        createElement(AlertDialogTitle, { className: "text-red-900 dark:text-red-100" }, "⚠️ Cảnh Báo"),
        createElement(AlertDialogDescription, { className: "text-red-700 dark:text-red-300" }, "Hành động này có thể gây ra những hậu quả không mong muốn. Bạn có chắc chắn muốn tiếp tục không?")
      ),
      createElement(AlertDialogFooter, null,
        createElement(AlertDialogCancel, { className: "border-red-300 text-red-700 hover:bg-red-100" }, "Từ Chối"),
        createElement(AlertDialogAction, { className: "bg-red-600 text-white hover:bg-red-700" }, "Chấp Nhận")
      )
    )
  ),
};