import { Drawer } from 'expo-router/drawer';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { Redirect, useRouter } from 'expo-router';
import { Settings, Crown, CircleDollarSign } from 'lucide-react-native';
import { Text, View, TouchableOpacity, StyleSheet } from 'react-native';
import { useQuery } from 'convex/react';
import { api } from 'convex/_generated/api';
import { FREE_PLAN } from 'constants/plans';
import { colors } from '../../styles/colors';
import { fontFamily } from '../../styles/font-family';
import { SafeAreaLayout } from 'components/layouts';

function CustomDrawerContent(props: any) {
  const router = useRouter();
  const { user } = useUser();
  const { signOut } = useAuth();

  const requestCount = useQuery(api.requestCount.getUserRequestCount);
  const activeSubscription = useQuery(api.subscriptions.getActiveSubscription);
  const plans = useQuery(api.subscriptions.getPlans);

  const currentPlan = activeSubscription?.plan
    ? plans?.find((plan) => plan.slug === activeSubscription.plan?.slug)
    : FREE_PLAN;

  const isPremium = currentPlan?.slug === 'premium';
  const requestAllocations = currentPlan?.requestAllocations || FREE_PLAN.requestAllocations;

  const formatRequestCount = () => {
    if (isPremium || requestAllocations >= 10_000) {
      return 'Unlimited';
    }
    const count = requestCount ?? 0;
    return `${count} / ${requestAllocations}`;
  };

  const handleUpgrade = () => {
    router.push('/(protected)/subscription');
  };

  const handleSignOut = async () => {
    await signOut();
    router.replace('/(auth)/sign-in');
  };

  return (
    <View style={styles.drawerContainer}>
      <DrawerContentScrollView {...props} contentContainerStyle={styles.drawerScrollContent}>
        <View style={styles.drawerHeader}>
          <Text style={styles.drawerTitle}>PriceIt</Text>
          {user && (
            <Text style={styles.drawerSubtitle}>
              {user.firstName || user.emailAddresses[0]?.emailAddress}
            </Text>
          )}
        </View>

        <DrawerItemList {...props} />
      </DrawerContentScrollView>

      <View>
        <View style={styles.requestCountContainer}>
          <Text style={styles.requestCountLabel}>Requests Rate</Text>
          <Text style={styles.requestCountValue}>{formatRequestCount()}</Text>
        </View>

        {!isPremium && (
          <TouchableOpacity style={styles.upgradeCard} onPress={handleUpgrade}>
            <View style={styles.upgradeCardContent}>
              <Crown size={20} color={colors.success} />
              <View style={styles.upgradeCardText}>
                <Text style={styles.upgradeCardTitle}>Upgrade to Premium</Text>
                <Text style={styles.upgradeCardSubtitle}>Get unlimited requests</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}

        <View style={styles.drawerFooter}>
          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export default function DrawerLayout() {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return null;
  }

  if (!isSignedIn) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return (
    <SafeAreaLayout>
      <Drawer
        drawerContent={CustomDrawerContent}
        screenOptions={{
          headerShown: false,
          drawerStyle: {
            backgroundColor: colors.white,
          },
          drawerActiveTintColor: colors.primaryBlue,
          drawerInactiveTintColor: colors.gray600,
          drawerLabelStyle: {
            fontSize: 14,
            fontFamily: fontFamily.ManropeSemiBold,
          },
          drawerItemStyle: {
            marginTop: 5,
          },
        }}>
        <Drawer.Screen
          name="(tabs)"
          options={{
            title: 'Home',
            drawerLabel: 'Home',
          }}
        />
        <Drawer.Screen
          name="currency"
          options={{
            title: 'Currency',
            drawerLabel: 'Currency',
            drawerIcon: ({ color, size }) => <CircleDollarSign size={size} color={color} />,
          }}
        />
        <Drawer.Screen
          name="subscription"
          options={{
            title: 'Subscription',
            drawerLabel: 'Subscription',
            drawerIcon: ({ color, size }) => <Crown size={size} color={color} />,
          }}
        />
        <Drawer.Screen
          name="settings"
          options={{
            title: 'Settings',
            drawerLabel: 'Settings',
            drawerIcon: ({ color, size }) => <Settings size={size} color={color} />,
          }}
        />
        <Drawer.Screen
          name="budget"
          options={{
            drawerItemStyle: { display: 'none' },
          }}
        />
      </Drawer>
    </SafeAreaLayout>
  );
}

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    backgroundColor: colors.white,
  },
  drawerHeader: {
    padding: 20,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  drawerTitle: {
    fontSize: 24,
    fontFamily: fontFamily.ManropeBold,
    color: colors.black,
    marginBottom: 4,
  },
  drawerSubtitle: {
    fontSize: 14,
    fontFamily: fontFamily.ManropeRegular,
    color: colors.gray600,
  },
  drawerScrollContent: {
    paddingTop: 0,
  },
  requestCountContainer: {
    padding: 20,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  requestCountLabel: {
    fontSize: 12,
    fontFamily: fontFamily.ManropeRegular,
    color: colors.gray600,
    marginBottom: 4,
  },
  requestCountValue: {
    fontSize: 18,
    fontFamily: fontFamily.ManropeSemiBold,
    color: colors.black,
  },
  upgradeCard: {
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: colors.successBg,
    borderWidth: 1,
    borderColor: colors.success,
  },
  upgradeCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  upgradeCardText: {
    flex: 1,
    marginLeft: 12,
  },
  upgradeCardTitle: {
    fontSize: 14,
    fontFamily: fontFamily.ManropeSemiBold,
    color: colors.black,
    marginBottom: 2,
  },
  upgradeCardSubtitle: {
    fontSize: 12,
    fontFamily: fontFamily.ManropeRegular,
    color: colors.gray600,
  },
  drawerFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
  },
  signOutButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: colors.black,
  },
  signOutText: {
    color: colors.white,
    fontSize: 16,
    fontFamily: fontFamily.ManropeSemiBold,
    textAlign: 'center',
  },
});
