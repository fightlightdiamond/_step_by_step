import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import SkillButton from "./SkillButton";

const meta: Meta<typeof SkillButton> = {
  title: "Game Components/SkillButton",
  component: SkillButton,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    name: {
      control: "text",
      description: "Name of the skill",
    },
    icon: {
      control: "text",
      description: "URL of the skill icon",
    },
    cooldown: {
      control: { type: "number", min: 0, max: 10 },
      description: "Cooldown time remaining",
    },
    disabled: {
      control: "boolean",
      description: "Whether the skill is disabled",
    },
  },
  args: {
    onClick: () => console.log("Skill used!"),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    name: "Fireball",
    icon: "https://cdn-icons-png.flaticon.com/512/785/785116.png",
  },
};

export const OnCooldown: Story = {
  args: {
    name: "Lightning Bolt",
    icon: "https://cdn-icons-png.flaticon.com/512/1684/1684438.png",
    cooldown: 3,
  },
};

export const Disabled: Story = {
  args: {
    name: "Heal",
    icon: "https://cdn-icons-png.flaticon.com/512/2913/2913465.png",
    disabled: true,
  },
};

export const WithoutIcon: Story = {
  args: {
    name: "Basic Attack",
  },
};

export const SkillBar: Story = {
  render: () => (
    <div className="flex gap-2">
      <SkillButton
        name="Fireball"
        icon="https://cdn-icons-png.flaticon.com/512/785/785116.png"
      />
      <SkillButton
        name="Lightning"
        icon="https://cdn-icons-png.flaticon.com/512/1684/1684438.png"
        cooldown={2}
      />
      <SkillButton
        name="Heal"
        icon="https://cdn-icons-png.flaticon.com/512/2913/2913465.png"
        disabled={true}
      />
      <SkillButton
        name="Shield"
        icon="https://cdn-icons-png.flaticon.com/512/929/929430.png"
      />
    </div>
  ),
};
