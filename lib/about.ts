/**
 * About-page content. `icon` is a stable key (not JSX) so this stays
 * presentation-free; AboutClient maps the key to a lucide icon.
 */
export type SkillIcon = 'frontend' | 'backend' | 'database' | 'tools';

export interface SkillGroup {
  name: string;
  icon: SkillIcon;
  items: string[];
}

export const skills: SkillGroup[] = [
  {
    name: 'Cloud & Infrastructure',
    icon: 'backend',
    items: [
      'Microsoft 365',
      'Google Workspace',
      'Windows/Linux Server',
      'Hyper-V',
      'Docker',
      'Veeam',
      'Intune',
      'Jamf',
      'Mosyle',
      'Okta',
      'Cisco Duo',
      'Cloudflare',
    ],
  },
  {
    name: 'Network & Security',
    icon: 'database',
    items: [
      'Cisco Meraki',
      'Fortigate',
      'SonicWall',
      'UniFi',
      'VPNs',
      'CJIS Compliance',
    ],
  },
  {
    name: 'Data & Automation',
    icon: 'tools',
    items: [
      'SQL',
      'Data Analysis',
      'PowerShell',
      'BASH',
      'Azure DevOps',
      'Git',
      'AI Platforms & Agentic Workflows',
    ],
  },
  {
    name: 'Business Operations',
    icon: 'frontend',
    items: [
      'Salesforce',
      'HubSpot',
      'Zammad',
      'Agile',
      'Project Leadership',
      'Inventory Management',
    ],
  },
];
