import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import WeatherDisplay from "./WeatherDisplay";
import {
  WeatherState,
  WeatherType,
  ElementType,
} from "../../weather-engine/types";

const meta: Meta<typeof WeatherDisplay> = {
  title: "Game Components/Weather/WeatherDisplay",
  component: WeatherDisplay,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Weather Display component shows current weather conditions, elemental modifiers, and active weather cards. Features smooth animations and responsive design.",
      },
    },
  },
  argTypes: {
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "Size of the weather display",
    },
    showDetails: {
      control: "boolean",
      description: "Show detailed elemental modifiers and active cards",
    },
    animated: {
      control: "boolean",
      description: "Enable animations and transitions",
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Sample weather states
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
    {
      id: "card-2",
      type: "WeatherBuff",
      name: "Lightning Rod",
      description: "Boosts lightning effects",
      effect: { Lightning: 15 },
      duration: 2,
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
    showDetails: true,
    animated: true,
  },
};

export const NoWeather: Story = {
  args: {
    weatherState: {
      currentWeather: [],
      turn: 1,
      month: 1,
      season: "Winter",
      activeCards: [],
    },
    elementalModifiers: {
      Fire: 0,
      Ice: 0,
      Lightning: 0,
    },
    size: "md",
    showDetails: true,
    animated: true,
  },
  parameters: {
    docs: {
      description: {
        story: "Weather display when no weather is active.",
      },
    },
  },
};

export const StormyWeather: Story = {
  args: {
    weatherState: {
      currentWeather: ["Stormy", "Rainy", "Windy"],
      turn: 8,
      month: 10,
      season: "Autumn",
      activeCards: [
        {
          id: "storm-card",
          type: "Weather",
          name: "Thunder Storm",
          description: "Massive lightning boost",
          weather: "Stormy",
          duration: 5,
        },
      ],
    },
    elementalModifiers: {
      Fire: -30,
      Ice: 5,
      Lightning: 35,
    },
    size: "md",
    showDetails: true,
    animated: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Complex weather with multiple types and strong elemental effects.",
      },
    },
  },
};

export const WinterScene: Story = {
  args: {
    weatherState: {
      currentWeather: ["Snowy", "Cold", "Foggy"],
      turn: 12,
      month: 12,
      season: "Winter",
      activeCards: [
        {
          id: "blizzard",
          type: "Weather",
          name: "Blizzard",
          description: "Extreme cold conditions",
          weather: "Snowy",
          duration: 4,
        },
        {
          id: "frost",
          type: "WeatherBuff",
          name: "Frost Armor",
          description: "Ice damage amplification",
          effect: { Ice: 20 },
          duration: 6,
        },
      ],
    },
    elementalModifiers: {
      Fire: -25,
      Ice: 30,
      Lightning: -10,
    },
    size: "md",
    showDetails: true,
    animated: true,
  },
  parameters: {
    docs: {
      description: {
        story: "Winter weather scene with ice-focused effects.",
      },
    },
  },
};

export const SmallSize: Story = {
  args: {
    weatherState: {
      currentWeather: ["Sunny"],
      turn: 3,
      month: 5,
      season: "Spring",
      activeCards: [],
    },
    elementalModifiers: {
      Fire: 15,
      Ice: -5,
      Lightning: 0,
    },
    size: "sm",
    showDetails: true,
    animated: true,
  },
};

export const LargeSize: Story = {
  args: {
    weatherState: sampleWeatherState,
    elementalModifiers: sampleModifiers,
    size: "lg",
    showDetails: true,
    animated: true,
  },
};

export const MinimalView: Story = {
  args: {
    weatherState: sampleWeatherState,
    elementalModifiers: sampleModifiers,
    size: "md",
    showDetails: false,
    animated: true,
  },
  parameters: {
    docs: {
      description: {
        story: "Minimal view showing only current weather without details.",
      },
    },
  },
};

export const WithoutAnimation: Story = {
  args: {
    weatherState: sampleWeatherState,
    elementalModifiers: sampleModifiers,
    size: "md",
    showDetails: true,
    animated: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Weather display without animations for performance-sensitive scenarios.",
      },
    },
  },
};

// Showcase all seasons
export const AllSeasons: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4">
      <WeatherDisplay
        weatherState={{
          currentWeather: ["Warm", "Sunny"],
          turn: 3,
          month: 3,
          season: "Spring",
          activeCards: [],
        }}
        elementalModifiers={{ Fire: 10, Ice: -5, Lightning: 5 }}
        size="sm"
        showDetails={false}
      />
      <WeatherDisplay
        weatherState={{
          currentWeather: ["Hot", "Humid"],
          turn: 6,
          month: 6,
          season: "Summer",
          activeCards: [],
        }}
        elementalModifiers={{ Fire: 25, Ice: -20, Lightning: 0 }}
        size="sm"
        showDetails={false}
      />
      <WeatherDisplay
        weatherState={{
          currentWeather: ["Cool", "Windy"],
          turn: 9,
          month: 9,
          season: "Autumn",
          activeCards: [],
        }}
        elementalModifiers={{ Fire: -5, Ice: 10, Lightning: 15 }}
        size="sm"
        showDetails={false}
      />
      <WeatherDisplay
        weatherState={{
          currentWeather: ["Cold", "Snowy"],
          turn: 12,
          month: 12,
          season: "Winter",
          activeCards: [],
        }}
        elementalModifiers={{ Fire: -30, Ice: 35, Lightning: -10 }}
        size="sm"
        showDetails={false}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "Showcase of weather display across all four seasons.",
      },
    },
  },
};
