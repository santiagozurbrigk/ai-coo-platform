export type ProductNodeType =
  | "avatar"
  | "offer"
  | "value-ladder"
  | "proposition";

export type SpatialProductNode = {
  id: string;
  type: ProductNodeType;
  title: string;
  subtitle: string;
  badge?: string;
  badgeColor?: string;
  aiInsight?: string;
  position: { x: string; y: string };
  href: string;
};

export type ProductAvatarObjection = {
  text: string;
  frequency?: number;
};

export type ProductAvatar = {
  id: string;
  name: string;
  age: number;
  role: string;
  location: string;
  isMain: boolean;
  currentRevenue: string;
  targetRevenue: string;
  yearsInBusiness: string;
  innerVoice: string;
  pains: string[];
  dreams: string[];
  objections: ProductAvatarObjection[];
  buyTrigger: string;
  aiInsights: string[];
  imageUrl?: string | null;
};

export type ValueLadderStep = {
  id: string;
  productId?: string;
  name: string;
  price: number;
  priceModel: string;
  description: string;
  isCore: boolean;
  closesPerMonth: number | string;
  closeRate: number;
};

export type OfferInclude = {
  title: string;
  description?: string;
};

export type ProductOffer = {
  id: string;
  name: string;
  price: number;
  promise: string;
  targetAvatar: string;
  promisedResult: string;
  timeframe: string;
  guarantee: string;
  mainObjection: string;
  objectionHandler: string;
  includes: OfferInclude[];
  stats: {
    monthlyRevenue: string;
    closeRate: number;
    topObjection: string;
    completionRate: number;
  };
  aiInsight: string;
};

export type ValueProposition = {
  avatar: string;
  result: string;
  painRemoved: string;
  timeframe: string;
};

export type ProductData = {
  avatars: ProductAvatar[];
  valueLadder: ValueLadderStep[];
  offers: ProductOffer[];
  proposition: ValueProposition;
};
