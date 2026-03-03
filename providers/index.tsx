import React from 'react';
import { ClerkProvider, useAuth } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import { ConvexProviderWithClerk } from 'convex/react-clerk';
import { ConvexReactClient } from 'convex/react';
import { resourceCache } from '@clerk/clerk-expo/resource-cache';

import { PaystackProvider } from 'react-native-paystack-webview';
const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!);

export default function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      tokenCache={tokenCache}
      __experimental_resourceCache={resourceCache}
      publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!}>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <PaystackProvider
          publicKey={process.env.EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY!}
          defaultChannels={['card', 'bank_transfer']}>
          {children}
        </PaystackProvider>
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
