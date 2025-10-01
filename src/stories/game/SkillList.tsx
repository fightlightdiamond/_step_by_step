import React from "react";
import Skill from "./Skill";
import styles from "./SkillList.module.css";

interface HeroSkill {
  id: string;
  name: string;
  img: string;
  desc: string;
  level: number;
  maxLevel: number;
  rarity: "common" | "rare" | "epic" | "legendary";
  unlocked: boolean;
}

interface SkillListProps {
  skills?: HeroSkill[];
  layout?: "grid" | "list" | "masonry";
  columns?: 2 | 3 | 4 | 5 | 6 | 7 | 8;
  animated?: boolean;
  size?: "small" | "medium" | "large" | "xlarge";
  sortBy?: "name" | "rarity" | "level";
  filterBy?: "all" | "unlocked" | "locked" | "maxLevel";
  onSkillClick?: (skill: HeroSkill) => void;
}

// Generate 50 skills với ảnh từ public/images/skills/1.png đến 50.png
const generateSkillsData = (): HeroSkill[] => {
  const skillNames = [
    "Fire Strike",
    "Ice Blast",
    "Lightning Bolt",
    "Heal",
    "Shield",
    "Poison Arrow",
    "Wind Slash",
    "Earth Spike",
    "Water Wave",
    "Dark Magic",
    "Holy Light",
    "Meteor",
    "Blizzard",
    "Thunder Storm",
    "Life Drain",
    "Flame Burst",
    "Frost Nova",
    "Chain Lightning",
    "Divine Protection",
    "Shadow Strike",
    "Tornado",
    "Earthquake",
    "Tsunami",
    "Solar Flare",
    "Lunar Eclipse",
    "Phoenix Rising",
    "Dragon Breath",
    "Serpent Strike",
    "Eagle Eye",
    "Bear Strength",
    "Wolf Pack",
    "Tiger Claw",
    "Shark Bite",
    "Falcon Dive",
    "Rhino Charge",
    "Spider Web",
    "Scorpion Sting",
    "Viper Venom",
    "Cobra Strike",
    "Mantis Slash",
    "Crane Kick",
    "Monkey Flip",
    "Elephant Stomp",
    "Lion Roar",
    "Hawk Swoop",
    "Owl Wisdom",
    "Raven Flight",
    "Bat Swarm",
    "Butterfly Dance",
    "Dragonfly Speed",
  ];

  const skillDescriptions = [
    "Unleashes a powerful flame attack",
    "Freezes enemies with ice magic",
    "Strikes with electric energy",
    "Restores health to allies",
    "Creates protective barrier",
    "Shoots poisoned projectiles",
    "Cuts through air with wind",
    "Pierces with earth spikes",
    "Crashes water waves",
    "Casts dark spells",
    "Illuminates with holy power",
    "Summons falling meteors",
    "Creates freezing storm",
    "Calls down thunder",
    "Drains enemy life force",
    "Explodes with fire",
    "Freezes area instantly",
    "Links lightning strikes",
    "Grants divine shield",
    "Attacks from shadows",
    "Spins destructive winds",
    "Shakes the ground",
    "Floods with massive waves",
    "Burns with sun power",
    "Darkens with moon magic",
    "Resurrects as phoenix",
    "Breathes dragon fire",
    "Strikes like serpent",
    "Sees with eagle vision",
    "Gains bear power",
    "Hunts in wolf pack",
    "Claws like tiger",
    "Bites with shark force",
    "Dives like falcon",
    "Charges with rhino might",
    "Traps in spider web",
    "Stings with scorpion tail",
    "Poisons like viper",
    "Strikes cobra fast",
    "Slashes mantis blade",
    "Kicks with crane leg",
    "Flips monkey style",
    "Stomps elephant heavy",
    "Roars lion loud",
    "Swoops hawk swift",
    "Grants owl knowledge",
    "Flies raven black",
    "Swarms with bats",
    "Dances butterfly grace",
    "Speeds dragonfly quick",
  ];

  const rarities: Array<"common" | "rare" | "epic" | "legendary"> = [
    "common",
    "rare",
    "epic",
    "legendary",
  ];

  return Array.from({ length: 50 }, (_, index) => ({
    id: `skill-${index + 1}`,
    name: skillNames[index],
    img: `/images/skills/${index + 1}.png`,
    desc: skillDescriptions[index],
    level: Math.floor(Math.random() * 5) + 1,
    maxLevel: 5,
    rarity: rarities[Math.floor(Math.random() * rarities.length)],
    unlocked: Math.random() > 0.2,
  }));
};

export default function SkillList({
  skills = generateSkillsData(),
  layout = "grid",
  columns = 3,
  animated = false,
  size = "medium",
  sortBy = "name",
  filterBy = "all",
  onSkillClick,
}: SkillListProps) {
  // Sort skills
  const sortedSkills = [...skills].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name);
      case "rarity":
        const rarityOrder = { common: 1, rare: 2, epic: 3, legendary: 4 };
        return rarityOrder[a.rarity] - rarityOrder[b.rarity];
      case "level":
        return b.level - a.level;
      default:
        return 0;
    }
  });

  // Filter skills
  const filteredSkills = sortedSkills.filter((skill) => {
    switch (filterBy) {
      case "unlocked":
        return skill.unlocked;
      case "locked":
        return !skill.unlocked;
      case "maxLevel":
        return skill.level === skill.maxLevel;
      default:
        return true;
    }
  });

  const getLayoutClasses = () => {
    const baseClasses = `${styles.skillList} ${
      animated ? styles.animated : ""
    }`;

    switch (layout) {
      case "grid":
        return `${baseClasses} ${styles.gridLayout} ${
          styles[`columns${columns}`]
        }`;
      case "list":
        return `${baseClasses} ${styles.listLayout}`;
      case "masonry":
        return `${baseClasses} ${styles.masonryLayout} ${
          styles[`masonryColumns${columns}`]
        }`;
      default:
        return baseClasses;
    }
  };

  return (
    <div className={getLayoutClasses()}>
      {filteredSkills.map((skill) => (
        <Skill
          key={skill.id}
          {...skill}
          animated={animated}
          size={size}
          onClick={() => onSkillClick?.(skill)}
        />
      ))}
    </div>
  );
}

export type { HeroSkill, SkillListProps };
