export type Language = 'en' | 'hi' | 'mr';

export interface LanguageContent {
  header: {
    brand: string;
    features: string;
    options: string;
    about: string;
    getStarted: string;
  };
  hero: {
    title: string;
    subtitle: string;
    description: string;
    startInvesting: string;
    learnMore: string;
    secureRegulated: string;
    secureDesc: string;
    expertGuidance: string;
    expertDesc: string;
    lowFees: string;
    lowFeesDesc: string;
  };
  features: {
    title: string;
    description: string;
    calculator: {
      title: string;
      description: string;
    };
    portfolio: {
      title: string;
      description: string;
    };
    education: {
      title: string;
      description: string;
    };
    research: {
      title: string;
      description: string;
    };
    risk: {
      title: string;
      description: string;
    };
    execution: {
      title: string;
      description: string;
    };
  };
  investmentOptions: {
    title: string;
    description: string;
    stocks: {
      title: string;
      description: string;
      minInvestment: string;
      riskLevel: string;
    };
    bonds: {
      title: string;
      description: string;
      minInvestment: string;
      riskLevel: string;
    };
    mutualFunds: {
      title: string;
      description: string;
      minInvestment: string;
      riskLevel: string;
    };
    indexFunds: {
      title: string;
      description: string;
      minInvestment: string;
      riskLevel: string;
    };
    learnMore: string;
    minInvestmentLabel: string;
    riskLevelLabel: string;
  };
  about: {
    title: string;
    description: string;
    activeInvestors: string;
    assetsUnderManagement: string;
    averageFee: string;
    userRating: string;
    startJourney: string;
    communityFocused: {
      title: string;
      description: string;
    };
    awardWinning: {
      title: string;
      description: string;
    };
    goalOriented: {
      title: string;
      description: string;
    };
    transparent: {
      title: string;
      description: string;
    };
  };
  footer: {
    description: string;
    platform: string;
    investmentOptions: string;
    portfolioTools: string;
    research: string;
    education: string;
    support: string;
    helpCenter: string;
    contact: string;
    privacy: string;
    terms: string;
    copyright: string;
  };
  chatbot: {
    title: string;
    status: string;
    placeholder: string;
    buttonText: string;
    welcomeMessage: string;
    responses: string[];
  };
}