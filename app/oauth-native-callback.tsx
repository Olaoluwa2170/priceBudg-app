import { useAuth } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { View, Text, Image, ActivityIndicator } from 'react-native';
import { colors } from '../styles/colors';
import { fontFamily } from '../styles/font-family';

export default function AuthCallback() {
  const router = useRouter();
  const { isSignedIn } = useAuth();

  useEffect(() => {
    if (isSignedIn) {
      router.push('/(protected)/(tabs)');
    }
  }, [router, isSignedIn]);

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
