import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import WeatherUI from "./WeatherUI";
import {
  WeatherState,
  WeatherType,
  ElementType,
} from "../../weather-engine/types";

const meta: Meta<typeof WeatherUI> = {
  title: "Game Components/Weather/WeatherUI",
  component: WeatherUI,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Complete Weather UI component that combines weather display, elemental modifiers, and transitions into a unified interface.",
      },
    },
  },
  argTypes: {
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "Overall size of the weather UI",
    },
    layout: {
      control: "select",
      options: ["compact", "detailed", "sidebar"],
      description: "Layout style of the weather UI",
    },
    animated: {
      control: "boolean",
      description: "Enable animations and transitions",
    },
    interactive: {
      control: "boolean",
      description: "Enable interactive features",
    },
    showTransitions: {
      control: "boolean",
      description: "Show weather change transitions",
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;
const sampleWeatherState: WeatherState = {
  currentWeather: ["Sunny", "Warm"],
  turn: 5,
  month: 6,
  season: "Summer",
  activeCards: [
    {
      id: "card-1",
      type: "Weather",
      name: "Heat Wave",
      description: "Increases fire damage",
      weather: "Hot",
      duration: 3,
    },
  ],
};

const sampleModifiers: Record<ElementType, number> = {
  Fire: 25,
  Ice: -15,
  Lightning: 10,
};

export const Default: Story = {
  args: {
    weatherState: sampleWeatherState,
    elementalModifiers: sampleModifiers,
    size: "md",
    layout: "detailed",
    animated: true,
    interactive: false,
    showTransitions: true,
  },
};

export const CompactLayout: Story = {
  args: {
    weatherState: sampleWeatherState,
    elementalModifiers: sampleModifiers,
    size: "md",
    layout: "compact",
    animated: true,
    interactive: false,
    showTransitions: true,
  },
};

export const SidebarLayout: Story = {
  args: {
    weatherState: sampleWeatherState,
    elementalModifiers: sampleModifiers,
    size: "sm",
    layout: "sidebar",
    animated: true,
    interactive: false,
    showTransitions: true,
  },
};

export const Interactive: Story = {
  args: {
    weatherState: sampleWeatherState,
    elementalModifiers: sampleModifiers,
    size: "md",
    layout: "detailed",
    animated: true,
    interactive: true,
    showTransitions: true,
    onWeatherChange: (weather: WeatherType[]) => {
      console.log("Weather changed to:", weather);
    },
    onElementClick: (element: ElementType) => {
      console.log("Element clicked:", element);
    },
  },
};
