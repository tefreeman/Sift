# Sift: AI-Powered Calorie Estimator Mobile App

## Overview

**Sift** is a mobile web application built with Ionic and Angular, designed to help users lose weight by leveraging AI technology to estimate the calorie content of menu items where such information is not readily available. The application uses an AI model trained on recipes and ingredient databases to predict calorie amounts, providing users with valuable insights into their dietary choices.

## Main Purpose and Functionality

The primary objective of Sift is to assist users in making informed dietary decisions by estimating the calorie content of restaurant menu items. Key functionalities include:

1. **Calorie Estimation**: Using an AI model trained on extensive recipe and ingredient data to provide calorie estimates for menu items.
2. **User Profiles**: Allowing users to create profiles, track their weight, set health goals, and receive personalized recommendations.
3. **Geolocation**: Displaying nearby restaurants and menu items on a map based on the user's current location.
4. **Filtering and Sorting**: Offering advanced filtering and sorting options to help users find menu items that fit their dietary preferences and goals.
5. **Local Caching**: Reducing backend search costs by caching restaurant and calorie information locally on the user's device.

## Key Components and Modules

The application is structured into several key modules and components, each responsible for specific functionalities:

### Authentication and Authorization
- **AuthService**: Handles user authentication via email, Google, Facebook, etc., and manages role-based access controls using Firebase and Google Cloud Functions.
- **User State Management**: Manages the logged-in state across the application using Firebase services.

### Data Management and Services
- **Firestore Integration**: Services like `firestore-data.service.ts` and `data.service.ts` handle user data storage in Firebase Firestore.
- **Local Storage**: Services like `cache.service.ts` and `file-cache.service.ts` manage local caching using a Loki.js database, storing restaurant and calorie information locally to save backend costs.

### UI Components and Design
- **Ionic Framework**: Extensively uses Ionic components with design guidelines inspired by Google Material Design.
- **Main Components**: Includes components like `MapsComponent` for geolocation, `ProfileComponent` for user profiles, and various filter components for user-specific dietary filters.

### Filtering and Sorting
- **Filtering Mechanism**: Implemented client-side using the local Loki.js database, allowing users to filter menu items based on distance, ingredients, and other criteria.
- **Sorting Mechanism**: Uses optimized Loki.js calls to sort menu items, ensuring performance similar to SQL databases.

### Maps and Geolocation
- **MapsComponent**: Integrates Google Maps to display user location and nearby restaurants, showing distances and locations.
- **Geolocation Services**: Uses Ionic's built-in services to fetch GPS location data from the user's device.

### Profiles and User Data
- **Profile Module**: Manages user profiles, health goals, and preferences, allowing dynamic updates and personalized recommendations.

### Miscellaneous
- **Mock Data**: Uses mock data (`mock.service.ts`) for testing purposes.
- **Error Handling and Logging**: Basic error handling using Angular's built-in mechanisms, with plans for more robust logging in the future.

## Overall Architecture and Design Patterns

The application's architecture follows a modular design, with each module focusing on specific functionalities. Key design patterns and architectural choices include:

- **Service-Oriented Architecture**: Separates concerns by using dedicated services for authentication, data management, and caching.
- **Reactive Programming**: Utilizes RxJS for state management and asynchronous operations, providing a responsive and scalable user experience.
- **Component-Based Design**: Leverages Angular's component-based architecture to create reusable UI components and maintain a clean separation of concerns.

## Important Technologies and Frameworks

The project employs several key technologies and frameworks:

- **Ionic Framework**: For building the mobile web application with a focus on cross-platform compatibility.
- **Angular**: As the primary framework for developing the application's frontend.
- **Firebase**: For authentication, Firestore database, and cloud functions.
- **Loki.js**: For local storage and caching, reducing backend dependency and improving performance.
- **Google Maps API**: For geolocation and displaying nearby restaurants on a map.

## Notable Features and Algorithms

- **AI-Powered Calorie Estimation**: Uses advanced AI models trained on recipe and ingredient data to estimate calorie content.
- **Advanced Filtering and Sorting**: Provides robust client-side filtering and sorting mechanisms, offering users a highly customizable search experience.
- **Local Caching Strategy**: Implements a local caching strategy using Loki.js to minimize backend costs and improve app performance.
- **Geolocation Integration**: Seamlessly integrates geolocation services to provide real-time location-based recommendations.

## Conclusion

Sift is a comprehensive mobile web application designed to assist users in making healthier dietary choices by providing AI-powered calorie estimates and personalized recommendations. With its modular architecture, robust data management, and user-friendly design, Sift aims to be a valuable tool for anyone looking to manage their weight and improve their health.
