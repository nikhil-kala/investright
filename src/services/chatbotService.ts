// Expert Financial Advisor Chatbot Service for InvestRight
import { GoogleGenerativeAI } from "@google/generative-ai";
import { webSearchService } from './webSearchService';

// Interface to track goal details for progressive questioning
interface GoalDetails {
  goalType: string;
  city?: string;
  propertyType?: string;
  propertySize?: string;
  areaPreference?: string;
  carBrand?: string;
  carType?: string;
  carVariant?: string;
  courseType?: string;
  institutionType?: string;
  courseLevel?: string;
  specificInstitution?: string;
}

// Function to extract goal details from conversation history
const extractGoalDetails = (conversationHistory: Array<{ role: 'user' | 'assistant', content: string }>): GoalDetails => {
  const allUserMessages = conversationHistory
    .filter(msg => msg.role === 'user')
    .map(msg => msg.content.toLowerCase())
    .join(' ');

  const details: GoalDetails = { goalType: 'unknown' };

  // Determine goal type
  if (allUserMessages.includes('house') || allUserMessages.includes('home') || allUserMessages.includes('property')) {
    details.goalType = 'property';
    
    // Extract property details
    if (allUserMessages.includes('mumbai')) details.city = 'mumbai';
    else if (allUserMessages.includes('delhi')) details.city = 'delhi';
    else if (allUserMessages.includes('bangalore') || allUserMessages.includes('bengaluru')) details.city = 'bangalore';
    else if (allUserMessages.includes('pune')) details.city = 'pune';
    else if (allUserMessages.includes('hyderabad')) details.city = 'hyderabad';
    else if (allUserMessages.includes('chennai')) details.city = 'chennai';
    else if (allUserMessages.includes('kolkata')) details.city = 'kolkata';
    else if (allUserMessages.includes('ahmedabad')) details.city = 'ahmedabad';
    else if (allUserMessages.includes('gurgaon') || allUserMessages.includes('gurugram')) details.city = 'gurgaon';
    else if (allUserMessages.includes('noida')) details.city = 'noida';

    if (allUserMessages.includes('2 bhk') || allUserMessages.includes('2bhk') || allUserMessages.includes('two bedroom')) details.propertySize = '2bhk';
    else if (allUserMessages.includes('3 bhk') || allUserMessages.includes('3bhk') || allUserMessages.includes('three bedroom')) details.propertySize = '3bhk';
    else if (allUserMessages.includes('1 bhk') || allUserMessages.includes('1bhk') || allUserMessages.includes('one bedroom')) details.propertySize = '1bhk';
    else if (allUserMessages.includes('4 bhk') || allUserMessages.includes('4bhk') || allUserMessages.includes('four bedroom')) details.propertySize = '4bhk';

    if (allUserMessages.includes('apartment') || allUserMessages.includes('flat')) details.propertyType = 'apartment';
    else if (allUserMessages.includes('villa') || allUserMessages.includes('independent house') || allUserMessages.includes('bungalow')) details.propertyType = 'independent';

    if (allUserMessages.includes('prime location') || allUserMessages.includes('city center') || allUserMessages.includes('central')) details.areaPreference = 'prime';
    else if (allUserMessages.includes('suburb') || allUserMessages.includes('outskirts') || allUserMessages.includes('affordable area')) details.areaPreference = 'suburb';
  }
  
  else if (allUserMessages.includes('car') || allUserMessages.includes('vehicle')) {
    details.goalType = 'car';
    
    // Extract car details
    if (allUserMessages.includes('bmw')) details.carBrand = 'bmw';
    else if (allUserMessages.includes('audi')) details.carBrand = 'audi';
    else if (allUserMessages.includes('mercedes')) details.carBrand = 'mercedes';
    else if (allUserMessages.includes('honda')) details.carBrand = 'honda';
    else if (allUserMessages.includes('toyota')) details.carBrand = 'toyota';
    else if (allUserMessages.includes('hyundai')) details.carBrand = 'hyundai';
    else if (allUserMessages.includes('maruti')) details.carBrand = 'maruti';
    else if (allUserMessages.includes('tata')) details.carBrand = 'tata';
    else if (allUserMessages.includes('mahindra')) details.carBrand = 'mahindra';
    else if (allUserMessages.includes('kia')) details.carBrand = 'kia';

    if (allUserMessages.includes('sedan')) details.carType = 'sedan';
    else if (allUserMessages.includes('suv')) details.carType = 'suv';
    else if (allUserMessages.includes('hatchback')) details.carType = 'hatchback';
    else if (allUserMessages.includes('compact')) details.carType = 'compact';

    if (allUserMessages.includes('petrol') || allUserMessages.includes('gasoline')) details.carVariant = 'petrol';
    else if (allUserMessages.includes('diesel')) details.carVariant = 'diesel';
    else if (allUserMessages.includes('electric') || allUserMessages.includes('ev')) details.carVariant = 'electric';
    else if (allUserMessages.includes('hybrid')) details.carVariant = 'hybrid';
  }
  
  else if (allUserMessages.includes('education') || allUserMessages.includes('college') || allUserMessages.includes('course') || allUserMessages.includes('study')) {
    details.goalType = 'education';
    
    // Extract education details
    if (allUserMessages.includes('engineering')) details.courseType = 'engineering';
    else if (allUserMessages.includes('medical') || allUserMessages.includes('mbbs')) details.courseType = 'medical';
    else if (allUserMessages.includes('mba') || allUserMessages.includes('management')) details.courseType = 'mba';
    else if (allUserMessages.includes('law')) details.courseType = 'law';
    else if (allUserMessages.includes('bca') || allUserMessages.includes('computer science')) details.courseType = 'computer';
    else if (allUserMessages.includes('commerce') || allUserMessages.includes('bcom')) details.courseType = 'commerce';

    if (allUserMessages.includes('government') || allUserMessages.includes('public')) details.institutionType = 'government';
    else if (allUserMessages.includes('private')) details.institutionType = 'private';
    else if (allUserMessages.includes('international') || allUserMessages.includes('abroad')) details.institutionType = 'international';

    if (allUserMessages.includes('bachelor') || allUserMessages.includes('graduation') || allUserMessages.includes('undergraduate')) details.courseLevel = 'bachelor';
    else if (allUserMessages.includes('master') || allUserMessages.includes('postgraduate') || allUserMessages.includes('pg')) details.courseLevel = 'master';
    else if (allUserMessages.includes('diploma')) details.courseLevel = 'diploma';

    if (allUserMessages.includes('iit')) details.specificInstitution = 'iit';
    else if (allUserMessages.includes('nit')) details.specificInstitution = 'nit';
    else if (allUserMessages.includes('iim')) details.specificInstitution = 'iim';
    else if (allUserMessages.includes('aiims')) details.specificInstitution = 'aiims';
  }

  return details;
};

// Progressive questioning system for comprehensive goal details
const getNextProgressiveQuestion = (details: GoalDetails, conversationHistory: Array<{ role: 'user' | 'assistant', content: string }>): string | null => {
  
  // Property questioning sequence
  if (details.goalType === 'property') {
    if (!details.city) {
      return "Great! To give you accurate property pricing, could you tell me which city or region you're considering?\n\n**Sample format:**\n• \"Mumbai, preferably Andheri area\"\n• \"Bangalore, near IT corridor\"\n• \"Pune, any good locality\"\n• \"Delhi, metro connectivity important\"";
    }
    
    if (!details.propertySize) {
      return "Perfect! Now, what size property are you looking for?\n\n**Sample format:**\n• \"2 BHK apartment\"\n• \"3 BHK with balcony\"\n• \"1 BHK for investment\"\n• \"4 BHK independent house\"";
    }
    
    if (!details.propertyType) {
      return "Got it! What type of property would you prefer?\n\n**Sample format:**\n• \"Apartment in a complex\"\n• \"Independent house/villa\"\n• \"Row house\"\n• \"Builder floor\"";
    }
    
    if (!details.areaPreference) {
      const cityName = details.city?.charAt(0).toUpperCase() + details.city?.slice(1);
      return `Almost there! In ${cityName}, do you have any specific area preferences?\n\n**Sample format:**\n• \"Prime location, close to city center\"\n• \"Suburban area, more space for budget\"\n• \"Near metro/transport hubs\"\n• \"Specific locality: [area name]\"`;
    }
  }
  
  // Car questioning sequence
  else if (details.goalType === 'car') {
    if (!details.carBrand) {
      return "Excellent! To provide accurate car pricing, do you have any brand preferences?\n\n**Sample format:**\n• \"BMW or Audi, luxury segment\"\n• \"Honda or Toyota, reliable brands\"\n• \"Maruti or Hyundai, budget-friendly\"\n• \"Any good brand, no specific preference\"";
    }
    
    if (!details.carType) {
      return "Great choice! What type of car are you looking for?\n\n**Sample format:**\n• \"SUV for family trips\"\n• \"Sedan for city driving\"\n• \"Hatchback, compact size\"\n• \"Compact SUV\"";
    }
    
    if (!details.carVariant) {
      return "Perfect! Any preference for fuel type or specific features?\n\n**Sample format:**\n• \"Petrol, city driving mainly\"\n• \"Diesel, long distance travel\"\n• \"Electric, eco-friendly option\"\n• \"Automatic transmission preferred\"";
    }
  }
  
  // Education questioning sequence
  else if (details.goalType === 'education') {
    if (!details.courseType) {
      return "Wonderful! What type of course or field of study are you planning for?\n\n**Sample format:**\n• \"Engineering, computer science\"\n• \"Medical, MBBS\"\n• \"MBA, management studies\"\n• \"Law, legal studies\"\n• \"Commerce, CA preparation\"";
    }
    
    if (!details.institutionType) {
      return "Great! Do you have a preference for the type of institution?\n\n**Sample format:**\n• \"Government colleges, affordable fees\"\n• \"Private institutions, good facilities\"\n• \"International universities, abroad\"\n• \"Both government and private options\"";
    }
    
    if (!details.courseLevel) {
      return "Perfect! What level of education are you planning?\n\n**Sample format:**\n• \"Bachelor's degree, undergraduate\"\n• \"Master's degree, postgraduate\"\n• \"Diploma course\"\n• \"Professional certification\"";
    }
    
    if (!details.specificInstitution && details.institutionType === 'government') {
      return "Excellent! Any specific institutions you're targeting?\n\n**Sample format:**\n• \"IIT for engineering\"\n• \"NIT, good government option\"\n• \"IIM for MBA\"\n• \"AIIMS for medical\"\n• \"Any good government college\"";
    }
  }
  
  return null; // No more questions needed
};

// Enhanced function to intelligently understand and process user responses
const intelligentResponseProcessor = (userResponse: string, conversationHistory: Array<{ role: 'user' | 'assistant', content: string }>): string => {
  const response = userResponse.toLowerCase().trim();
  
  // Get the last assistant question to understand context
  const lastAssistantMessage = conversationHistory
    .filter(msg => msg.role === 'assistant')
    .slice(-1)[0]?.content || '';
  
  // Analyze what the assistant was asking about
  const questionContext = analyzeQuestionContext(lastAssistantMessage);
  
  // Process the user's response based on the context
  const processedInfo = processUserResponseInContext(response, questionContext, conversationHistory);
  
  // Update goal details with the new information
  const updatedDetails = extractGoalDetails([...conversationHistory, { role: 'user', content: userResponse }]);
  
  // Enhanced with processed information
  const enhancedDetails = mergeProcessedInformation(updatedDetails, processedInfo);
  
  // Determine next step
  const nextQuestion = getNextProgressiveQuestion(enhancedDetails, conversationHistory);
  
  if (nextQuestion) {
    // Generate dynamic acknowledgment
    const acknowledgment = generateDynamicAcknowledgment(processedInfo, questionContext);
    return `${acknowledgment} ${nextQuestion}`;
  }
  
  // We have enough details about the goal specifics, but check if we need to progress to income/savings collection
  
  // Extract financial figures from the entire conversation to see what we have
  const allUserMessages = conversationHistory.filter(msg => msg.role === 'user').map(msg => msg.content).join(' ');
  const extractedFigures = extractFinancialFigures(allUserMessages, 'general');
  
  console.log('intelligentResponseProcessor: Checking progression needs', {
    extractedFigures,
    enhancedDetails
  });
  
  // If we have goal details but missing financial info, progress to next step instead of providing pricing
  if (extractedFigures.amount && extractedFigures.timeline && !extractedFigures.income) {
    return "Perfect! Now I have a clear understanding of your goal. To create a comprehensive financial plan, I need to understand your financial capacity.\n\n**What is your current monthly income and how much can you invest monthly towards this goal?**\n\n**Sample format:**\n• \"₹50,000 per month, can invest ₹20,000\"\n• \"I earn ₹8 LPA, can save ₹30,000 monthly\"\n• \"Monthly income ₹1.2 lakhs, investment capacity ₹40,000\"";
  }
  
  if (extractedFigures.amount && extractedFigures.timeline && extractedFigures.income && !extractedFigures.existingSavings) {
    return "Excellent! I have your income and investment capacity. One more important detail:\n\n**Do you have any existing savings or investments that we can consider for this goal?**\n\n**Sample format:**\n• \"I have ₹2 lakhs in FDs\"\n• \"₹5 lakhs in mutual funds already\"\n• \"No existing savings, starting fresh\"";
  }
  
  // If we have all required info, proceed to feasibility analysis
  if (extractedFigures.amount && extractedFigures.timeline && extractedFigures.income) {
    return "Thank you for all the details! Let me now perform a comprehensive feasibility analysis for your goal. I'll calculate if your target is achievable with your current capacity and provide you with a detailed investment strategy.\n\n*Analyzing your financial plan...*";
  }
  
  // Fallback to comprehensive pricing if we're still in goal details phase
  return generateComprehensivePricing(enhancedDetails, conversationHistory);
};

// Function to analyze what the assistant was asking about in the last message
const analyzeQuestionContext = (lastAssistantMessage: string): string => {
  const message = lastAssistantMessage.toLowerCase();
  
  if (message.includes('which city') || message.includes('city or area') || message.includes('region')) {
    return 'city';
  } else if (message.includes('size property') || message.includes('bhk') || message.includes('bedroom')) {
    return 'property_size';
  } else if (message.includes('type of property') || message.includes('apartment') || message.includes('independent')) {
    return 'property_type';
  } else if (message.includes('area preferences') || message.includes('specific area')) {
    return 'area_preference';
  } else if (message.includes('brand preferences') || message.includes('brand')) {
    return 'car_brand';
  } else if (message.includes('type of car') || message.includes('hatchback') || message.includes('sedan')) {
    return 'car_type';
  } else if (message.includes('fuel type') || message.includes('petrol') || message.includes('diesel')) {
    return 'car_fuel';
  } else if (message.includes('course or field') || message.includes('type of course')) {
    return 'course_type';
  } else if (message.includes('type of institution') || message.includes('government') || message.includes('private')) {
    return 'institution_type';
  } else if (message.includes('level of education') || message.includes('bachelor') || message.includes('master')) {
    return 'course_level';
  } else if (message.includes('specific institutions') || message.includes('colleges')) {
    return 'specific_institution';
  } else if (message.includes('monthly income') || message.includes('current income') || message.includes('invest monthly') || message.includes('lpa')) {
    return 'income_and_investment';
  } else if (message.includes('existing savings') || message.includes('investments') || message.includes('fd') || message.includes('mutual fund')) {
    return 'existing_savings';
  } else {
    return 'general';
  }
};

// Function to process user response based on the context of what was asked
const processUserResponseInContext = (response: string, questionContext: string, _conversationHistory: Array<{ role: 'user' | 'assistant', content: string }>): any => {
  let processedInfo: any = {};
  
  switch (questionContext) {
    case 'city':
      processedInfo.city = extractCityFromResponse(response);
      break;
    case 'property_size':
      processedInfo.propertySize = extractPropertySizeFromResponse(response);
      break;
    case 'property_type':
      processedInfo.propertyType = extractPropertyTypeFromResponse(response);
      break;
    case 'area_preference':
      processedInfo.areaPreference = extractAreaPreferenceFromResponse(response);
      break;
    case 'car_brand':
      processedInfo.carBrand = extractCarBrandFromResponse(response);
      break;
    case 'car_type':
      processedInfo.carType = extractCarTypeFromResponse(response);
      break;
    case 'car_fuel':
      processedInfo.carVariant = extractCarFuelFromResponse(response);
      break;
    case 'course_type':
      processedInfo.courseType = extractCourseTypeFromResponse(response);
      break;
    case 'institution_type':
      processedInfo.institutionType = extractInstitutionTypeFromResponse(response);
      break;
    case 'course_level':
      processedInfo.courseLevel = extractCourseLevelFromResponse(response);
      break;
    case 'specific_institution':
      processedInfo.specificInstitution = extractSpecificInstitutionFromResponse(response);
      break;
    case 'income_and_investment':
      processedInfo.income = extractIncomeFromResponse(response);
      processedInfo.monthlyInvestment = extractMonthlyInvestmentFromResponse(response);
      break;
    case 'existing_savings':
      processedInfo.existingSavings = extractExistingSavingsFromResponse(response);
      break;
    default:
      // Try to extract any relevant information
      processedInfo = extractGeneralInformation(response);
  }
  
  return processedInfo;
};

// Helper functions for intelligent natural language understanding

const extractCityFromResponse = (response: string): string | undefined => {
  const cityMappings = {
    'mumbai': ['mumbai', 'bombay', 'andheri', 'bandra', 'powai', 'thane', 'navi mumbai'],
    'delhi': ['delhi', 'new delhi', 'ncr', 'dwarka', 'rohini', 'gurgaon', 'gurugram', 'noida'],
    'bangalore': ['bangalore', 'bengaluru', 'whitefield', 'koramangala', 'indiranagar', 'electronic city'],
    'pune': ['pune', 'pimpri', 'chinchwad', 'hinjewadi', 'magarpatta', 'aundh', 'kharadi'],
    'hyderabad': ['hyderabad', 'secunderabad', 'hitec city', 'gachibowli', 'madhapur'],
    'chennai': ['chennai', 'madras', 'anna nagar', 'velachery', 'tambaram', 'omr']
  };

  for (const [city, keywords] of Object.entries(cityMappings)) {
    if (keywords.some(keyword => response.includes(keyword))) {
      return city;
    }
  }
  return response.includes('anywhere') || response.includes('flexible') ? 'flexible' : undefined;
};

const extractPropertySizeFromResponse = (response: string): string | undefined => {
  if (response.includes('1') || response.includes('one') || response.includes('studio')) return '1bhk';
  if (response.includes('2') || response.includes('two')) return '2bhk';
  if (response.includes('3') || response.includes('three')) return '3bhk';
  if (response.includes('4') || response.includes('four') || response.includes('big')) return '4bhk';
  if (response.includes('small')) return '1bhk';
  if (response.includes('medium')) return '2bhk';
  if (response.includes('large')) return '3bhk';
  return undefined;
};

const extractPropertyTypeFromResponse = (response: string): string | undefined => {
  if (response.includes('apartment') || response.includes('flat') || response.includes('complex')) return 'apartment';
  if (response.includes('independent') || response.includes('house') || response.includes('villa')) return 'independent';
  if (response.includes('both') || response.includes('any')) return 'flexible';
  return undefined;
};

const extractAreaPreferenceFromResponse = (response: string): string | undefined => {
  if (response.includes('prime') || response.includes('central') || response.includes('main area')) return 'prime';
  if (response.includes('suburb') || response.includes('outskirts') || response.includes('affordable')) return 'suburb';
  if (response.includes('metro') || response.includes('transport')) return 'transport_hub';
  if (response.includes('it') || response.includes('tech')) return 'it_area';
  if (response.includes('anywhere') || response.includes('flexible')) return 'flexible';
  return undefined;
};

const extractCarBrandFromResponse = (response: string): string | undefined => {
  const brands = ['bmw', 'audi', 'mercedes', 'honda', 'toyota', 'hyundai', 'maruti', 'tata'];
  for (const brand of brands) {
    if (response.includes(brand)) return brand;
  }
  if (response.includes('luxury') || response.includes('premium')) return 'luxury';
  if (response.includes('budget') || response.includes('affordable')) return 'budget';
  if (response.includes('any') || response.includes('flexible')) return 'flexible';
  return undefined;
};

const extractCarTypeFromResponse = (response: string): string | undefined => {
  if (response.includes('suv') || response.includes('big car') || response.includes('family')) return 'suv';
  if (response.includes('sedan') || response.includes('comfortable')) return 'sedan';
  if (response.includes('hatchback') || response.includes('small') || response.includes('compact')) return 'hatchback';
  return undefined;
};

const extractCarFuelFromResponse = (response: string): string | undefined => {
  if (response.includes('petrol') || response.includes('gas')) return 'petrol';
  if (response.includes('diesel') || response.includes('mileage')) return 'diesel';
  if (response.includes('electric') || response.includes('ev')) return 'electric';
  if (response.includes('hybrid')) return 'hybrid';
  return undefined;
};

const extractCourseTypeFromResponse = (response: string): string | undefined => {
  if (response.includes('engineering') || response.includes('computer')) return 'engineering';
  if (response.includes('medical') || response.includes('doctor')) return 'medical';
  if (response.includes('mba') || response.includes('management')) return 'mba';
  if (response.includes('law') || response.includes('legal')) return 'law';
  if (response.includes('commerce') || response.includes('ca')) return 'commerce';
  return undefined;
};

const extractInstitutionTypeFromResponse = (response: string): string | undefined => {
  if (response.includes('government') || response.includes('affordable')) return 'government';
  if (response.includes('private') || response.includes('facilities')) return 'private';
  if (response.includes('international') || response.includes('abroad')) return 'international';
  if (response.includes('both') || response.includes('any')) return 'flexible';
  return undefined;
};

const extractCourseLevelFromResponse = (response: string): string | undefined => {
  if (response.includes('bachelor') || response.includes('graduation')) return 'bachelor';
  if (response.includes('master') || response.includes('postgraduate')) return 'master';
  if (response.includes('diploma')) return 'diploma';
  return undefined;
};

const extractSpecificInstitutionFromResponse = (response: string): string | undefined => {
  if (response.includes('iit')) return 'iit';
  if (response.includes('nit')) return 'nit';
  if (response.includes('iim')) return 'iim';
  if (response.includes('aiims')) return 'aiims';
  if (response.includes('any good') || response.includes('best')) return 'top_tier';
  return undefined;
};

const extractIncomeFromResponse = (response: string): number | undefined => {
  const figures = extractFinancialFigures(response, 'income');
  return figures.income;
};

const extractMonthlyInvestmentFromResponse = (response: string): number | undefined => {
  const figures = extractFinancialFigures(response, 'general');
  return figures.monthlyInvestment;
};

const extractExistingSavingsFromResponse = (response: string): number | undefined => {
  const figures = extractFinancialFigures(response, 'general');
  return figures.existingSavings;
};

const extractGeneralInformation = (response: string): any => {
  return {
    city: extractCityFromResponse(response),
    propertySize: extractPropertySizeFromResponse(response),
    propertyType: extractPropertyTypeFromResponse(response),
    carBrand: extractCarBrandFromResponse(response),
    carType: extractCarTypeFromResponse(response),
    income: extractIncomeFromResponse(response),
    monthlyInvestment: extractMonthlyInvestmentFromResponse(response),
    existingSavings: extractExistingSavingsFromResponse(response)
  };
};

const mergeProcessedInformation = (existingDetails: GoalDetails, processedInfo: any): GoalDetails => {
  const merged = { ...existingDetails };
  if (processedInfo.city) merged.city = processedInfo.city;
  if (processedInfo.propertySize) merged.propertySize = processedInfo.propertySize;
  if (processedInfo.propertyType) merged.propertyType = processedInfo.propertyType;
  if (processedInfo.areaPreference) merged.areaPreference = processedInfo.areaPreference;
  if (processedInfo.carBrand) merged.carBrand = processedInfo.carBrand;
  if (processedInfo.carType) merged.carType = processedInfo.carType;
  if (processedInfo.carVariant) merged.carVariant = processedInfo.carVariant;
  if (processedInfo.courseType) merged.courseType = processedInfo.courseType;
  if (processedInfo.institutionType) merged.institutionType = processedInfo.institutionType;
  if (processedInfo.courseLevel) merged.courseLevel = processedInfo.courseLevel;
  if (processedInfo.specificInstitution) merged.specificInstitution = processedInfo.specificInstitution;
  return merged;
};

const generateDynamicAcknowledgment = (processedInfo: any, questionContext: string): string => {
  const acknowledgments = {
    city: processedInfo.city ? `Great choice! ${processedInfo.city.charAt(0).toUpperCase() + processedInfo.city.slice(1)} is a wonderful location.` : "Thank you for that information!",
    property_size: processedInfo.propertySize ? `Perfect! A ${processedInfo.propertySize.toUpperCase()} is a great size choice.` : "Got it!",
    property_type: processedInfo.propertyType ? `Excellent! ${processedInfo.propertyType === 'apartment' ? 'Apartments' : 'Independent houses'} have their advantages.` : "Understood!",
    car_brand: processedInfo.carBrand ? `Great preference! ${processedInfo.carBrand.charAt(0).toUpperCase() + processedInfo.carBrand.slice(1)} makes reliable vehicles.` : "Noted!",
    car_type: processedInfo.carType ? `Excellent! ${processedInfo.carType.toUpperCase()}s are very popular.` : "Perfect!",
    course_type: processedInfo.courseType ? `Wonderful field! ${processedInfo.courseType.charAt(0).toUpperCase() + processedInfo.courseType.slice(1)} has great prospects.` : "Great choice!",
    income_and_investment: processedInfo.income ? `Excellent! With your financial capacity, we can create a strong investment plan.` : "Thank you for sharing your financial details!",
    existing_savings: processedInfo.existingSavings ? `Great! Your existing savings will give us a good head start.` : "Perfect! Starting fresh is completely fine.",
    default: "Thank you for that information!"
  };
  return acknowledgments[questionContext] || acknowledgments.default;
};

// Function to process follow-up details when user provides specific information
const processFollowUpDetails = (userResponse: string, conversationHistory: Array<{ role: 'user' | 'assistant', content: string }>): string => {
  return intelligentResponseProcessor(userResponse, conversationHistory);
};

// Function to generate comprehensive pricing based on all collected details
const generateComprehensivePricing = (details: GoalDetails, conversationHistory: Array<{ role: 'user' | 'assistant', content: string }>): string => {
  
  if (details.goalType === 'property') {
    return generatePropertyPricing(details);
  } else if (details.goalType === 'car') {
    return generateCarPricing(details);
  } else if (details.goalType === 'education') {
    return generateEducationPricing(details);
  } else {
    return "Thank you for all the details! Based on the information you've provided, I can help you create a realistic budget estimate. What target amount feels comfortable for your goal, and what timeline are you considering?";
  }
};

// Generate detailed property pricing
const generatePropertyPricing = (details: GoalDetails): string => {
  const cityName = details.city?.charAt(0).toUpperCase() + details.city?.slice(1);
  const propertyTypeText = details.propertyType === 'independent' ? 'Independent House/Villa' : 'Apartment';
  const sizeText = details.propertySize?.toUpperCase() || 'Property';
  const areaText = details.areaPreference === 'prime' ? 'Prime Location' : details.areaPreference === 'suburb' ? 'Suburban Area' : 'Good Locality';

  let priceRange = '';
  let specificEstimate = '';

  // City-based pricing
  if (details.city === 'mumbai' || details.city === 'delhi' || details.city === 'bangalore') {
    if (details.propertySize === '2bhk') {
      priceRange = '₹80 lakhs - ₹1.5 crores';
      specificEstimate = '₹1.1 crores';
    } else if (details.propertySize === '3bhk') {
      priceRange = '₹1.2 crores - ₹2.5 crores';
      specificEstimate = '₹1.8 crores';
    } else {
      priceRange = '₹80 lakhs - ₹2.5 crores';
      specificEstimate = '₹1.3 crores';
    }
  } else if (details.city === 'pune' || details.city === 'hyderabad' || details.city === 'chennai') {
    if (details.propertySize === '2bhk') {
      priceRange = '₹50 lakhs - ₹80 lakhs';
      specificEstimate = '₹65 lakhs';
    } else if (details.propertySize === '3bhk') {
      priceRange = '₹70 lakhs - ₹1.2 crores';
      specificEstimate = '₹90 lakhs';
    } else {
      priceRange = '₹50 lakhs - ₹1.2 crores';
      specificEstimate = '₹75 lakhs';
    }
  } else {
    if (details.propertySize === '2bhk') {
      priceRange = '₹30 lakhs - ₹60 lakhs';
      specificEstimate = '₹45 lakhs';
    } else if (details.propertySize === '3bhk') {
      priceRange = '₹40 lakhs - ₹80 lakhs';
      specificEstimate = '₹60 lakhs';
    } else {
      priceRange = '₹30 lakhs - ₹80 lakhs';
      specificEstimate = '₹50 lakhs';
    }
  }

  // Adjust for area preference
  if (details.areaPreference === 'prime') {
    specificEstimate = specificEstimate.replace('₹', '₹1.2-1.4x of ');
  } else if (details.areaPreference === 'suburb') {
    specificEstimate = specificEstimate.replace('₹', '₹0.8-0.9x of ');
  }

  return `Perfect! Based on all the details you've provided, here's a comprehensive pricing analysis:

**🏠 Your Property Requirements:**
• **Location**: ${cityName} (${areaText})
• **Type**: ${propertyTypeText}
• **Size**: ${sizeText}

**💰 Pricing Analysis:**
• **Market Range**: ${priceRange}
• **Recommended Target**: **${specificEstimate}**

**📊 Price Breakdown:**
• Base property cost: 90% of budget
• Registration & legal: 8-10% additional
• Interior/furnishing: 15-20% additional

**🎯 Suggested Planning Amount: ${specificEstimate}**

This covers the property purchase with all associated costs. 

**Next Step:** What timeline are you considering for this purchase? This will help me create your investment strategy.`;
};

// Generate detailed car pricing
const generateCarPricing = (details: GoalDetails): string => {
  const brandText = details.carBrand?.toUpperCase() || 'Car';
  const typeText = details.carType?.toUpperCase() || '';
  const variantText = details.carVariant?.toUpperCase() || '';

  let priceRange = '';
  let specificEstimate = '';
  let models = '';

  // Brand and type-based pricing
  if (details.carBrand === 'bmw' || details.carBrand === 'audi' || details.carBrand === 'mercedes') {
    if (details.carType === 'sedan') {
      priceRange = '₹42-60 lakhs';
      specificEstimate = '₹50 lakhs';
      models = `${brandText} 3 Series/A4/C-Class`;
    } else if (details.carType === 'suv') {
      priceRange = '₹60-85 lakhs';
      specificEstimate = '₹72 lakhs';
      models = `${brandText} X3/Q5/GLC`;
    } else {
      priceRange = '₹42-85 lakhs';
      specificEstimate = '₹60 lakhs';
      models = `${brandText} Range`;
    }
  } else if (details.carBrand === 'honda' || details.carBrand === 'toyota' || details.carBrand === 'hyundai') {
    if (details.carType === 'sedan') {
      priceRange = '₹12-20 lakhs';
      specificEstimate = '₹16 lakhs';
      models = 'City/Camry/Verna';
    } else if (details.carType === 'suv') {
      priceRange = '₹15-30 lakhs';
      specificEstimate = '₹22 lakhs';
      models = 'Creta/Innova/CR-V';
    } else {
      priceRange = '₹12-30 lakhs';
      specificEstimate = '₹18 lakhs';
      models = 'Mid-range options';
    }
  } else if (details.carBrand === 'maruti' || details.carBrand === 'tata') {
    if (details.carType === 'hatchback') {
      priceRange = '₹6-12 lakhs';
      specificEstimate = '₹8 lakhs';
      models = 'Swift/Baleno/Tiago';
    } else if (details.carType === 'suv') {
      priceRange = '₹8-16 lakhs';
      specificEstimate = '₹12 lakhs';
      models = 'Nexon/Vitara/XUV300';
    } else {
      priceRange = '₹6-16 lakhs';
      specificEstimate = '₹10 lakhs';
      models = 'Entry-level range';
    }
  } else {
    priceRange = '₹8-50 lakhs';
    specificEstimate = '₹20 lakhs';
    models = 'Various options';
  }

  // Adjust for variant
  if (details.carVariant === 'electric') {
    specificEstimate = specificEstimate.replace('₹', '₹1.3-1.5x of ');
  } else if (details.carVariant === 'diesel') {
    specificEstimate = specificEstimate.replace('₹', '₹1.1-1.2x of ');
  }

  return `Excellent! Based on your preferences, here's a detailed car pricing analysis:

**🚗 Your Car Requirements:**
• **Brand**: ${brandText}
• **Type**: ${typeText || 'Flexible'}
• **Fuel**: ${variantText || 'Flexible'}

**💰 Pricing Analysis:**
• **Market Range**: ${priceRange}
• **Popular Models**: ${models}
• **Recommended Target**: **${specificEstimate}**

**📊 Total Cost Breakdown:**
• Ex-showroom price: 85% of budget
• Insurance (1st year): 3-5% additional
• Registration & accessories: 8-12% additional

**🎯 Suggested Planning Amount: ${specificEstimate}**

This covers the complete purchase with all on-road costs.

**Next Step:** What timeline are you considering for this purchase? This will help me create your investment strategy.`;
};

// Generate detailed education pricing
const generateEducationPricing = (details: GoalDetails): string => {
  const courseText = details.courseType?.toUpperCase() || 'Course';
  const institutionText = details.institutionType?.charAt(0).toUpperCase() + details.institutionType?.slice(1) || 'Institution';
  const levelText = details.courseLevel?.charAt(0).toUpperCase() + details.courseLevel?.slice(1) || 'Degree';

  let priceRange = '';
  let specificEstimate = '';
  let breakdown = '';

  // Course and institution-based pricing
  if (details.courseType === 'engineering') {
    if (details.institutionType === 'government' || details.specificInstitution === 'iit' || details.specificInstitution === 'nit') {
      priceRange = '₹8-12 lakhs';
      specificEstimate = '₹10 lakhs';
      breakdown = '• Tuition fees: ₹6-8 lakhs\n• Hostel & living: ₹2-3 lakhs\n• Books & materials: ₹1 lakh';
    } else if (details.institutionType === 'private') {
      priceRange = '₹15-25 lakhs';
      specificEstimate = '₹20 lakhs';
      breakdown = '• Tuition fees: ₹12-18 lakhs\n• Hostel & living: ₹3-5 lakhs\n• Books & materials: ₹2 lakhs';
    } else {
      priceRange = '₹30-60 lakhs';
      specificEstimate = '₹45 lakhs';
      breakdown = '• Tuition fees: ₹25-45 lakhs\n• Living expenses: ₹8-12 lakhs\n• Travel & misc: ₹2-3 lakhs';
    }
  } else if (details.courseType === 'medical') {
    if (details.institutionType === 'government' || details.specificInstitution === 'aiims') {
      priceRange = '₹5-10 lakhs';
      specificEstimate = '₹7 lakhs';
      breakdown = '• Tuition fees: ₹3-5 lakhs\n• Hostel & living: ₹2-4 lakhs\n• Books & materials: ₹1 lakh';
    } else if (details.institutionType === 'private') {
      priceRange = '₹50 lakhs - ₹1 crore';
      specificEstimate = '₹75 lakhs';
      breakdown = '• Tuition fees: ₹60-80 lakhs\n• Hostel & living: ₹8-12 lakhs\n• Books & materials: ₹2-3 lakhs';
    } else {
      priceRange = '₹80 lakhs - ₹1.5 crores';
      specificEstimate = '₹1.1 crores';
      breakdown = '• Tuition fees: ₹80 lakhs - ₹1.2 crores\n• Living expenses: ₹15-20 lakhs\n• Travel & misc: ₹5-8 lakhs';
    }
  } else if (details.courseType === 'mba') {
    if (details.institutionType === 'government' || details.specificInstitution === 'iim') {
      priceRange = '₹20-25 lakhs';
      specificEstimate = '₹22 lakhs';
      breakdown = '• Tuition fees: ₹18-20 lakhs\n• Living expenses: ₹2-4 lakhs\n• Books & materials: ₹1 lakh';
    } else if (details.institutionType === 'private') {
      priceRange = '₹15-30 lakhs';
      specificEstimate = '₹22 lakhs';
      breakdown = '• Tuition fees: ₹12-25 lakhs\n• Living expenses: ₹3-4 lakhs\n• Books & materials: ₹1 lakh';
    } else {
      priceRange = '₹40-80 lakhs';
      specificEstimate = '₹60 lakhs';
      breakdown = '• Tuition fees: ₹35-60 lakhs\n• Living expenses: ₹8-15 lakhs\n• Travel & misc: ₹3-5 lakhs';
    }
  } else {
    if (details.institutionType === 'government') {
      priceRange = '₹5-10 lakhs';
      specificEstimate = '₹7 lakhs';
    } else if (details.institutionType === 'private') {
      priceRange = '₹10-20 lakhs';
      specificEstimate = '₹15 lakhs';
    } else {
      priceRange = '₹25-50 lakhs';
      specificEstimate = '₹35 lakhs';
    }
    breakdown = '• Tuition & fees: 70-80% of budget\n• Living expenses: 15-25%\n• Books & materials: 5-10%';
  }

  return `Wonderful! Based on your education goals, here's a comprehensive cost analysis:

**🎓 Your Education Requirements:**
• **Course**: ${courseText} (${levelText})
• **Institution Type**: ${institutionText}
• **Target**: ${details.specificInstitution?.toUpperCase() || 'Quality Institution'}

**💰 Cost Analysis:**
• **Total Range**: ${priceRange}
• **Recommended Target**: **${specificEstimate}**

**📊 Cost Breakdown:**
${breakdown}

**🎯 Suggested Planning Amount: ${specificEstimate}**

This covers the complete education cost including living expenses.

**Next Step:** What timeline are you considering? (When will the course start?) This will help me create your investment strategy.`;
};

// Enhanced function to generate relevant follow-up questions based on user's specific goal
const generateRelevantFollowUpQuestion = (userResponse: string, conversationHistory: Array<{ role: 'user' | 'assistant', content: string }>): string => {
  const response = userResponse.toLowerCase();
  const allUserMessages = conversationHistory
    .filter(msg => msg.role === 'user')
    .map(msg => msg.content.toLowerCase())
    .join(' ');

  // House/Property goal - ask specific details
  if (allUserMessages.includes('house') || allUserMessages.includes('home') || allUserMessages.includes('property') || allUserMessages.includes('apartment')) {
    if (!allUserMessages.includes('mumbai') && !allUserMessages.includes('delhi') && !allUserMessages.includes('bangalore') && !allUserMessages.includes('pune') && !allUserMessages.includes('hyderabad') && !allUserMessages.includes('chennai')) {
      return "Great! A house is one of the most important investments. To help you with accurate pricing, which city or area are you considering?\n\n**Sample answers:**\n• \"Mumbai, looking at suburbs\"\n• \"Bangalore, near IT corridor\"\n• \"Pune, any decent locality\"\n• \"Delhi, with metro connectivity\"";
    }
    
    if (!allUserMessages.includes('bhk') && !allUserMessages.includes('bedroom') && !allUserMessages.includes('room')) {
      return "Perfect! Now, what size property are you looking for?\n\n**Sample answers:**\n• \"2 BHK apartment\"\n• \"3 BHK independent house\"\n• \"1 BHK for investment\"\n• \"4 BHK with garden\"";
    }
    
    return "Excellent! Based on your requirements, I can help estimate the budget. Do you have any preference for:\n• Apartment complex or independent house?\n• Any specific area within the city?\n• New construction or ready-to-move-in?\n\nThis will help me give you accurate pricing.";
  }

  // Car/Vehicle goal - ask specific details  
  else if (allUserMessages.includes('car') || allUserMessages.includes('vehicle') || allUserMessages.includes('bike') || allUserMessages.includes('auto')) {
    if (!allUserMessages.includes('maruti') && !allUserMessages.includes('hyundai') && !allUserMessages.includes('honda') && !allUserMessages.includes('toyota') && !allUserMessages.includes('bmw') && !allUserMessages.includes('audi') && !allUserMessages.includes('mercedes')) {
      return "Excellent choice! Cars vary significantly in price based on brand and type. Do you have any brand preferences?\n\n**Sample answers:**\n• \"Maruti or Hyundai, budget-friendly\"\n• \"Honda or Toyota for reliability\"\n• \"BMW or Audi, luxury segment\"\n• \"Any good brand, no specific preference\"";
    }
    
    if (!allUserMessages.includes('hatchback') && !allUserMessages.includes('sedan') && !allUserMessages.includes('suv') && !allUserMessages.includes('compact')) {
      return "Great! What type of car are you looking for?\n\n**Sample answers:**\n• \"SUV for family and long drives\"\n• \"Sedan for city commuting\"\n• \"Hatchback, easy to park\"\n• \"Compact SUV, best of both\"";
    }
    
    return "Perfect! To give you the most accurate pricing, could you share:\n• Any specific model you're interested in?\n• Petrol, diesel, or electric preference?\n• New car or considering pre-owned?\n\nThis will help me provide precise cost estimates.";
  }

  // Education goal - ask specific details
  else if (allUserMessages.includes('education') || allUserMessages.includes('college') || allUserMessages.includes('course') || allUserMessages.includes('study') || allUserMessages.includes('degree')) {
    if (!allUserMessages.includes('engineering') && !allUserMessages.includes('medical') && !allUserMessages.includes('mba') && !allUserMessages.includes('commerce') && !allUserMessages.includes('arts')) {
      return "Wonderful! Education is a great investment. What type of course or field are you planning for?\n\n**Sample answers:**\n• \"Engineering, computer science\"\n• \"Medical, MBBS course\"\n• \"MBA from good college\"\n• \"Commerce, CA preparation\"";
    }
    
    if (!allUserMessages.includes('government') && !allUserMessages.includes('private') && !allUserMessages.includes('international') && !allUserMessages.includes('abroad')) {
      return "Excellent choice! Do you have a preference for the type of institution?\n\n**Sample answers:**\n• \"Government colleges, affordable fees\"\n• \"Private institutions, good facilities\"\n• \"International universities abroad\"\n• \"Both government and private options\"";
    }
    
    return "Great! To provide accurate cost estimates, could you share:\n• Any specific colleges or universities in mind?\n• Bachelor's or Master's level?\n• When will the course start?\n\nThis will help me research current education costs.";
  }

  // Business/Investment goal - ask specific details
  else if (allUserMessages.includes('business') || allUserMessages.includes('startup') || allUserMessages.includes('investment') || allUserMessages.includes('shop')) {
    return "Fantastic! Starting a business is exciting. To help estimate the investment needed, could you share:\n\n**Business Details:**\n• What type of business? (restaurant, retail, online, services)\n• Scale: Small local setup or larger operation?\n• Location: Home-based, rented space, or own premises?\n\n**Sample answers:**\n• \"Small restaurant, local area\"\n• \"Online clothing business\"\n• \"Grocery shop in my locality\"";
  }

  // Travel goal - ask specific details
  else if (allUserMessages.includes('travel') || allUserMessages.includes('trip') || allUserMessages.includes('vacation') || allUserMessages.includes('tour')) {
    return "Amazing! Travel goals are so refreshing. To help estimate the budget, could you share:\n\n**Travel Details:**\n• Destination: Domestic or international?\n• Duration: How many days/weeks?\n• Type: Budget travel, comfort, or luxury?\n\n**Sample answers:**\n• \"Europe trip for 2 weeks\"\n• \"Domestic India tour, 10 days\"\n• \"International honeymoon, 1 week\"";
  }

  // Wedding/Marriage goal - ask specific details
  else if (allUserMessages.includes('wedding') || allUserMessages.includes('marriage') || allUserMessages.includes('shaadi')) {
    return "Congratulations on your upcoming wedding! To help plan the budget, could you share:\n\n**Wedding Details:**\n• Scale: Intimate ceremony or grand celebration?\n• Guest count: Approximate number?\n• Location: Home, banquet hall, or destination?\n\n**Sample answers:**\n• \"Simple ceremony, 100-150 guests\"\n• \"Grand wedding, 300+ people\"\n• \"Destination wedding in Goa\"";
  }

  // General/unclear goal - ask for clarification
  else {
    return "I'd love to help you plan for your goal! To provide the most relevant guidance, could you tell me a bit more about what specifically you're planning for?\n\n**Common goals:**\n• Buying a house or property\n• Purchasing a car or vehicle\n• Child's education expenses\n• Starting a business\n• Wedding or marriage\n• Travel or vacation\n• Other specific goal\n\nJust describe what you have in mind!";
  }
};

// Helper function to handle adaptive responses when users give unexpected replies
const handleAdaptiveResponse = (userResponse: string, currentStep: string, _extracted: any, conversationHistory: Array<{ role: 'user' | 'assistant', content: string }> = []): string => {
  const response = userResponse.toLowerCase();
  
  // Check if this is a follow-up response to a previous question about details
  const lastAssistantMessage = conversationHistory
    .filter(msg => msg.role === 'assistant')
    .slice(-1)[0]?.content.toLowerCase() || '';
  
  // If the last assistant message was asking for details, process the user's response
  if (lastAssistantMessage.includes('which city') || lastAssistantMessage.includes('what type') || 
      lastAssistantMessage.includes('any specific') || lastAssistantMessage.includes('could you tell me') ||
      lastAssistantMessage.includes('sample answers') || lastAssistantMessage.includes('could you share')) {
    
    return processFollowUpDetails(userResponse, conversationHistory);
  }
  
  // If user gives a rough goal idea but can't provide budget, ask relevant follow-up questions
  if (currentStep === 'goal_amount_timeline' || currentStep === 'goal_amount_determination') {
    // If user expresses uncertainty about budget/amount
    if (response.includes('not sure') || response.includes('don\'t know') || response.includes('unclear') || 
        response.includes('no idea') || response.includes('unsure') || response.includes('not certain') ||
        response.includes('help me') || response.includes('no clue') || response.includes('confused')) {
      
      return generateRelevantFollowUpQuestion(userResponse, conversationHistory);
    }
    
    // If user gives a very general goal without specifics
    const generalGoalTerms = ['house', 'car', 'education', 'business', 'travel', 'wedding', 'investment'];
    const hasGeneralGoal = generalGoalTerms.some(term => response.includes(term));
    const hasSpecifics = response.includes('bhk') || response.includes('lakh') || response.includes('crore') || 
                        response.includes('year') || response.includes('month') || response.includes('mumbai') || 
                        response.includes('delhi') || response.includes('bangalore');
    
    if (hasGeneralGoal && !hasSpecifics && response.split(' ').length < 8) {
      return generateRelevantFollowUpQuestion(userResponse, conversationHistory);
    }
    
    if (response.includes('urgent') || response.includes('asap') || response.includes('quickly')) {
      return "I understand you need this quickly! That's important context. Let me help you find the most efficient way to achieve your goal. What's the specific item or goal you're looking at, and do you have any idea about the cost range?";
    }
    
    if (response.includes('family') || response.includes('growing') || response.includes('children')) {
      return "Family considerations are crucial in financial planning! Let me help you find the best solution that works for your family's needs. What specific goal are you planning for, and do you have any budget range in mind?";
    }
  }
  
  if (currentStep === 'income_savings') {
    if (response.includes('unstable') || response.includes('irregular') || response.includes('variable')) {
      return "I understand your income is irregular. That's actually quite common! Let me help you create a flexible plan that works with your income pattern. What's your average monthly income, and what's the minimum you can consistently invest?";
    }
    
    if (response.includes('low') || response.includes('not enough') || response.includes('struggling')) {
      return "I understand you're concerned about your current financial capacity. Don't worry - there are always ways to work towards your goals! Let me help you explore options that fit your current situation. What's your current monthly income?";
    }
  }
  
  if (currentStep === 'existing_savings') {
    if (response.includes('nothing') || response.includes('zero') || response.includes('starting fresh')) {
      return "Starting fresh is perfectly fine! Many successful investors begin with zero savings. Let me help you create a plan that builds your financial foundation from the ground up. What's your current monthly income?";
    }
    
    if (response.includes('debt') || response.includes('loans') || response.includes('borrowed')) {
      return "I understand you have existing debt. That's an important factor to consider in your financial planning. Let me help you create a plan that addresses both your debt and your goals. What's the total amount of debt you're carrying?";
    }
  }
  
  // Enhanced default adaptive response based on conversation context
  return generateIntelligentFollowUpQuestion(userResponse, currentStep, conversationHistory);
};

// Function to generate intelligent, context-aware follow-up questions
const generateIntelligentFollowUpQuestion = (userResponse: string, currentStep: string, conversationHistory: Array<{ role: 'user' | 'assistant', content: string }>): string => {
  const response = userResponse.toLowerCase();
  
  // Analyze what information we already have from the conversation
  const allUserMessages = conversationHistory.filter(msg => msg.role === 'user').map(msg => msg.content).join(' ').toLowerCase();
  const hasGoalMentioned = allUserMessages.includes('house') || allUserMessages.includes('car') || allUserMessages.includes('education') || 
                          allUserMessages.includes('business') || allUserMessages.includes('travel') || allUserMessages.includes('wedding');
  
  // Extract any financial figures mentioned
  const extractedFigures = extractFinancialFigures(allUserMessages, 'general');
  
  // Context-specific intelligent questions based on current step and conversation state
  switch (currentStep) {
    case 'goal_collection':
      if (response.length < 5) {
        return "I'd love to help you with your financial planning! What's your main financial goal or something you're looking to save money for?\n\n**For example:**\n• \"I want to buy my own house\"\n• \"Planning for my child's education\"\n• \"Looking to buy a car\"\n• \"Starting a business\"\n• \"Retirement planning\"";
      }
      
      if (hasGoalMentioned) {
        return "Great! I can see you're interested in financial planning. To give you the most accurate advice, could you share what specific goal you'd like to achieve?\n\n**Please tell me:**\n• What exactly are you planning for?\n• Any specific timeline you have in mind?\n• Do you have a rough idea of the cost?";
      }
      
      return "I'm here to help you create a personalized financial plan! What's the main thing you'd like to save money for or achieve financially?\n\n**Popular goals:**\n• Buying property (house/apartment)\n• Vehicle purchase (car/bike)\n• Education planning\n• Business investment\n• Travel or lifestyle goals";
      
    case 'goal_amount_determination':
      if (!extractedFigures.amount) {
        if (allUserMessages.includes('house') || allUserMessages.includes('property')) {
          return "Perfect! For house planning, I need to understand the cost range. **What's your target budget for the property?**\n\n**If you're unsure:**\n• Which city are you looking at?\n• What type of property (2BHK, 3BHK)?\n• Any area preferences?\n\nI can help research current market prices with these details!";
        }
        
        if (allUserMessages.includes('car') || allUserMessages.includes('vehicle')) {
          return "Excellent! For your car purchase plan, **what's your target budget?**\n\n**If you're not sure about pricing:**\n• Any specific brand you prefer?\n• What type of car (hatchback, sedan, SUV)?\n• New or pre-owned?\n\nI can provide current market pricing with these details!";
        }
        
        if (allUserMessages.includes('education') || allUserMessages.includes('college')) {
          return "Great goal! Education is a wonderful investment. **What's your target budget for education expenses?**\n\n**If you need help estimating:**\n• What type of course/degree?\n• Government or private institutions?\n• Any specific colleges in mind?\n\nI can help you find current education costs!";
        }
        
        return "I understand your goal! To create the best financial plan, **what's your target amount for this goal?**\n\n**If you're unsure about the cost:**\n• Share more details about what exactly you're planning\n• Any specifications or requirements you have\n• Timeline when you need this\n\nI'll help you research accurate pricing!";
      }
      
      return "Thanks for sharing! I have your goal details. Now I need to understand your financial situation better. **What's your current monthly income and how much can you realistically invest towards this goal each month?**";
      
    case 'goal_timeline_determination':
      return "Great! I have your goal and budget. **When are you planning to achieve this goal?**\n\n**Examples:**\n• \"In 3 years\"\n• \"5 years from now\"\n• \"My child will need this in 8 years\"\n• \"As soon as possible\"";
      
    case 'income_savings':
      if (!extractedFigures.income) {
        return "Perfect! Now I need to understand your financial capacity. **Could you share:**\n\n**1. Your monthly income** (salary, business income, etc.)\n**2. How much you can invest monthly** towards this goal\n\n**Example:** \"I earn ₹8 LPA and can invest ₹25,000 monthly\"";
      }
      
      if (!extractedFigures.existingSavings) {
        return "Excellent! I have your income details. **Do you have any existing savings or investments** that we can consider for this goal?\n\n**Examples:**\n• \"₹3 lakhs in FDs and ₹2 lakhs in mutual funds\"\n• \"No existing savings, starting fresh\"\n• \"₹5 lakhs in PPF\"";
      }
      
      return "Thank you for the financial details! Let me analyze your goal feasibility and create a comprehensive investment plan.";
      
    case 'feasibility_analysis':
      return "Based on all your details, I'm preparing a complete feasibility analysis with investment recommendations. This will show if your goal is achievable and the best strategy to reach it.";
      
    default:
      // Analyze user response for better contextual questions
      if (response.includes('yes') || response.includes('sure') || response.includes('okay')) {
        return "Great! I'm ready to help you create a personalized financial plan. **What's your main financial goal?** Are you planning to:\n\n• Buy a house or property?\n• Purchase a vehicle?\n• Save for education?\n• Start a business?\n• Something else?";
      }
      
      if (response.includes('help') || response.includes('confused') || response.includes('not sure')) {
        return "No worries! I'm here to guide you through this. Let's start simple. **What's one thing you'd like to save money for or achieve financially?**\n\n**Think about:**\n• Something you want to buy\n• A goal you want to achieve\n• A dream you want to fulfill\n\nJust tell me in your own words!";
      }
      
      return "I understand you're interested in financial planning! **To give you the best personalized advice, could you tell me:**\n\n• What's your main financial goal?\n• What are you looking to save money for?\n• Any specific target you have in mind?\n\n**Just describe it in your own words** - I'll help you create a plan for it!";
  }
};

// Enhanced helper function to search for pricing information and ask contextual questions
const searchPricingInformation = async (goalDescription: string, conversationHistory: Array<{ role: 'user' | 'assistant', content: string }>): Promise<string> => {
  try {
    console.log('Searching for pricing information for:', goalDescription);
    
    // Analyze the goal description to determine what additional context we need
    const needsLocationContext = (goalDescription.toLowerCase().includes('house') || 
                                  goalDescription.toLowerCase().includes('home') || 
                                  goalDescription.toLowerCase().includes('property') ||
                                  goalDescription.toLowerCase().includes('apartment') ||
                                  goalDescription.toLowerCase().includes('flat'));
    
    const needsBrandContext = (goalDescription.toLowerCase().includes('car') || 
                               goalDescription.toLowerCase().includes('vehicle') ||
                               goalDescription.toLowerCase().includes('bike') ||
                               goalDescription.toLowerCase().includes('motorcycle'));
    
    const needsEducationContext = (goalDescription.toLowerCase().includes('education') || 
                                   goalDescription.toLowerCase().includes('college') || 
                                   goalDescription.toLowerCase().includes('university') ||
                                   goalDescription.toLowerCase().includes('course') ||
                                   goalDescription.toLowerCase().includes('mba') ||
                                   goalDescription.toLowerCase().includes('engineering'));

    // Check if user has already provided specific details in conversation
    const recentUserMessages = conversationHistory
      .filter(msg => msg.role === 'user')
      .slice(-3)
      .map(msg => msg.content.toLowerCase())
      .join(' ');

    // Create contextual search query
    let searchQuery = '';
    let contextualQuestions: string[] = [];
    
    if (needsLocationContext) {
      searchQuery = `${goalDescription} price cost in India 2024 average`;
      
      if (!recentUserMessages.includes('mumbai') && !recentUserMessages.includes('delhi') && 
          !recentUserMessages.includes('bangalore') && !recentUserMessages.includes('pune') &&
          !recentUserMessages.includes('city') && !recentUserMessages.includes('location')) {
        contextualQuestions.push(
          "📍 **Location Details**: Which city or area are you looking at? (e.g., Mumbai suburbs, Delhi NCR, Bangalore IT corridor)"
        );
      }
      
      if (!recentUserMessages.includes('bhk') && !recentUserMessages.includes('bedroom') && 
          !recentUserMessages.includes('size') && !recentUserMessages.includes('area')) {
        contextualQuestions.push(
          "🏠 **Property Type**: What type of property? (e.g., 2 BHK apartment, 3 BHK independent house, 1200 sq ft)"
        );
      }
      
    } else if (needsBrandContext) {
      searchQuery = `${goalDescription} price India 2024 models`;
      
      if (!recentUserMessages.includes('brand') && !recentUserMessages.includes('model') &&
          !recentUserMessages.includes('maruti') && !recentUserMessages.includes('hyundai') &&
          !recentUserMessages.includes('tata') && !recentUserMessages.includes('honda')) {
        contextualQuestions.push(
          "🚗 **Vehicle Preferences**: Any specific brand or model in mind? (e.g., Maruti Swift, Hyundai Creta, Honda City)"
        );
      }
      
      if (!recentUserMessages.includes('variant') && !recentUserMessages.includes('type') &&
          !recentUserMessages.includes('petrol') && !recentUserMessages.includes('diesel')) {
        contextualQuestions.push(
          "⚙️ **Variant Details**: Any preferences for variant/fuel type? (e.g., petrol automatic, diesel manual, top variant)"
        );
      }
      
    } else if (needsEducationContext) {
      searchQuery = `${goalDescription} cost fees India 2024`;
      
      if (!recentUserMessages.includes('engineering') && !recentUserMessages.includes('medical') &&
          !recentUserMessages.includes('mba') && !recentUserMessages.includes('degree') &&
          !recentUserMessages.includes('course')) {
        contextualQuestions.push(
          "🎓 **Course Details**: What specific course or degree? (e.g., Engineering, MBA, Medical, B.Tech, Study abroad)"
        );
      }
      
      if (!recentUserMessages.includes('government') && !recentUserMessages.includes('private') &&
          !recentUserMessages.includes('college') && !recentUserMessages.includes('university')) {
        contextualQuestions.push(
          "🏫 **Institution Type**: Government or private institution? (Government colleges are typically cheaper)"
        );
      }
      
    } else {
      searchQuery = `${goalDescription} price cost in India 2024`;
    }
    
    // Perform web search
    const searchResult = await webSearchService.searchWeb(searchQuery);
    
    if (searchResult.success && searchResult.results && searchResult.results.length > 0) {
      const topResult = searchResult.results[0];
      let response = `Based on current market research, here's what I found about ${goalDescription}:\n\n${topResult?.snippet || 'Current market information'}\n\nSource: ${topResult?.title || 'Market Research'}`;
      
      // Add contextual questions to get more specific information
      if (contextualQuestions.length > 0) {
        response += `\n\n**To provide more accurate estimates, I'd like to know:**\n\n${contextualQuestions.join('\n')}\n\nOnce you provide these details, I can give you a more precise cost estimate for your financial planning.`;
    } else {
        response += `\n\nThis gives us a good starting point for your financial planning. Would you like to proceed with this estimate, or do you have a more specific budget in mind?`;
      }
      
      return response;
    } else {
      // Fallback when search fails - still ask contextual questions
      let response = `I'd like to help you find current pricing for ${goalDescription}. `;
      
      if (contextualQuestions.length > 0) {
        response += `To provide accurate estimates, please share:\n\n${contextualQuestions.join('\n')}\n\nWith these details, I can research current market prices and help you set a realistic target amount.`;
      } else {
        response += `Could you tell me more about your specific requirements (like location, size, brand, etc.) so I can provide a more accurate estimate?`;
      }
      
      return response;
    }
  } catch (error) {
    console.error('Error searching for pricing information:', error);
    return `I'd like to help you find current pricing for ${goalDescription}. Could you share specific details about your requirements (like location, size, brand, type, etc.) so I can provide a better estimate? This will help me research current market data and give you accurate cost projections.`;
  }
};

// Helper function to format questions with sample answer formats
const formatQuestionWithSamples = (question: string, questionType: string): string => {
  const sampleFormats: { [key: string]: string[] } = {
    timeline: [
      '• "5 years" or "10 years"',
      '• "I want to buy a house in 3 years"',
      '• "My child will start college in 8 years"'
    ],
    amount: [
      '• "50 lakhs" or "1 crore"',
      '• "Around ₹75 lakhs in my city"',
      '• "Between 60-80 lakhs depending on location"'
    ],
    income: [
      '• "₹50,000 per month, can invest ₹20,000"',
      '• "I earn ₹8 LPA, can save ₹30,000 monthly"',
      '• "Monthly income ₹1.2 lakhs, investment capacity ₹40,000"'
    ],
    risk_appetite: [
      '• "Conservative - I prefer safe investments"',
      '• "Balanced - mix of safe and growth"',
      '• "Aggressive - I can take higher risks for better returns"'
    ],
    profession: [
      '• "Software Engineer"',
      '• "Business Owner"',
      '• "Government Employee"'
    ],
    goal: [
      '• "Buy a house worth ₹1 crore"',
      '• "Save for child\'s education"',
      '• "Plan for retirement"'
    ]
  };

  const samples = sampleFormats[questionType] || [];
  if (samples.length === 0) return question;

  return `${question}

Sample format:
${samples.join('\n')}`;
};

// Function to determine current step in the conversation - SIMPLIFIED VERSION
const determineCurrentStep = (conversationHistory: Array<{ role: 'user' | 'assistant', content: string }>, extracted: any, userInfo?: { username?: string; isAuthenticated?: boolean }): string => {
  console.log('=== STEP DETERMINATION DEBUG ===');
  
  const allUserMessages = conversationHistory.filter(msg => msg.role === 'user').map(msg => msg.content).join(' ').toLowerCase();
  const allAssistantMessages = conversationHistory.filter(msg => msg.role === 'assistant').map(msg => msg.content).join(' ').toLowerCase();
  
  console.log('All user messages:', allUserMessages);
  console.log('All assistant messages (last 100 chars):', allAssistantMessages.slice(-100));
  
  // Simple goal detection - if user has mentioned any common goal words
  const hasGoal = allUserMessages.includes('house') || 
                 allUserMessages.includes('car') || 
                 allUserMessages.includes('education') || 
                 allUserMessages.includes('buy') || 
                 allUserMessages.includes('want') ||
                 allUserMessages.includes('goal') ||
                 allUserMessages.includes('home') ||
                 allUserMessages.includes('property') ||
                 allUserMessages.includes('marriage') ||
                 allUserMessages.includes('wedding') ||
                 allUserMessages.includes('retirement') ||
                 allUserMessages.includes('business') ||
                 allUserMessages.includes('study') ||
                 allUserMessages.includes('college') ||
                 allUserMessages.includes('travel') ||
                 allUserMessages.includes('dream') ||
                 allUserMessages.includes('plan') ||
                 // If user has written a long descriptive message (likely contains goal)
                 allUserMessages.replace(/[^\w\s]/g, '').split(' ').filter(word => word.length > 2).length > 6;
  
  // Check what's been asked by looking at assistant messages - COMPREHENSIVE GOAL DETECTION
  const hasAskedGoal = allAssistantMessages.includes('inspirational life goal') || 
                       allAssistantMessages.includes('what you want to accomplish') ||
                       allAssistantMessages.includes('financial goal') ||
                       allAssistantMessages.includes('what inspirational life goal do you have') ||
                       allAssistantMessages.includes('buy a house worth') ||
                       allAssistantMessages.includes('save for child') ||
                       allAssistantMessages.includes('plan for retirement') ||
                       // Check for sample formats that would have been shown to user
                       allAssistantMessages.includes('sample format') ||
                       // Also check conversation position - if we're past message 3/4, goal was likely asked
                       (conversationHistory.length > (userInfo?.isAuthenticated ? 2 : 3));
  
  const hasAskedAmount = allAssistantMessages.includes('target budget') || 
                        allAssistantMessages.includes('target amount') ||
                        allAssistantMessages.includes('approximate cost') ||
                        allAssistantMessages.includes('budget');

  console.log('Goal detection:', {
    hasGoal,
    hasAskedGoal,
    hasAskedAmount,
    extractedAmount: extracted.amount,
    extractedTimeline: extracted.timeline,
    extractedIncome: extracted.income
  });
  
  // Step 1: If no goal detected AND haven't asked for goal yet
  if (!hasGoal && !hasAskedGoal) {
    console.log('→ STEP: goal_collection (no goal detected and not asked yet)');
    return 'goal_collection';
  }
  
  // Step 2: If goal detected OR goal was asked (user likely provided goal), but no amount
  if ((hasGoal || hasAskedGoal) && !extracted.amount) {
    console.log('→ STEP: goal_amount_determination (goal detected or asked, no amount)');
    return 'goal_amount_determination';
  }
  
  // Step 3: If goal and amount but no timeline
  if ((hasGoal || hasAskedGoal) && extracted.amount && !extracted.timeline) {
    console.log('→ STEP: goal_timeline_determination (have goal & amount, need timeline)');
    return 'goal_timeline_determination';
  }
  
  // Step 4: If goal, amount, timeline but no income
  if ((hasGoal || hasAskedGoal) && extracted.amount && extracted.timeline && !extracted.income) {
    console.log('→ STEP: income_savings (have goal, amount & timeline, need income)');
    return 'income_savings';
  }
  
  // Step 5: If we have goal, amount, timeline, income - do feasibility
  if ((hasGoal || hasAskedGoal) && extracted.amount && extracted.timeline && extracted.income) {
    console.log('→ STEP: feasibility_analysis (have all required info)');
    return 'feasibility_analysis';
  }
  
  // Fallback
  console.log('→ STEP: goal_collection (fallback)');
  return 'goal_collection';
};

// Function to generate step-based questions
const generateStepBasedQuestion = async (
  currentStep: string,
  conversationHistory: Array<{ role: 'user' | 'assistant', content: string }>,
  extracted: any,
  userInfo?: { username?: string; isAuthenticated?: boolean }
): Promise<{ success: boolean; message: string; isGeneratingPlan?: boolean }> => {
  try {
    const userName = userInfo?.username || '';
    const greeting = userName ? `${userName}, ` : '';
    
    // Check if we've already asked the same question recently
    const recentAssistantMessages = conversationHistory
      .filter(msg => msg.role === 'assistant')
      .slice(-3) // Check last 3 assistant messages
      .map(msg => msg.content.toLowerCase());
    
    const hasRecentlyAskedGoal = recentAssistantMessages.some(msg => 
      msg.includes('financial goal') || msg.includes('what you want to achieve') || msg.includes('specific goal')
    );
    const hasRecentlyAskedAmount = recentAssistantMessages.some(msg => 
      msg.includes('target amount') || msg.includes('cost') || msg.includes('budget')
    );
    const hasRecentlyAskedTimeline = recentAssistantMessages.some(msg => 
      msg.includes('timeline') || msg.includes('years') || msg.includes('when')
    );
    const hasRecentlyAskedIncome = recentAssistantMessages.some(msg => 
      msg.includes('income') || msg.includes('salary') || msg.includes('earn') || msg.includes('lpa')
    );
    const hasRecentlyAskedSavings = recentAssistantMessages.some(msg => 
      msg.includes('existing') || msg.includes('savings') || msg.includes('fd') || msg.includes('mutual fund')
    );
    
    console.log('Question generation - Recent questions asked:', {
      hasRecentlyAskedGoal,
      hasRecentlyAskedAmount,
      hasRecentlyAskedTimeline,
      hasRecentlyAskedIncome,
      hasRecentlyAskedSavings
    });
    
    switch (currentStep) {
      case 'goal_collection':
          return {
            success: true,
            message: `${greeting}What inspirational life goal do you have? I would love to hear from you – it could be investment advice, any goal you want to accomplish, or even just curiosity on any investment or anything else too.

Please share your goal in your own words. There's no specific format required – just tell me what you're hoping to achieve and I'll help you create a plan for it.`
        };
        
      case 'goal_amount_determination':
        if (!hasRecentlyAskedAmount) {
          // Extract the goal from previous user message for personalized response
          const lastUserMessage = conversationHistory.filter(msg => msg.role === 'user').slice(-1)[0]?.content || '';
          const goalMention = lastUserMessage.includes('buy') || lastUserMessage.includes('purchase') ? 'this purchase' : 'achieving this goal';
          
          return {
            success: true,
            message: `${greeting}Great choice! Now, what's your target budget for ${goalMention}?

Sample format:
• "Around ₹50 lakhs"
• "Between ₹25-30 lakhs"  
• "I'm not sure about the exact amount" (I can help you research current market prices)`
          };
        }
        
        // If we've already asked for amount, user might be having trouble providing it
        // Use adaptive response to help them
        const lastUserMessageAmount = conversationHistory
          .filter(msg => msg.role === 'user')
          .slice(-1)[0]?.content || '';
        
        if (lastUserMessageAmount) {
          try {
            const adaptiveResponse = handleAdaptiveResponse(lastUserMessageAmount, 'goal_amount_determination', extracted, conversationHistory);
            return {
              success: true,
              message: `${greeting}${adaptiveResponse}`
            };
          } catch (error) {
            console.error('Error in handleAdaptiveResponse for amount determination:', error);
            // Fallback response
            return {
              success: true,
              message: `${greeting}I understand you might need help determining the cost. Could you share more details about your goal? For example, if it's a house - which city and what type? If it's a car - any specific brand or model? This will help me research current market prices for you.`
            };
          }
        }
        
        return {
          success: true,
          message: `${greeting}I'm here to help you determine the target amount for your goal. Could you provide more details about what you're planning to achieve?`
        };
        break;
        
      case 'goal_timeline_determination':
        if (!hasRecentlyAskedTimeline) {
          return {
            success: true,
            message: `${greeting}Perfect! What's your target timeline for achieving this goal?

Sample format:
• "5 years"
• "3-4 years"
• "I want it in 2 years"`
          };
        }
        break;
        
      case 'goal_amount_timeline':
        if (!extracted.amount && !hasRecentlyAskedAmount) {
          // Check if user mentioned a specific goal but didn't provide amount
          const lastUserMessage = conversationHistory
            .filter(msg => msg.role === 'user')
            .slice(-1)[0]?.content || '';
          
          // If user mentioned a specific item but no amount, search for pricing
          if (lastUserMessage && !lastUserMessage.includes('lakh') && !lastUserMessage.includes('crore') && !lastUserMessage.includes('₹') && !lastUserMessage.includes('year') && !lastUserMessage.includes('month')) {
            try {
              const pricingInfo = await searchPricingInformation(lastUserMessage, conversationHistory);
            return {
              success: true,
              message: `${greeting}${pricingInfo}`
            };
            } catch (error) {
              console.error('Error in searchPricingInformation:', error);
              // Fallback to basic response if pricing search fails
              return {
                success: true,
                message: `${greeting}I'd love to help you research pricing for your goal! Could you tell me more details about what you're looking for? For example, if it's a house - which city, what type? If it's a car - any specific brand or model? This will help me provide accurate cost estimates.`
              };
            }
          }
          
          return {
            success: true,
            message: `${greeting}Great! Now I need to understand the specifics of your goal to create an accurate financial plan. 

Let me ask this step by step:

**Target Amount** - What's the approximate cost you're expecting for this goal?

Sample responses:
• "Around ₹50 lakhs" or "₹1 crore"
• "Between ₹75-80 lakhs depending on specifications"
• "I'm not sure about the exact cost" (I'll help you research current market prices)

**If you're unsure about the amount**, I can help you research current pricing by understanding:
• Specific details about what you're looking for
• Location or area preferences
• Brand, size, or type specifications
• Any other requirements that affect cost

Just share what you know, and I'll guide you through finding realistic cost estimates using current market data!`

          };
        }
        if (extracted.amount && !extracted.timeline && !hasRecentlyAskedTimeline) {
          return {
            success: true,
            message: `${greeting}Perfect! I have the amount (${extracted.amount}). Now I need to know your target timeline for achieving this goal.

Sample format:
• "5 years" or "10 years"
• "I want to buy a house in 3 years"
• "My child will start college in 8 years"`

          };
        }
        // If we have both amount and timeline, move to next step
        if (extracted.amount && extracted.timeline) {
          return generateStepBasedQuestion('income_savings', conversationHistory, extracted, userInfo);
        }
        // If we've already asked recently, check if user gave unexpected response
        const lastUserMessageGoal = conversationHistory
          .filter(msg => msg.role === 'user')
          .slice(-1)[0]?.content || '';
        
        if (lastUserMessageGoal) {
          try {
            const adaptiveResponse = handleAdaptiveResponse(lastUserMessageGoal, 'goal_amount_timeline', extracted, conversationHistory);
          return {
            success: true,
            message: `${greeting}${adaptiveResponse}`
          };
          } catch (error) {
            console.error('Error in handleAdaptiveResponse:', error);
            // Fallback response
            return {
              success: true,
              message: `${greeting}I understand you're sharing your goal with me. Could you tell me what the target amount would be for achieving this goal? If you're not sure about the exact cost, I can help you research current market prices.`
            };
          }
        }
        
        return {
          success: true,
          message: `${greeting}I'm waiting for your response to help me understand your goal better.`
        };
        
      case 'income_savings':
        if (!hasRecentlyAskedIncome) {
          return {
            success: true,
            message: `${greeting}What is your current monthly income and how much can you invest monthly towards this goal?

Sample format:
• "₹50,000 per month, can invest ₹20,000"
• "I earn ₹8 LPA, can save ₹30,000 monthly"
• "Monthly income ₹1.2 lakhs, investment capacity ₹40,000"`

          };
        }
        // If we've already asked recently, check if user gave unexpected response
        const lastUserMessageIncome = conversationHistory
          .filter(msg => msg.role === 'user')
          .slice(-1)[0]?.content || '';
        
        if (lastUserMessageIncome) {
          const adaptiveResponse = handleAdaptiveResponse(lastUserMessageIncome, 'income_savings', extracted, conversationHistory);
          return {
            success: true,
            message: `${greeting}${adaptiveResponse}`
          };
        }
        
        return {
          success: true,
          message: `${greeting}I'm waiting for your income and investment details to proceed with the analysis.`
        };
        
      case 'existing_savings':
        if (!hasRecentlyAskedSavings) {
          return {
            success: true,
            message: `${greeting}Do you have any existing savings or investments that we can consider for this goal?

Sample format:
• "I have ₹2 lakhs in FDs"
• "₹5 lakhs in mutual funds already"
• "No existing savings, starting fresh"`

          };
        }
        // If we've already asked recently, check if user gave unexpected response
        const lastUserMessageSavings = conversationHistory
          .filter(msg => msg.role === 'user')
          .slice(-1)[0]?.content || '';
        
        if (lastUserMessageSavings) {
          const adaptiveResponse = handleAdaptiveResponse(lastUserMessageSavings, 'existing_savings', extracted, conversationHistory);
          return {
            success: true,
            message: `${greeting}${adaptiveResponse}`
          };
        }
        
        return {
          success: true,
          message: `${greeting}I'm waiting for your existing savings information to complete the analysis.`
        };
        
      case 'feasibility_analysis':
        // Perform feasibility analysis and provide results
        return await performFeasibilityAnalysis(conversationHistory, extracted, userInfo);
        
      default:
        return {
          success: true,
          message: `${greeting}Could you share more details about your financial situation?`
        };
    }
  } catch (error) {
    console.error('Error in generateStepBasedQuestion:', error);
    return {
      success: true,
      message: `${greeting}Could you tell me more about your financial goals?`
    };
  }
};

// Function to perform feasibility analysis
const performFeasibilityAnalysis = async (
  conversationHistory: Array<{ role: 'user' | 'assistant', content: string }>,
  extracted: any,
  userInfo?: { username?: string; isAuthenticated?: boolean }
): Promise<{ success: boolean; message: string; isGeneratingPlan?: boolean }> => {
  try {
    const userName = userInfo?.username || '';
    const greeting = userName ? `${userName}, ` : '';
    
    // Extract key information
    const goalAmount = extracted.amount || 0;
    const timeline = extracted.timeline || 0;
    const monthlyInvestment = extracted.monthlyInvestment || 0;
    const existingSavings = extracted.existingSavings || 0;
    
    // Calculate feasibility
    const annualReturn = 0.10; // 10% annual return
    const monthlyReturn = annualReturn / 12;
    const totalMonths = timeline * 12;
    
    // Future value of existing savings
    const futureValueExisting = existingSavings * Math.pow(1 + annualReturn, timeline);
    
    // Future value of monthly investments (SIP)
    const futureValueSIP = monthlyInvestment * ((Math.pow(1 + monthlyReturn, totalMonths) - 1) / monthlyReturn) * (1 + monthlyReturn);
    
    const totalAccumulation = futureValueExisting + futureValueSIP;
    const shortfall = goalAmount - totalAccumulation;
    
    if (totalAccumulation >= goalAmount) {
      // Goal is achievable
      const surplus = totalAccumulation - goalAmount;
      return {
        success: true,
        message: `${greeting}Let me calculate if your goal is achievable:

**Current Resources:**
• Existing Savings: ₹${(existingSavings / 100000).toFixed(1)} lakhs
• Monthly Investment: ₹${(monthlyInvestment / 1000).toFixed(1)}k
• Timeline: ${timeline} years
• Expected Returns: 10%* annually

**Calculation:**
• Future Value of ₹${(existingSavings / 100000).toFixed(1)} lakhs in ${timeline} years: ₹${(futureValueExisting / 100000).toFixed(1)} lakhs*
• Future Value of ₹${(monthlyInvestment / 1000).toFixed(1)}k monthly SIP: ₹${(futureValueSIP / 100000).toFixed(1)} lakhs*
• **Total Accumulation: ₹${(totalAccumulation / 100000).toFixed(1)} lakhs***

**Result: ✅ GOAL IS ACHIEVABLE!** You'll have ₹${(surplus / 100000).toFixed(1)} lakhs* more than needed.

Let me create your personalized investment plan...`,
        isGeneratingPlan: true
      };
    } else {
      // Goal is not achievable
      return {
        success: true,
        message: `${greeting}Let me calculate if your goal is achievable:

**Current Resources:**
• Existing Savings: ₹${(existingSavings / 100000).toFixed(1)} lakhs
• Monthly Investment: ₹${(monthlyInvestment / 1000).toFixed(1)}k
• Timeline: ${timeline} years
• Expected Returns: 10%* annually

**Calculation:**
• Future Value of ₹${(existingSavings / 100000).toFixed(1)} lakhs in ${timeline} years: ₹${(futureValueExisting / 100000).toFixed(1)} lakhs*
• Future Value of ₹${(monthlyInvestment / 1000).toFixed(1)}k monthly SIP: ₹${(futureValueSIP / 100000).toFixed(1)} lakhs*
• **Total Accumulation: ₹${(totalAccumulation / 100000).toFixed(1)} lakhs***

**Result: ❌ GOAL IS NOT ACHIEVABLE** - You'll be short by ₹${(shortfall / 100000).toFixed(1)} lakhs*

Don't worry! I have several alternatives to help you achieve your goal:

**Option 1: Timeline Extension**
- Extend timeline to ${Math.ceil(timeline * 1.5)}-${Math.ceil(timeline * 2)} years
- This would make your goal achievable with current investment capacity

**Option 2: Second-hand/Pre-owned Options**
- Consider pre-owned alternatives (cars, bikes, homes)
- Could save 30-50% on cost while meeting your needs
- Many excellent options available with proper verification

**Option 3: Income Enhancement**
- What's your current profession? I can suggest specific skills to increase your income
- Side business opportunities based on your skills
- Career advancement strategies

**Option 4: Alternative Goal Modifications**
- Consider smaller/different variants of your goal
- Alternative locations or brands with better value
- Phased approach - achieve part of goal first

**Option 5: Financial Restructuring**
- Optimize existing investments for better returns
- Consider different investment strategies
- Review and optimize monthly expenses

Which option interests you most? I can provide detailed guidance on any of these.

**What is your profession?** This will help me provide targeted advice.

Sample format:
• "Software Engineer"
• "Business Owner"
• "Government Employee"`

      };
    }
  } catch (error) {
    console.error('Error in performFeasibilityAnalysis:', error);
    return {
      success: true,
      message: `${greeting}I need to gather more information to analyze your goal feasibility. Could you share your profession and current financial situation?`
    };
  }
};

// Function to convert Indian number formats to numeric values
const convertIndianNumberFormat = (text: string): number | null => {
  try {
    // Remove extra spaces and convert to lowercase
    const cleanText = text.toLowerCase().replace(/\s+/g, '');
    
    // Extract numeric part and unit
    const match = cleanText.match(/^(\d+(?:\.\d+)?)(lakh|lacs|crore|crores|thousand|k|cr|l|t)?$/);
    
    if (!match) return null;
    
    const numericValue = parseFloat(match[1]);
    const unit = match[2];
    
    if (isNaN(numericValue)) return null;
    
    // Convert based on unit
    switch (unit) {
      case 'lakh':
      case 'lacs':
      case 'l':
        return numericValue * 100000; // 1 lakh = 100,000
      case 'crore':
      case 'crores':
      case 'cr':
        return numericValue * 10000000; // 1 crore = 10,000,000
      case 'thousand':
      case 'k':
      case 't':
        return numericValue * 1000; // 1 thousand = 1,000
      default:
        // If no unit specified, assume it's already in the base unit
        return numericValue;
    }
  } catch (error) {
    console.error('Error converting Indian number format:', error);
    return null;
  }
};

// Function to create a new chat session and return conversation ID
export const createNewChatSession = async (
  userEmail?: string,
  isAuthenticated: boolean = false
): Promise<{ success: boolean; conversationId: string; error?: string }> => {
  try {
    // Generate a unique conversation ID
    const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log('ChatbotService: Created new chat session with ID:', conversationId);
    
    // If user is authenticated, create a conversation record in database
    if (isAuthenticated && userEmail) {
      try {
        // Import chatService dynamically to avoid circular dependencies
        const { chatService } = await import('./chatService');
        
        // Create conversation record
        const conversationData = {
          user_email: userEmail,
          title: 'New Financial Advisory Session',
          summary: 'Financial planning conversation started',
          message_count: 0,
          created_at: new Date(),
          last_message_at: new Date()
        };
        
        // Store the conversation
        const result = await chatService.storeConversation({
          ...conversationData,
          messages: []
        });
        
        if (result.success) {
          console.log('ChatbotService: Successfully created conversation in database:', result.conversationId);
          return { success: true, conversationId: result.conversationId || conversationId };
        } else {
          console.warn('ChatbotService: Failed to create conversation in database, using local ID:', result.error);
          return { success: true, conversationId };
        }
      } catch (dbError) {
        console.error('ChatbotService: Database error creating conversation, using local ID:', dbError);
        return { success: true, conversationId };
      }
    }
    
    // For unauthenticated users, return the local conversation ID
    return { success: true, conversationId };
    
  } catch (error) {
    console.error('ChatbotService: Error creating chat session:', error);
    const fallbackId = `conv_${Date.now()}_fallback`;
    return { success: false, conversationId: fallbackId, error: 'Failed to create chat session' };
  }
};

// Function to save entire conversation to database
export const saveConversationToDatabase = async (
  conversationId: string,
  messages: Array<{ role: 'user' | 'assistant', content: string }>,
  userEmail?: string,
  isAuthenticated: boolean = false
): Promise<{ success: boolean; error?: string }> => {
  try {
    if (!isAuthenticated || !userEmail) {
      console.log('ChatbotService: User not authenticated, skipping database save');
      return { success: true };
    }
    
    // Import chatService dynamically to avoid circular dependencies
    const { chatService } = await import('./chatService');
    
    // Convert messages to the format expected by chatService
    const chatMessages = messages.map((msg, index) => ({
      user_email: userEmail,
      message_text: msg.content,
      sender: msg.role as 'user' | 'bot',
      timestamp: new Date(Date.now() + index * 1000), // Ensure unique timestamps
      conversation_id: conversationId
    }));
    
    // Store all messages
    let successCount = 0;
    for (const message of chatMessages) {
      try {
        const result = await chatService.storeMessage(message);
        if (result.success) {
          successCount++;
        }
      } catch (error) {
        console.error('ChatbotService: Error storing message:', error);
      }
    }
    
    console.log(`ChatbotService: Successfully stored ${successCount}/${chatMessages.length} messages to database`);
    
    if (successCount > 0) {
      return { success: true };
    } else {
      return { success: false, error: 'Failed to store any messages' };
    }
    
  } catch (error) {
    console.error('ChatbotService: Error saving conversation to database:', error);
    return { success: false, error: 'Database save failed' };
  }
};

// Function to analyze user input complexity and determine what additional information is needed
const analyzeUserInputComplexity = (
  userMessage: string, 
  conversationHistory: Array<{ role: 'user' | 'assistant', content: string }>
): {
  complexity: 'low' | 'medium' | 'high';
  missingInfo: string[];
  needsClarification: string[];
  suggestedQuestions: string[];
} => {
  const result: {
    complexity: 'low' | 'medium' | 'high';
    missingInfo: string[];
    needsClarification: string[];
    suggestedQuestions: string[];
  } = {
    complexity: 'low',
    missingInfo: [],
    needsClarification: [],
    suggestedQuestions: []
  };

  try {
    const allUserMessages = conversationHistory.filter(msg => msg.role === 'user').map(msg => msg.content).join(' ');
    const currentMessage = userMessage.toLowerCase();
    const allContent = (allUserMessages + ' ' + currentMessage).toLowerCase();
    
    // Check for multiple goals
    const goalKeywords = ['goal', 'want', 'need', 'save', 'buy', 'achieve', 'plan'];
    const goalCount = goalKeywords.filter(keyword => allContent.includes(keyword)).length;
    
    // Check for complex financial situations
    const hasMultipleIncomeSources = (allContent.match(/income|salary|lpa|earn|business|freelance|consulting/g) || []).length > 2;
    const hasExistingInvestments = allContent.includes('existing') || allContent.includes('already') || allContent.includes('current');
    const hasDependents = allContent.includes('family') || allContent.includes('children') || allContent.includes('spouse') || allContent.includes('parents');
    
    // Check for vague or incomplete information
    const vagueResponses = [
      'maybe', 'not sure', 'dont know', "don't know", 'unsure', 'probably', 'around', 'approximately',
      'some', 'few', 'several', 'various', 'different'
    ];
    const hasVagueInfo = vagueResponses.some(vague => currentMessage.includes(vague));
    
    // Check for specific constraints or requirements
    const hasConstraints = allContent.includes('constraint') || allContent.includes('requirement') || 
                          allContent.includes('preference') || allContent.includes('condition');
    
    // Determine complexity level
    if (goalCount > 2 || hasMultipleIncomeSources || hasConstraints || hasVagueInfo) {
      result.complexity = 'high';
    } else if (goalCount > 1 || hasExistingInvestments || hasDependents) {
      result.complexity = 'medium';
    } else {
      result.complexity = 'low';
    }
    
    // Identify missing information
    if (!allContent.includes('timeline') && !allContent.includes('year') && !allContent.includes('month')) {
      result.missingInfo.push('timeline');
    }
    if (!allContent.includes('amount') && !allContent.includes('lakh') && !allContent.includes('crore')) {
      result.missingInfo.push('amount');
    }
    if (!allContent.includes('income') && !allContent.includes('salary') && !allContent.includes('lpa')) {
      result.missingInfo.push('income');
    }
    if (!allContent.includes('risk') && !allContent.includes('conservative') && !allContent.includes('moderate') && !allContent.includes('aggressive')) {
      result.missingInfo.push('risk_appetite');
    }
    if (!allContent.includes('profession') && !allContent.includes('job') && !allContent.includes('work')) {
      result.missingInfo.push('profession');
    }
    
    // Identify areas needing clarification
    if (hasVagueInfo) {
      result.needsClarification.push('specific_details');
    }
    if (goalCount > 1) {
      result.needsClarification.push('goal_prioritization');
    }
    if (hasMultipleIncomeSources) {
      result.needsClarification.push('income_breakdown');
    }
    if (hasExistingInvestments) {
      result.needsClarification.push('current_portfolio');
    }
    
    // Generate suggested questions based on missing information
    if (result.missingInfo.includes('timeline')) {
      result.suggestedQuestions.push('What is your target timeline for achieving this goal?');
    }
    if (result.missingInfo.includes('amount')) {
      result.suggestedQuestions.push('What is the approximate cost of your goal?');
    }
    if (result.missingInfo.includes('income')) {
      result.suggestedQuestions.push('What is your current monthly income and investment capacity?');
    }
    if (result.missingInfo.includes('risk_appetite')) {
      result.suggestedQuestions.push('What is your investment risk preference?');
    }
    if (result.missingInfo.includes('profession')) {
      result.suggestedQuestions.push('What is your current profession?');
    }
    
    // Add clarification questions for complex scenarios
    if (result.needsClarification.includes('goal_prioritization')) {
      result.suggestedQuestions.push('Which goal is your top priority?');
    }
    if (result.needsClarification.includes('income_breakdown')) {
      result.suggestedQuestions.push('Can you break down your income sources?');
    }
    if (result.needsClarification.includes('current_portfolio')) {
      result.suggestedQuestions.push('What are your current investments and their values?');
    }
    
    console.log('User input complexity analysis:', result);
    return result;
    
  } catch (error) {
    console.error('Error analyzing user input complexity:', error);
    return result;
  }
};

// Function to extract and convert financial figures from user input with context awareness
const extractFinancialFigures = (userInput: string, context?: 'goal_amount' | 'income' | 'general'): {
  amount?: number;
  timeline?: number;
  monthlyInvestment?: number;
  income?: number;
  existingSavings?: number;
} => {
  const result: {
    amount?: number;
    timeline?: number;
    monthlyInvestment?: number;
    income?: number;
    existingSavings?: number;
  } = {};
  
  try {
    const inputLower = userInput.toLowerCase();
    const words = userInput.split(/\s+/);
    
    // Context-aware extraction - prioritize based on what we're looking for
    const isGoalAmountContext = context === 'goal_amount' || 
      inputLower.includes('cost') || inputLower.includes('budget') || 
      inputLower.includes('price') || inputLower.includes('worth') ||
      inputLower.includes('buy') || inputLower.includes('need');
      
    const isIncomeContext = context === 'income' || 
      inputLower.includes('earn') || inputLower.includes('salary') || 
      inputLower.includes('income') || inputLower.includes('lpa') ||
      inputLower.includes('per month') || inputLower.includes('monthly income');
    
    words.forEach((word, index) => {
      const cleanWord = word.toLowerCase().replace(/[^\w.]/g, '');
      
      // Check for amount patterns with context awareness
      if (cleanWord.includes('lakh') || cleanWord.includes('lacs') || 
          cleanWord.includes('crore') || cleanWord.includes('crores') ||
          cleanWord.includes('thousand') || cleanWord.includes('k')) {
        const amount = convertIndianNumberFormat(word);
        if (amount) {
          // Prioritize based on context
          if (isIncomeContext && !result.income) {
            result.income = amount;
          } else if (isGoalAmountContext && !result.amount) {
            result.amount = amount;
          } else if (!result.amount && !result.income) {
            // Default behavior - first amount found becomes goal amount unless it's clearly income
            if (cleanWord.includes('lpa') || inputLower.includes('salary') || inputLower.includes('earn')) {
              result.income = amount;
            } else {
          result.amount = amount;
            }
          }
        }
      }
      
      // Check for timeline patterns
      if (cleanWord.includes('year') || cleanWord.includes('month')) {
        const numericMatch = word.match(/(\d+(?:\.\d+)?)/);
        if (numericMatch) {
          const value = parseFloat(numericMatch[1]);
          if (cleanWord.includes('year')) {
            result.timeline = value;
          } else if (cleanWord.includes('month') && !inputLower.includes('per month') && !inputLower.includes('monthly income')) {
            result.timeline = value / 12; // Convert months to years, but not for income descriptions
          }
        }
      }
      
      // Check for monthly investment patterns
      if ((cleanWord.includes('month') || cleanWord.includes('monthly')) && 
          (inputLower.includes('invest') || inputLower.includes('save') || inputLower.includes('sip'))) {
        const prevWord = words[index - 1];
        const nextWord = words[index + 1];
        let amount = 0;
        
        if (prevWord) {
          amount = convertIndianNumberFormat(prevWord);
        }
        if (!amount && nextWord) {
          amount = convertIndianNumberFormat(nextWord);
        }
        
        if (amount && !result.monthlyInvestment) {
          result.monthlyInvestment = amount;
        }
      }
      
      // Check for income patterns with better context detection
      if (cleanWord.includes('lpa') || 
          (cleanWord.includes('salary') || cleanWord.includes('income')) ||
          inputLower.includes('earn') || inputLower.includes('per month')) {
        const prevWord = words[index - 1];
        const nextWord = words[index + 1];
        let amount = 0;
        
        if (prevWord) {
          amount = convertIndianNumberFormat(prevWord);
        }
        if (!amount && nextWord) {
          amount = convertIndianNumberFormat(nextWord);
        }
        
        if (amount && !result.income) {
          result.income = amount;
        }
      }
    });
    
    // Specific patterns for goal amounts (only if not already found and context is appropriate)
    if (!result.amount && (context === 'goal_amount' || !isIncomeContext)) {
      const goalPatterns = [
        /(?:cost|price|budget|worth|need|buy).*?(\d+(?:\.\d+)?)\s*(lakh|lacs|crore|crores|thousand|k|cr|l|t)/gi,
        /(\d+(?:\.\d+)?)\s*(lakh|lacs|crore|crores|thousand|k|cr|l|t).*?(?:cost|price|budget|worth)/gi
      ];
      
      for (const pattern of goalPatterns) {
        const match = userInput.match(pattern);
        if (match) {
          const amount = convertIndianNumberFormat(match[0]);
          if (amount && !result.amount) {
          result.amount = amount;
            break;
          }
        }
      }
    }
    
    // Specific patterns for income (only if not already found and context is appropriate)
    if (!result.income && (context === 'income' || !isGoalAmountContext)) {
      const incomePatterns = [
        /(?:earn|salary|income|lpa).*?(\d+(?:\.\d+)?)\s*(lakh|lacs|crore|crores|thousand|k|cr|l|t|lpa)/gi,
        /(\d+(?:\.\d+)?)\s*(lakh|lacs|crore|crores|thousand|k|cr|l|t|lpa).*?(?:salary|income|earn|per year|annually)/gi
      ];
      
      for (const pattern of incomePatterns) {
        const match = userInput.match(pattern);
        if (match) {
          const amount = convertIndianNumberFormat(match[0]);
          if (amount && !result.income) {
            result.income = amount;
            break;
          }
        }
      }
    }
    
    // Check for existing savings patterns
    const existingSavingsPatterns = [
      /(?:have|existing|savings|saved|invested|fd|mutual fund|asset).*?(\d+(?:\.\d+)?)\s*(lakh|lacs|crore|crores|thousand|k|cr|l|t)/gi,
      /(\d+(?:\.\d+)?)\s*(lakh|lacs|crore|crores|thousand|k|cr|l|t).*?(?:savings|fd|mutual fund|investment|asset)/gi
    ];
    
    for (const pattern of existingSavingsPatterns) {
      const match = userInput.match(pattern);
      if (match) {
        const amount = convertIndianNumberFormat(match[0]);
        if (amount && !result.existingSavings) {
          result.existingSavings = amount;
          break;
        }
      }
    }
    
    console.log('Extracted financial figures with context:', context, result);
    return result;
    
  } catch (error) {
    console.error('Error extracting financial figures:', error);
    return result;
  }
};

interface GeminiResponse {
  candidates?: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
  error?: {
    message: string;
  };
}

// Financial advisor conversation flow as specified in the system prompt
const FINANCIAL_ADVISOR_FLOW = {
  welcome: "Hi there, Welcome to InvestRight - your unbiased personal wealth advisor. I am here to help you achieve and prepare for your Key Life Goals through financial advice.",
  
  lifeGoalExplanation: "Life Goal Preparedness refers to how ready and financially equipped an individual (or family) is to achieve their key life goals — such as: Buying a house, Children's education, Marriage expenses, Retirement planning, Health & family security, Travel, lifestyle, or passion pursuits.",
  
  startQuestion: "Are you ready to start?",
  
  nameQuestion: "What's your name? I'd love to address you personally throughout our conversation.",
  
  goalQuestion: formatQuestionWithSamples("What inspirational life goal do you have? I would love to hear from you – it could be investment advice, any goal you want to accomplish, or even just curiosity on any investment or anything else too", 'goal'),
  
  disclaimer: "\n\n*This number is indicative, kindly seek guidance from a Certified Financial Professional before taking a financial decision"
};

// Updated system instruction to match custom GPT prompt exactly
const SYSTEM_INSTRUCTION = `Act as an expert financial advisor with knowledge of available investment options in India.

## Welcome Message
Start the conversation with:
"Hi there, Welcome to InvestRight - your unbiased personal wealth advisor. I am here to help you achieve and prepare for your Key Life Goals through financial advice."

Then explain Life Goal Preparedness (keep it shorter):
"Life Goal Preparedness refers to how ready and financially equipped an individual (or family) is to achieve their key life goals — such as: Buying a house, Children's education, Marriage expenses, Retirement planning, Health & family security, Travel, lifestyle, or passion pursuits."

Ask: "Are you ready to start?"

## Conversation Flow

**Step 1: Get User's Name**
If user agrees to start, ask for their name to address them personally.

**Step 2: Main Goal Question**
Ask: "What inspirational life goal you have? I would love to hear from you - it could be investment advice, any goal you want to accomplish, or it could just curiosity on any investment or anything else too"

**Step 3: Follow-up Questions**
- The next questions should be based on the previous answers
- Nature of questions should be to advise or get more details as required
- As more details become available, start providing advice
- **Stick to maximum 5 questions before sharing advice**

**Step 4: Investment Plan Generation**
When client seeks investment plan or way to get money for their goal, generate a report for their plan.

**Step 5: Risk Assessment & Feasibility Check**
When customer goal is clear and ready for investment options:
1. Check user's appetite for taking risk by asking simple questions
2. Check user income source and current profession
3. Determine if the goal is achievable or not
4. If goal is not achievable, suggest alternative options

**Step 6: Income Enhancement (if needed)**
If goals are not achieved with current investment plan:
- Ask about user's profession
- Suggest additional options to increase income:
  * Upskilling opportunities
  * Starting side business
  * Starting new business

## Communication Style
- Tone should be friendly, professional, educative and engaging
- Maintain conversational format
- Use friendly and indirect approach
- Provide explanations for the purpose of questions

## Important Rules
1. **Maximum 5 questions** before providing advice
2. **ROI Numbers**: Whenever generating any return on investment number, put a "*" mark beside the number
3. **Disclaimer**: Add this line at end of any financial advice - "This number is indicative, kindly seek guidance from Certified Financial Professional before taking a financial decision"
4. **Natural conversation**: Base each question on the previous answer
5. **Goal-focused**: Move towards providing actionable investment advice quickly
6. **India-specific advice**: Provide investment options available in India (mutual funds, stocks, FDs, PPF, NPS, ELSS)
7. **Risk assessment**: Always assess user's risk appetite before suggesting investments
8. **Feasibility check**: Determine if goals are achievable with current income and suggest alternatives if not`;

// Simplified examples aligned with custom GPT prompt approach  
const FEW_SHOT_EXAMPLES = `### Conversation Examples (Max 5 Questions)

---
**Example 1: House Purchase Goal**

**Step 3.1: Natural Goal Collection**
User: I've always dreamed of owning a luxury SUV. I really want to get an Audi Q7 because it's my dream car and I think it would be perfect for my family.
Bot: That's wonderful! Having a dream car that meets your family's needs is a great goal. What's your target budget for this Audi Q7 purchase?

Sample format:
• "Around ₹85 lakhs"
• "Between ₹80-90 lakhs"
• "I'm not sure about the exact amount"

User: I'm not sure about the exact amount.
Bot: No worries! Let me help you with some rough estimates. Audi Q7 typically ranges from ₹85 lakhs to ₹1.10 crores depending on the variant. For basic calculation, let's consider:

• **Base Model**: ₹85-90 lakhs
• **Mid Variant**: ₹95 lakhs - ₹1 crore  
• **Top Model**: ₹1-1.10 crores

Which range feels comfortable for your planning?

User: Still not sure, can you help me with exact pricing?
Bot: Absolutely! Let me search for current market pricing to give you accurate information.

[Web Search Results]
Based on current market research, here's what I found about Audi Q7:

The Audi Q7 2024 is priced between ₹85.29 lakhs to ₹1.10 crores (ex-showroom) in India, depending on the variant. The base model starts at ₹85.29 lakhs, while the top-end variant can go up to ₹1.10 crores.

Source: CarWale.com

This gives us a good starting point for your financial planning. Would you like to proceed with this estimate, or do you have a more specific budget in mind?

User: I'm looking at the base model, so around 85 lakhs.
Bot: Perfect! ₹85 lakhs for the base model Audi Q7 is a realistic target. Now, what's your timeline for this purchase?

Sample format:
• "2 years" or "3 years"
• "I want to buy it in 18 months"
• "Planning for next year"

User: I want to buy it in 3 years.
Bot: Excellent! So we're planning for ₹85 lakhs in 3 years. Now let me understand your financial capacity:

What is your current monthly income and how much can you invest monthly towards this goal?

Sample format:
• "₹1.5 lakhs per month, can invest ₹50,000"
• "I earn ₹20 LPA, can save ₹60,000 monthly"
• "Monthly income ₹2 lakhs, investment capacity ₹70,000"

---
**Example 2: Natural Goal Expression - House Purchase**

**Step 3.1: Natural Goal Collection** 
User: My wife and I have been renting for years and we're tired of it. We want to own our own place where we can raise our kids and have a garden. It's been our dream for so long.
Bot: That's a beautiful dream! Having your own home where you can build memories with your family is truly special. What's your target budget for this house purchase?

Sample format:
• "₹50 lakhs in 5 years"
• "Around ₹1 crore, need it in 3 years"
• "Not sure about budget, want it soon"

**Example 3: Adaptive Response Handling - Unexpected User Reply**

**Step 3.1: Goal Collection with Unexpected Response**
User: I want to buy a house.
Bot: Great! A house is a significant investment. What's your target budget for this purchase?

Sample format:
• "₹50 lakhs in 5 years"
• "Around ₹1 crore, need it in 3 years"
• "Not sure about budget, want it soon"

User: I don't know about budget, but I need it urgently because my family is growing.

Bot: I understand your urgency! Family growth is an important factor. Let me help you find current house prices in your area to set a realistic budget. What city or area are you looking at?

Sample format:
• "Mumbai, preferably Andheri"
• "Delhi, near metro stations"
• "Bangalore, IT corridor"

User: Mumbai, but I'm not sure about the area yet.

Bot: Perfect! Mumbai has various options. Let me search for current property prices in different areas of Mumbai to help you decide.

[Web Search Results]
Based on current market research, here's what I found about Mumbai property prices:

Mumbai property prices range from ₹8,000-15,000 per sq ft in suburbs to ₹25,000-50,000+ per sq ft in prime areas. For a 2BHK (800-1000 sq ft), this translates to ₹65 lakhs to ₹5 crores depending on location.

Source: 99acres.com

This gives us a good starting point. What's your preferred area type - suburbs for affordability or prime areas for convenience?

---
**Example 3: Alternative Solutions for Unfeasible Goal**

**Step 3.4: Feasibility Analysis - Goal Not Achievable**
Bot: Let me calculate if your goal is achievable:

**Current Resources:**
• Existing Savings: ₹2 lakhs
• Monthly Investment: ₹15,000
• Timeline: 3 years
• Expected Returns: 10%* annually

**Calculation:**
• Future Value of ₹2 lakhs in 3 years: ₹2.66 lakhs*
• Future Value of ₹15,000 monthly SIP: ₹6.18 lakhs*
• **Total Accumulation: ₹8.84 lakhs***

**Result: ❌ GOAL NOT ACHIEVABLE** - You need ₹91.16 lakhs* more.

**Step 5: Alternative Solutions**
Bot: I understand this is challenging, but don't worry! Let me suggest several alternatives to help you achieve your goal:

**Option 1: Timeline Extension**
- Extend timeline to 7-8 years to make it achievable
- This would require ₹25,000-30,000 monthly investment

**Option 2: Second-hand Property**
- Consider pre-owned properties in the same area
- Could save 30-40% on cost (₹60-80 lakhs instead of ₹1 crore)
- Many good options available with proper verification

**Option 3: Income Enhancement**
- What's your current profession? I can suggest specific skills to increase your income
- Side business opportunities based on your skills
- Career advancement strategies

**Option 4: Alternative Locations**
- Consider nearby areas with better price-to-value ratio
- Emerging localities with good connectivity
- Could reduce cost by 20-30%

Which option interests you most? I can provide detailed guidance on any of these.

---
**Example 4: Natural Goal Expression - Child Education**

**Step 3.1: Natural Goal Collection**
User: My daughter is 8 years old and she's so bright. I want to make sure she can go to the best college when she grows up, maybe even study abroad if that's what she wants. Education is so expensive these days and I don't want money to be a barrier for her dreams.
Bot: What a loving parent you are! Ensuring your daughter has access to quality education is one of the most valuable gifts you can give her. What's your target budget for her education expenses?

Sample format:
• "Around ₹25 lakhs for her college"
• "₹50 lakhs including international options"
• "I'm not sure about the exact costs"

**Example 5: Step-by-Step Process - Goal Amount Already Mentioned**

**Step 3.1: Goal Collection**
User: I want to save for my child's education in 10 years. I think it will cost 25 lakhs.
Bot: Perfect! Let me help you plan for your child's education. ₹25 lakhs in 10 years is a significant goal. Let me gather some information to create the best plan for you.

**Step 3.2: Income Assessment**
Bot: What is your current monthly income and how much can you invest monthly towards this goal?

Sample format:
• "₹50,000 per month, can invest ₹20,000"
• "I earn ₹8 LPA, can save ₹30,000 monthly"
• "Monthly income ₹1.2 lakhs, investment capacity ₹40,000"

User: I earn ₹8 LPA and can invest ₹20,000 monthly.

**Step 3.3: Existing Savings Check**
Bot: Do you have any existing savings or investments that we can consider for this goal?

Sample format:
• "I have ₹2 lakhs in FDs"
• "₹5 lakhs in mutual funds already"
• "No existing savings, starting fresh"

User: I have ₹3 lakhs in FDs and ₹2 lakhs in mutual funds.

**Step 3.4: Four-Area Feasibility Analysis**
Bot: Let me perform a comprehensive feasibility analysis considering all four critical areas:

**1. Goal Amount**: ₹25 lakhs (Child's education)
**2. Timeline**: 10 years
**3. Income Sources**: ₹8 LPA (₹67,000 monthly)
**4. Monthly Savings Capacity**: ₹20,000 towards this goal

**Current Resources:**
• Existing Savings: ₹5 lakhs
• Monthly Investment: ₹20,000
• Timeline: 10 years
• Expected Returns: 10%* annually

**Detailed Calculation:**
• Future Value of ₹5 lakhs in 10 years: ₹12.97 lakhs*
• Future Value of ₹20,000 monthly SIP: ₹20.48 lakhs*
• **Total Accumulation: ₹33.45 lakhs***

**Feasibility Analysis:**
• **Required**: ₹25 lakhs
• **Projected**: ₹33.45 lakhs*
• **Surplus**: ₹8.45 lakhs*
• **Success Rate**: 133%* (Goal fully achievable)

**Result: ✅ GOAL IS ACHIEVABLE!** You'll have ₹8.45 lakhs* more than needed.

**Step 4: Investment Plan**
**Investment Strategy:**
📈 **Equity Mutual Funds (70%)**: Large-cap and Flexi-cap funds for growth
🛡️ **Debt Instruments (20%)**: PPF for safety and tax benefits  
💰 **Emergency Fund (10%)**: Liquid funds for 6-month expenses

**Monthly SIP Breakdown:**
• Large-cap Fund: ₹10,000 (50%)
• Flexi-cap Fund: ₹6,000 (30%) 
• PPF: ₹4,000 (20%)

This number is indicative, kindly seek guidance from a Certified Financial Professional before taking a financial decision.

---
**Example 2: Step-by-Step Process - House Purchase (Goal Not Achievable)**

**Step 3.1: Goal Collection**
User: I want to buy a house worth 50 lakhs in 5 years.
Bot: Great! A house is a significant investment. Let me help you plan this step by step.

**Step 3.2: Income Assessment**
Bot: What is your current monthly income and how much can you invest monthly towards this goal?

Sample format:
• "₹50,000 per month, can invest ₹20,000"
• "I earn ₹8 LPA, can save ₹30,000 monthly"
• "Monthly income ₹1.2 lakhs, investment capacity ₹40,000"

User: I earn ₹6 LPA and can invest ₹5,000 monthly.

**Step 3.3: Existing Savings Check**
Bot: Do you have any existing savings or investments for this goal?

Sample format:
• "I have ₹2 lakhs in FDs"
• "₹5 lakhs in mutual funds already"
• "No existing savings, starting fresh"

User: I have ₹1 lakh in savings.

**Step 3.4: Feasibility Analysis**
Bot: Let me calculate if your goal is achievable:

**Current Resources:**
• Existing Savings: ₹1 lakh
• Monthly Investment: ₹5,000
• Timeline: 5 years
• Expected Returns: 10%* annually

**Calculation:**
• Future Value of ₹1 lakh in 5 years: ₹1.61 lakhs*
• Future Value of ₹5,000 monthly SIP: ₹3.87 lakhs*
• **Total Accumulation: ₹5.48 lakhs***

**Result: ❌ GOAL IS NOT ACHIEVABLE** - You'll be short by ₹44.52 lakhs*

**Step 5: Alternative Solutions**
Bot: Since your current capacity won't achieve this goal, let me suggest alternatives:

**What is your profession?** This will help me provide targeted advice.

Sample format:
• "Software Engineer"
• "Business Owner"
• "Government Employee"

User: I am a software engineer.

**Profession-Specific Solutions:**
**Income Enhancement Strategies:**
• **Upskilling**: AI/ML, Cloud Computing (20-30%* salary increase)
• **Freelancing**: Upwork, Fiverr (₹15,000-30,000* monthly)
• **Part-time Consulting**: Technical training (₹10,000-20,000* monthly)

**Alternative Goal Options:**
• **Option A**: ₹50 lakhs house in 10 years (₹25,000 monthly)
• **Option B**: ₹30 lakhs house in 5 years (₹35,000 monthly)
• **Option C**: Start with ₹5,000 monthly and increase gradually

**Modified Timeline with Income Growth:**
• Year 1-2: ₹5,000 monthly (while upskilling)
• Year 3-5: ₹15,000 monthly (after salary increase)
• Expected accumulation: ₹12-15 lakhs* in 5 years

This number is indicative, kindly seek guidance from a Certified Financial Professional before taking a financial decision.

---

**Example 3: Goal Amount Research - User Doesn't Know Cost**

**Step 3.1: Goal Collection with Research**
User: I want to buy a house, but I'm not sure about the cost.
Bot: That's perfectly fine! Let me help you understand the current market prices for houses in India.

**Current House Prices in India (2024):**
• **Tier 1 Cities** (Mumbai, Delhi, Bangalore): ₹80 lakhs - ₹2 crores*
• **Tier 2 Cities** (Pune, Hyderabad, Chennai): ₹40 lakhs - ₹1 crore*
• **Tier 3 Cities** (Indore, Coimbatore, Kochi): ₹25 lakhs - ₹60 lakhs*

**What type of house are you looking for?**
Sample format:
• "2 BHK apartment in Bangalore"
• "3 BHK house in Pune"
• "1 BHK in Mumbai"

User: 2 BHK apartment in Bangalore.

Bot: For a 2 BHK apartment in Bangalore, the current market price ranges from ₹60-80 lakhs* depending on location and amenities.

**What's your preferred budget range?**
Sample format:
• "Around ₹60 lakhs"
• "Between ₹70-80 lakhs"
• "I can stretch to ₹1 crore"

User: Around ₹70 lakhs.

Bot: Perfect! So your goal is to buy a ₹70 lakhs house. What's your target timeline for this purchase?

Sample format:
• "5 years" or "10 years"
• "I want to buy a house in 3 years"
• "My child will start college in 8 years"

User: 5 years.

Bot: Excellent! Now let me gather more information to create your investment plan.

**Step 3.2: Income Assessment**
Bot: What is your current monthly income and how much can you invest monthly towards this goal?

Sample format:
• "₹50,000 per month, can invest ₹20,000"
• "I earn ₹8 LPA, can save ₹30,000 monthly"
• "Monthly income ₹1.2 lakhs, investment capacity ₹40,000"

This number is indicative, kindly seek guidance from a Certified Financial Professional before taking a financial decision.

---

**Example 4: Question with Sample Answer Format**
Bot: What is your target timeline for achieving this goal?

Sample format:
• "5 years" or "10 years"
• "I want to buy a house in 3 years"
• "My child will start college in 8 years"

User: I want to buy a house in 5 years.
Bot: Perfect! A 5-year timeline is good for house purchase. What is the approximate cost of the house you're looking at?

Sample format:
• "50 lakhs" or "1 crore"
• "Around ₹75 lakhs in my city"
• "Between 60-80 lakhs depending on location"

User: Around ₹75 lakhs.
Bot: Great! For ₹75 lakhs in 5 years, you'll need to invest approximately ₹95,000* per month. What is your current monthly income and investment capacity?

Sample format:
• "₹50,000 per month, can invest ₹20,000"
• "I earn ₹8 LPA, can save ₹30,000 monthly"
• "Monthly income ₹1.2 lakhs, investment capacity ₹40,000"

This number is indicative, kindly seek guidance from a Certified Financial Professional before taking a financial decision.

---
**Example 4: Income Enhancement Strategies**
User: I am a software engineer earning ₹8 LPA.
Bot: Perfect! With your technical background, here are income enhancement strategies:

**Immediate Actions:**
• **Upskilling**: AI/ML, Cloud Computing, DevOps (potential 20-30%* salary increase)
• **Freelancing**: Upwork, Fiverr for side income (₹20,000-50,000* monthly)
• **Part-time Consulting**: Technical training or project consulting

**Investment Strategy:**
📈 **Equity SIP**: ₹15,000 monthly in diversified funds
🛡️ **Tax Savings**: ELSS funds up to ₹1.5 lakhs under 80C
💰 **Emergency Fund**: 6 months of expenses in liquid funds

**Expected Growth**: With upskilling and side income, you could reach ₹12-15 LPA* within 2-3 years.

This number is indicative, kindly seek guidance from a Certified Financial Professional before taking a financial decision.

---
**Example 4: Lifestyle Goal - Travel**
User: I want to take a Europe trip costing 8 lakhs in 3 years.
Bot: To save 8 lakhs in 3 years, assuming 8%* returns, you need to invest around ₹20,000* per month.

**Investment Plan:**
📈 **Short-term Goals Fund**: ₹15,000 monthly in liquid/debt funds
🛡️ **Tax-efficient Savings**: ₹5,000 monthly in ELSS for tax benefits

**Alternative Approaches:**
• **Extended Timeline**: 4 years instead of 3 (₹15,000 monthly)
• **Reduced Budget**: 6 lakhs in 3 years (₹15,000 monthly)
• **Income Supplement**: Side income through:
  - Online tutoring (₹10,000-15,000* monthly)
  - Freelance writing/design (₹8,000-12,000* monthly)
  - Part-time consulting (₹15,000-25,000* monthly)

This number is indicative, kindly seek guidance from a Certified Financial Professional before taking a financial decision.

---
**Example 5: Complex Scenario - Multiple Goals**
User: I want to save for my child's education (25 lakhs in 10 years), buy a house (50 lakhs in 8 years), and plan for retirement (2 crores in 20 years). I earn 12 LPA and can invest 30,000 monthly.
Bot: This is a comprehensive financial planning scenario! Let me break this down step by step.

**Goal Analysis:**
📚 **Child Education**: 25 lakhs in 10 years (₹13,000* monthly at 10%* returns)
🏠 **House Purchase**: 50 lakhs in 8 years (₹35,000* monthly at 10%* returns)
🌅 **Retirement**: 2 crores in 20 years (₹25,000* monthly at 10%* returns)

**Total Required**: ₹73,000* monthly vs. Your Capacity: ₹30,000 monthly

**Recommendations:**
1. **Prioritize Goals**: Which goal is most important to you right now?
2. **Timeline Adjustment**: Consider extending some timelines
3. **Income Enhancement**: With your current capacity, you'll need additional income sources

**Questions to Clarify:**
• Which goal is your top priority?
• Are you open to extending any timelines?
• What's your profession? I can suggest income enhancement strategies.

This number is indicative, kindly seek guidance from a Certified Financial Professional before taking a financial decision.

---
**Example 6: Vague Information - Needs Clarification**
User: I want to save some money for maybe a house or education, not sure exactly. I earn around 8-10 LPA and can invest some amount monthly.
Bot: I understand you're thinking about saving, but I need more specific information to create a proper plan.

**Questions to Clarify:**
• **Goal Specificity**: Are you leaning more towards a house or education? Or both?
• **Timeline**: When do you think you might need this money?
• **Amount**: What's your rough estimate for the house cost or education expenses?
• **Investment Capacity**: What's your approximate monthly investment capacity?

**Current Understanding:**
💰 **Income Range**: ₹8-10 LPA (₹67,000-83,000 monthly)
📈 **Investment**: "Some amount monthly" - could you be more specific?

Once you provide these details, I can create a personalized investment strategy for you!

This number is indicative, kindly seek guidance from a Certified Financial Professional before taking a financial decision.

---
**Always end responses with:**
"This number is indicative, kindly seek guidance from a Certified Financial Professional before taking a financial decision."`;

export const sendChatMessageToGemini = async (
  userMessage: string,
  conversationHistory: Array<{ role: 'user' | 'assistant', content: string }> = [],
  userInfo?: { username?: string; isAuthenticated?: boolean },
  conversationId?: string
): Promise<{ success: boolean; message: string; isGeneratingPlan?: boolean; conversationId?: string }> => {
  try {
    console.log('ChatbotService: Starting with userMessage:', userMessage);
    console.log('ChatbotService: Conversation history length:', conversationHistory.length);
    console.log('ChatbotService: Full conversation history:', conversationHistory);
    console.log('ChatbotService: UserInfo received:', userInfo);
    console.log('ChatbotService: Is user authenticated:', userInfo?.isAuthenticated);
    console.log('ChatbotService: Username:', userInfo?.username);
    
    // Extract user's name from conversation history or user info
    let userName = '';
    if (userInfo?.isAuthenticated && userInfo?.username) {
      // Use authenticated user's username
      userName = userInfo.username;
      console.log('ChatbotService: Using authenticated username:', userName);
    } else if (conversationHistory.length >= 4) {
      // Find the user's name from the fourth message (index 3) when they provided their name
      const nameMessage = conversationHistory[3];
      if (nameMessage.role === 'user') {
        userName = nameMessage.content.trim();
        console.log('ChatbotService: Extracted userName from position 3:', userName);
      }
    }
    
    // Also check if we can extract from the current user message for name
    if (conversationHistory.length === 2 && !userName) {
      // This is when user is providing their name
      userName = userMessage.trim();
      console.log('ChatbotService: Extracted userName from current message:', userName);
    }
    
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!apiKey || apiKey === 'your-gemini-api-key-here') {
      console.log('ChatbotService: API key not configured');
      return {
        success: false,
        message: 'API key not configured. Please set your Gemini API key in the environment variables.'
      };
    }

    // Handle first message - Welcome and Life Goal Explanation
    if (conversationHistory.length === 0) {
      console.log('ChatbotService: Handling first message - welcome and explanation');
      console.log('ChatbotService: UserInfo at first message:', userInfo);
      console.log('ChatbotService: Is authenticated:', userInfo?.isAuthenticated);
      console.log('ChatbotService: Username:', userInfo?.username);
      
      // If user is authenticated and has username, skip name question
      if (userInfo?.isAuthenticated && userInfo?.username) {
        console.log('ChatbotService: User is authenticated, skipping name question');
        return {
          success: true,
          message: `${FINANCIAL_ADVISOR_FLOW.welcome}\n\n${FINANCIAL_ADVISOR_FLOW.lifeGoalExplanation}\n\n${FINANCIAL_ADVISOR_FLOW.startQuestion}`
        };
      } else {
        console.log('ChatbotService: User is NOT authenticated, will ask for name later');
        return {
          success: true,
          message: `${FINANCIAL_ADVISOR_FLOW.welcome}\n\n${FINANCIAL_ADVISOR_FLOW.lifeGoalExplanation}\n\n${FINANCIAL_ADVISOR_FLOW.startQuestion}`
        };
      }
    }

    // Handle second message - Check if user is ready to start
    if (conversationHistory.length === 1) {
      console.log('ChatbotService: Handling second message, user response:', userMessage);
      console.log('ChatbotService: UserInfo at second message:', userInfo);
      console.log('ChatbotService: Is authenticated:', userInfo?.isAuthenticated);
      console.log('ChatbotService: Username:', userInfo?.username);
      
      const userResponse = userMessage.toLowerCase();
      if (userResponse.includes('yes') || userResponse.includes('ready') || userResponse.includes('start') || userResponse.includes('ok') || userResponse.includes('sure') || userResponse.includes('go')) {
        console.log('ChatbotService: User agreed to start');
        
        // If user is authenticated, skip name question and go directly to goal question
        if (userInfo?.isAuthenticated && userInfo?.username) {
          console.log('ChatbotService: Authenticated user, going directly to goal question');
          return {
            success: true,
            message: `Great! ${userInfo.username}, ${FINANCIAL_ADVISOR_FLOW.goalQuestion}`
          };
        } else {
          console.log('ChatbotService: Unauthenticated user, asking for name');
          return {
            success: true,
            message: FINANCIAL_ADVISOR_FLOW.nameQuestion
          };
        }
      } else {
        console.log('ChatbotService: User not ready yet');
        return {
          success: true,
          message: "I understand you might not be ready yet. Take your time! When you're ready to start, just let me know with a 'yes' or 'ready'."
        };
      }
    }

    // Handle third message - Get user's name (only for unauthenticated users)
    if (conversationHistory.length === 2) {
      console.log('ChatbotService: Handling third message - getting name');
      
      // If user is authenticated, this shouldn't happen, but handle gracefully
      if (userInfo?.isAuthenticated && userInfo?.username) {
        console.log('ChatbotService: Authenticated user reached name question, going to goal question');
        return {
          success: true,
          message: `${userInfo.username}, ${FINANCIAL_ADVISOR_FLOW.goalQuestion}`
        };
      }
      
      // For unauthenticated users, get their name
      const userName = userMessage.trim();
      if (userName.length > 0) {
        console.log('ChatbotService: User provided name:', userName);
        return {
          success: true,
          message: `Nice to meet you, ${userName}! ${FINANCIAL_ADVISOR_FLOW.goalQuestion}`
        };
      } else {
        console.log('ChatbotService: User name was empty, asking again');
        return {
          success: true,
          message: "I didn't catch your name. Could you please tell me your name?"
        };
      }
    }

    // Handle fourth message - Get user's life goal
    if (conversationHistory.length === 3) {
      console.log('ChatbotService: Handling fourth message - getting life goal');
      console.log('ChatbotService: User message content:', userMessage);
      
      // For authenticated users, this is the first question after welcome
      // For unauthenticated users, this is after they provided their name
      let greeting = '';
      if (userInfo?.isAuthenticated && userInfo?.username) {
        greeting = `${userInfo.username}, `;
        console.log('ChatbotService: Using authenticated username for greeting:', userInfo.username);
      } else if (conversationHistory.length >= 4) {
        // Extract from conversation history for unauthenticated users
        const nameMessage = conversationHistory[3];
        if (nameMessage.role === 'user') {
          const extractedName = nameMessage.content.trim();
          greeting = `${extractedName}, `;
          console.log('ChatbotService: Using extracted name from conversation:', extractedName);
        }
      }
      
      console.log('ChatbotService: Generated greeting:', greeting);
      return {
        success: true,
        message: `${greeting}${FINANCIAL_ADVISOR_FLOW.goalQuestion}`
      };
    }

    // After goal is provided, intelligently determine what additional information is needed
    // For authenticated users, the conversation flow is different (no name question)
    let questionCount;
    if (userInfo?.isAuthenticated && userInfo?.username) {
      // For authenticated users: welcome(0) -> ready(1) -> goal(2) -> follow-up questions start from 3
      questionCount = Math.max(0, conversationHistory.length - 3);
    } else {
      // For unauthenticated users: welcome(0) -> ready(1) -> name(2) -> goal(3) -> follow-up questions start from 4
      questionCount = Math.max(0, conversationHistory.length - 4);
    }
    console.log('ChatbotService: Current state - Conversation length:', conversationHistory.length, 'Question count:', questionCount, 'Authenticated:', userInfo?.isAuthenticated);
    
    // Extract financial figures and check what information we have
    const extractedInfo = extractFinancialFigures(userMessage, 'general');
    const hasGoal = conversationHistory.some(msg => msg.role === 'user' && msg.content.length > 10);
    const hasFinancialInfo = extractedInfo.amount || extractedInfo.timeline || extractedInfo.monthlyInvestment || extractedInfo.income;
    
    // Analyze all conversation to see if we have enough information
    const allUserMessages = conversationHistory.filter(msg => msg.role === 'user').map(msg => msg.content).join(' ');
    const allExtracted = extractFinancialFigures(allUserMessages, 'general');
    const hasGoalInfo = conversationHistory.some(msg => msg.role === 'user' && (msg.content.includes('goal') || msg.content.includes('want') || msg.content.includes('need')));
    const hasFinancialData = allExtracted.amount || allExtracted.income || allExtracted.monthlyInvestment;
    
    // Check for essential information needed for investment planning
    const hasTimeline = allExtracted.timeline || allUserMessages.includes('year') || allUserMessages.includes('month');
    const hasRiskAppetite = allUserMessages.includes('conservative') || allUserMessages.includes('moderate') || allUserMessages.includes('aggressive') || allUserMessages.includes('risk');
    const hasProfession = allUserMessages.includes('engineer') || allUserMessages.includes('doctor') || allUserMessages.includes('teacher') || allUserMessages.includes('business') || allUserMessages.includes('profession') || allUserMessages.includes('job');
    
    console.log('ChatbotService: Information status:', { 
      hasGoal, 
      hasGoalInfo, 
      hasFinancialInfo, 
      hasFinancialData, 
      hasTimeline,
      hasRiskAppetite,
      hasProfession,
      extractedInfo, 
      allExtracted 
    });
    
    // Check if we should generate the investment plan
    // Conditions: Either have goal+financial data OR have all essential info OR user provided comprehensive information
    const hasEssentialInfo = hasGoalInfo && hasFinancialData && hasTimeline;
    
    // Analyze user input complexity to determine if more questions are needed
    const userInputComplexity = analyzeUserInputComplexity(userMessage, conversationHistory);
    const needsMoreQuestions = userInputComplexity.complexity === 'high' || userInputComplexity.missingInfo.length > 0;
    
    // Check if we have sufficient information for comprehensive planning
    const hasSufficientInfo = hasEssentialInfo && !needsMoreQuestions;
    
    // Determine if we should generate plan or continue asking questions
    const shouldGeneratePlan = hasSufficientInfo || 
                               (conversationHistory.length >= (userInfo?.isAuthenticated ? 10 : 12)) || // Increased limit for complex cases
                               (questionCount >= 8 && hasEssentialInfo); // Allow up to 8 questions for complex scenarios
    
    if (shouldGeneratePlan) {
      console.log('======== GENERATING INVESTMENT PLAN ========');
      console.log('ChatbotService: Plan generation triggered');
      console.log('ChatbotService: hasGoalInfo:', hasGoalInfo, 'hasFinancialData:', hasFinancialData);
      console.log('ChatbotService: conversationHistory.length:', conversationHistory.length, 'hasGoal:', hasGoal);
      console.log('ChatbotService: questionCount:', questionCount);
      console.log('ChatbotService: User message:', userMessage);
      
      try {
        const advice = await generateFinancialAdvice(userMessage, conversationHistory);
        console.log('ChatbotService: Financial advice generated successfully:', advice.success);
        console.log('ChatbotService: Advice message length:', advice.message.length);
        
        // Add a header indicating this is a comprehensive investment report
        const reportHeader = `🎯 **INVESTMENT PLAN GENERATED** 🎯\n\n`;
        const fullMessage = reportHeader + advice.message;
        
        return {
          success: advice.success,
          message: fullMessage,
          isGeneratingPlan: false
        };
      } catch (error) {
        console.error('ChatbotService: Error calling generateFinancialAdvice:', error);
        console.error('ChatbotService: Error stack:', (error as any)?.stack);
        return {
          success: true,
          message: "Based on your goal, I recommend starting with a diversified investment approach. Consider mutual funds for growth, PPF for safety, and NPS for retirement planning. Start with small amounts and increase gradually as you become more comfortable with investing." + FINANCIAL_ADVISOR_FLOW.disclaimer,
          isGeneratingPlan: false
        };
      }
    }
    
    // Follow the step-by-step process for goal analysis
    if (conversationHistory.length >= (userInfo?.isAuthenticated ? 3 : 4)) {
      console.log('ChatbotService: Following step-by-step process for goal analysis');
      
      try {
      // Analyze what information we have and what step we're on
      const allUserMessages = conversationHistory.filter(msg => msg.role === 'user').map(msg => msg.content).join(' ');
      const allExtracted = extractFinancialFigures(allUserMessages, 'general');
      
        console.log('ChatbotService: Extracted information:', allExtracted);
        console.log('ChatbotService: All user messages:', allUserMessages);
        
        // Use the determineCurrentStep function to get the next step
        const nextStep = determineCurrentStep(conversationHistory, allExtracted, userInfo);
        
        console.log('ChatbotService: Determined next step:', nextStep);
      
      // Generate appropriate question based on current step
        return await generateStepBasedQuestion(nextStep, conversationHistory, allExtracted, userInfo);
        
      } catch (error) {
        console.error('ChatbotService: Error in step-by-step processing:', error);
        
        // Fallback to simple response
        return {
          success: true,
          message: `${greeting}I'm here to help you with your financial planning! Could you tell me about your goal? For example, what would you like to save money for?`
        };
      }
    }

    // Default fallback
    return {
      success: true,
      message: "I'm here to help! Please continue sharing your thoughts, and I'll guide you through the process."
    };

      } catch (error) {
      console.error('Error in sendChatMessageToGemini:', error);
      console.error('Error details:', error);
      return {
        success: false,
        message: 'I apologize, but I encountered an error while processing your request. Please try again.',
        isGeneratingPlan: false
      };
    }
};

const generateAdaptiveQuestion = async (
  _userMessage: string,
  conversationHistory: Array<{ role: 'user' | 'assistant', content: string }>,
  complexity: {
    complexity: 'low' | 'medium' | 'high';
    missingInfo: string[];
    needsClarification: string[];
    suggestedQuestions: string[];
  },
  userInfo?: { username?: string; isAuthenticated?: boolean }
): Promise<{ success: boolean; message: string; isGeneratingPlan?: boolean }> => {
  try {
    // Extract user's name for personalization
    let userName = '';
    if (userInfo?.isAuthenticated && userInfo?.username) {
      userName = userInfo.username;
    } else if (conversationHistory.length >= 4) {
      const nameMessage = conversationHistory[3];
      if (nameMessage.role === 'user') {
        userName = nameMessage.content.trim();
      }
    }
    
    const greeting = userName ? `${userName}, ` : '';
    
    // Generate questions based on complexity analysis
    if (complexity.suggestedQuestions.length > 0) {
      // Use the first suggested question from complexity analysis
      const question = complexity.suggestedQuestions[0];
      return {
        success: true,
        message: `${greeting}${question}`
      };
    }
    
    // Generate questions based on missing information
    if (complexity.missingInfo.length > 0) {
      const missingInfo = complexity.missingInfo[0];
      let question = '';
      
      switch (missingInfo) {
        case 'timeline':
          question = formatQuestionWithSamples('What is your target timeline for achieving this goal?', 'timeline');
          break;
        case 'amount':
          question = formatQuestionWithSamples('What is the approximate cost of your goal?', 'amount');
          break;
        case 'income':
          question = formatQuestionWithSamples('What is your current monthly income and how much can you invest monthly?', 'income');
          break;
        case 'risk_appetite':
          question = formatQuestionWithSamples('What is your investment risk preference?', 'risk_appetite');
          break;
        case 'profession':
          question = formatQuestionWithSamples('What is your current profession? This helps me suggest income enhancement strategies.', 'profession');
          break;
        default:
          question = 'Could you provide more specific details about your financial situation?';
      }
      
      return {
        success: true,
        message: `${greeting}${question}`
      };
    }
    
    // Generate clarification questions for complex scenarios
    if (complexity.needsClarification.length > 0) {
      const clarification = complexity.needsClarification[0];
      let question = '';
      
      switch (clarification) {
        case 'goal_prioritization':
          question = 'You mentioned multiple goals. Which one is your top priority for now?';
          break;
        case 'income_breakdown':
          question = 'Can you break down your income sources and their approximate amounts?';
          break;
        case 'current_portfolio':
          question = 'What are your current investments and their approximate values?';
          break;
        case 'specific_details':
          question = 'Could you be more specific about your requirements? For example, exact amounts, timelines, or preferences.';
          break;
        default:
          question = 'Could you clarify this aspect of your financial situation?';
      }
      
      return {
        success: true,
        message: `${greeting}${question}`
      };
    }
    
    // Fallback question
    return {
      success: true,
      message: `${greeting}Could you share more details about your goal, timeline, or current financial situation?`
    };
    
  } catch (error) {
    console.error('Error in generateAdaptiveQuestion:', error);
    return {
      success: true,
      message: 'Could you provide more information about your financial goals and situation?'
      };
    }
};

const generateRelevantQuestion = async (
  _userMessage: string,
  conversationHistory: Array<{ role: 'user' | 'assistant', content: string }>,
  userInfo?: { username?: string; isAuthenticated?: boolean }
): Promise<{ success: boolean; message: string; isGeneratingPlan?: boolean }> => {
  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!apiKey || apiKey === 'your-gemini-api-key-here') {
      console.error('Gemini API key not configured for question generation');
      return {
        success: false,
        message: 'API key not configured. Please set your Gemini API key in the environment variables.'
      };
    }
    
    // Extract user's name for personalization
    let userName = '';
    if (userInfo?.isAuthenticated && userInfo?.username) {
      // Use authenticated user's username
      userName = userInfo.username;
    } else if (conversationHistory.length >= 4) {
      const nameMessage = conversationHistory[3];
      if (nameMessage.role === 'user') {
        userName = nameMessage.content.trim();
      }
    }
    
    const greeting = userName ? `${userName}, ` : '';
    
    // Analyze conversation to track what information has been collected
    const allUserMessages = conversationHistory.filter(msg => msg.role === 'user').map(msg => msg.content).join(' ');
    const allExtracted = extractFinancialFigures(allUserMessages, 'general');
    
    // Track what information has been collected to avoid repetitive questions
    const collectedInfo = {
      goal: allUserMessages.toLowerCase().includes('goal') || allUserMessages.toLowerCase().includes('want') || allUserMessages.toLowerCase().includes('need'),
      amount: !!allExtracted.amount || allUserMessages.toLowerCase().includes('lakh') || allUserMessages.toLowerCase().includes('crore'),
      timeline: !!allExtracted.timeline || allUserMessages.toLowerCase().includes('year') || allUserMessages.toLowerCase().includes('month'),
      income: !!allExtracted.income || allUserMessages.toLowerCase().includes('lpa') || allUserMessages.toLowerCase().includes('salary') || allUserMessages.toLowerCase().includes('earn'),
      investment: !!allExtracted.monthlyInvestment || allUserMessages.toLowerCase().includes('invest') || allUserMessages.toLowerCase().includes('save'),
      risk: allUserMessages.toLowerCase().includes('risk') || allUserMessages.toLowerCase().includes('conservative') || allUserMessages.toLowerCase().includes('moderate') || allUserMessages.toLowerCase().includes('aggressive'),
      age: allUserMessages.toLowerCase().includes('age') || allUserMessages.toLowerCase().includes('old'),
      profession: allUserMessages.toLowerCase().includes('profession') || allUserMessages.toLowerCase().includes('job') || allUserMessages.toLowerCase().includes('work'),
      existing: allUserMessages.toLowerCase().includes('existing') || allUserMessages.toLowerCase().includes('savings') || allUserMessages.toLowerCase().includes('investment') || allUserMessages.toLowerCase().includes('asset'),
      dependents: allUserMessages.toLowerCase().includes('dependent') || allUserMessages.toLowerCase().includes('family') || allUserMessages.toLowerCase().includes('child') || allUserMessages.toLowerCase().includes('spouse')
    };
    
    console.log('ChatbotService: Collected information analysis:', collectedInfo);
    
    // Check if we have enough information to generate plan
    const hasGoalInfo = collectedInfo.goal;
    const hasFinancialData = allExtracted.amount || allExtracted.income || allExtracted.monthlyInvestment;
    const hasTimeline = collectedInfo.timeline;
    
    // Determine if we should generate plan now
    const shouldGeneratePlan = (hasGoalInfo && hasFinancialData && hasTimeline) || 
                              (conversationHistory.length >= (userInfo?.isAuthenticated ? 7 : 8)); // Max 7 exchanges for authenticated, 8 for unauthenticated
    
    if (shouldGeneratePlan) {
      console.log('ChatbotService: Have sufficient info, generating investment plan directly');
      
      try {
        const advice = await generateFinancialAdvice(_userMessage, conversationHistory);
        console.log('ChatbotService: Financial advice generated successfully in generateRelevantQuestion');
        return {
          success: advice.success,
          message: `${greeting}Perfect! I have gathered the essential information. Here's your personalized financial plan:\n\n${advice.message}`,
          isGeneratingPlan: false
        };
      } catch (error) {
        console.error('ChatbotService: Error generating plan in generateRelevantQuestion:', error);
        return {
          success: true,
          message: `${greeting}Perfect! I have gathered the essential information to create your personalized investment plan. Let me analyze your goals and create a comprehensive investment strategy for you.\n\n🔄 **Generating your personalized investment plan... Please wait.**`,
          isGeneratingPlan: true
        };
      }
    }
    
    // Intelligently determine what information is missing and prioritize questions
    const allContent = allUserMessages.toLowerCase();
    
    console.log('ChatbotService: Analyzing conversation for missing info:', allExtracted);
    
    // Check what key information is missing and prioritize by importance
    const missingInfo = {
      timeline: !collectedInfo.timeline,
      amount: !collectedInfo.amount,
      income: !collectedInfo.income,
      investment: !collectedInfo.investment,
      risk: !collectedInfo.risk,
      profession: !collectedInfo.profession,
      existing: !collectedInfo.existing
    };
    
    console.log('ChatbotService: Missing information analysis:', missingInfo);
    
    // Priority-based question selection following the 5-question structure
    const priorityQuestions = [
      // Question 1: Timeline & Amount (Essential for goal planning)
      {
        condition: missingInfo.timeline && missingInfo.amount,
        message: `${greeting}Excellent goal! To create your investment strategy, I need to know:\n\n📅 **Timeline**: When do you want to achieve this goal? (e.g., 5 years, 10 years)\n💰 **Target Amount**: What's the approximate cost? (e.g., 25 lakhs, 1 crore)\n\nYou can answer both together like: "I need 50 lakhs in 8 years"`
      },
      // Question 2: Income & Investment Capacity (Financial feasibility)
      {
        condition: missingInfo.income && missingInfo.investment,
        message: `${greeting}Now I need to understand your financial capacity:\n\n💼 **Monthly Income**: What do you currently earn? (e.g., 8 LPA, 60,000 per month)\n📈 **Investment Capacity**: How much can you invest monthly towards this goal? (e.g., 15,000 per month)\n\nYou can combine like: "I earn 10 LPA and can invest 20,000 monthly"`
      },
      // Question 3: Risk Appetite (Investment strategy)
      {
        condition: missingInfo.risk,
        message: `${greeting}What's your investment risk preference?\n\n🛡️ **Conservative**: Safe investments, lower returns (FD, PPF)\n⚖️ **Moderate**: Balanced mix, moderate returns (Mutual Funds)\n🚀 **Aggressive**: Higher risk, higher potential returns (Equity, Stocks)\n\nJust say "moderate" or describe your preference.`
      },
      // Question 4: Profession (Income enhancement strategies)
      {
        condition: missingInfo.profession,
        message: `${greeting}What is your current profession? This helps me understand your income stability and suggest upskilling or side business opportunities if needed.`
      },
      // Question 5: Existing Investments (Portfolio optimization)
      {
        condition: missingInfo.existing,
        message: `${greeting}Do you have any existing savings, investments, or assets? This helps me optimize your portfolio and avoid duplication.`
      }
    ];
    
    // Find the first missing information to ask about
    for (const question of priorityQuestions) {
      if (question.condition) {
        return {
          success: true,
          message: question.message
        };
      }
    }
    
    // If we have most info, ask for any remaining details
    if (conversationHistory.length >= 6) {
      return {
        success: true,
        message: `${greeting}Great! Any additional details about your current financial situation, age, or family responsibilities that might affect your investment planning?`
      };
    }
    
    // Use Google Generative AI for dynamic question generation
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-pro"
      });

      const chat = model.startChat();
      
      const prompt = `${SYSTEM_INSTRUCTION}

${FEW_SHOT_EXAMPLES}

Based on the conversation history below, generate the next relevant follow-up question to better understand the user's financial situation and goals efficiently. 

User's name: ${userName}
Conversation length: ${conversationHistory.length}

Conversation so far:
${conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

Generate ONE specific, relevant question that gathers essential information for investment planning:`;

      const result = await chat.sendMessage(prompt);
      const response = await result.response;
      const question = response.text().trim();
      
      console.log('Generated relevant question using Google AI successfully');
      return {
        success: true,
        message: question
      };
    } catch (aiError) {
      console.error('Error using Google AI for question generation:', aiError);
      // Fall through to fallback questions
    }
    
    // Simple fallback question
    const fallbackQuestion = `${greeting}Could you share more details about your goal, timeline, budget, or current financial situation? Any information helps me create a better plan for you.`;
    
    return {
      success: true,
      message: fallbackQuestion
    };
  } catch (error) {
    console.error('Error in generateRelevantQuestion:', error);
    
    // Provide fallback questions based on conversation length
    const greeting = conversationHistory.length >= 4 ? `${conversationHistory[3].content}, ` : '';
    
    const fallbackQuestions = [
      `${greeting}What is your target timeline for achieving this goal?`,
      `${greeting}What is your current monthly income and how much can you allocate for investments?`,
      `${greeting}How would you describe your risk tolerance - conservative, moderate, or aggressive?`,
      `${greeting}What is your current profession and main sources of income?`,
      `${greeting}Do you have any existing savings, investments, or assets?`,
      `${greeting}What is your current age and do you have any financial dependents?`
    ];
    
    // Select question based on conversation length to avoid repetition
    const questionIndex = Math.min(Math.floor((conversationHistory.length - 4) / 2), fallbackQuestions.length - 1);
    const fallbackQuestion = fallbackQuestions[questionIndex] || `${greeting}Could you tell me more about your financial background?`;
    
    return {
      success: true,
      message: fallbackQuestion
    };
  }
};

const generateFinancialAdvice = async (
  _userMessage: string,
  conversationHistory: Array<{ role: 'user' | 'assistant', content: string }>
): Promise<{ success: boolean; message: string }> => {
  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!apiKey || apiKey === 'your-gemini-api-key-here') {
      console.error('Gemini API key not configured');
      return {
        success: false,
        message: 'API key not configured. Please set your Gemini API key in the environment variables.'
      };
    }
    
    // Extract user's name for personalization
    let userName = '';
    if (conversationHistory.length >= 4) {
      const nameMessage = conversationHistory[3];
      if (nameMessage.role === 'user') {
        userName = nameMessage.content.trim();
        console.log('generateFinancialAdvice: Extracted userName:', userName);
      }
    }
    
    const greeting = userName ? `${userName}, ` : '';
    
    // Extract key information from conversation for personalized fallback
    let goalDescription = '';
    let timeline = '';
    let cost = '';
    // let income = ''; // Not used in current implementation
    let riskAppetite = '';
    let extractedFigures: {
      amount?: number;
      timeline?: number;
      monthlyInvestment?: number;
      income?: number;
    } = {};
    
    // Parse conversation to extract key details and financial figures
    conversationHistory.forEach((msg, index) => {
      if (msg.role === 'user') {
        const content = msg.content.toLowerCase();
        
        // Extract goal description - look for the first substantive user message (not just name)
        if (!goalDescription && msg.content.length > 5 && !msg.content.toLowerCase().includes('yes') && !msg.content.toLowerCase().includes('ready')) {
          // Skip if this looks like a name (short and doesn't contain goal keywords)
          if (msg.content.length > 15 || content.includes('goal') || content.includes('want') || content.includes('need') || content.includes('save') || content.includes('buy')) {
            goalDescription = msg.content;
          }
        }
        
        if (content.includes('year') || content.includes('month')) {
          timeline = msg.content;
        } else if (content.includes('₹') || content.includes('lakh') || content.includes('crore') || content.includes('thousand')) {
          cost = msg.content;
        } else if (content.includes('income') || content.includes('salary') || content.includes('lpa')) {
          // Store income information (not used in current fallback implementation)
        } else if (content.includes('conservative') || content.includes('moderate') || content.includes('aggressive')) {
          riskAppetite = msg.content;
        }
        
        // Extract financial figures from user messages
        const figures = extractFinancialFigures(msg.content, 'general');
        if (figures.amount && !extractedFigures.amount) extractedFigures.amount = figures.amount;
        if (figures.timeline && !extractedFigures.timeline) extractedFigures.timeline = figures.timeline;
        if (figures.monthlyInvestment && !extractedFigures.monthlyInvestment) extractedFigures.monthlyInvestment = figures.monthlyInvestment;
        if (figures.income && !extractedFigures.income) extractedFigures.income = figures.income;
      }
    });
    
    console.log('Extracted financial figures from conversation:', extractedFigures);
    
    // Use Google Generative AI for comprehensive financial advice
    try {
      console.log('======== GOOGLE AI GENERATION START ========');
      console.log('generateFinancialAdvice: Starting Google AI call...');
      console.log('generateFinancialAdvice: API Key configured:', !!apiKey);
      console.log('generateFinancialAdvice: Extracted figures for prompt:', extractedFigures);
      
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-pro"
      });

      const chat = model.startChat();
      
      const prompt = `${SYSTEM_INSTRUCTION}

${FEW_SHOT_EXAMPLES}

Based on this comprehensive conversation (7 questions asked), provide a detailed financial plan including:

**User Profile Summary:**
• **Name**: ${userName || 'User'}
• **Goal**: ${goalDescription || 'Financial goal'}
• **Risk Appetite**: ${riskAppetite || 'To be determined'}

**Extracted Financial Figures:**
${extractedFigures.amount ? `• Goal Amount: ₹${(extractedFigures.amount / 100000).toFixed(1)} lakhs (${extractedFigures.amount.toLocaleString()})` : ''}
${extractedFigures.timeline ? `• Timeline: ${extractedFigures.timeline} years` : ''}
${extractedFigures.monthlyInvestment ? `• Monthly Investment Capacity: ₹${(extractedFigures.monthlyInvestment / 1000).toFixed(1)}k (${extractedFigures.monthlyInvestment.toLocaleString()})` : ''}
${extractedFigures.income ? `• Annual Income: ₹${(extractedFigures.income / 100000).toFixed(1)} lakhs (${extractedFigures.income.toLocaleString()})` : ''}

**Complete User Inputs from Conversation:**
${conversationHistory.map((msg, index) => {
  if (msg.role === 'user') {
    return `• Question ${Math.floor(index/2) + 1}: ${msg.content}`;
  }
  return null;
}).filter(Boolean).join('\n')}

**Financial Plan Requirements:**

1. **Goal Cost Analysis**: 
   - Use the exact goal amount provided: ${extractedFigures.amount ? `₹${(extractedFigures.amount / 100000).toFixed(1)} lakhs` : 'To be determined'}
   - If user didn't provide cost, research and provide estimated cost for their specific goal
   - Break down the total cost into components if applicable

2. **Feasibility Assessment**: 
   - Calculate if the goal is achievable with their current financial capacity
   - Use the exact figures: Timeline: ${extractedFigures.timeline || 'TBD'} years, Monthly Investment: ${extractedFigures.monthlyInvestment ? `₹${(extractedFigures.monthlyInvestment / 1000).toFixed(1)}k` : 'TBD'}
   - Consider inflation (6%*), market returns (10-12%*), and realistic investment growth
   - Provide concrete calculations showing monthly investment needed vs. capacity

3. **Investment Strategy**: 
   - Specific investment recommendations for India (mutual funds, stocks, FDs, PPF, NPS, ELSS)
   - Monthly investment allocation strategy based on their capacity
   - Risk assessment and portfolio diversification considering their risk appetite: ${riskAppetite || 'To be assessed'}

4. **Alternative Options** (if goal is not achievable):
   - Suggest modified goal parameters (extended timeline, reduced scope)
   - Income enhancement strategies (upskilling, side business, career advancement)
   - Skill development recommendations based on their profession
   - Alternative investment approaches

5. **Action Plan**: 
   - Step-by-step implementation with timelines
   - Monthly investment amounts (use exact figures provided)
   - Progress tracking milestones
   - Specific mutual fund recommendations for India

**Calculation Requirements:**
- Use exact figures: Goal: ${extractedFigures.amount ? `₹${extractedFigures.amount.toLocaleString()}` : 'TBD'}, Timeline: ${extractedFigures.timeline || 'TBD'} years
- Calculate required monthly investment: ${extractedFigures.amount && extractedFigures.timeline ? `₹${Math.round(extractedFigures.amount / (extractedFigures.timeline * 12)).toLocaleString()}` : 'To be calculated'}
- Compare with their capacity: ${extractedFigures.monthlyInvestment ? `₹${extractedFigures.monthlyInvestment.toLocaleString()}` : 'To be determined'}
- Show feasibility gap and solutions

**Report Structure:**
- Start with "🎯 **YOUR PERSONALIZED INVESTMENT PLAN** 🎯"
- Include goal summary, feasibility analysis, investment strategy, and action plan
- Use emojis and formatting for better readability
- Provide specific mutual fund categories and allocation percentages
- Include monthly SIP breakdown with exact amounts

Rules:
- Mark all ROI numbers with asterisk (*)
- Keep advice India-specific and practical
- Use friendly, professional tone
- Address user by name: ${greeting}
- Be realistic about goal achievability
- Provide concrete financial calculations using the exact figures provided
- If goal seems unachievable, offer constructive alternatives
- Generate a comprehensive investment report
- Keep response under 800 words for detailed planning
- Use the extracted financial figures for all calculations

**Complete Conversation History:**
${conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

Generate a comprehensive financial plan with goal cost analysis, feasibility assessment, and investment strategy using ALL the user inputs provided above:`;

      console.log('generateFinancialAdvice: Sending request to Google AI with prompt length:', prompt.length);
      console.log('generateFinancialAdvice: Conversation history length:', conversationHistory.length);
      console.log('generateFinancialAdvice: Extracted figures being sent to Gemini:', extractedFigures);
      console.log('generateFinancialAdvice: User profile being sent to Gemini:', { userName, goalDescription, riskAppetite });
      console.log('generateFinancialAdvice: First 500 characters of prompt:', prompt.substring(0, 500));
      
      console.log('generateFinancialAdvice: Calling Gemini API...');
      const result = await chat.sendMessage(prompt);
      console.log('generateFinancialAdvice: Gemini API call completed, processing response...');
      
      const response = await result.response;
      const advice = response.text().trim();
      
      console.log('======== GOOGLE AI GENERATION RESPONSE ========');
      console.log('generateFinancialAdvice: Generated financial advice using Google AI, length:', advice.length);
      console.log('generateFinancialAdvice: First 200 characters of advice:', advice.substring(0, 200));
      console.log('generateFinancialAdvice: Last 200 characters of advice:', advice.substring(advice.length - 200));
      
      // Check if the advice is empty or too short
      if (!advice || advice.length < 50) {
        console.log('======== GOOGLE AI RETURNED EMPTY/SHORT RESPONSE ========');
        console.log('generateFinancialAdvice: Advice is empty or too short, falling back to fallback advice');
        console.log('generateFinancialAdvice: Advice content:', JSON.stringify(advice));
        throw new Error('Empty or insufficient response from Gemini API');
      }
      
      console.log('======== GOOGLE AI GENERATION SUCCESS ========');
      return {
        success: true,
        message: advice + FINANCIAL_ADVISOR_FLOW.disclaimer
      };
    } catch (aiError) {
      console.error('======== GOOGLE AI GENERATION ERROR ========');
      console.error('generateFinancialAdvice: Error using Google AI for financial advice:', aiError);
      console.error('generateFinancialAdvice: Error message:', (aiError as any)?.message || 'Unknown error');
      console.error('generateFinancialAdvice: Error details:', JSON.stringify(aiError, null, 2));
      console.error('generateFinancialAdvice: Error stack:', (aiError as any)?.stack);
      // Fall through to fallback advice
    }
    
    // Provide fallback advice if Google AI fails
    console.log('======== USING FALLBACK ADVICE ========');
    console.log('generateFinancialAdvice: Using fallback advice due to Google AI failure');
    console.log('generateFinancialAdvice: Extracted info for fallback:', { goalDescription, timeline, cost, riskAppetite, extractedFigures });
    
    // Create a more comprehensive fallback advice
    const allConversationText = conversationHistory.filter(msg => msg.role === 'user').map(msg => msg.content).join(' ');
    const comprehensiveExtracted = extractFinancialFigures(allConversationText, 'general');
    
    console.log('generateFinancialAdvice: Comprehensive extracted for fallback:', comprehensiveExtracted);
    console.log('generateFinancialAdvice: All conversation text:', allConversationText);
    
    const fallbackAdvice = `${greeting}Based on our conversation, here's your personalized investment strategy:

## 🎯 **Your Financial Goal Analysis**
**Goal**: ${goalDescription || 'Achieving your financial objective'}
**Timeline**: ${comprehensiveExtracted.timeline ? `${comprehensiveExtracted.timeline} years` : timeline || 'As discussed'}
**Target Amount**: ${comprehensiveExtracted.amount ? `₹${(comprehensiveExtracted.amount / 100000).toFixed(1)} lakhs` : cost || 'Based on your requirements'}

## 📊 **Investment Strategy**

**Monthly Investment Approach:**
${comprehensiveExtracted.monthlyInvestment ? 
`• **Your Capacity**: ₹${(comprehensiveExtracted.monthlyInvestment / 1000).toFixed(1)}k per month
• **Recommended Allocation**: Start with 80% of your capacity (₹${Math.round(comprehensiveExtracted.monthlyInvestment * 0.8 / 1000)}k)
• **Growth Plan**: Increase by 10-15% annually` :
`• **Start Small**: Begin with ₹10,000-15,000 monthly
• **Scale Up**: Increase as income grows
• **Rule of Thumb**: Invest 20-30% of monthly income`}

**Portfolio Allocation for India:**
📈 **Equity Mutual Funds (60%)**: Large-cap, Mid-cap, Flexi-cap funds
🛡️ **Debt Instruments (30%)**: PPF, ELSS, Debt funds
💰 **Emergency Fund (10%)**: Liquid funds, FD for 6-month expenses

## 🕰️ **Timeline & Returns**
${comprehensiveExtracted.amount && comprehensiveExtracted.timeline ?
`**Target**: ₹${(comprehensiveExtracted.amount / 100000).toFixed(1)} lakhs in ${comprehensiveExtracted.timeline} years
**Required Monthly SIP**: ₹${Math.round(comprehensiveExtracted.amount / (comprehensiveExtracted.timeline * 12 * 1.1))} (at 10%* returns)
**Expected Corpus**: ₹${(comprehensiveExtracted.amount / 100000).toFixed(1)} lakhs*` :
`**Conservative Returns**: 8-10%* annually
**Moderate Returns**: 10-12%* annually  
**Aggressive Returns**: 12-15%* annually`}

## ✅ **Action Plan**
1. **Complete KYC** with any mutual fund company
2. **Start SIP** in diversified equity funds
3. **Open PPF Account** for tax savings
4. **Set up Emergency Fund** in liquid funds
5. **Review Quarterly** and rebalance portfolio

## 📝 **Tax Saving Options**
• **ELSS Funds**: Save up to ₹1.5 lakhs under 80C
• **PPF**: ₹1.5 lakhs annual limit, 15-year lock-in
• **ULIPs**: Insurance + investment combo

${comprehensiveExtracted.income ? 
`## 💼 **Income-Based Recommendations**
With ₹${(comprehensiveExtracted.income / 100000).toFixed(1)} lakhs annual income:
• Emergency Fund: ₹${Math.round(comprehensiveExtracted.income * 0.5 / 100000)} lakhs
• Monthly Investment: ₹${Math.round(comprehensiveExtracted.income * 0.25 / 12000)}k-${Math.round(comprehensiveExtracted.income * 0.35 / 12000)}k
• Insurance: Term plan of ₹${Math.round(comprehensiveExtracted.income * 10 / 100000)} lakhs` : ''}

**Remember**: Start small, stay consistent, and increase gradually. Time in the market beats timing the market!

*All returns are indicative and historical. Markets are subject to risks.`;

    console.log('generateFinancialAdvice: Fallback advice generated, length:', fallbackAdvice.length);
    console.log('generateFinancialAdvice: First 300 characters of fallback:', fallbackAdvice.substring(0, 300));
    console.log('generateFinancialAdvice: Last 200 characters of fallback:', fallbackAdvice.substring(fallbackAdvice.length - 200));

    return {
      success: true,
      message: fallbackAdvice + FINANCIAL_ADVISOR_FLOW.disclaimer
    };
  } catch (error) {
    console.error('Error in generateFinancialAdvice:', error);
    
    // Provide a simple fallback response for unexpected errors
    return {
      success: false,
      message: 'I apologize, but I encountered an error while generating your financial advice. Please try again.'
    };
  }
};

// Legacy function for backward compatibility
export const generateInvestmentPlan = async (
  userMessage: string,
  conversationHistory: Array<{ role: 'user' | 'assistant', content: string }> = []
): Promise<{ success: boolean; message: string }> => {
  return await generateFinancialAdvice(userMessage, conversationHistory);
};

// Temporary function to store user inputs from chat conversation
export const storeUserInputsTemporarily = (conversationHistory: Array<{ role: 'user' | 'assistant', content: string }>): {
  userName: string;
  goalDescription: string;
  timeline: string;
  cost: string;
  income: string;
  riskAppetite: string;
  profession: string;
  extractedFigures: {
    amount?: number;
    timeline?: number;
    monthlyInvestment?: number;
    income?: number;
  };
  userInputs: Array<{ question: string; answer: string }>;
} => {
  console.log('storeUserInputsTemporarily: Processing conversation history...');
  
  // Initialize variables
  let userName = '';
  let goalDescription = '';
  let timeline = '';
  let cost = '';
  let income = '';
  let riskAppetite = '';
  let profession = '';
  let extractedFigures: {
    amount?: number;
    timeline?: number;
    monthlyInvestment?: number;
    income?: number;
  } = {};
  
  // Extract user inputs from conversation
  const userInputs: Array<{ question: string; answer: string }> = [];
  
  conversationHistory.forEach((msg, index) => {
    if (msg.role === 'user') {
      const content = msg.content.toLowerCase();
      
      // Extract specific information based on question position
      if (index === 3 && !userName) { // Name question (usually 4th message)
        userName = msg.content.trim();
        userInputs.push({ question: 'What is your name?', answer: msg.content });
      } else if (index === 5 && !goalDescription) { // Goal question (usually 6th message)
        goalDescription = msg.content;
        userInputs.push({ question: 'What is your life goal?', answer: msg.content });
      } else if (content.includes('year') || content.includes('month') || content.includes('timeline')) {
        timeline = msg.content;
        userInputs.push({ question: 'What is your timeline?', answer: msg.content });
      } else if (content.includes('₹') || content.includes('lakh') || content.includes('crore') || content.includes('thousand') || content.includes('cost')) {
        cost = msg.content;
        userInputs.push({ question: 'What is the cost of your goal?', answer: msg.content });
      } else if (content.includes('income') || content.includes('salary') || content.includes('lpa') || content.includes('earn')) {
        income = msg.content;
        userInputs.push({ question: 'What is your income?', answer: msg.content });
      } else if (content.includes('conservative') || content.includes('moderate') || content.includes('aggressive') || content.includes('risk')) {
        riskAppetite = msg.content;
        userInputs.push({ question: 'What is your risk appetite?', answer: msg.content });
      } else if (content.includes('engineer') || content.includes('doctor') || content.includes('teacher') || content.includes('business') || content.includes('profession')) {
        profession = msg.content;
        userInputs.push({ question: 'What is your profession?', answer: msg.content });
      } else {
        // Generic question for other user inputs
        userInputs.push({ question: `Question ${Math.floor(index/2) + 1}`, answer: msg.content });
      }
      
      // Extract financial figures from user messages
      const figures = extractFinancialFigures(msg.content);
      if (figures.amount && !extractedFigures.amount) extractedFigures.amount = figures.amount;
      if (figures.timeline && !extractedFigures.timeline) extractedFigures.timeline = figures.timeline;
      if (figures.monthlyInvestment && !extractedFigures.monthlyInvestment) extractedFigures.monthlyInvestment = figures.monthlyInvestment;
      if (figures.income && !extractedFigures.income) extractedFigures.income = figures.income;
    }
  });
  
  console.log('storeUserInputsTemporarily: Extracted user inputs:', {
    userName,
    goalDescription,
    timeline,
    cost,
    income,
    riskAppetite,
    profession,
    extractedFigures,
    userInputsCount: userInputs.length
  });
  
  return {
    userName,
    goalDescription,
    timeline,
    cost,
    income,
    riskAppetite,
    profession,
    extractedFigures,
    userInputs
  };
};

// Enhanced function to send stored inputs to Gemini API
export const sendStoredInputsToGemini = async (
  storedInputs: ReturnType<typeof storeUserInputsTemporarily>
): Promise<{ success: boolean; message: string }> => {
  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!apiKey || apiKey === 'your-gemini-api-key-here') {
      console.error('Gemini API key not configured');
      return {
        success: false,
        message: 'API key not configured. Please set your Gemini API key in the environment variables.'
      };
    }
    
    console.log('sendStoredInputsToGemini: Starting Gemini API call with stored inputs...');
    
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-pro"
    });

    const chat = model.startChat();
    
    const greeting = storedInputs.userName ? `${storedInputs.userName}, ` : '';
    
    const prompt = `${SYSTEM_INSTRUCTION}

${FEW_SHOT_EXAMPLES}

Based on the stored user inputs, provide a detailed financial plan including:

**User Profile Summary:**
• **Name**: ${storedInputs.userName || 'User'}
• **Goal**: ${storedInputs.goalDescription || 'Financial goal'}
• **Risk Appetite**: ${storedInputs.riskAppetite || 'To be determined'}
• **Profession**: ${storedInputs.profession || 'To be determined'}

**Stored Financial Figures:**
${storedInputs.extractedFigures.amount ? `• Goal Amount: ₹${(storedInputs.extractedFigures.amount / 100000).toFixed(1)} lakhs (${storedInputs.extractedFigures.amount.toLocaleString()})` : ''}
${storedInputs.extractedFigures.timeline ? `• Timeline: ${storedInputs.extractedFigures.timeline} years` : ''}
${storedInputs.extractedFigures.monthlyInvestment ? `• Monthly Investment Capacity: ₹${(storedInputs.extractedFigures.monthlyInvestment / 1000).toFixed(1)}k (${storedInputs.extractedFigures.monthlyInvestment.toLocaleString()})` : ''}
${storedInputs.extractedFigures.income ? `• Annual Income: ₹${(storedInputs.extractedFigures.income / 100000).toFixed(1)} lakhs (${storedInputs.extractedFigures.income.toLocaleString()})` : ''}

**Stored User Inputs:**
${storedInputs.userInputs.map((input, index) => `• ${input.question}: ${input.answer}`).join('\n')}

**Financial Plan Requirements:**

1. **Goal Cost Analysis**: 
   - Use the exact goal amount provided: ${storedInputs.extractedFigures.amount ? `₹${(storedInputs.extractedFigures.amount / 100000).toFixed(1)} lakhs` : 'To be determined'}
   - If user didn't provide cost, research and provide estimated cost for their specific goal
   - Break down the total cost into components if applicable

2. **Feasibility Assessment**: 
   - Calculate if the goal is achievable with their current financial capacity
   - Use the exact figures: Timeline: ${storedInputs.extractedFigures.timeline || 'TBD'} years, Monthly Investment: ${storedInputs.extractedFigures.monthlyInvestment ? `₹${(storedInputs.extractedFigures.monthlyInvestment / 1000).toFixed(1)}k` : 'TBD'}
   - Consider inflation (6%*), market returns (10-12%*), and realistic investment growth
   - Provide concrete calculations showing monthly investment needed vs. capacity

3. **Investment Strategy**: 
   - Specific investment recommendations for India (mutual funds, stocks, FDs, PPF, NPS, ELSS)
   - Monthly investment allocation strategy based on their capacity
   - Risk assessment and portfolio diversification considering their risk appetite: ${storedInputs.riskAppetite || 'To be assessed'}

4. **Alternative Options** (if goal is not achievable):
   - Suggest modified goal parameters (extended timeline, reduced scope)
   - Income enhancement strategies (upskilling, side business, career advancement)
   - Skill development recommendations based on their profession: ${storedInputs.profession || 'To be determined'}
   - Alternative investment approaches

5. **Action Plan**: 
   - Step-by-step implementation with timelines
   - Monthly investment amounts (use exact figures provided)
   - Progress tracking milestones
   - Specific mutual fund recommendations for India

**Calculation Requirements:**
- Use exact figures: Goal: ${storedInputs.extractedFigures.amount ? `₹${storedInputs.extractedFigures.amount.toLocaleString()}` : 'TBD'}, Timeline: ${storedInputs.extractedFigures.timeline || 'TBD'} years
- Calculate required monthly investment: ${storedInputs.extractedFigures.amount && storedInputs.extractedFigures.timeline ? `₹${Math.round(storedInputs.extractedFigures.amount / (storedInputs.extractedFigures.timeline * 12)).toLocaleString()}` : 'To be calculated'}
- Compare with their capacity: ${storedInputs.extractedFigures.monthlyInvestment ? `₹${storedInputs.extractedFigures.monthlyInvestment.toLocaleString()}` : 'To be determined'}
- Show feasibility gap and solutions

Rules:
- Mark all ROI numbers with asterisk (*)
- Keep advice India-specific and practical
- Use friendly, professional tone
- Address user by name: ${greeting}
- Be realistic about goal achievability
- Provide concrete financial calculations using the exact figures provided
- If goal seems unachievable, offer constructive alternatives
- Generate a comprehensive investment report
- Keep response under 500 words
- Use the stored financial figures for all calculations

Generate a comprehensive financial plan with goal cost analysis, feasibility assessment, and investment strategy using ALL the stored user inputs provided above:`;

    console.log('sendStoredInputsToGemini: Sending request to Gemini with prompt length:', prompt.length);
    console.log('sendStoredInputsToGemini: Stored inputs being sent:', storedInputs);
    
    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    const advice = response.text().trim();
    
    console.log('sendStoredInputsToGemini: Generated financial advice successfully, length:', advice.length);
    
    return {
      success: true,
      message: advice + FINANCIAL_ADVISOR_FLOW.disclaimer
    };
    
  } catch (error) {
    console.error('Error in sendStoredInputsToGemini:', error);
    return {
      success: false,
      message: 'I apologize, but I encountered an error while generating your financial advice. Please try again.'
    };
  }
};

// Test function to verify financial advice generation
export const testFinancialAdviceGeneration = async (): Promise<{ success: boolean; message: string }> => {
  const testConversation = [
    { role: 'assistant' as const, content: 'Welcome to InvestRight!' },
    { role: 'user' as const, content: 'Yes, I am ready to start' },
    { role: 'assistant' as const, content: 'What is your name?' },
    { role: 'user' as const, content: 'John' },
    { role: 'assistant' as const, content: 'What is your life goal?' },
    { role: 'user' as const, content: 'I want to save for my child education in 10 years' },
    { role: 'assistant' as const, content: 'What is the timeline and cost?' },
    { role: 'user' as const, content: '10 years, around 25 lakhs' },
    { role: 'assistant' as const, content: 'What is your monthly income?' },
    { role: 'user' as const, content: 'I earn 50,000 per month' },
    { role: 'assistant' as const, content: 'What is your risk appetite?' },
    { role: 'user' as const, content: 'Moderate' },
    { role: 'assistant' as const, content: 'What is your profession?' },
    { role: 'user' as const, content: 'Software Engineer' },
    { role: 'assistant' as const, content: 'Do you have existing investments?' },
    { role: 'user' as const, content: 'Some FDs and savings' }
  ];
  
  console.log('Testing financial advice generation with sample conversation (5 questions)...');
  return await generateFinancialAdvice('Generate my financial plan', testConversation);
};

// Test function to verify the 5-question flow
export const testFiveQuestionFlow = async (): Promise<{ success: boolean; message: string }> => {
  const testConversation = [
    { role: 'assistant' as const, content: 'Hi there, Welcome to InvestRight - your unbiased personal wealth advisor. I am here to help you achieve and prepare for your Key Life Goals through financial advice.\n\nLife Goal Preparedness refers to how ready and financially equipped an individual (or family) is to achieve their key life goals — such as: Buying a house, Children\'s education, Marriage expenses, Retirement planning, Health & family security, Travel, lifestyle, or passion pursuits.\n\nAre you ready to start?' },
    { role: 'user' as const, content: 'Yes, I am ready to start' },
    { role: 'assistant' as const, content: 'What is your name? I\'d love to address you personally throughout our conversation.' },
    { role: 'user' as const, content: 'Priya' },
    { role: 'assistant' as const, content: 'Nice to meet you, Priya! What inspirational life goal do you have? I would love to hear from you – it could be investment advice, any goal you want to accomplish, or even just curiosity on any investment or anything else too\n\nSample format:\n• "Buy a house worth ₹1 crore"\n• "Save for child\'s education"\n• "Plan for retirement"' },
    { role: 'user' as const, content: 'I want to buy a house worth 50 lakhs' },
    { role: 'assistant' as const, content: 'Excellent goal! To create your investment strategy, I need to know:\n\n📅 **Timeline**: When do you want to achieve this goal? (e.g., 5 years, 10 years)\n💰 **Target Amount**: What\'s the approximate cost? (e.g., 25 lakhs, 1 crore)\n\nYou can answer both together like: "I need 50 lakhs in 8 years"' },
    { role: 'user' as const, content: 'I need 50 lakhs in 8 years' },
    { role: 'assistant' as const, content: 'Now I need to understand your financial capacity:\n\n💼 **Monthly Income**: What do you currently earn? (e.g., 8 LPA, 60,000 per month)\n📈 **Investment Capacity**: How much can you invest monthly towards this goal? (e.g., 15,000 per month)\n\nYou can combine like: "I earn 10 LPA and can invest 20,000 monthly"' },
    { role: 'user' as const, content: 'I earn 8 LPA and can invest 15,000 monthly' },
    { role: 'assistant' as const, content: 'What\'s your investment risk preference?\n\n🛡️ **Conservative**: Safe investments, lower returns (FD, PPF)\n⚖️ **Moderate**: Balanced mix, moderate returns (Mutual Funds)\n🚀 **Aggressive**: Higher risk, higher potential returns (Equity, Stocks)\n\nJust say "moderate" or describe your preference.' },
    { role: 'user' as const, content: 'Moderate' },
    { role: 'assistant' as const, content: 'What is your current profession? This helps me understand your income stability and suggest upskilling or side business opportunities if needed.' },
    { role: 'user' as const, content: 'Software Engineer' },
    { role: 'assistant' as const, content: 'Do you have any existing savings, investments, or assets? This helps me optimize your portfolio and avoid duplication.' },
    { role: 'user' as const, content: 'Some FDs worth 2 lakhs' }
  ];
  
  console.log('Testing 5-question flow with sample conversation...');
  return await generateFinancialAdvice('Generate my investment plan', testConversation);
};

// Test function to verify Indian number conversion
export const testIndianNumberConversion = (): void => {
  const testCases = [
    '50 lakhs',
    '2.5 crores',
    '10k per month',
    '8 LPA',
    '25 lakh',
    '1 crore',
    '5000 monthly',
    '15 thousand'
  ];
  
  console.log('Testing Indian number conversion:');
  testCases.forEach(testCase => {
    const result = convertIndianNumberFormat(testCase);
    console.log(`"${testCase}" → ${result}`);
  });
  
  console.log('\nTesting financial figure extraction:');
  const testInput = 'I want to save 25 lakhs in 10 years and can invest 10k per month. I earn 8 LPA.';
  const extracted = extractFinancialFigures(testInput, 'general');
  console.log(`Input: "${testInput}"`);
  console.log('Extracted:', extracted);
};

// Test function to verify adaptive questioning for complex scenarios
export const testAdaptiveQuestioning = async (): Promise<{ success: boolean; message: string }> => {
  const complexConversation = [
    { role: 'assistant' as const, content: 'Hi there, Welcome to InvestRight - your unbiased personal wealth advisor. I am here to help you achieve and prepare for your Key Life Goals through financial advice.\n\nLife Goal Preparedness refers to how ready and financially equipped an individual (or family) is to achieve their key life goals — such as: Buying a house, Children\'s education, Marriage expenses, Retirement planning, Health & family security, Travel, lifestyle, or passion pursuits.\n\nAre you ready to start?' },
    { role: 'user' as const, content: 'Yes, I am ready to start' },
    { role: 'assistant' as const, content: 'What is your name? I\'d love to address you personally throughout our conversation.' },
    { role: 'user' as const, content: 'Rahul' },
    { role: 'assistant' as const, content: 'Nice to meet you, Rahul! What inspirational life goal do you have? I would love to hear from you – it could be investment advice, any goal you want to accomplish, or even just curiosity on any investment or anything else too\n\nSample format:\n• "Buy a house worth ₹1 crore"\n• "Save for child\'s education"\n• "Plan for retirement"' },
    { role: 'user' as const, content: 'I want to save some money for maybe a house or education, not sure exactly. I earn around 8-10 LPA and can invest some amount monthly.' }
  ];
  
  console.log('Testing adaptive questioning for complex scenario...');
  return await generateFinancialAdvice('Generate my investment plan', complexConversation);
};

// Test function to verify multiple goals scenario
export const testMultipleGoals = async (): Promise<{ success: boolean; message: string }> => {
  const multipleGoalsConversation = [
    { role: 'assistant' as const, content: 'Hi there, Welcome to InvestRight - your unbiased personal wealth advisor. I am here to help you achieve and prepare for your Key Life Goals through financial advice.\n\nLife Goal Preparedness refers to how ready and financially equipped an individual (or family) is to achieve their key life goals — such as: Buying a house, Children\'s education, Marriage expenses, Retirement planning, Health & family security, Travel, lifestyle, or passion pursuits.\n\nAre you ready to start?' },
    { role: 'user' as const, content: 'Yes, I am ready to start' },
    { role: 'assistant' as const, content: 'What is your name? I\'d love to address you personally throughout our conversation.' },
    { role: 'user' as const, content: 'Anita' },
    { role: 'assistant' as const, content: 'Nice to meet you, Anita! What inspirational life goal do you have? I would love to hear from you – it could be investment advice, any goal you want to accomplish, or even just curiosity on any investment or anything else too\n\nSample format:\n• "Buy a house worth ₹1 crore"\n• "Save for child\'s education"\n• "Plan for retirement"' },
    { role: 'user' as const, content: 'I want to save for my child\'s education (25 lakhs in 10 years), buy a house (50 lakhs in 8 years), and plan for retirement (2 crores in 20 years). I earn 12 LPA and can invest 30,000 monthly.' }
  ];
  
  console.log('Testing multiple goals scenario...');
  return await generateFinancialAdvice('Generate my investment plan', multipleGoalsConversation);
};