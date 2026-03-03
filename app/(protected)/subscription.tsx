import { SafeAreaLayout } from 'components/layouts';
import { ScrollView, View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '@clerk/clerk-expo';
import { Menu, Check, Crown } from 'lucide-react-native';
import { useQuery, useMutation } from 'convex/react';
import { api } from 'convex/_generated/api';
import { usePaystack } from 'react-native-paystack-webview';
import { useState } from 'react';
import { colors } from '../../styles/colors';
import { styles } from 'styles/app/(protected)/subscription';
import { FREE_PLAN as freePlan } from 'constants/plans';

export default function SubscriptionScreen() {
  const navigation = useNavigation();
  const { user } = useUser();
  const [isProcessing, setIsProcessing] = useState(false);
  const { popup } = usePaystack();

  const plans = useQuery(api.subscriptions.getPlans);

  const activeSubscription = useQuery(api.subscriptions.getActiveSubscription);
  const createSubscription = useMutation(api.subscriptions.createSubscription);

  const userEmail = user?.emailAddresses[0]?.emailAddress || '';
  const premiumPlan = plans?.find((plan) => plan.slug === 'premium');

  const currentPlan = activeSubscription?.plan
    ? plans?.find((plan) => plan.slug === activeSubscription.plan?.slug)
    : freePlan;

  const isPremium = currentPlan?.slug === 'premium';
  const isActive = activeSubscription && activeSubscription.expiresAt > Date.now();

  const formatPrice = (price: number) => {
    return `₦${price.toLocaleString()}`;
  };

  const formatAllocations = (allocations: number) => {
    if (allocations >= 10_000) return 'Unlimited';
    return allocations.toLocaleString();
  };

  const handlePaymentSuccess = async (reference: string) => {
    try {
      setIsProcessing(true);

      if (!premiumPlan || !createSubscription) {
        throw new Error('Premium plan not found or subscription service unavailable');
      }

      // Calculate expiration (30 days from now)
      const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000;

      await createSubscription({
        referenceId: reference,
        planId: premiumPlan._id,
        expiresAt,
      });

      Alert.alert('Success', 'Your premium subscription has been activated!', [
        { text: 'OK', style: 'default' },
      ]);
    } catch (error: any) {
      console.error('Error creating subscription:', error);
      Alert.alert('Error', 'Failed to activate subscription. Please contact support.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentClose = () => {
    setIsProcessing(false);
  };

  const handleSubscribe = () => {
    if (!premiumPlan || !userEmail) {
      Alert.alert('Error', 'Unable to process payment. Please try again.');
      return;
    }

    setIsProcessing(true);

    const reference = `TXN_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;

    popup.checkout({
      email: userEmail,
      amount: premiumPlan.priceInNaria, 
      plan: premiumPlan.paystackPlanCode,
      reference: reference,
      onSuccess: (res) => {
        handlePaymentSuccess(res.reference || reference);
      },
      onCancel: () => {
        handlePaymentClose();
      },
    });
  };

  const getExpirationDate = () => {
    if (!activeSubscription || !isActive) return null;
    const date = new Date(activeSubscription.expiresAt);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => {
            // @ts-ignore - drawer navigation type
            navigation.openDrawer();
          }}>
          <Menu size={24} color={colors.black} />
        </TouchableOpacity>
        <Crown size={32} color={colors.black} />
        <Text style={styles.title}>Subscription</Text>
      </View>

      {isActive && (
        <View style={styles.currentPlanCard}>
          <View style={styles.currentPlanHeader}>
            <Crown size={24} color={isPremium ? colors.success : colors.gray600} />
            <Text style={styles.currentPlanTitle}>Current Plan</Text>
          </View>
          <Text style={[styles.currentPlanName, isPremium && styles.premiumText]}>
            {currentPlan?.planTitle}
          </Text>
          <Text style={styles.currentPlanDetails}>
            {formatAllocations(currentPlan?.requestAllocations || 0)} requests per month
          </Text>
          {getExpirationDate() && (
            <Text style={styles.expirationText}>Expires: {getExpirationDate()}</Text>
          )}
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Choose Your Plan</Text>
        <Text style={styles.sectionSubtitle}>
          Upgrade to unlock unlimited product scans and pricing insights
        </Text>

        {/* Free Plan Card */}
        <View style={[styles.planCard, !isPremium && isActive && styles.activePlanCard]}>
          <View style={styles.planHeader}>
            <Text style={styles.planTitle}>{freePlan?.planTitle}</Text>
            {!activeSubscription && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Current</Text>
              </View>
            )}
          </View>
          <View style={styles.planPrice}>
            <Text style={styles.priceAmount}>{formatPrice(freePlan?.price || 0)}</Text>
            <Text style={styles.pricePeriod}>/month</Text>
          </View>
          <View style={styles.planFeatures}>
            <View style={styles.feature}>
              <Check size={18} color={colors.success} />
              <Text style={styles.featureText}>
                {formatAllocations(freePlan?.requestAllocations || 0)} scans per month
              </Text>
            </View>
            <View style={styles.feature}>
              <Check size={18} color={colors.success} />
              <Text style={styles.featureText}>Basic price comparison</Text>
            </View>
            <View style={styles.feature}>
              <Check size={18} color={colors.success} />
              <Text style={styles.featureText}>Product history</Text>
            </View>
          </View>
        </View>

        {/* Premium Plan Card */}
        <View style={[styles.planCard, styles.premiumCard, isPremium && styles.activePlanCard]}>
          <View style={styles.planHeader}>
            <View style={styles.premiumHeader}>
              <Crown size={20} color={colors.success} />
              <Text style={[styles.planTitle, styles.premiumTitle]}>{premiumPlan?.planTitle}</Text>
            </View>
            {isPremium && isActive && (
              <View style={[styles.badge, styles.premiumBadge]}>
                <Text style={styles.badgeText}>Current</Text>
              </View>
            )}
          </View>
          <View style={styles.planPrice}>
            <Text style={[styles.priceAmount, styles.premiumPrice]}>
              {formatPrice(premiumPlan?.priceInNaria || 0)}
            </Text>
            <Text style={styles.pricePeriod}>/month</Text>
          </View>
          <View style={styles.planFeatures}>
            <View style={styles.feature}>
              <Check size={18} color={colors.success} />
              <Text style={styles.featureText}>
                {formatAllocations(premiumPlan?.requestAllocations || 0)} scans per month
              </Text>
            </View>
            <View style={styles.feature}>
              <Check size={18} color={colors.success} />
              <Text style={styles.featureText}>Advanced price analytics</Text>
            </View>
            <View style={styles.feature}>
              <Check size={18} color={colors.success} />
              <Text style={styles.featureText}>Price history tracking</Text>
            </View>
            <View style={styles.feature}>
              <Check size={18} color={colors.success} />
              <Text style={styles.featureText}>Priority support</Text>
            </View>
            <View style={styles.feature}>
              <Check size={18} color={colors.success} />
              <Text style={styles.featureText}>Share results</Text>
            </View>
          </View>
          {!isPremium && (
            <View style={styles.planAction}>
              <TouchableOpacity
                style={styles.subscribeButton}
                onPress={handleSubscribe}
                disabled={isProcessing || !userEmail}>
                {isProcessing ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <Text style={styles.subscribeButtonText}>Subscribe to Premium</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          All subscriptions renew automatically. You can cancel anytime from your account settings.
        </Text>
      </View>
    </ScrollView>
  );
}
