import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import GameCard from "./GameCard";

const meta: Meta<typeof GameCard> = {
  title: "Game Components/GameCard",
  component: GameCard,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Game card component tối ưu với Tailwind CSS + CSS Module. Sử dụng Tailwind cho layout, spacing, colors cơ bản và CSS Module cho effects, animations phức tạp.",
      },
    },
  },
  argTypes: {
    rarity: {
      control: "select",
      options: ["common", "rare", "epic", "legendary"],
      description: "Độ hiếm của card, ảnh hưởng đến màu sắc và effects",
    },
    level: {
      control: { type: "number", min: 1, max: 100 },
      description: "Level của card",
    },
    isActive: {
      control: "boolean",
      description: "Trạng thái active với glow effect",
    },
    isHovered: {
      control: "boolean",
      description: "Trạng thái hover với lift effect",
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Common: Story = {
  args: {
    title: "Fire Spell",
    level: 5,
    rarity: "common",
    image: "https://via.placeholder.com/150x120/ff6b6b/ffffff?text=🔥",
  },
};

export const Rare: Story = {
  args: {
    title: "Ice Storm",
    level: 15,
    rarity: "rare",
    image: "https://via.placeholder.com/150x120/4ecdc4/ffffff?text=❄️",
  },
};

export const Epic: Story = {
  args: {
    title: "Lightning Strike",
    level: 35,
    rarity: "epic",
    image: "https://via.placeholder.com/150x120/9b59b6/ffffff?text=⚡",
  },
};

export const Legendary: Story = {
  args: {
    title: "Dragon Breath",
    level: 50,
    rarity: "legendary",
    image: "https://via.placeholder.com/150x120/f39c12/ffffff?text=🐉",
  },
};

export const Active: Story = {
  args: {
    title: "Active Spell",
    level: 25,
    rarity: "epic",
    isActive: true,
    image: "https://via.placeholder.com/150x120/e74c3c/ffffff?text=✨",
  },
};

export const Hovered: Story = {
  args: {
    title: "Hovered Card",
    level: 20,
    rarity: "rare",
    isHovered: true,
    image: "https://via.placeholder.com/150x120/3498db/ffffff?text=👆",
  },
};

export const NoImage: Story = {
  args: {
    title: "Mystery Card",
    level: 10,
    rarity: "common",
  },
};

// Interactive playground
export const Playground: Story = {
  args: {
    title: "Custom Card",
    level: 25,
    rarity: "epic",
    isActive: false,
    isHovered: false,
    image: "https://via.placeholder.com/150x120/8e44ad/ffffff?text=🎮",
  },
};

// All rarities showcase
export const AllRarities: Story = {
  render: () => (
    <div className="flex gap-4 flex-wrap">
      <GameCard title="Common Card" level={5} rarity="common" />
      <GameCard title="Rare Card" level={15} rarity="rare" />
      <GameCard title="Epic Card" level={35} rarity="epic" />
      <GameCard title="Legendary Card" level={50} rarity="legendary" isActive />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Showcase tất cả các rarity với effects khác nhau. Legendary card có shine animation đặc biệt.",
      },
    },
  },
};
