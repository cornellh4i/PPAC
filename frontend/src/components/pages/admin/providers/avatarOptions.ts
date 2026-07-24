import femalePractIcon from "../../../../assets/icons/female_pract.png";
import malePractIcon from "../../../../assets/icons/male_pract.png";

export type Avatar = "female" | "male";

export const AVATAR_OPTIONS: { value: Avatar; label: string; icon: string }[] = [
  { value: "female", label: "Female", icon: femalePractIcon },
  { value: "male", label: "Male", icon: malePractIcon },
];

export const getAvatarIcon = (avatar?: Avatar): string | undefined =>
  AVATAR_OPTIONS.find((option) => option.value === avatar)?.icon;
