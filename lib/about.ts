import { contentDir, list, readMdxFile, text } from './content';

/**
 * About-page content from `content/about.mdx`, bind-mount editable. `icon` is a
 * stable key, so this stays presentation-free; AboutClient maps it to JSX.
 */
export type SkillIcon = 'ops' | 'network' | 'data' | 'business';

export interface SkillGroup {
  name: string;
  icon: SkillIcon;
  items: string[];
}

export type InterestIcon =
  'server' | 'bot' | 'gamepad' | 'camera' | 'wrench' | 'sprout';

export interface Interest {
  name: string;
  icon: InterestIcon;
  blurb: string;
}

export interface About {
  skills: SkillGroup[];
  interests: Interest[];
  skillsHeading: string;
  skillsBlurb: string;
  interestsHeading: string;
  interestsBlurb: string;
  /** Falls back to the caller's name-derived line. */
  description: string;
  /** MDX body: the bio paragraphs. */
  content: string;
}

/** Returns default content if `content/about.mdx` is missing or unparseable. */
export function getAbout(fallbackDescription: string): About {
  const file = readMdxFile(contentDir(), 'about');
  const data = file?.data ?? {};
  return {
    skills: list<SkillGroup>(data.skills),
    interests: list<Interest>(data.interests),
    skillsHeading: text(data.skillsHeading, 'Skills'),
    skillsBlurb: text(data.skillsBlurb, 'The tools I use most.'),
    interestsHeading: text(data.interestsHeading, 'Interests'),
    interestsBlurb: text(data.interestsBlurb, 'What I do outside work.'),
    description: text(data.description, fallbackDescription),
    content: file?.content ?? '',
  };
}
