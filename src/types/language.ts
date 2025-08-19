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
    subtitle: string;
    status: string;
    placeholder: string;
    buttonText: string;
    welcomeMessage: string;
    responses: string[];
  };
  login: {
    title: string;
    subtitle: string;
    emailLabel: string;
    emailPlaceholder: string;
    passwordLabel: string;
    passwordPlaceholder: string;
    rememberMe: string;
    forgotPassword: string;
    signInButton: string;
    noAccount: string;
    signUpLink: string;
  };
  contact: {
    title: string;
    subtitle: string;
    contactInfo: string;
    officeAddress: string;
    email: string;
    businessHours: string;
    hours: string;
    sendMessage: string;
    name: string;
    namePlaceholder: string;
    emailLabel: string;
    emailPlaceholder: string;
    subject: string;
    subjectPlaceholder: string;
    message: string;
    messagePlaceholder: string;
    sendButton: string;
    sending: string;
  };
  ourStory: {
    title: string;
    subtitle: string;
    missionTitle: string;
    missionText: string;
    missionText2: string;
    missionCardTitle: string;
    missionCardText: string;
    journeyTitle: string;
    journeySubtitle: string;
    year2020Title: string;
    year2020Text: string;
    year2021Title: string;
    year2021Text: string;
    year2022Title: string;
    year2022Text: string;
    year2023Title: string;
    year2023Text: string;
    year2024Title: string;
    year2024Text: string;
    valuesTitle: string;
    valuesSubtitle: string;
    transparencyTitle: string;
    transparencyText: string;
    careTitle: string;
    careText: string;
    innovationTitle: string;
    innovationText: string;
    accessibilityTitle: string;
    accessibilityText: string;
    teamTitle: string;
    teamSubtitle: string;
    team1Name: string;
    team1Desc: string;
    team2Name: string;
    team2Desc: string;
    team3Name: string;
    team3Desc: string;
    ctaTitle: string;
    ctaText: string;
    ctaButton1: string;
    ctaButton2: string;
  };
}