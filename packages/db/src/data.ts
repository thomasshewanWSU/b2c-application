export type Product = {
  id: number;
  urlId: string;
  name: string;
  brand: string;
  description: string;
  specifications: string;
  detailedDescription: string;
  price: number;
  imageUrl: string;
  category: string;
  stock: number;
  featured: boolean;
  active: boolean;
  rating?: number;
  reviewCount?: number;
  reviews?: Review[];
  createdAt: Date;
  updatedAt: Date;
};

export type User = {
  id: number;
  email: string;
  name?: string | null;
  password: string;
  role: "customer" | "admin";
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type Order = {
  id: number;
  userId: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  total: number;
  notes?: string | null;
  shippingAddress: string;
  billingAddress?: string | null;
  paymentMethod: string;
  paymentId?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type OrderItem = {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  price: number;
  productName: string;
  productBrand?: string | null;
  productImage?: string | null;
  productOptions?: string | null;
};

export type Review = {
  id: number;
  productId: number;
  userId: number;
  rating: number;
  title?: string | null;
  comment: string;
  verified: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
};

// Sample product data
export const products: Product[] = [
  {
    id: 1,
    urlId: "wireless-bluetooth-headphones",
    name: "Wireless Bluetooth Headphones",
    brand: "Sony",
    description:
      "Premium wireless headphones with **active noise cancellation** and *30-hour battery life*. Experience studio-quality sound with deep bass and crystal-clear highs.",
    detailedDescription: `# Sony WH-1000XM4 Wireless Headphones

## Overview
The ultimate noise-canceling headphones with exceptional sound quality and all-day comfort. Perfect for travel, work, or just enjoying your music without distractions.

## Key Features
- **Industry-leading noise cancellation** adapts to your environment
- *30-hour* battery life with quick charging (10 min charge = 5 hours playback)
- Touch sensor controls for easy operation
- Speak-to-chat technology automatically reduces volume during conversations
- Superior call quality with precise voice pickup
- Wearing detection pauses playback when headphones are removed

## What's in the Box
- WH-1000XM4 headphones
- Carrying case
- USB-C charging cable
- Audio cable for wired connection
- Airplane adapter

![Headphones in case](https://images.unsplash.com/photo-1590658268037-6bf12165a8df?ixlib=rb-4.0.3)`,
    specifications: JSON.stringify({
      "Battery Life": "30 hours",
      Connectivity: "Bluetooth 5.0",
      "Noise Cancellation": "Active",
      Weight: "254g",
      Foldable: "Yes",
    }),
    price: 199.99,
    imageUrl:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3",
    category: "Electronics",
    stock: 50,
    featured: true,
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 2,
    urlId: "smart-fitness-tracker",
    name: "Smart Fitness Tracker",
    brand: "Fitbit",
    description:
      "Track your steps, heart rate, sleep quality and more. *Waterproof* and with **7-day battery life**. Perfect for fitness enthusiasts!",
    detailedDescription: `# Fitbit Charge 5 Advanced Fitness Tracker

## Your Personal Health Assistant
The Fitbit Charge 5 is designed to help you optimize your workout routine, understand your sleep patterns, and manage your stress levels.

## Health Metrics
- **24/7 Heart Rate Monitoring** for optimized workouts
- *ECG App* for heart rhythm assessment
- EDA Scan app for stress management
- Sleep stage tracking
- Oxygen saturation (SpO2) monitoring

## Fitness Features
1. Built-in GPS for pace and distance tracking
2. 20+ exercise modes
3. Active Zone Minutes alert
4. Automatic exercise recognition

> "The most advanced Fitbit tracker to date with features typically found in more expensive smartwatches."

## Daily Use Benefits
* Smartphone notifications
* Contactless payments
* Water resistant to 50m
* Customizable clock faces

![Fitbit on wrist](https://images.unsplash.com/photo-1576243345690-4e4b79b63288?ixlib=rb-4.0.3)`,
    specifications: JSON.stringify({
      "Battery Life": "7 days",
      "Water Resistance": "50m",
      Sensors: "Heart rate, Accelerometer, GPS",
      Screen: "OLED Touch",
      Compatibility: "iOS, Android",
    }),
    price: 89.99,
    imageUrl:
      "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b1?ixlib=rb-4.0.3",
    category: "Electronics",
    stock: 75,
    featured: true,
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 3,
    urlId: "organic-cotton-t-shirt",
    name: "Organic Cotton T-Shirt",
    brand: "EcoWear",
    description:
      "Comfortable, **sustainable** t-shirt made from *100% organic cotton*. Available in various colors for everyday casual wear.",
    detailedDescription: `# EcoWear Organic Cotton Crew Neck

## Sustainable Fashion
Our organic cotton t-shirts are ethically produced using sustainable farming practices without harmful chemicals or pesticides.

## Fabric Details
- *100% GOTS Certified Organic Cotton*
- Medium weight (180 GSM)
- Pre-shrunk to maintain shape
- Breathable and soft on skin

## Design
The minimalist design features:
- Classic crew neck
- Regular fit
- Double-stitched hems
- Reinforced shoulder seams

## Care Instructions
| Do | Don't |
|-------|--------|
| Machine wash cold | Bleach |
| Gentle cycle | Iron print |
| Tumble dry low | Dry clean |

## Available Colors
- Heather Gray
- Natural White
- Forest Green
- Navy Blue
- Terra Cotta

*All dyes are low-impact and eco-friendly*

![T-shirt fabric close-up](https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?ixlib=rb-4.0.3)`,
    specifications: JSON.stringify({
      Material: "100% Organic Cotton",
      Care: "Machine wash cold, tumble dry low",
      Fit: "Regular",
      Origin: "Ethically made in Portugal",
    }),
    price: 24.99,
    imageUrl:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3",
    category: "Clothing",
    stock: 100,
    featured: false,
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 4,
    urlId: "stainless-steel-water-bottle",
    name: "Stainless Steel Water Bottle",
    brand: "HydroFlask",
    description:
      "Eco-friendly double-walled insulated bottle that keeps drinks **hot for 12 hours** and **cold for 24 hours**. Perfect for hiking and everyday use.",
    detailedDescription: `# HydroFlask Insulated Water Bottle

## Why Choose HydroFlask?
Our premium stainless steel water bottles are designed to keep your beverages at the perfect temperature all day long, while reducing single-use plastic waste.

## Temperature Retention
Temperature tests show our bottles maintain:
- ❄️ Cold beverages stay cold for **24 hours**
- 🔥 Hot beverages stay hot for **12 hours**

## Construction
Made with precision using:
- *18/8 Pro-Grade Stainless Steel*
- BPA-free and phthalate-free materials
- TempShield™ double-wall vacuum insulation
- Powder coat finish for slip-free grip

## Features
- Honeycomb™ insulated cap
- Flex strap for easy carrying
- Wide mouth for ice cubes and easy cleaning
- Lifetime warranty

## Environmental Impact
Each reusable water bottle prevents approximately 217 plastic bottles from entering landfills and oceans annually.

![Bottle in use outdoors](https://images.unsplash.com/photo-1523362628745-0c100150b504?ixlib=rb-4.0.3)`,
    specifications: JSON.stringify({
      Capacity: "750ml",
      Material: "18/8 Stainless Steel",
      Insulation: "Double-wall vacuum",
      "Keeps Cold": "24 hours",
      "Keeps Hot": "12 hours",
    }),
    price: 34.99,
    imageUrl:
      "https://images.unsplash.com/photo-1602143407151-7111542de6e8?ixlib=rb-4.0.3",
    category: "Home",
    stock: 5,
    featured: false,
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 5,
    urlId: "wireless-charging-station",
    name: "Wireless Charging Station",
    brand: "Anker",
    description:
      "**3-in-1 charging station** for your phone, smartwatch, and earbuds with *fast charging technology*. Keep your devices organized and powered.",
    detailedDescription: `# Anker PowerWave 3-in-1 Wireless Charging Station

## Complete Charging Solution
The PowerWave 3-in-1 is your all-in-one charging solution for Apple and Android devices with Qi wireless charging capability.

## Device Compatibility
Designed specifically for:

### Phones
- iPhone 15/14/13/12 Series (up to 15W)
- Samsung Galaxy S23/S22/S21 Series (up to 15W)
- Google Pixel 8/7/6 (up to 12W)
- All Qi-enabled smartphones

### Watches
- Apple Watch Series 9/8/7/SE/Ultra
- Samsung Galaxy Watch 6/5/4
- Other Qi-compatible smartwatches

### Earbuds
- AirPods Pro/3/2
- Galaxy Buds Pro/Live/+
- Pixel Buds Pro
- All Qi-enabled earbuds cases

## Technical Specifications
- Input: QC 3.0/PD adapter required (included)
- Output: Up to 15W fast charging (device-dependent)
- Case compatibility: Works with most cases up to 5mm thick
- Safety: Foreign object detection, temperature control, over-charge protection

## In The Box
* PowerWave 3-in-1 Charging Station
* 30W Quick Charge 3.0 Wall Adapter
* 5ft USB-C Cable
* User Manual
* 18-month warranty card

![Devices charging on station](https://images.unsplash.com/photo-1617625802912-cde586faf331?ixlib=rb-4.0.3)`,
    specifications: JSON.stringify({
      Input: "QC 3.0 / PD",
      Output: "15W max",
      Compatibility: "Qi-enabled devices",
      Dimensions: "150 x 100 x 80mm",
      Includes: "Charging station, USB-C cable",
    }),
    price: 59.99,
    imageUrl:
      "https://images.unsplash.com/photo-1625895197185-efcec01cffe0?ixlib=rb-4.0.3",
    category: "Electronics",
    stock: 45,
    featured: true,
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 6,
    urlId: "smart-home-security-camera",
    name: "Smart Home Security Camera",
    brand: "Ring",
    description:
      "**HD security camera** with *motion detection*, night vision, and two-way audio. Easily monitor your home from anywhere using your smartphone.",
    detailedDescription: `# Ring Indoor Cam - Smart Home Security

## Home Security Made Simple
The Ring Indoor Cam is a compact, plug-in security camera that lets you see, hear and speak to people and pets from your phone, tablet, or select Echo device.

## Key Security Features

### Video Quality
- **1080p HD Video** with a 140° diagonal field of view
- Color night vision for clear footage even in low light
- Live View on-demand video streaming

### Smart Detection
- Advanced motion detection with customizable motion zones
- Person detection to reduce false alerts
- Real-time notifications sent to your phone

### Audio Capabilities
- Two-way talk with noise cancellation
- Ability to hear and respond to visitors
- Siren functionality to deter intruders

## Privacy Controls
- Easily disable motion recording, audio, and Live View
- Privacy zones to exclude areas from recording
- Camera privacy cover (sold separately)

## Smart Home Integration
Connects seamlessly with:
1. Amazon Alexa devices
2. Google Assistant
3. IFTTT for custom automations
4. Other Ring products

## Installation
* Takes just minutes to set up
* No professional installation required
* Includes mounting bracket and hardware
* Can be placed on flat surfaces or wall-mounted

## Subscription
Ring Protect Plan available (sold separately) for:
- Video recording
- Photo capture
- Video sharing
- Extended 60-day video history

![Security camera view](https://images.unsplash.com/photo-1558000143-a78f8299c0c1?ixlib=rb-4.0.3)`,
    specifications: JSON.stringify({
      Resolution: "1080p HD",
      "Field of View": "130°",
      "Night Vision": "Yes",
      "Two-way Audio": "Yes",
      Connectivity: "Wi-Fi",
      Power: "Wired / Battery",
    }),
    price: 129.99,
    imageUrl:
      "https://images.unsplash.com/photo-1580981454769-61eb384acaee?ixlib=rb-4.0.3",
    category: "Electronics",
    stock: 30,
    featured: false,
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Sample user data
export const users: User[] = [
  {
    id: 1,
    email: "admin@store.com",
    name: "Admin User",
    password: "admin123", // "admin123" hashed
    role: "admin",
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 2,
    email: "john@example.com",
    name: "John Doe",
    password: "customer123", // "password123" hashed
    role: "customer",
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 3,
    email: "jane@example.com",
    name: "Jane Smith",
    password: "$2a$10$2R1wda5c8U4uK67LW0OimuEiLW2Q0y2TkBPQFE0DZ3B9ZCf6sq6Fe", // "password123" hashed
    role: "customer",
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Sample order data
export const orders: Order[] = [
  {
    id: 1,
    userId: 2,
    status: "delivered",
    total: 224.98,
    notes: "Please leave at front door",
    shippingAddress: "123 Main St, Anytown, ST 12345",
    billingAddress: "123 Main St, Anytown, ST 12345",
    paymentMethod: "Credit Card",
    paymentId: "ch_1K2XjKLkGJYt8tZUMYaTx5Z",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
  },
  {
    id: 2,
    userId: 3,
    status: "shipped",
    total: 89.99,
    notes: null,
    shippingAddress: "456 Oak Ave, Othertown, ST 67890",
    billingAddress: null,
    paymentMethod: "PayPal",
    paymentId: "PAY-1AB23456CD789012E",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
  },
  {
    id: 3,
    userId: 2,
    status: "processing",
    total: 94.98,
    notes: null,
    shippingAddress: "123 Main St, Anytown, ST 12345",
    billingAddress: "123 Main St, Anytown, ST 12345",
    paymentMethod: "Credit Card",
    paymentId: "ch_1K2XnPLkGJYt8tZUB3mTy7X",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
  },
];

// Sample order item data
export const orderItems: OrderItem[] = [
  {
    id: 1,
    orderId: 1,
    productId: 1,
    quantity: 1,
    price: 199.99,
    productName: "Wireless Bluetooth Headphones",
    productBrand: "Sony",
    productImage:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3",
    productOptions: null,
  },
  {
    id: 2,
    orderId: 1,
    productId: 3,
    quantity: 1,
    price: 24.99,
    productName: "Organic Cotton T-Shirt",
    productBrand: "EcoWear",
    productImage:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3",
    productOptions: JSON.stringify({ Color: "Blue", Size: "L" }),
  },
  {
    id: 3,
    orderId: 2,
    productId: 2,
    quantity: 1,
    price: 89.99,
    productName: "Smart Fitness Tracker",
    productBrand: "Fitbit",
    productImage:
      "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b1?ixlib=rb-4.0.3",
    productOptions: null,
  },
  {
    id: 4,
    orderId: 3,
    productId: 3,
    quantity: 2,
    price: 24.99,
    productName: "Organic Cotton T-Shirt",
    productBrand: "EcoWear",
    productImage:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3",
    productOptions: JSON.stringify({ Color: "Black", Size: "M" }),
  },
  {
    id: 5,
    orderId: 3,
    productId: 4,
    quantity: 1,
    price: 34.99,
    productName: "Stainless Steel Water Bottle",
    productBrand: "HydroFlask",
    productImage:
      "https://images.unsplash.com/photo-1602143407151-7111542de6e8?ixlib=rb-4.0.3",
    productOptions: JSON.stringify({ Color: "Navy Blue" }),
  },
];

// Sample review data
export const reviews: Review[] = [
  {
    id: 1,
    productId: 1,
    userId: 2,
    rating: 4.5,
    title: "Great sound quality!",
    comment:
      "These headphones have amazing sound quality and the noise cancellation works really well. Battery life is impressive too.",
    verified: true,
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
    updatedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
  },
  {
    id: 2,
    productId: 1,
    userId: 3,
    rating: 5,
    title: "Best headphones I've owned",
    comment:
      "Absolutely love these headphones. The comfort is amazing even for extended periods, and the sound is crisp and clear.",
    verified: true,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
  },
  {
    id: 3,
    productId: 2,
    userId: 2,
    rating: 4,
    title: "Great for tracking workouts",
    comment:
      "Really happy with this fitness tracker. Battery lasts as advertised and the app is intuitive. Heart rate monitor seems accurate.",
    verified: true,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
  {
    id: 4,
    productId: 3,
    userId: 3,
    rating: 5,
    title: "Soft and sustainable",
    comment:
      "This t-shirt is incredibly soft and comfortable. I love that it's made from organic cotton. Will definitely buy more in different colors.",
    verified: true,
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), // 20 days ago
    updatedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
  },
  {
    id: 5,
    productId: 4,
    userId: 2,
    rating: 4.5,
    title: "Great insulation",
    comment:
      "This water bottle really does keep drinks cold for 24 hours as advertised. I'm impressed with the quality and it doesn't leak at all.",
    verified: false,
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
    updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
  },
  {
    id: 6,
    productId: 5,
    userId: 3,
    rating: 3.5,
    title: "Good but could be better",
    comment:
      "The charging station works well with my devices but it does get warm after extended use. Charging speed is decent but not as fast as advertised.",
    verified: true,
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), // 12 days ago
    updatedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
  },
];
