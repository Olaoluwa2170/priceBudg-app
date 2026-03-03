import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { useSignIn } from '@clerk/clerk-expo';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react-native';
import { SafeAreaLayout } from 'components/layouts';
import HandledKeyboardLayout from 'components/layouts/HandledKeyboardLayout';
import { styles } from 'styles/app/(auth)/reset-password';
import { colors } from '../../styles/colors';

export default function ResetPasswordScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [successfulCreation, setSuccessfulCreation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const { signIn, setActive } = useSignIn();

  // Request the reset code
  const onRequestReset = async () => {
    if (!email) return;
    setIsLoading(true);
    setError(null);

    try {
      await signIn?.create({
        strategy: 'reset_password_email_code',
        identifier: email,
      });
      setSuccessfulCreation(true);
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      const message = err.errors?.[0]?.message || 'Failed to send reset code. Please try again.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset the password
  const onReset = async () => {
    if (!code || !password) return;
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn?.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code,
        password,
      });

      if (result?.status === 'complete') {
        setActive!({ session: result.createdSessionId });
        router.replace('/(protected)/(tabs)');
      } else {
        console.error(JSON.stringify(result, null, 2));
        setError('Failed to reset password. Please try again.');
      }
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      const message = err.errors?.[0]?.message || 'Failed to reset password. Please try again.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <HandledKeyboardLayout behavior="padding">
      <SafeAreaLayout>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft color={colors.black} size={28} />
          </TouchableOpacity>

          <View style={styles.content}>
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>
              {!successfulCreation
                ? "Enter your email address and we'll send you a code to reset your password."
                : 'Enter the code sent to your email and your new password.'}
            </Text>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <View style={styles.formContainer}>
              {!successfulCreation ? (
                <>
                  <View>
                    <Text style={styles.label}>Email</Text>
                    <TextInput
                      style={styles.input}
                      value={email}
                      placeholder="Enter your email"
                      placeholderTextColor={colors.placeholderGray}
                      onChangeText={(text) => {
                        setEmail(text);
                        setError(null);
                      }}
                      autoCapitalize="none"
                      keyboardType="email-address"
                    />
                  </View>
                  <TouchableOpacity
                    style={[styles.button, (!email || isLoading) && styles.buttonDisabled]}
                    onPress={onRequestReset}
                    disabled={!email || isLoading}>
                    {isLoading ? (
                      <ActivityIndicator color={colors.white} />
                    ) : (
                      <Text style={styles.buttonText}>Send Reset Code</Text>
                    )}
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <View>
                    <Text style={styles.label}>Code</Text>
                    <TextInput
                      style={styles.input}
                      value={code}
                      placeholder="Enter verification code"
                      placeholderTextColor={colors.placeholderGray}
                      onChangeText={(text) => {
                        setCode(text);
                        setError(null);
                      }}
                      keyboardType="numeric"
                    />
                  </View>
                  <View>
                    <Text style={styles.label}>New Password</Text>
                    <View style={styles.passwordContainer}>
                      <TextInput
                        style={styles.input}
                        value={password}
                        placeholder="Enter new password"
                        placeholderTextColor={colors.placeholderGray}
                        onChangeText={(text) => {
                          setPassword(text);
                          setError(null);
                        }}
                        secureTextEntry={!showPassword}
                      />
                      <TouchableOpacity
                        style={styles.eyeButton}
                        onPress={() => setShowPassword(!showPassword)}>
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
                      styles.button,
                      (!code || !password || isLoading) && styles.buttonDisabled,
                    ]}
                    onPress={onReset}
                    disabled={!code || !password || isLoading}>
                    {isLoading ? (
                      <ActivityIndicator color={colors.white} />
                    ) : (
                      <Text style={styles.buttonText}>Set New Password</Text>
                    )}
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </ScrollView>
      </SafeAreaLayout>
    </HandledKeyboardLayout>
  );
}
