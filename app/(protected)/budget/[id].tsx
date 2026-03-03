import { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation } from 'convex/react';
import { api } from 'convex/_generated/api';
import { Id } from 'convex/_generated/dataModel';
import { ArrowLeft, Trash2, Edit2, ShoppingBag } from 'lucide-react-native';
import { colors } from '../../../styles/colors';
import { fontFamily } from '../../../styles/font-family';
import { getExchangeRateRecord } from '../../../utils/storage/currency-rates';
import { ExchangeRateResponse } from '../../../types';

export default function BudgetDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const budgetId = id as Id<'budgets'>;

  const budget = useQuery(api.budgets.getById, { budgetId });
  const items = useQuery(api.budgets.getItems, { budgetId });
  const deleteItem = useMutation(api.budgets.deleteItem);

  const [rates, setRates] = useState<ExchangeRateResponse | null>(null);

  useEffect(() => {
    const fetchRates = async () => {
      const storedRates = await getExchangeRateRecord();
      if (storedRates) {
        setRates(storedRates as ExchangeRateResponse);
      }
    };
    fetchRates();
  }, []);

  const totalSpent = useMemo(() => {
    if (!items) return 0;
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [items]);

  const progress = useMemo(() => {
    if (!budget?.targetAmount || budget.targetAmount === 0) return 0;
    const ratio = totalSpent / budget.targetAmount;
    return Math.min(Math.max(ratio, 0), 1);
  }, [totalSpent, budget?.targetAmount]);

  const targetColor =
    progress > 0.9 ? colors.danger : progress > 0.7 ? '#F59E0B' : colors.primaryBlue;

  const handleDeleteItem = (itemId: Id<'budgetItems'>) => {
    Alert.alert('Remove Item', 'Are you sure you want to remove this item from your budget?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => deleteItem({ itemId }),
      },
    ]);
  };

  const formattedPrice = (price: number) => {
    return Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
  };

  if (budget === undefined || items === undefined) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primaryBlue} />
      </View>
    );
  }

  if (budget === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ fontFamily: fontFamily.ManropeBold, fontSize: 18, color: colors.black }}>
          Budget not found
        </Text>
        <TouchableOpacity
          style={{
            marginTop: 20,
            padding: 10,
            backgroundColor: colors.primaryBlue,
            borderRadius: 8,
          }}
          onPress={() => router.back()}>
          <Text style={{ color: colors.white, fontFamily: fontFamily.ManropeMedium }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderItem = ({ item }: { item: any }) => (
    <View
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
      }}>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: fontFamily.ManropeBold, fontSize: 16, color: colors.black }}>
          {item.name}
        </Text>
        <Text
          style={{
            fontFamily: fontFamily.ManropeMedium,
            fontSize: 14,
            color: colors.gray500,
            marginTop: 4,
          }}>
          {item.quantity} x {formattedPrice(item.price)}
        </Text>
      </View>
      <View style={{ alignItems: 'flex-end', marginRight: 16 }}>
        <Text
          style={{ fontFamily: fontFamily.ManropeBold, fontSize: 16, color: colors.primaryBlue }}>
          {formattedPrice(item.price * item.quantity)}
        </Text>
      </View>
      <TouchableOpacity onPress={() => handleDeleteItem(item._id)} style={{ padding: 8 }}>
        <Trash2 size={20} color={colors.danger} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.gray50 }}>
      {/* Header */}
      <View
        style={{
          paddingHorizontal: 20,
          paddingTop: 60,
          paddingBottom: 20,
          backgroundColor: colors.white,
          flexDirection: 'row',
          alignItems: 'center',
          borderBottomWidth: 1,
          borderBottomColor: colors.gray100,
        }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16, padding: 8 }}>
          <ArrowLeft size={24} color={colors.black} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text
            style={{ fontFamily: fontFamily.ManropeBold, fontSize: 20, color: colors.black }}
            numberOfLines={1}>
            {budget.name}
          </Text>
        </View>
      </View>

      {/* Summary Card */}
      <View style={{ padding: 20 }}>
        <View
          style={{
            backgroundColor: colors.white,
            borderRadius: 16,
            padding: 24,
            shadowColor: targetColor,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 4,
          }}>
          <Text
            style={{ fontFamily: fontFamily.ManropeMedium, fontSize: 14, color: colors.gray500 }}>
            Total Appriximate Cost
          </Text>
          <Text
            style={{
              fontFamily: fontFamily.ManropeBold,
              fontSize: 32,
              color: colors.black,
              marginTop: 8,
              marginBottom: 20,
            }}>
            {formattedPrice(totalSpent)}
          </Text>

          {budget.targetAmount && (
            <View>
              <View
                style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text
                  style={{
                    fontFamily: fontFamily.ManropeMedium,
                    fontSize: 14,
                    color: colors.gray600,
                  }}>
                  Budget: {formattedPrice(budget.targetAmount)}
                </Text>
                <Text
                  style={{
                    fontFamily: fontFamily.ManropeMedium,
                    fontSize: 14,
                    color: targetColor,
                  }}>
                  {Math.round(progress * 100)}%
                </Text>
              </View>

              {/* Progress Bar Container */}
              <View
                style={{
                  height: 8,
                  backgroundColor: colors.gray100,
                  borderRadius: 4,
                  overflow: 'hidden',
                }}>
                {/* Progress Fill */}
                <View
                  style={{
                    height: '100%',
                    width: `${progress * 100}%`,
                    backgroundColor: targetColor,
                    borderRadius: 4,
                  }}
                />
              </View>

              {totalSpent > budget.targetAmount && (
                <Text
                  style={{
                    fontFamily: fontFamily.ManropeMedium,
                    fontSize: 12,
                    color: colors.danger,
                    marginTop: 8,
                  }}>
                  You are over budget by {formattedPrice(totalSpent - budget.targetAmount)}!
                </Text>
              )}
            </View>
          )}
        </View>
      </View>

      {/* Items List */}
      <View style={{ flex: 1, paddingHorizontal: 20 }}>
        <Text
          style={{
            fontFamily: fontFamily.ManropeBold,
            fontSize: 18,
            color: colors.black,
            marginBottom: 16,
          }}>
          Items ({items.length})
        </Text>

        {items.length === 0 ? (
          <View
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 60 }}>
            <ShoppingBag size={48} color={colors.gray300} style={{ marginBottom: 16 }} />
            <Text
              style={{ fontFamily: fontFamily.ManropeBold, fontSize: 16, color: colors.gray700 }}>
              Your budget is empty
            </Text>
            <Text
              style={{
                fontFamily: fontFamily.ManropeRegular,
                fontSize: 14,
                color: colors.gray500,
                textAlign: 'center',
                marginTop: 8,
              }}>
              Scan items and use "Add to Budget" from the results modal.
            </Text>
          </View>
        ) : (
          <FlatList
            data={items}
            renderItem={renderItem}
            keyExtractor={(item) => item._id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
          />
        )}
      </View>
    </View>
  );
}
