import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import StatusBar from "./StatusBar";

const meta: Meta<typeof StatusBar> = {
  title: "Game Components/StatusBar",
  component: StatusBar,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Status bar component tối ưu với Tailwind CSS + CSS Module. Tailwind cho layout, colors, typography. CSS Module cho animations, gradients, effects phức tạp.",
      },
    },
  },
  argTypes: {
    type: {
      control: "select",
      options: ["health", "mana", "experience", "energy"],
      description: "Loại status bar, ảnh hưởng đến màu sắc và effects",
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "Kích thước của status bar",
    },
    current: {
      control: { type: "number", min: 0, max: 1000 },
      description: "Giá trị hiện tại",
    },
    max: {
      control: { type: "number", min: 1, max: 1000 },
      description: "Giá trị tối đa",
    },
    animated: {
      control: "boolean",
      description: "Bật/tắt animations và effects",
    },
    showNumbers: {
      control: "boolean",
      description: "Hiển thị số liệu current/max",
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Health: Story = {
  args: {
    label: "Health",
    current: 75,
    max: 100,
    type: "health",
    animated: true,
  },
};

export const Mana: Story = {
  args: {
    label: "Mana",
    current: 120,
    max: 200,
    type: "mana",
    animated: true,
  },
};

export const Experience: Story = {
  args: {
    label: "Experience",
    current: 850,
    max: 1000,
    type: "experience",
    animated: true,
  },
};

export const Energy: Story = {
  args: {
    label: "Energy",
    current: 45,
    max: 100,
    type: "energy",
    animated: true,
  },
};

export const CriticalHealth: Story = {
  args: {
    label: "Health",
    current: 15,
    max: 100,
    type: "health",
    animated: true,
  },
  parameters: {
    docs: {
      description: {
        story: "Health bar ở mức critical (≤20%) sẽ có pulsing warning effect.",
      },
    },
  },
};

export const SmallSize: Story = {
  args: {
    label: "HP",
    current: 80,
    max: 100,
    type: "health",
    size: "sm",
    animated: true,
  },
};

export const LargeSize: Story = {
  args: {
    label: "Experience Points",
    current: 750,
    max: 1000,
    type: "experience",
    size: "lg",
    animated: true,
  },
};

export const WithoutAnimation: Story = {
  args: {
    label: "Static Bar",
    current: 60,
    max: 100,
    type: "mana",
    animated: false,
  },
};

export const WithoutNumbers: Story = {
  args: {
    label: "Progress",
    current: 40,
    max: 100,
    type: "energy",
    showNumbers: false,
    animated: true,
  },
};

// Showcase tất cả types
export const AllTypes: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <StatusBar label="Health" current={75} max={100} type="health" />
      <StatusBar label="Mana" current={120} max={200} type="mana" />
      <StatusBar
        label="Experience"
        current={850}
        max={1000}
        type="experience"
      />
      <StatusBar label="Energy" current={45} max={100} type="energy" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Showcase tất cả các loại status bar với colors và effects khác nhau.",
      },
    },
  },
};

// Showcase tất cả sizes
export const AllSizes: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <StatusBar label="Small" current={75} max={100} type="health" size="sm" />
      <StatusBar
        label="Medium"
        current={75}
        max={100}
        type="health"
        size="md"
      />
      <StatusBar label="Large" current={75} max={100} type="health" size="lg" />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Showcase các kích thước khác nhau của status bar.",
      },
    },
  },
};
