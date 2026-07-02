export interface App {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  isPremium: boolean;
  icon: string;
  isInstalled: boolean;
  features: string[];
  downloads: string;
  rating: number;
  version: string;
  size: string;
}

export interface Category {
  id: string;
  name: string;
  count: number;
}

export interface AppStats {
  totalApps: number;
  installedApps: number;
  freeApps: number;
  premiumApps: number;
}

const MOCK_APPS: App[] = [
  {
    id: '1',
    name: 'DevTerminal Pro',
    category: 'Utilities',
    description: 'Advanced terminal emulator with SSH, Telnet, and raw socket support.',
    price: 0,
    isPremium: false,
    icon: 'terminal',
    isInstalled: false,
    features: ['SSH', 'Zsh Support', 'Custom Themes'],
    downloads: '10k+',
    rating: 4.8,
    version: '2.1.0',
    size: '15MB'
  },
  {
    id: '2',
    name: 'CloudManager',
    category: 'DevOps',
    description: 'Manage your cloud infrastructure across multiple providers in one place.',
    price: 19.99,
    isPremium: true,
    icon: 'cloud',
    isInstalled: false,
    features: ['Multi-cloud', 'Resource Scaling', 'Cost Analysis'],
    downloads: '5k+',
    rating: 4.9,
    version: '1.0.4',
    size: '42MB'
  },
  {
    id: '3',
    name: 'CodeSniffer',
    category: 'Optimization',
    description: 'Static code analysis tool to find bottlenecks and security vulnerabilities.',
    price: 0,
    isPremium: false,
    icon: 'search',
    isInstalled: true,
    features: ['Security Audit', 'Performance Tips', 'Refactoring'],
    downloads: '25k+',
    rating: 4.7,
    version: '3.2.1',
    size: '12MB'
  }
];

const appService = {
  getApps: async (): Promise<App[]> => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => resolve(MOCK_APPS), 500);
    });
  },

  getStats: async (): Promise<AppStats> => {
    return {
      totalApps: MOCK_APPS.length,
      installedApps: MOCK_APPS.filter(app => app.isInstalled).length,
      freeApps: MOCK_APPS.filter(app => !app.isPremium).length,
      premiumApps: MOCK_APPS.filter(app => app.isPremium).length,
    };
  },

  getCategories: async (): Promise<Category[]> => {
    const categories = ['Utilities', 'DevOps', 'Optimization', 'Security', 'Database'];
    return categories.map(cat => ({
      id: cat.toLowerCase(),
      name: cat,
      count: MOCK_APPS.filter(app => app.category === cat).length
    }));
  },

  installApp: async (appId: string): Promise<boolean> => {
    console.log(`Installing app ${appId}...`);
    return true;
  }
};

export default appService;