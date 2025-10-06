import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import WeatherTransition from "./WeatherTransition";
import { WeatherType } from "../../weather-engine/types";

const meta: Meta<typeof WeatherTransition> = {
  title: "Game Components/Weather/WeatherTransition",
  component: WeatherTransition,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Weather Transition component provides animated transitions between different weather states with visual effects and progress indicators.",
      },
    },
  },
  argTypes: {
    duration: {
      control: { type: "number", min: 1000, max: 5000, step: 500 },
      description: "Duration of the transition animation in milliseconds",
    },
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "Size of the transition display",
    },
    isVisible: {
      control: "boolean",
      description: "Whether the transition is visible",
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const SunnyToRainy: Story = {
  args: {
    fromWeather: ["Sunny"],
    toWeather: ["Rainy"],
    isVisible: true,
    duration: 2000,
    size: "md",
    onComplete: () => console.log("Transition completed!"),
  },
  parameters: {
    docs: {
      description: {
        story: "Simple transition from sunny to rainy weather.",
      },
    },
  },
};

export const ComplexWeatherChange: Story = {
  args: {
    fromWeather: ["Hot", "Sunny"],
    toWeather: ["Stormy", "Rainy", "Windy"],
    isVisible: true,
    duration: 3000,
    size: "md",
    onComplete: () => console.log("Complex transition completed!"),
  },
  parameters: {
    docs: {
      description: {
        story:
          "Complex transition from multiple hot weather types to stormy conditions.",
      },
    },
  },
};

export const WinterToSpring: Story = {
  args: {
    fromWeather: ["Cold", "Snowy", "Foggy"],
    toWeather: ["Warm", "Cloudy"],
    isVisible: true,
    duration: 2500,
    size: "md",
    onComplete: () => console.log("Seasonal transition completed!"),
  },
  parameters: {
    docs: {
      description: {
        story: "Seasonal transition from winter to spring weather.",
      },
    },
  },
};

export const SmallSize: Story = {
  args: {
    fromWeather: ["Cloudy"],
    toWeather: ["Sunny"],
    isVisible: true,
    duration: 2000,
    size: "sm",
  },
};

export const LargeSize: Story = {
  args: {
    fromWeather: ["Foggy"],
    toWeather: ["Stormy"],
    isVisible: true,
    duration: 2000,
    size: "lg",
  },
};

export const FastTransition: Story = {
  args: {
    fromWeather: ["Windy"],
    toWeather: ["Humid"],
    isVisible: true,
    duration: 1000,
    size: "md",
  },
  parameters: {
    docs: {
      description: {
        story: "Fast transition with shorter duration.",
      },
    },
  },
};

export const SlowTransition: Story = {
  args: {
    fromWeather: ["Cool"],
    toWeather: ["Hot"],
    isVisible: true,
    duration: 4000,
    size: "md",
  },
  parameters: {
    docs: {
      description: {
        story: "Slow transition with longer duration for dramatic effect.",
      },
    },
  },
};

// Interactive story with button to trigger transition
export const Interactive: Story = {
  render: () => {
    const [isVisible, setIsVisible] = useState(false);
    const [fromWeather, setFromWeather] = useState<WeatherType[]>(["Sunny"]);
    const [toWeather, setToWeather] = useState<WeatherType[]>(["Rainy"]);

    const weatherOptions: WeatherType[] = [
      "Sunny",
      "Cloudy",
      "Rainy",
      "Windy",
      "Stormy",
      "Foggy",
      "Snowy",
      "Hot",
      "Cold",
      "Warm",
      "Cool",
      "Humid",
    ];

    const startTransition = () => {
      // Randomize weather for demo
      const randomFrom = [
        weatherOptions[Math.floor(Math.random() * weatherOptions.length)],
      ];
      const randomTo = [
        weatherOptions[Math.floor(Math.random() * weatherOptions.length)],
      ];

      setFromWeather(randomFrom);
      setToWeather(randomTo);
      setIsVisible(true);
    };

    const handleComplete = () => {
      setIsVisible(false);
    };

    return (
      <div className="p-8">
        <div className="text-center mb-8">
          <button
            onClick={startTransition}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            disabled={isVisible}
          >
            {isVisible
              ? "Transition in Progress..."
              : "Start Random Weather Transition"}
          </button>
        </div>

        <div className="text-center text-gray-600 mb-4">
          Current: {fromWeather.join(" + ")} → {toWeather.join(" + ")}
        </div>

        <WeatherTransition
          fromWeather={fromWeather}
          toWeather={toWeather}
          isVisible={isVisible}
          duration={2500}
          size="md"
          onComplete={handleComplete}
        />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "Interactive transition that can be triggered with a button. Click to see random weather transitions.",
      },
    },
  },
};

// Showcase different weather combinations
export const WeatherCombinations: Story = {
  render: () => {
    const [currentTransition, setCurrentTransition] = useState(0);
    const [isVisible, setIsVisible] = useState(false);

    const transitions = [
      { from: ["Sunny"], to: ["Cloudy"], name: "Clear to Overcast" },
      { from: ["Cloudy"], to: ["Rainy"], name: "Overcast to Rain" },
      { from: ["Rainy"], to: ["Stormy"], name: "Rain to Storm" },
      { from: ["Stormy"], to: ["Windy"], name: "Storm to Wind" },
      { from: ["Hot", "Sunny"], to: ["Cool", "Cloudy"], name: "Hot to Cool" },
      {
        from: ["Cold", "Snowy"],
        to: ["Warm", "Sunny"],
        name: "Winter to Spring",
      },
    ];

    const startTransition = (index: number) => {
      setCurrentTransition(index);
      setIsVisible(true);
    };

    const handleComplete = () => {
      setIsVisible(false);
    };

    return (
      <div className="p-8">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {transitions.map((transition, index) => (
            <button
              key={index}
              onClick={() => startTransition(index)}
              disabled={isVisible}
              className="p-4 border rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <div className="font-medium text-sm mb-2">{transition.name}</div>
              <div className="text-xs text-gray-600">
                {transition.from.join("+")} → {transition.to.join("+")}
              </div>
            </button>
          ))}
        </div>

        <WeatherTransition
          fromWeather={transitions[currentTransition].from}
          toWeather={transitions[currentTransition].to}
          isVisible={isVisible}
          duration={2000}
          size="md"
          onComplete={handleComplete}
        />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "Showcase of different weather transition combinations. Click any button to see the transition.",
      },
    },
  },
};
