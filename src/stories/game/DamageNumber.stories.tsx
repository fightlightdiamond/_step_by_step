import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import DamageNumber from "./DamageNumber";

const meta: Meta<typeof DamageNumber> = {
  title: "Game Components/DamageNumber",
  component: DamageNumber,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Damage number component tối ưu với Tailwind CSS + CSS Module. Tailwind cho colors, typography, layout cơ bản. CSS Module cho damage animations, critical effects, floating effects phức tạp.",
      },
    },
  },
  argTypes: {
    damage: {
      control: { type: "number", min: 1, max: 9999 },
      description: "Damage amount to display",
    },
    type: {
      control: "select",
      options: ["physical", "magical", "true", "heal"],
      description: "Type of damage/heal",
    },
    critical: {
      control: "boolean",
      description: "Show critical hit effects",
    },
    animated: {
      control: "boolean",
      description: "Enable animations",
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg", "xl"],
      description: "Size of the damage number",
    },
    floating: {
      control: "boolean",
      description: "Enable floating animation",
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const PhysicalDamage: Story = {
  args: {
    damage: 150,
    type: "physical",
    animated: true,
  },
};

export const MagicalDamage: Story = {
  args: {
    damage: 200,
    type: "magical",
    animated: true,
  },
};

export const TrueDamage: Story = {
  args: {
    damage: 300,
    type: "true",
    animated: true,
  },
};

export const Healing: Story = {
  args: {
    damage: 75,
    type: "heal",
    animated: true,
  },
};

export const CriticalHit: Story = {
  args: {
    damage: 450,
    type: "physical",
    critical: true,
    animated: true,
  },
};

export const FloatingDamage: Story = {
  args: {
    damage: 250,
    type: "magical",
    animated: true,
    floating: true,
  },
};

export const LargeCritical: Story = {
  args: {
    damage: 999,
    type: "true",
    critical: true,
    animated: true,
    size: "xl",
  },
};

export const AllTypes: Story = {
  render: () => (
    <div className="flex gap-6 flex-wrap items-center">
      <DamageNumber damage={120} type="physical" animated />
      <DamageNumber damage={180} type="magical" animated />
      <DamageNumber damage={250} type="true" animated />
      <DamageNumber damage={85} type="heal" animated />
      <DamageNumber damage={350} type="physical" critical animated />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Showcase tất cả các loại damage với effects khác nhau.",
      },
    },
  },
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex gap-6 items-center">
      <DamageNumber damage={100} size="sm" animated />
      <DamageNumber damage={200} size="md" animated />
      <DamageNumber damage={300} size="lg" animated />
      <DamageNumber damage={500} size="xl" critical animated />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Showcase các kích thước khác nhau của damage numbers.",
      },
    },
  },
};
