export type Brand = 'Apple' | 'Samsung' | 'Google' | 'OnePlus' | 'Xiaomi' | 'Sony' | 'Motorola' | 'Nothing';
export type PhoneType = 'flagship' | 'mid-range' | 'budget';
export type SortOption = 'default' | 'price-asc' | 'price-desc' | 'rating' | 'newest';

export interface ProductSpecs {
  display: string;
  processor: string;
  ram: string;
  storage: string;
  camera: string;
  battery: string;
  os: string;
}

export interface Product {
  id: string;
  name: string;
  brand: Brand;
  type: PhoneType;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  image: string;
  images: string[];
  shortDescription: string;
  specs: ProductSpecs;
  colors: string[];
  inStock: boolean;
  isNew?: boolean;
  isFeatured?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor: string;
}

export interface FilterState {
  brands: Brand[];
  types: PhoneType[];
  minPrice: number;
  maxPrice: number;
  sortBy: SortOption;
  searchQuery: string;
}

export interface CarouselSlide {
  id: string;
  product: Product;
  headline: string;
  subtext: string;
  accentColor: string;
  bgGradient: string;
}
