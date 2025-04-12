import React from "react";
import SkillTag from "./SkillTag";

interface Skill {
  id: number;
  name: string;
  category?: string;
}

interface SkillsListProps {
  skills: Skill[];
  variant?: "primary" | "secondary" | "neutral";
  className?: string;
  limit?: number;
}

const SkillsList: React.FC<SkillsListProps> = ({ 
  skills, 
  variant = "primary", 
  className = "", 
  limit
}) => {
  const displaySkills = limit ? skills.slice(0, limit) : skills;
  const hasMore = limit && skills.length > limit;
  
  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {displaySkills.map((skill) => (
        <SkillTag key={skill.id} name={skill.name} variant={variant} />
      ))}
      {hasMore && (
        <SkillTag name={`+${skills.length - limit!} more`} variant="neutral" />
      )}
    </div>
  );
};

export default SkillsList;
