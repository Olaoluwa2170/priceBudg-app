import { useAuth, useUser } from '@clerk/clerk-expo';
import { api } from 'convex/_generated/api';
import { useMutation, useQuery } from 'convex/react';
import { Tabs, useRouter } from 'expo-router';
import { Camera, History, Search, Wallet } from 'lucide-react-native';
import { useEffect } from 'react';
import { Text } from 'react-native';
import { generateLastName } from 'utils/helper';
import { colors } from '../../../styles/colors';
import { fontFamily } from '../../../styles/font-family';
import { fontSizes } from 'styles/font-sizes';

export default function TabLayout() {
  const router = useRouter();
  const { user } = useUser();
  const { isSignedIn, isLoaded: authLoaded } = useAuth();

  const convexUser = useQuery(
    api.users.getByEmail,
    user ? { email: user.emailAddresses[0].emailAddress } : 'skip'
  );

  const createUserMutation = useMutation(api.users.create);

  useEffect(() => {
    if (authLoaded && !isSignedIn) {
      router.push('(tabs)');
      return;
    }

    if (user && convexUser === null) {
      const createUserAsync = async () => {
        await createUserMutation({
          firstName: user.firstName ?? 'User',
          lastName: user.lastName ?? generateLastName(),
          email: user.emailAddresses[0].emailAddress,
        });
      };

      createUserAsync();
    }
  }, [authLoaded, convexUser, createUserMutation, isSignedIn, router, user]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.black,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: colors.gray200,
          paddingTop: 5,
          paddingBottom: 6,
          height: 90,
        },
        tabBarLabel({ focused, children }) {
          const color = focused ? colors.black : colors.tabInactive;
          const fontWeight = focused ? '500' : '400';

          return (
            <Text
              style={{
                color,
                fontWeight,
                marginTop: 2,
                fontSize: fontSizes.extraSmall,
                textAlign: 'center',
                fontFamily: fontFamily.ManropeRegular,
              }}>
              {children}
            </Text>
          );
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Scan',
          tabBarIcon: ({ color, size }) => <Camera size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color, size }) => <Search size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color, size }) => <History size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="budgets"
        options={{
          title: 'Budgets',
          tabBarIcon: ({ color, size }) => <Wallet size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
