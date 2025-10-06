import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import WeatherCard from "./WeatherCard";
import { WeatherCard as WeatherCardType } from "../../weather-engine/types";

const meta: Meta<typeof WeatherCard> = {
  title: "Game Components/Weather/WeatherCard",
  component: WeatherCard,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Weather Card component displays individual weather cards with interactive features, visual effects, and detailed information.",
      },
    },
  },
  argTypes: {
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "Size of the weather card",
    },
    interactive: {
      control: "boolean",
      description: "Enable interactive features like hover and click",
    },
    disabled: {
      control: "boolean",
      description: "Disable the card (cannot be played)",
    },
    selected: {
      control: "boolean",
      description: "Show the card as selected",
    },
    showDetails: {
      control: "boolean",
      description: "Show detailed card information",
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;
// Sample cards
const sunnyCard: WeatherCardType = {
  id: "sunny-1",
  type: "Weather",
  name: "Blazing Sun",
  description:
    "Brings intense sunlight to the battlefield, boosting fire damage significantly.",
  weather: "Sunny",
  cost: 2,
  duration: 3,
};

const stormCard: WeatherCardType = {
  id: "storm-1",
  type: "Weather",
  name: "Thunder Storm",
  description:
    "Unleashes a powerful storm with lightning and rain, affecting multiple elements.",
  weather: "Stormy",
  cost: 4,
  duration: 2,
};

const breakCard: WeatherCardType = {
  id: "break-1",
  type: "BreakWeather",
  name: "Clear Skies",
  description:
    "Dispels all active weather effects, returning the battlefield to neutral conditions.",
  cost: 1,
};

const buffCard: WeatherCardType = {
  id: "buff-1",
  type: "WeatherBuff",
  name: "Lightning Rod",
  description: "Enhances lightning-based attacks for a short duration.",
  effect: { Lightning: 15 },
  cost: 3,
  duration: 4,
};

const nerfCard: WeatherCardType = {
  id: "nerf-1",
  type: "WeatherNerf",
  name: "Dampening Field",
  description: "Reduces fire damage output from all sources.",
  effect: { Fire: -20 },
  cost: 2,
  duration: 3,
};

export const Default: Story = {
  args: {
    card: sunnyCard,
    size: "md",
    interactive: false,
    disabled: false,
    selected: false,
    showDetails: true,
  },
};

export const Interactive: Story = {
  args: {
    card: sunnyCard,
    size: "md",
    interactive: true,
    disabled: false,
    selected: false,
    showDetails: true,
    onPlay: (card) => alert(`Playing card: ${card.name}`),
    onHover: (card) => console.log("Hovering:", card?.name),
  },
};

export const Selected: Story = {
  args: {
    card: sunnyCard,
    size: "md",
    interactive: true,
    disabled: false,
    selected: true,
    showDetails: true,
  },
};

export const Disabled: Story = {
  args: {
    card: sunnyCard,
    size: "md",
    interactive: true,
    disabled: true,
    selected: false,
    showDetails: true,
  },
};

export const StormCard: Story = {
  args: {
    card: stormCard,
    size: "md",
    interactive: true,
    showDetails: true,
  },
};

export const BreakWeatherCard: Story = {
  args: {
    card: breakCard,
    size: "md",
    interactive: true,
    showDetails: true,
  },
};

export const BuffCard: Story = {
  args: {
    card: buffCard,
    size: "md",
    interactive: true,
    showDetails: true,
  },
};

export const NerfCard: Story = {
  args: {
    card: nerfCard,
    size: "md",
    interactive: true,
    showDetails: true,
  },
};
