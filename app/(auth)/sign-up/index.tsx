import { useCallback, useEffect, useState } from 'react';
import {
  Platform,
  View,
  Text,
  Image,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Mail, Eye, EyeOff } from 'lucide-react-native';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { SafeAreaLayout } from 'components/layouts';
import { colors } from '../../../styles/colors';
import { styles } from '../../../styles/app/(auth)/sign-up';
import { useSignUp, useSSO, isClerkRuntimeError } from '@clerk/clerk-expo';
import HandledKeyboardLayout from 'components/layouts/HandledKeyboardLayout';

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

export default function SignUpScreen() {
  useWarmUpBrowser();

  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [pendingVerification, setPendingVerification] = useState(false);
  const [buttonClicked, setButtonClicked] = useState<'google' | 'email' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const { signUp, setActive, isLoaded } = useSignUp();
  const { startSSOFlow } = useSSO();

  const handleGoogleSignIn = useCallback(async () => {
    setButtonClicked('google');
    setIsLoading(true);

    try {
      const { createdSessionId, setActive: setActiveSession } = await startSSOFlow({
        strategy: 'oauth_google',
        redirectUrl: AuthSession.makeRedirectUri({
          path: 'oauth-native-callback',
        }),
      });

      if (createdSessionId && setActiveSession) {
        await setActiveSession({
          session: createdSessionId,
        });
        router.replace('/(protected)/(tabs)');
        return;
      }
    } catch (err) {
      if (isClerkRuntimeError(err) && err.code === 'network_error') {
        setError('Network error. Please try again.');
      } else {
        setError('Google sign in failed. Please try again.');
      }
      console.error('Google sign in error:', err);
    } finally {
      setButtonClicked(null);
      setIsLoading(false);
    }
  }, [startSSOFlow]);

  const handleSignUp = useCallback(async () => {
    if (!isLoaded || !emailAddress.trim() || !password) return;

    setButtonClicked('email');
    setIsLoading(true);
    setError(null);

    try {
      await signUp.create({
        emailAddress: emailAddress.trim(),
        password,
      });

      await signUp.prepareEmailAddressVerification({
        strategy: 'email_code',
      });

      setPendingVerification(true);
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'errors' in err
          ? (err as { errors: { message: string }[] }).errors?.[0]?.message
          : 'Could not create account. Check your email and password.';
      setError(message ?? 'Sign up failed.');
      console.error('Sign up error:', err);
    } finally {
      setButtonClicked(null);
      setIsLoading(false);
    }
  }, [isLoaded, signUp, emailAddress, password]);

  const handleVerifyCode = useCallback(async () => {
    if (!isLoaded || !code.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code: code.trim(),
      });

      if (signUpAttempt.status === 'complete' && signUpAttempt.createdSessionId && setActive) {
        await setActive({
          session: signUpAttempt.createdSessionId,
          navigate: async ({ session }) => {
            if (session?.currentTask) return;
            router.replace('/(protected)/(tabs)');
          },
        });
      } else {
        setError('Verification could not be completed. Please try again.');
      }
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'errors' in err
          ? (err as { errors: { message: string }[] }).errors?.[0]?.message
          : 'Invalid or expired code.';
      setError(message ?? 'Verification failed.');
      console.error('Verify code error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isLoaded, signUp, setActive, code]);

  if (pendingVerification) {
    return (
      <SafeAreaLayout>
        <HandledKeyboardLayout
          style={styles.container}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <Image
              source={require('../../../assets/images/priceit-logo.png')}
              style={styles.logo}
            />
            <View style={styles.content}>
              <Text style={styles.title}>Verify your email</Text>
              <Text style={styles.subtitle}>
                We sent a verification code to {emailAddress}. Enter it below.
              </Text>
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
              <TextInput
                style={styles.input}
                value={code}
                placeholder="Enter verification code"
                placeholderTextColor={colors.placeholderGray}
                onChangeText={setCode}
                keyboardType="number-pad"
                autoCapitalize="none"
                autoCorrect={false}
                maxLength={6}
                editable={!isLoading}
              />
              <TouchableOpacity
                style={[
                  styles.emailButton,
                  (!code.trim() || isLoading) && styles.emailButtonDisabled,
                ]}
                onPress={handleVerifyCode}
                disabled={!code.trim() || isLoading}>
                {isLoading ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <Text style={styles.emailButtonText}>Verify</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.backLink}
                onPress={() => {
                  setPendingVerification(false);
                  setCode('');
                  setError(null);
                }}
                disabled={isLoading}>
                <Text style={styles.linkText}>Back to sign up</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </HandledKeyboardLayout>
      </SafeAreaLayout>
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
              <Text style={styles.title}>Create account</Text>
              <Text style={styles.subtitle}>
                Sign up to start scanning products and comparing prices
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
              <Text style={styles.label}>Password</Text>

              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={password}
                  placeholder="Min 8 characters"
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
              onPress={handleSignUp}
              disabled={!emailAddress.trim() || !password || isLoading}>
              {buttonClicked === 'email' && isLoading ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <View style={styles.emailButtonContent}>
                  <Mail size={24} color={colors.white} />
                  <Text style={styles.emailButtonText}>Create account</Text>
                </View>
              )}
            </TouchableOpacity>

            <View style={styles.linkContainer}>
              <Text style={styles.linkPrompt}>{`Already have an account? `}</Text>
              <TouchableOpacity onPress={() => router.replace('/(auth)/sign-in')}>
                <Text style={styles.linkText}>Sign in</Text>
              </TouchableOpacity>
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
}) => (
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
