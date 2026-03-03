import { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useQuery, useMutation, useConvexAuth } from 'convex/react';
import { useUser } from '@clerk/clerk-expo';
import { api } from 'convex/_generated/api';
import { Plus, Wallet, Trash2 } from 'lucide-react-native';
import { colors } from '../../../styles/colors';
import { fontFamily } from '../../../styles/font-family';
import { useRouter } from 'expo-router';
import BottomSheet, {
  BottomSheetView,
  BottomSheetTextInput,
  TouchableOpacity as BottomSheetTouchableOpacity,
} from '@gorhom/bottom-sheet';
import { useRef, useMemo, useCallback } from 'react';
import { Id } from 'convex/_generated/dataModel';

export default function BudgetsScreen() {
  const router = useRouter();
  const { user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress || user?.emailAddresses?.[0]?.emailAddress;

  const activeUser = useQuery(api.users.getByEmail, email ? { email } : 'skip');
  const userId = activeUser?._id;

  const budgets = useQuery(api.budgets.list, userId ? { userId } : 'skip');
  const createBudget = useMutation(api.budgets.create);
  const deleteBudget = useMutation(api.budgets.deleteBudget);

  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['50%'], []);
  const [newBudgetName, setNewBudgetName] = useState('');
  const [newBudgetAmount, setNewBudgetAmount] = useState('');

  const handleCreateBudget = async () => {
    console.log('handleCreateBudget initiated', { newBudgetName, userId });

    if (!newBudgetName.trim() || !userId || !email) {
      console.log('Exiting early from handleCreateBudget - missing name, user ID, or email');
      return;
    }

    try {
      await createBudget({
        name: newBudgetName.trim(),
        userId,
        email,
        targetAmount: newBudgetAmount.trim() ? parseFloat(newBudgetAmount) : undefined,
      });
      setNewBudgetName('');
      setNewBudgetAmount('');
      bottomSheetRef.current?.close();
    } catch (error) {
      console.error('Error creating budget:', error);
      Alert.alert('Error', 'Failed to create budget. Please try again.');
    }
  };

  const handleDeleteBudget = (id: Id<'budgets'>) => {
    Alert.alert('Delete Budget', 'Are you sure you want to delete this budget and all its items?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteBudget({ budgetId: id }),
      },
    ]);
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={{
        backgroundColor: colors.white,
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
      }}
      onPress={() => router.push(`/budget/${item._id}`)}>
      <View
        style={{
          width: 48,
          height: 48,
          borderRadius: 24,
          backgroundColor: colors.gray100,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 16,
        }}>
        <Wallet size={24} color={colors.primaryBlue} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: fontFamily.ManropeBold, fontSize: 16, color: colors.black }}>
          {item.name}
        </Text>
        {item.targetAmount && (
          <Text
            style={{ fontFamily: fontFamily.ManropeMedium, fontSize: 14, color: colors.gray500 }}>
            Target:{' '}
            {Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
              item.targetAmount
            )}
          </Text>
        )}
      </View>
      <TouchableOpacity onPress={() => handleDeleteBudget(item._id)} style={{ padding: 8 }}>
        <Trash2 size={20} color={colors.danger} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const isLoading = budgets === undefined && userId !== undefined;

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primaryBlue} />
      </View>
    );
  }

  const displayBudgets = budgets || [];

  return (
    <View style={{ flex: 1, backgroundColor: colors.gray50 }}>
      <View
        style={{
          paddingHorizontal: 20,
          paddingTop: 60,
          paddingBottom: 20,
          backgroundColor: colors.white,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottomWidth: 1,
          borderBottomColor: colors.gray100,
        }}>
        <Text style={{ fontFamily: fontFamily.ManropeBold, fontSize: 24, color: colors.black }}>
          Budgets
        </Text>
        <TouchableOpacity
          onPress={() => bottomSheetRef.current?.expand()}
          style={{
            backgroundColor: colors.primaryBlue,
            width: 40,
            height: 40,
            borderRadius: 20,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Plus size={24} color={colors.white} />
        </TouchableOpacity>
      </View>

      {displayBudgets.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Wallet size={64} color={colors.gray300} style={{ marginBottom: 16 }} />
          <Text
            style={{
              fontFamily: fontFamily.ManropeBold,
              fontSize: 18,
              color: colors.gray700,
              marginBottom: 8,
            }}>
            No budgets yet
          </Text>
          <Text
            style={{
              fontFamily: fontFamily.ManropeRegular,
              fontSize: 14,
              color: colors.gray500,
              textAlign: 'center',
            }}>
            Create a budget to start tracking items you want to buy.
          </Text>
        </View>
      ) : (
        <FlatList
          data={displayBudgets}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ padding: 20 }}
        />
      )}

      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backgroundStyle={{ backgroundColor: colors.white, borderRadius: 24 }}>
        <BottomSheetView style={{ flex: 1, padding: 24 }}>
          <Text
            style={{
              fontFamily: fontFamily.ManropeBold,
              fontSize: 20,
              color: colors.black,
              marginBottom: 20,
            }}>
            Create New Budget
          </Text>

          <Text
            style={{
              fontFamily: fontFamily.ManropeMedium,
              fontSize: 14,
              color: colors.gray700,
              marginBottom: 8,
            }}>
            Budget Name
          </Text>
          <BottomSheetTextInput
            style={{
              backgroundColor: colors.gray50,
              borderWidth: 1,
              borderColor: colors.gray200,
              borderRadius: 12,
              padding: 16,
              fontSize: 16,
              fontFamily: fontFamily.ManropeRegular,
              marginBottom: 20,
            }}
            placeholder="e.g. Dream PC Setup"
            value={newBudgetName}
            onChangeText={setNewBudgetName}
          />

          <Text
            style={{
              fontFamily: fontFamily.ManropeMedium,
              fontSize: 14,
              color: colors.gray700,
              marginBottom: 8,
            }}>
            Target Amount (Optional, in USD)
          </Text>
          <BottomSheetTextInput
            style={{
              backgroundColor: colors.gray50,
              borderWidth: 1,
              borderColor: colors.gray200,
              borderRadius: 12,
              padding: 16,
              fontSize: 16,
              fontFamily: fontFamily.ManropeRegular,
              marginBottom: 24,
            }}
            placeholder="e.g. 1500"
            keyboardType="numeric"
            value={newBudgetAmount}
            onChangeText={setNewBudgetAmount}
          />

          <BottomSheetTouchableOpacity
            style={{
              backgroundColor: colors.primaryBlue,
              borderRadius: 12,
              padding: 16,
              alignItems: 'center',
              opacity: newBudgetName.trim() ? 1 : 0.5,
            }}
            disabled={!newBudgetName.trim()}
            onPress={handleCreateBudget}>
            <Text style={{ fontFamily: fontFamily.ManropeBold, fontSize: 16, color: colors.white }}>
              Create Budget
            </Text>
          </BottomSheetTouchableOpacity>
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
}
