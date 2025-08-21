import { LanguageContent } from '../types/language';

export const translations: Record<string, LanguageContent> = {
  en: {
    header: {
      brand: "Invest Right",
      features: "Features",
      options: "Investment Options",
      about: "About Us",
      getStarted: "Get Started"
    },
    hero: {
      title: "Smart Investing for Small Investors",
      subtitle: "",
      description: "Invest Right is your neutral platform for making informed investment decisions. Get personalized guidance, explore diverse options, and grow your wealth with confidence.",
      startInvesting: "Start Your Journey",
      learnMore: "How It Works",
      secureRegulated: "Completely Unbiased",
      secureDesc: "Neutral advice that always works in your best interest",
      expertGuidance: "Expert Guidance",
      expertDesc: "AI-powered advice tailored for small investors",
      lowFees: "Tailor Made",
      lowFeesDesc: "Personalized investment plans crafted just for you"
    },
    features: {
      title: "Everything You Need for Smart Investing",
      description: "Our platform provides all the tools and resources necessary to make informed investment decisions.",
      calculator: {
        title: "Investment Calculator",
        description: "Plan your investments with our advanced calculators and projection tools."
      },
      portfolio: {
        title: "Portfolio Analysis",
        description: "Get detailed insights into your portfolio performance and risk assessment."
      },
      education: {
        title: "Educational Resources",
        description: "Access comprehensive guides and tutorials for investment education."
      },
      research: {
        title: "Market Research",
        description: "Stay informed with real-time market data and expert analysis."
      },
      risk: {
        title: "Risk Management",
        description: "Understand and manage investment risks with our assessment tools."
      },
      execution: {
        title: "Quick Execution",
        description: "Execute trades quickly and efficiently with our streamlined platform."
      }
    },
    investmentOptions: {
      title: "Investment Options for Every Goal",
      description: "Choose from a wide range of investment options tailored for small investors.",
      stocks: {
        title: "Stocks & ETFs",
        description: "Invest in individual stocks or diversified ETFs with low fees.",
        minInvestment: "$100",
        riskLevel: "Medium-High"
      },
      bonds: {
        title: "Bonds & Treasury",
        description: "Stable returns with government and corporate bonds.",
        minInvestment: "$1,000",
        riskLevel: "Low-Medium"
      },
      mutualFunds: {
        title: "Mutual Funds",
        description: "Professionally managed portfolios for diversified investing.",
        minInvestment: "$500",
        riskLevel: "Medium"
      },
      indexFunds: {
        title: "Index Funds",
        description: "Low-cost passive investing in market indices.",
        minInvestment: "$100",
        riskLevel: "Medium"
      },
      learnMore: "Learn More",
      minInvestmentLabel: "Min Investment:",
      riskLevelLabel: "Risk Level:"
    },
    about: {
      title: "Empowering Small Investors Since Day One",
      description: "Invest Right was built with a simple mission: make professional-grade investing accessible to everyone, regardless of their portfolio size. We believe smart investing shouldn't be limited to the wealthy.",
              activeInvestors: "Investors Served",
      assetsUnderManagement: "Investment Plan Generated",
      investmentPlanValue: "₹1,000 CR+",
      averageFee: "Average Fee",
      userRating: "User Rating",
      startJourney: "Start Your Journey",
      communityFocused: {
        title: "Community Focused",
        description: "Building a supportive community of investors."
      },
      awardWinning: {
        title: "Award Winning",
        description: "Recognized for innovation in fintech."
      },
      goalOriented: {
        title: "Goal Oriented",
        description: "Helping you reach your financial goals."
      },
      transparent: {
        title: "Transparent",
        description: "No hidden fees or complex terms."
      }
    },
    footer: {
      description: "Your trusted partner for smart investing. Making professional-grade investment tools accessible to everyone.",
      platform: "Platform",
      investmentOptions: "Investment Options",
      portfolioTools: "Portfolio Tools",
      research: "Research",
      education: "Education",
      support: "Support",
      helpCenter: "Help Center",
      contact: "Contact Us",
      privacy: "Privacy Policy",
      terms: "Terms of Service",
      copyright: "© 2025 Invest Right. All rights reserved. Securities offered through registered broker-dealers."
    },
    chatbot: {
              title: "InvestRight Advisor",
      subtitle: "Your personal investment guide",
      status: "Online",
      placeholder: "Ask about investment planning...",
      buttonText: "Chat with AI Advisor",
              welcomeMessage: "Hello! I'm your InvestRight investment advisor. How can I help you with your investment planning today?",
      responses: [
        "That's a great question about investment planning! Based on your situation, I'd recommend starting with a diversified portfolio that includes both stocks and bonds.",
        "For small investors, index funds are often an excellent choice due to their low fees and built-in diversification. What's your investment timeline?",
        "Risk tolerance is crucial in investment planning. Generally, younger investors can take on more risk for potentially higher returns. How comfortable are you with market volatility?",
        "Dollar-cost averaging is a smart strategy for beginners. It involves investing a fixed amount regularly regardless of market conditions. This helps reduce the impact of market volatility.",
        "Emergency funds should typically cover 3-6 months of expenses before investing. This ensures you won't need to withdraw investments during market downturns.",
        "Tax-advantaged accounts like 401(k)s and IRAs should generally be prioritized. Are you taking advantage of any employer matching programs?"
      ]
    },
    login: {
      title: "Welcome Back",
      subtitle: "Sign in to your account to continue",
      emailLabel: "Email Address",
      emailPlaceholder: "Enter your email",
      passwordLabel: "Password",
      passwordPlaceholder: "Enter your password",
      rememberMe: "Remember me",
      forgotPassword: "Forgot password?",
      signInButton: "Sign In",
      noAccount: "Don't have an account?",
      signUpLink: "Sign up"
    },
    contact: {
      title: "Get in Touch",
      subtitle: "Have questions about investing? We'd love to hear from you. Send us a message and we'll respond as soon as possible.",
      contactInfo: "Contact Information",
      officeAddress: "Office Address",
      email: "Email",
      businessHours: "Business Hours",
      hours: "Monday - Friday: 9:00 AM - 6:00 PM",
      sendMessage: "Send us a Message",
      name: "Full Name",
      namePlaceholder: "Enter your full name",
      emailLabel: "Email Address",
      emailPlaceholder: "Enter your email",
      subject: "Subject",
      subjectPlaceholder: "What is this about?",
      message: "Message",
      messagePlaceholder: "Tell us more about your inquiry...",
      sendButton: "Send Message",
      sending: "Sending..."
    },
    ourStory: {
      title: "Our Story",
      subtitle: "From humble beginnings to empowering millions of small investors worldwide. Discover the journey that shaped Invest Right into the trusted platform it is today.",
      missionTitle: "Our Mission",
      missionText: "We believe that smart investing shouldn't be limited to the wealthy. Our mission is to democratize professional-grade investment tools and make them accessible to everyone, regardless of their portfolio size.",
      missionText2: "By combining cutting-edge technology with financial expertise, we're building a future where every individual can make informed investment decisions and build lasting wealth.",
      missionCardTitle: "Empowering Small Investors",
      missionCardText: "Making professional investment tools accessible to everyone",
      journeyTitle: "Our Journey",
      journeySubtitle: "Key milestones that shaped our path to becoming a trusted investment platform",
      year2020Title: "The Beginning",
      year2020Text: "Founded with a vision to democratize investing. Started with a small team of financial experts and technologists.",
      year2021Title: "First Platform Launch",
      year2021Text: "Launched our first investment platform with basic tools and educational resources for small investors.",
      year2022Title: "AI Integration",
      year2022Text: "Introduced AI-powered investment advice and portfolio analysis tools, making professional guidance accessible to all.",
      year2023Title: "Global Expansion",
      year2023Text: "Expanded to multiple countries and introduced multi-language support to serve investors worldwide.",
      year2024Title: "Innovation Leader",
      year2024Text: "Recognized as a leading fintech platform with advanced tools, comprehensive education, and a growing community of empowered investors.",
      valuesTitle: "Our Core Values",
      valuesSubtitle: "The principles that guide everything we do",
      transparencyTitle: "Transparency",
      transparencyText: "We believe in complete transparency in all our operations and fees.",
      careTitle: "Care",
      careText: "We genuinely care about our users' financial success and well-being.",
      innovationTitle: "Innovation",
      innovationText: "Constantly innovating to provide the best tools and experience.",
      accessibilityTitle: "Accessibility",
      accessibilityText: "Making professional tools accessible to everyone, everywhere.",
      teamTitle: "Meet Our Team",
      teamSubtitle: "Passionate experts dedicated to empowering small investors",
      team1Name: "Financial Experts",
      team1Desc: "Certified financial advisors with decades of experience in investment management.",
      team2Name: "Technology Team",
      team2Desc: "Innovative developers and engineers building cutting-edge investment tools.",
      team3Name: "Customer Success",
      team3Desc: "Dedicated support team ensuring every user gets the help they need.",
      ctaTitle: "Join Our Story",
      ctaText: "Be part of the revolution that's making professional investing accessible to everyone. Start your investment journey with us today.",
      ctaButton1: "Start Your Journey",
      ctaButton2: "Get in Touch"
    }
  },
  hi: {
    header: {
      brand: "इन्वेस्ट राइट",
      features: "विशेषताएं",
      options: "निवेश विकल्प",
      about: "हमारे बारे में",
      getStarted: "शुरू करें"
    },
    hero: {
      title: "छोटे निवेशकों के लिए स्मार्ट निवेश",
      subtitle: "",
      description: "इन्वेस्ट राइट आपका तटस्थ प्लेटफॉर्म है सूचित निवेश निर्णय लेने के लिए। व्यक्तिगत मार्गदर्शन प्राप्त करें, विविध विकल्पों का अन्वेषण करें, और आत्मविश्वास के साथ अपनी संपत्ति बढ़ाएं।",
      startInvesting: "अपनी यात्रा शुरू करें",
      learnMore: "यह कैसे काम करता है",
      secureRegulated: "पूर्णतः निष्पक्ष",
      secureDesc: "तटस्थ सलाह जो हमेशा आपके सर्वोत्तम हित में काम करती है",
      expertGuidance: "विशेषज्ञ मार्गदर्शन",
      expertDesc: "छोटे निवेशकों के लिए AI-संचालित सलाह",
      lowFees: "विशेष रूप से बनाया गया",
      lowFeesDesc: "आपके लिए विशेष रूप से तैयार किए गए व्यक्तिगत निवेश योजनाएं"
    },
    features: {
      title: "स्मार्ट निवेश के लिए आपको जो कुछ भी चाहिए",
      description: "हमारा प्लेटफॉर्म सूचित निवेश निर्णय लेने के लिए आवश्यक सभी उपकरण और संसाधन प्रदान करता है।",
      calculator: {
        title: "निवेश कैलकुलेटर",
        description: "हमारे उन्नत कैलकुलेटर और प्रक्षेपण उपकरणों के साथ अपने निवेश की योजना बनाएं।"
      },
      portfolio: {
        title: "पोर्टफोलियो विश्लेषण",
        description: "अपने पोर्टफोलियो के प्रदर्शन और जोखिम मूल्यांकन में विस्तृत अंतर्दृष्टि प्राप्त करें।"
      },
      education: {
        title: "शैक्षिक संसाधन",
        description: "निवेश शिक्षा के लिए व्यापक गाइड और ट्यूटोरियल तक पहुंच प्राप्त करें।"
      },
      research: {
        title: "बाजार अनुसंधान",
        description: "रियल-टाइम बाजार डेटा और विशेषज्ञ विश्लेषण के साथ सूचित रहें।"
      },
      risk: {
        title: "जोखिम प्रबंधन",
        description: "हमारे मूल्यांकन उपकरणों के साथ निवेश जोखिमों को समझें और प्रबंधित करें।"
      },
      execution: {
        title: "त्वरित निष्पादन",
        description: "हमारे सुव्यवस्थित प्लेटफॉर्म के साथ तेजी से और कुशलता से ट्रेड निष्पादित करें।"
      }
    },
    investmentOptions: {
      title: "हर लक्ष्य के लिए निवेश विकल्प",
      description: "छोटे निवेशकों के लिए तैयार किए गए निवेश विकल्पों की विस्तृत श्रृंखला से चुनें।",
      stocks: {
        title: "स्टॉक और ETF",
        description: "कम शुल्क के साथ व्यक्तिगत स्टॉक या विविधीकृत ETF में निवेश करें।",
        minInvestment: "₹100",
        riskLevel: "मध्यम-उच्च"
      },
      bonds: {
        title: "बॉन्ड और ट्रेजरी",
        description: "सरकारी और कॉर्पोरेट बॉन्ड के साथ स्थिर रिटर्न।",
        minInvestment: "₹2,500",
        riskLevel: "कम-मध्यम"
      },
      mutualFunds: {
        title: "म्यूचुअल फंड",
        description: "विविधीकृत निवेश के लिए पेशेवर रूप से प्रबंधित पोर्टफोलियो।",
        minInvestment: "₹500",
        riskLevel: "मध्यम"
      },
      indexFunds: {
        title: "इंडेक्स फंड",
        description: "बाजार सूचकांकों में कम लागत वाला निष्क्रिय निवेश।",
        minInvestment: "₹100",
        riskLevel: "मध्यम"
      },
      learnMore: "और जानें",
      minInvestmentLabel: "न्यूनतम निवेश:",
      riskLevelLabel: "जोखिम स्तर:"
    },
    about: {
      title: "पहले दिन से छोटे निवेशकों को सशक्त बनाना",
      description: "इन्वेस्ट राइट एक सरल मिशन के साथ बनाया गया था: पेशेवर-ग्रेड निवेश को सभी के लिए सुलभ बनाना, उनके पोर्टफोलियो के आकार की परवाह किए बिना। हमारा मानना है कि स्मार्ट निवेश केवल धनी लोगों तक सीमित नहीं होना चाहिए।",
      activeInvestors: "सक्रिय निवेशक",
      assetsUnderManagement: "निवेश योजना उत्पन्न",
      investmentPlanValue: "₹1,000 करोड़+",
      averageFee: "औसत शुल्क",
      userRating: "उपयोगकर्ता रेटिंग",
      startJourney: "अपनी यात्रा शुरू करें",
      communityFocused: {
        title: "समुदाय केंद्रित",
        description: "निवेशकों का एक सहायक समुदाय बनाना।"
      },
      awardWinning: {
        title: "पुरस्कार विजेता",
        description: "फिनटेक में नवाचार के लिए मान्यता प्राप्त।"
      },
      goalOriented: {
        title: "लक्ष्य उन्मुख",
        description: "आपके वित्तीय लक्ष्यों तक पहुंचने में मदद करना।"
      },
      transparent: {
        title: "पारदर्शी",
        description: "कोई छुपी हुई फीस या जटिल शर्तें नहीं।"
      }
    },
    footer: {
      description: "स्मार्ट निवेश के लिए आपका विश्वसनीय साझीदार। पेशेवर-ग्रेड निवेश उपकरणों को सभी के लिए सुलभ बनाना।",
      platform: "प्लेटफॉर्म",
      investmentOptions: "निवेश विकल्प",
      portfolioTools: "पोर्टफोलियो उपकरण",
      research: "अनुसंधान",
      education: "शिक्षा",
      support: "सहायता",
      helpCenter: "सहायता केंद्र",
      contact: "संपर्क करें",
      privacy: "गोपनीयता नीति",
      terms: "सेवा की शर्तें",
      copyright: "© 2025 इन्वेस्ट राइट। सभी अधिकार सुरक्षित। प्रतिभूतियां पंजीकृत ब्रोकर-डीलरों के माध्यम से प्रस्तुत की जाती हैं।"
    },
    chatbot: {
      title: "AI निवेश सलाहकार",
      subtitle: "आपका व्यक्तिगत निवेश गाइड",
      status: "ऑनलाइन",
      placeholder: "निवेश योजना के बारे में पूछें...",
      buttonText: "AI सलाहकार से चैट करें",
      welcomeMessage: "नमस्ते! मैं आपका AI निवेश सलाहकार हूं। आज मैं आपकी निवेश योजना में कैसे मदद कर सकता हूं?",
      responses: [
        "निवेश योजना के बारे में यह एक बेहतरीन सवाल है! आपकी स्थिति के आधार पर, मैं स्टॉक और बॉन्ड दोनों को शामिल करने वाले विविधीकृत पोर्टफोलियो से शुरुआत करने की सलाह दूंगा।",
        "छोटे निवेशकों के लिए, इंडेक्स फंड अक्सर कम फीस और अंतर्निहित विविधीकरण के कारण एक उत्कृष्ट विकल्प होते हैं। आपकी निवेश समयसीमा क्या है?",
        "निवेश योजना में जोखिम सहनशीलता महत्वपूर्ण है। आम तौर पर, युवा निवेशक संभावित रूप से उच्च रिटर्न के लिए अधिक जोखिम उठा सकते हैं। बाजार की अस्थिरता के साथ आप कितने सहज हैं?",
        "डॉलर-कॉस्ट एवरेजिंग शुरुआती लोगों के लिए एक स्मार्ट रणनीति है। इसमें बाजार की स्थितियों की परवाह किए बिना नियमित रूप से एक निश्चित राशि का निवेश करना शामिल है। यह बाजार की अस्थिरता के प्रभाव को कम करने में मदद करता है।",
        "आपातकालीन फंड में आमतौर पर निवेश से पहले 3-6 महीने के खर्च को कवर करना चाहिए। यह सुनिश्चित करता है कि बाजार में गिरावट के दौरान आपको निवेश वापस लेने की आवश्यकता नहीं होगी।",
        "कर-लाभकारी खातों जैसे PPF और ELSS को आमतौर पर प्राथमिकता दी जानी चाहिए। क्या आप किसी नियोक्ता मैचिंग कार्यक्रम का लाभ उठा रहे हैं?"
      ]
    },
    login: {
      title: "वापसी पर स्वागत है",
      subtitle: "जारी रखने के लिए अपने खाते में साइन इन करें",
      emailLabel: "ईमेल पता",
      emailPlaceholder: "अपना ईमेल दर्ज करें",
      passwordLabel: "पासवर्ड",
      passwordPlaceholder: "अपना पासवर्ड दर्ज करें",
      rememberMe: "मुझे याद रखें",
      forgotPassword: "पासवर्ड भूल गए?",
      signInButton: "साइन इन करें",
      noAccount: "खाता नहीं है?",
      signUpLink: "साइन अप करें"
    },
    contact: {
      title: "संपर्क करें",
      subtitle: "निवेश के बारे में प्रश्न हैं? हम आपसे सुनना चाहेंगे। हमें संदेश भेजें और हम जल्द से जल्द जवाब देंगे।",
      contactInfo: "संपर्क जानकारी",
      officeAddress: "कार्यालय का पता",
      email: "ईमेल",
      businessHours: "कार्य समय",
      hours: "सोमवार - शुक्रवार: सुबह 9:00 बजे - शाम 6:00 बजे",
      sendMessage: "हमें संदेश भेजें",
      name: "पूरा नाम",
      namePlaceholder: "अपना पूरा नाम दर्ज करें",
      emailLabel: "ईमेल पता",
      emailPlaceholder: "अपना ईमेल दर्ज करें",
      subject: "विषय",
      subjectPlaceholder: "यह किस बारे में है?",
      message: "संदेश",
      messagePlaceholder: "अपनी जांच के बारे में और बताएं...",
      sendButton: "संदेश भेजें",
      sending: "भेज रहे हैं..."
    }
  },
  mr: {
    header: {
      brand: "इन्व्हेस्ट राइट",
      features: "वैशिष्ट्ये",
      options: "गुंतवणूक पर्याय",
      about: "आमच्याबद्दल",
      getStarted: "सुरुवात करा"
    },
    hero: {
      title: "छोट्या गुंतवणूकदारांसाठी स्मार्ट गुंतवणूक",
      subtitle: "",
      description: "इन्व्हेस्ट राइट हे माहितीपूर्ण गुंतवणूक निर्णय घेण्यासाठी तुमचे तटस्थ प्लॅटफॉर्म आहे. वैयक्तिक मार्गदर्शन मिळवा, विविध पर्यायांचा शोध घ्या आणि आत्मविश्वासाने तुमची संपत्ति वाढवा.",
      startInvesting: "तुमची यात्रा सुरू करा",
      learnMore: "हे कसे काम करते",
      secureRegulated: "पूर्णपणे निष्पक्ष",
      secureDesc: "तटस्थ सल्ला जो नेहमी तुमच्या सर्वोत्तम हितासाठी काम करतो",
      expertGuidance: "तज्ञ मार्गदर्शन",
      expertDesc: "छोट्या गुंतवणूकदारांसाठी AI-चालित सल्ला",
      lowFees: "विशेष रीतीने बनवलेले",
      lowFeesDesc: "तुमच्यासाठी विशेष रीतीने तयार केलेले वैयक्तिक गुंतवणूक योजना"
    },
    features: {
      title: "स्मार्ट गुंतवणुकीसाठी तुम्हाला जे काही हवे",
      description: "आमचे प्लॅटफॉर्म माहितीपूर्ण गुंतवणूक निर्णय घेण्यासाठी आवश्यक सर्व साधने आणि संसाधने प्रदान करते.",
      calculator: {
        title: "गुंतवणूक कॅल्क्युलेटर",
        description: "आमच्या प्रगत कॅल्क्युलेटर आणि प्रक्षेपण साधनांसह तुमच्या गुंतवणुकीची योजना करा."
      },
      portfolio: {
        title: "पोर्टफोलिओ विश्लेषण",
        description: "तुमच्या पोर्टफोलिओच्या कामगिरी आणि जोखीम मूल्यांकनामध्ये तपशीलवार अंतर्दृष्टी मिळवा."
      },
      education: {
        title: "शैक्षणिक संसाधने",
        description: "गुंतवणूक शिक्षणासाठी सर्वसमावेशक मार्गदर्शक आणि ट्यूटोरियलमध्ये प्रवेश मिळवा."
      },
      research: {
        title: "बाजार संशोधन",
        description: "रिअल-टाइम बाजार डेटा आणि तज्ञ विश्लेषणासह माहितीपूर्ण राहा."
      },
      risk: {
        title: "जोखीम व्यवस्थापन",
        description: "आमच्या मूल्यांकन साधनांसह गुंतवणूक जोखीम समजून घ्या आणि व्यवस्थापित करा."
      },
      execution: {
        title: "जलद अंमलबजावणी",
        description: "आमच्या सुव्यवस्थित प्लॅटफॉर्मसह जलद आणि कार्यक्षमतेने व्यापार अंमलात आणा."
      }
    },
    investmentOptions: {
      title: "प्रत्येक ध्येयासाठी गुंतवणूक पर्याय",
      description: "छोट्या गुंतवणूकदारांसाठी तयार केलेल्या गुंतवणूक पर्यायांच्या विस्तृत श्रेणीतून निवडा.",
      stocks: {
        title: "स्टॉक आणि ETF",
        description: "कमी शुल्कासह वैयक्तिक स्टॉक किंवा विविधीकृत ETF मध्ये गुंतवणूक करा.",
        minInvestment: "₹100",
        riskLevel: "मध्यम-उच्च"
      },
      bonds: {
        title: "बाँड आणि ट्रेझरी",
        description: "सरकारी आणि कॉर्पोरेट बाँडसह स्थिर परतावा.",
        minInvestment: "₹2,500",
        riskLevel: "कमी-मध्यम"
      },
      mutualFunds: {
        title: "म्युच्युअल फंड",
        description: "विविधीकृत गुंतवणुकीसाठी व्यावसायिकरित्या व्यवस्थापित पोर्टफोलिओ.",
        minInvestment: "₹500",
        riskLevel: "मध्यम"
      },
      indexFunds: {
        title: "इंडेक्स फंड",
        description: "बाजार निर्देशांकांमध्ये कमी खर्चाची निष्क्रिय गुंतवणूक.",
        minInvestment: "₹100",
        riskLevel: "मध्यम"
      },
      learnMore: "अधिक जाणून घ्या",
      minInvestmentLabel: "किमान गुंतवणूक:",
      riskLevelLabel: "जोखीम पातळी:"
    },
    about: {
      title: "पहिल्या दिवसापासून छोट्या गुंतवणूकदारांना सक्षम करणे",
      description: "इन्व्हेस्ट राइट एका साध्या मिशनसह तयार करण्यात आले: व्यावसायिक-दर्जाची गुंतवणूक सर्वांसाठी प्रवेशयोग्य बनवणे, त्यांच्या पोर्टफोलिओच्या आकाराची पर्वा न करता. आमचा विश्वास आहे की स्मार्ट गुंतवणूक केवळ श्रीमंतांपुरती मर्यादित नसावी.",
      activeInvestors: "सक्रिय गुंतवणूकदार",
      assetsUnderManagement: "गुंतवणूक योजना उत्पन्न",
      investmentPlanValue: "₹1,000 करोड़+",
      averageFee: "सरासरी शुल्क",
      userRating: "वापरकर्ता रेटिंग",
      startJourney: "तुमचा प्रवास सुरू करा",
      communityFocused: {
        title: "समुदाय केंद्रित",
        description: "गुंतवणूकदारांचा सहायक समुदाय तयार करणे."
      },
      awardWinning: {
        title: "पुरस्कार विजेता",
        description: "फिनटेकमधील नवाचारासाठी मान्यता प्राप्त."
      },
      goalOriented: {
        title: "ध्येय केंद्रित",
        description: "तुमच्या आर्थिक ध्येयांपर्यंत पोहोचण्यात मदत करणे."
      },
      transparent: {
        title: "पारदर्शक",
        description: "कोणतेही लपलेले शुल्क किंवा जटिल अटी नाहीत."
      }
    },
    footer: {
      description: "स्मार्ट गुंतवणुकीसाठी तुमचा विश्वसनीय भागीदार. व्यावसायिक-दर्जाची गुंतवणूक साधने सर्वांसाठी प्रवेशयोग्य बनवणे.",
      platform: "प्लॅटफॉर्म",
      investmentOptions: "गुंतवणूक पर्याय",
      portfolioTools: "पोर्टफोलिओ साधने",
      research: "संशोधन",
      education: "शिक्षण",
      support: "सहाय्य",
      helpCenter: "मदत केंद्र",
      contact: "संपर्क साधा",
      privacy: "गोपनीयता धोरण",
      terms: "सेवा अटी",
      copyright: "© 2025 इन्व्हेस्ट राइट. सर्व हक्क राखीव. नोंदणीकृत ब्रोकर-डीलरद्वारे सिक्युरिटीज ऑफर केल्या जातात."
    },
    chatbot: {
      title: "AI गुंतवणूक सल्लागार",
      subtitle: "तुमचा वैयक्तिक गुंतवणूक मार्गदर्शक",
      status: "ऑनलाइन",
      placeholder: "गुंतवणूक नियोजनाबद्दल विचारा...",
      buttonText: "AI सल्लागाराशी चॅट करा",
      welcomeMessage: "नमस्कार! मी तुमचा AI गुंतवणूक सल्लागार आहे. आज मी तुमच्या गुंतवणूक नियोजनात कशी मदत करू शकतो?",
      responses: [
        "गुंतवणूक नियोजनाबद्दल हा एक उत्कृष्ट प्रश्न आहे! तुमच्या परिस्थितीच्या आधारे, मी स्टॉक आणि बाँड दोन्ही समाविष्ट करणाऱ्या विविधीकृत पोर्टफोलिओपासून सुरुवात करण्याची शिफारस करेन.",
        "छोट्या गुंतवणूकदारांसाठी, इंडेक्स फंड अनेकदा कमी शुल्क आणि अंतर्निहित विविधीकरणामुळे एक उत्कृष्ट पर्याय असतात. तुमची गुंतवणूक टाइमलाइन काय आहे?",
        "गुंतवणूक नियोजनामध्ये जोखीम सहनशीलता महत्त्वाची आहे. सामान्यतः, तरुण गुंतवणूकदार संभाव्य उच्च परताव्यासाठी अधिक जोखीम घेऊ शकतात. बाजारातील अस्थिरतेसह तुम्ही किती सहज आहात?",
        "डॉलर-कॉस्ट अॅव्हरेजिंग ही नवशिक्यांसाठी एक स्मार्ट रणनीती आहे. यामध्ये बाजारातील परिस्थितीची पर्वा न करता नियमितपणे निश्चित रक्कम गुंतवणे समाविष्ट आहे. हे बाजारातील अस्थिरतेचा प्रभाव कमी करण्यास मदत करते.",
        "आपत्कालीन फंडामध्ये सामान्यतः गुंतवणूक करण्यापूर्वी 3-6 महिन्यांचा खर्च कव्हर केला पाहिजे. हे सुनिश्चित करते की बाजारातील मंदीच्या काळात तुम्हाला गुंतवणूक काढण्याची गरज भासणार नाही.",
        "PPF आणि ELSS सारख्या कर-लाभकारी खात्यांना सामान्यतः प्राधान्य दिले पाहिजे. तुम्ही कोणत्याही नियोक्ता मॅचिंग प्रोग्रामचा फायदा घेत आहात का?"
      ]
    },
    login: {
      title: "परत येण्याबद्दल स्वागत आहे",
      subtitle: "सुरू ठेवण्यासाठी तुमच्या खात्यात साइन इन करा",
      emailLabel: "ईमेल पत्ता",
      emailPlaceholder: "तुमचा ईमेल प्रविष्ट करा",
      passwordLabel: "पासवर्ड",
      passwordPlaceholder: "तुमचा पासवर्ड प्रविष्ट करा",
      rememberMe: "मला लक्षात ठेवा",
      forgotPassword: "पासवर्ड विसरलात?",
      signInButton: "साइन इन करा",
      noAccount: "खाते नाही?",
      signUpLink: "साइन अप करा"
    },
    contact: {
      title: "संपर्क साधा",
      subtitle: "गुंतवणुकीबद्दल प्रश्न आहेत? आम्हाला तुमच्याकडून ऐकायला आवडेल. आम्हाला संदेश पाठवा आणि आम्ही लवकरच प्रतिसाद देऊ.",
      contactInfo: "संपर्क माहिती",
      officeAddress: "कार्यालयाचा पत्ता",
      email: "ईमेल",
      businessHours: "व्यवसायाचे तास",
      hours: "सोमवार - शुक्रवार: सकाळी 9:00 वाजता - संध्याकाळी 6:00 वाजता",
      sendMessage: "आम्हाला संदेश पाठवा",
      name: "पूर्ण नाव",
      namePlaceholder: "तुमचे पूर्ण नाव प्रविष्ट करा",
      emailLabel: "ईमेल पत्ता",
      emailPlaceholder: "तुमचा ईमेल प्रविष्ट करा",
      subject: "विषय",
      subjectPlaceholder: "हे कशाबद्दल आहे?",
      message: "संदेश",
      messagePlaceholder: "तुमच्या चौकशीबद्दल अधिक सांगा...",
      sendButton: "संदेश पाठवा",
      sending: "पाठवत आहे..."
    }
  }
};