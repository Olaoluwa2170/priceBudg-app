import { useCallback, useEffect, useState } from 'react';
import {
  Platform,
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  TextInput,
  ScrollView,
  Pressable,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { useSSO, useSignIn, isClerkRuntimeError } from '@clerk/clerk-expo';
import type { EmailCodeFactor } from '@clerk/types';
import { SafeAreaLayout } from 'components/layouts';
import { colors } from '../../../styles/colors';
import { styles } from 'styles/app/(auth)/sign-in';
import { router, Link } from 'expo-router';
import { Mail, Eye, EyeOff } from 'lucide-react-native';
import HandledKeyboardLayout from 'components/layouts/HandledKeyboardLayout';
import EnterEmailCode from './components/EnterEmailCode';

export type ButtonClickedType = 'email' | 'google' | null;

export const useWarmUpBrowser = () => {
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    void WebBrowser.warmUpAsync();

    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);
};

WebBrowser.maybeCompleteAuthSession();

export default function SignInScreen() {
  useWarmUpBrowser();

  const [buttonClicked, setButtonClicked] = useState<ButtonClickedType>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [showEmailCode, setShowEmailCode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const { startSSOFlow } = useSSO();
  const { signIn, setActive, isLoaded } = useSignIn();

  const handleGoogleSignIn = useCallback(async () => {
    setButtonClicked('google');
    setIsLoading(true);

    try {
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: 'oauth_google',
        redirectUrl: AuthSession.makeRedirectUri({
          path: 'oauth-native-callback',
        }),
      });

      if (createdSessionId && setActive) {
        await setActive({
          session: createdSessionId,
        });
        router.replace('/(protected)/(tabs)');
        return;
      } else {
        console.log('Something went wrong');
      }
    } catch (error) {
      if (isClerkRuntimeError(error) && error.code === 'network_error') {
        console.error('Network Error occured');
      }
      console.error('Error signing in with Google:', JSON.stringify(error, null, 2));
    } finally {
      setButtonClicked(null);
      setIsLoading(false);
    }
  }, [startSSOFlow]);

  const handleEmailSignIn = useCallback(async () => {
    if (!isLoaded || !emailAddress.trim() || !password) return;

    setButtonClicked('email');
    setIsLoading(true);
    setError(null);

    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress.trim(),
        password,
      });

      if (signInAttempt.status === 'complete') {
        if (signInAttempt.createdSessionId && setActive) {
          await setActive({
            session: signInAttempt.createdSessionId,
            navigate: async ({ session }) => {
              if (session?.currentTask) return;
              router.replace('/(protected)/(tabs)');
            },
          });
        }
        return;
      }

      if (signInAttempt.status === 'needs_second_factor') {
        const emailCodeFactor = signInAttempt.supportedSecondFactors?.find(
          (factor): factor is EmailCodeFactor => factor.strategy === 'email_code'
        );
        if (emailCodeFactor) {
          await signIn.prepareSecondFactor({
            strategy: 'email_code',
            emailAddressId: emailCodeFactor.emailAddressId,
          });
          setShowEmailCode(true);
        } else {
          setError('Additional verification is required. Please try another method.');
        }
      } else {
        setError('Sign-in could not be completed. Please try again.');
      }
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'errors' in err
          ? (err as { errors: { message: string }[] }).errors?.[0]?.message
          : 'Sign in failed. Check your email and password.';
      setError(message ?? 'Sign in failed.');
      console.error('Email sign-in error:', err);
    } finally {
      setButtonClicked(null);
      setIsLoading(false);
    }
  }, [isLoaded, signIn, setActive, emailAddress, password]);

  const handleVerifyCode = useCallback(async () => {
    if (!isLoaded || !code.trim()) return;

    setButtonClicked('email');
    setIsLoading(true);
    setError(null);

    try {
      const signInAttempt = await signIn.attemptSecondFactor({
        strategy: 'email_code',
        code: code.trim(),
      });

      if (signInAttempt.status === 'complete' && signInAttempt.createdSessionId && setActive) {
        await setActive({
          session: signInAttempt.createdSessionId,
          navigate: async ({ session }) => {
            if (session?.currentTask) return;
            router.replace('/(protected)/(tabs)');
          },
        });
      } else {
        setError('Verification failed. Please try again.');
      }
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'errors' in err
          ? (err as { errors: { message: string }[] }).errors?.[0]?.message
          : 'Invalid or expired code.';
      setError(message ?? 'Verification failed.');
      console.error('Verify code error:', err);
    } finally {
      setButtonClicked(null);
      setIsLoading(false);
    }
  }, [isLoaded, signIn, setActive, code]);

  if (showEmailCode) {
    return (
      <EnterEmailCode
        emailAddress={emailAddress}
        code={code}
        setCode={setCode}
        setError={setError}
        isLoading={isLoading}
        error={error}
        buttonClicked={buttonClicked}
        handleVerifyCode={handleVerifyCode}
        setShowEmailCode={setShowEmailCode}
      />
    );
  }

  return (
    <HandledKeyboardLayout behavior="padding">
      <SafeAreaLayout>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <Image source={require('../../../assets/images/priceit-logo.png')} style={styles.logo} />
          <View style={styles.content}>
            <View style={styles.topContentView}>
              <Text style={styles.title}>Welcome 👋</Text>
              <Text style={styles.subtitle}>
                Sign in to start scanning products and comparing prices
              </Text>
            </View>

            <AuthButton
              Icon={
                <Image
                  source={require('../../../assets/images/google-icon.png')}
                  style={{ width: 23, height: 23 }}
                />
              }
              label="Continue with Google"
              onPress={handleGoogleSignIn}
              buttonClicked={buttonClicked === 'google'}
              isLoading={isLoading}
            />

            <View style={styles.emailSection}>
              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>Or</Text>
                <View style={styles.dividerLine} />
              </View>

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <View>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  value={emailAddress}
                  placeholder="Enter your email"
                  placeholderTextColor={colors.placeholderGray}
                  onChangeText={(text) => {
                    setEmailAddress(text);
                    setError(null);
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
              </View>

              <View>
                <View style={styles.passwordLabelContainer}>
                  <Text style={styles.passwordLabel}>Password</Text>

                  <Link href="/(auth)/reset-password" asChild>
                    <Pressable>
                      <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                    </Pressable>
                  </Link>
                </View>

                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    value={password}
                    placeholder="Enter your password"
                    placeholderTextColor={colors.placeholderGray}
                    onChangeText={(text) => {
                      setPassword(text);
                      setError(null);
                    }}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    editable={!isLoading}
                  />

                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowPassword(!showPassword)}
                    disabled={isLoading}>
                    {showPassword ? (
                      <EyeOff size={20} color={colors.gray600} />
                    ) : (
                      <Eye size={20} color={colors.gray600} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={[
                  styles.emailButton,
                  (!emailAddress.trim() || !password || isLoading) && styles.emailButtonDisabled,
                ]}
                onPress={handleEmailSignIn}
                disabled={!emailAddress.trim() || !password || isLoading}>
                {buttonClicked === 'email' && isLoading ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <View style={styles.emailButtonContent}>
                    <Mail size={24} color={colors.white} />
                    <Text style={styles.emailButtonText}>Sign in</Text>
                  </View>
                )}
              </TouchableOpacity>

              <View style={styles.linkContainer}>
                <Text style={styles.linkPrompt}>{`Don't have an account? `}</Text>
                <Link href="/(auth)/sign-up" asChild>
                  <TouchableOpacity>
                    <Text style={styles.linkText}>Sign up</Text>
                  </TouchableOpacity>
                </Link>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaLayout>
    </HandledKeyboardLayout>
  );
}

const AuthButton = ({
  label,
  Icon,
  isLoading,
  buttonClicked,
  onPress,
}: {
  label: string;
  isLoading?: boolean;
  Icon: React.ReactNode;
  buttonClicked?: boolean;
  onPress?: () => void;
}) => {
  return (
    <TouchableOpacity
      disabled={buttonClicked || isLoading}
      style={[styles.authButton, { opacity: buttonClicked || isLoading ? 0.6 : 1 }]}
      onPress={onPress}
      activeOpacity={0.8}>
      {Icon}
      <Text style={styles.authButtonText}>{label}</Text>

      {buttonClicked ? (
        <ActivityIndicator
          style={{ position: 'absolute', top: 20, right: 20 }}
          size="small"
          color="black"
        />
      ) : null}
    </TouchableOpacity>
  );
};
