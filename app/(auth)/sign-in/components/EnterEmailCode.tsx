import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaLayout } from 'components/layouts';
import HandledKeyboardLayout from 'components/layouts/HandledKeyboardLayout';
import { styles } from 'styles/app/(auth)/sign-in';
import { colors } from 'styles/colors';
import { ButtonClickedType } from '..';

interface EnterEmailCodeProps {
  emailAddress: string;
  code: string;
  setCode: (code: string) => void;
  setError: (error: string | null) => void;
  isLoading: boolean;
  error: string | null;
  buttonClicked: ButtonClickedType;
  handleVerifyCode: () => void;
  setShowEmailCode: (show: boolean) => void;
}

export default function EnterEmailCode({
  emailAddress,
  code,
  setCode,
  isLoading,
  error,
  buttonClicked,
  handleVerifyCode,
  setShowEmailCode,
  setError,
}: EnterEmailCodeProps) {
  return (
    <HandledKeyboardLayout behavior="padding">
      <SafeAreaLayout>
        <View style={{ width: '100%', flex: 1 }}>
          <View style={[styles.content, { marginHorizontal: 'auto', paddingTop: 50 }]}>
            <Text style={styles.title}>Verify your email</Text>
            <Text style={styles.subtitle}>
              A verification code has been sent to {emailAddress}. Enter it below.
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
              editable={!isLoading}
            />
            <TouchableOpacity
              style={[
                styles.emailButton,
                (!code.trim() || isLoading) && styles.emailButtonDisabled,
              ]}
              onPress={handleVerifyCode}
              disabled={!code.trim() || isLoading}>
              {buttonClicked === 'email' && isLoading ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Text style={styles.emailButtonText}>Verify</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.backLink}
              onPress={() => {
                setShowEmailCode(false);
                setCode('');
                setError(null);
              }}
              disabled={isLoading}>
              <Text style={styles.linkText}>Back to sign in</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaLayout>
    </HandledKeyboardLayout>
  );
}
