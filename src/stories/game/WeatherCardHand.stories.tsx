import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import WeatherCardHand from "./WeatherCardHand";
import { WeatherCard as WeatherCardType } from "../../weather-engine/types";

const meta: Meta<typeof WeatherCardHand> = {
  title: "Game Components/Weather/WeatherCardHand",
  component: WeatherCardHand,
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Weather Card Hand component displays a collection of weather cards in various layouts with interactive features.",
      },
    },
  },
  argTypes: {
    size: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "Size of the cards in the hand",
    },
    layout: {
      control: "select",
      options: ["fan", "grid", "row"],
      description: "Layout style for displaying cards",
    },
    interactive: {
      control: "boolean",
      description: "Enable interactive features",
    },
    maxCards: {
      control: { type: "number", min: 1, max: 10 },
      description: "Maximum number of cards to display",
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;
// Sample card collection
const sampleCards: WeatherCardType[] = [
  {
    id: "card-1",
    type: "Weather",
    name: "Blazing Sun",
    description: "Brings intense sunlight to the battlefield.",
    weather: "Sunny",
    cost: 2,
    duration: 3,
  },
  {
    id: "card-2",
    type: "Weather",
    name: "Thunder Storm",
    description: "Unleashes a powerful storm with lightning.",
    weather: "Stormy",
    cost: 4,
    duration: 2,
  },
  {
    id: "card-3",
    type: "BreakWeather",
    name: "Clear Skies",
    description: "Dispels all active weather effects.",
    cost: 1,
  },
  {
    id: "card-4",
    type: "WeatherBuff",
    name: "Lightning Rod",
    description: "Enhances lightning-based attacks.",
    effect: { Lightning: 15 },
    cost: 3,
    duration: 4,
  },
  {
    id: "card-5",
    type: "Weather",
    name: "Blizzard",
    description: "Creates a freezing snowstorm.",
    weather: "Snowy",
    cost: 3,
    duration: 3,
  },
];

export const Default: Story = {
  args: {
    cards: sampleCards,
    size: "md",
    layout: "fan",
    interactive: true,
    maxCards: 7,
  },
};

export const FanLayout: Story = {
  args: {
    cards: sampleCards,
    size: "md",
    layout: "fan",
    interactive: true,
    onCardPlay: (card) => alert(`Playing: ${card.name}`),
    onCardSelect: (card) => console.log("Selected:", card?.name),
  },
};

export const GridLayout: Story = {
  args: {
    cards: sampleCards,
    size: "sm",
    layout: "grid",
    interactive: true,
  },
};

export const RowLayout: Story = {
  args: {
    cards: sampleCards,
    size: "sm",
    layout: "row",
    interactive: true,
  },
};

export const EmptyHand: Story = {
  args: {
    cards: [],
    size: "md",
    layout: "fan",
    interactive: true,
  },
};

export const SingleCard: Story = {
  args: {
    cards: [sampleCards[0]],
    size: "md",
    layout: "fan",
    interactive: true,
  },
};

export const WithDisabledCards: Story = {
  args: {
    cards: sampleCards,
    size: "md",
    layout: "fan",
    interactive: true,
    disabledCardIds: ["card-2", "card-4"],
    selectedCardId: "card-1",
  },
};

export const LargeHand: Story = {
  args: {
    cards: [
      ...sampleCards,
      ...sampleCards.map((card, i) => ({
        ...card,
        id: `${card.id}-copy-${i}`,
      })),
    ],
    size: "sm",
    layout: "fan",
    interactive: true,
    maxCards: 7,
  },
};
