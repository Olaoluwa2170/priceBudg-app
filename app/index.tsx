import { useAuth, useUser } from '@clerk/clerk-expo';
import { api } from 'convex/_generated/api';
import { useMutation, useQuery } from 'convex/react';
import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { generateLastName } from 'utils/helper';
import { ActivityIndicator, Image, Text, View } from 'react-native';
import { colors } from '../styles/colors';
import { fontFamily } from '../styles/font-family';

export default function IndexScreen() {
  const [isLoading, setIsLoading] = useState(true);

  const { user, isLoaded: userLoaded } = useUser();
  const { isSignedIn, isLoaded: authLoaded } = useAuth();

  const convexUser = useQuery(
    api.users.getByEmail,
    user ? { email: user.emailAddresses[0].emailAddress } : 'skip'
  );

  const createUser = useMutation(api.users.create);

  useEffect(() => {
    const loadUser = async () => {
      if (!authLoaded || !userLoaded) return;

      if (isSignedIn && user) {
        if (convexUser === null) {
          try {
            await createUser({
              firstName: user.firstName ?? 'User',
              lastName: user.lastName ?? generateLastName(),
              email: user.emailAddresses[0]?.emailAddress ?? '',
            });
          } catch (error: any) {
            if (error?.message?.includes('already exists')) {
              console.log('User already exists in database');
            } else {
              console.error('Error creating user:', error);
            }
          }
        }
      }

      setIsLoading(false);
    };

    loadUser();
  }, [isSignedIn, user, createUser, convexUser, authLoaded, userLoaded]);

  if (isLoading || !userLoaded || !authLoaded) {
    return (
      <View
        style={{
          position: 'relative',
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.black,
        }}>
        <Image
          source={require('../assets/splash.png')}
          style={{
            position: 'absolute',
            top: '18%',
            width: '100%',
            height: 200,
            resizeMode: 'contain',
          }}
        />

        <ActivityIndicator size="large" color={colors.white} />
        <Text
          style={{
            fontSize: 14,
            marginTop: 2,
            color: colors.white,
            textAlign: 'center',
            fontFamily: fontFamily.ManropeRegular,
          }}>
          Just a minute...
        </Text>
      </View>
    );
  }

  if (!isSignedIn) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return <Redirect href="/(protected)/(tabs)" />;
}
