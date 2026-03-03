import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  TextInput,
  Modal,
} from 'react-native';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
  BottomSheetTextInput,
  TouchableOpacity as BottomSheetTouchableOpacity,
} from '@gorhom/bottom-sheet';
import { useQuery, useMutation, useConvexAuth } from 'convex/react';
import { api } from 'convex/_generated/api';
import { colors } from '../styles/colors';
import { fontFamily } from '../styles/font-family';
import { Wallet, Plus, Check } from 'lucide-react-native';
import { ScanItem } from '../types';
import { useUser } from '@clerk/clerk-expo';
interface SelectBudgetModalProps {
  visible: boolean;
  onClose: () => void;
  item: ScanItem;
  basePrice: number | null;
}

export function SelectBudgetModal({ visible, onClose, item, basePrice }: SelectBudgetModalProps) {
  const bottomSheetRef = React.useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['60%'], []);
  const { isAuthenticated } = useConvexAuth();
  const { user } = useUser();
  const email =
    user?.primaryEmailAddress?.emailAddress || user?.emailAddresses?.[0]?.emailAddress || '';

  // const activeUser = useQuery(api.users.getActiveUser, isAuthenticated ? undefined : 'skip');
  const activeUser = useQuery(api.users.getByEmail, email ? { email } : 'skip');
  const userId = activeUser?._id;

  const budgets = useQuery(api.budgets.list, userId ? { userId } : 'skip');
  const createBudget = useMutation(api.budgets.create);
  const addBudgetItem = useMutation(api.budgets.addItem);

  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newBudgetName, setNewBudgetName] = useState('');
  const [newBudgetAmount, setNewBudgetAmount] = useState('');
  const [addingToBudget, setAddingToBudget] = useState<string | null>(null);

  React.useEffect(() => {
    if (visible) {
      bottomSheetRef.current?.expand();
      setIsCreatingNew(false);
      setNewBudgetName('');
      setNewBudgetAmount('');
    } else {
      bottomSheetRef.current?.close();
    }
  }, [visible]);

  const handleCreateAndAdd = async () => {
    console.log('handleCreateAndAdd initiated', { newBudgetName, userId, basePrice });
    if (!newBudgetName.trim() || !userId) {
      console.log('Exiting early from handleCreateAndAdd - missing name or user ID');
      return;
    }

    try {
      const newBudgetId = await createBudget({
        name: newBudgetName.trim(),
        userId,
        targetAmount: newBudgetAmount.trim() ? parseFloat(newBudgetAmount) : undefined,
        email,
      });

      await addBudgetItem({
        budgetId: newBudgetId,
        name: item.name,
        price: basePrice || 0,
        quantity: 1, // Default quantity
      });

      onClose();
    } catch (error) {
      console.error('Error creating budget and adding item:', error);
    }
  };

  const handleAddToBudget = async (budgetId: any) => {
    try {
      setAddingToBudget(budgetId);
      await addBudgetItem({
        budgetId,
        name: item.name,
        price: basePrice || 0,
        quantity: 1,
      });
      onClose();
    } catch (error) {
      console.error('Error adding item to budget:', error);
    } finally {
      setAddingToBudget(null);
    }
  };

  const renderBackdrop = React.useCallback(
    (props: any) => (
      <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.5} />
    ),
    []
  );

  const formattedPrice = (price: number) => {
    return Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
  };

  const isLoading = budgets === undefined && userId !== undefined;
  const displayBudgets = budgets || [];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
        <View
          style={{
            backgroundColor: colors.white,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            height: '60%',
            paddingBottom: 20,
          }}>
          <View
            style={{
              width: 40,
              height: 4,
              backgroundColor: colors.gray300,
              borderRadius: 2,
              alignSelf: 'center',
              marginTop: 12,
              marginBottom: 8,
            }}
          />
          <View style={styles.contentContainer}>
            <View style={styles.header}>
              <Text style={styles.title}>Add to Budget</Text>
              <Text style={styles.subtitle}>
                {item.name} - {basePrice ? formattedPrice(basePrice) : 'Unknown Price'}
              </Text>
            </View>

            {isCreatingNew ? (
              <View style={styles.createNewContainer}>
                <Text style={styles.label}>Budget Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Living Room Makeover"
                  value={newBudgetName}
                  onChangeText={setNewBudgetName}
                />
                <Text style={styles.label}>Target Amount (Optional, USD)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 2000"
                  keyboardType="numeric"
                  value={newBudgetAmount}
                  onChangeText={setNewBudgetAmount}
                />
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={[styles.button, styles.cancelButton]}
                    onPress={() => setIsCreatingNew(false)}>
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.button,
                      styles.primaryButton,
                      !newBudgetName.trim() && styles.disabledButton,
                    ]}
                    disabled={!newBudgetName.trim()}
                    onPress={handleCreateAndAdd}>
                    <Text style={styles.primaryButtonText}>Create & Add</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={{ flex: 1 }}>
                <TouchableOpacity
                  style={styles.createNewBtn}
                  onPress={() => setIsCreatingNew(true)}>
                  <Plus size={20} color={colors.primaryBlue} style={{ marginRight: 8 }} />
                  <Text style={styles.createNewBtnText}>Create New Budget</Text>
                </TouchableOpacity>

                {isLoading ? (
                  <ActivityIndicator
                    size="large"
                    color={colors.primaryBlue}
                    style={{ marginTop: 20 }}
                  />
                ) : displayBudgets.length === 0 ? (
                  <View style={styles.emptyStateContainer}>
                    <Wallet size={48} color={colors.gray300} style={{ marginBottom: 12 }} />
                    <Text style={styles.emptyStateText}>No budgets found</Text>
                  </View>
                ) : (
                  <FlatList
                    data={displayBudgets}
                    keyExtractor={(b) => b._id}
                    renderItem={({ item: budget }) => (
                      <TouchableOpacity
                        style={styles.budgetItem}
                        onPress={() => handleAddToBudget(budget._id)}
                        disabled={addingToBudget === budget._id}>
                        <View style={styles.budgetIconContainer}>
                          <Wallet size={20} color={colors.primaryBlue} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.budgetName}>{budget.name}</Text>
                          {budget.targetAmount && (
                            <Text style={styles.budgetTarget}>
                              Target: {formattedPrice(budget.targetAmount)}
                            </Text>
                          )}
                        </View>
                        {addingToBudget === budget._id ? (
                          <ActivityIndicator size="small" color={colors.primaryBlue} />
                        ) : (
                          <Plus size={20} color={colors.gray400} />
                        )}
                      </TouchableOpacity>
                    )}
                    contentContainerStyle={{ paddingBottom: 20 }}
                  />
                )}
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontFamily: fontFamily.ManropeBold,
    fontSize: 20,
    color: colors.black,
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: fontFamily.ManropeMedium,
    fontSize: 14,
    color: colors.gray500,
  },
  createNewContainer: {
    marginTop: 8,
  },
  label: {
    fontFamily: fontFamily.ManropeMedium,
    fontSize: 14,
    color: colors.gray700,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.gray50,
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontFamily: fontFamily.ManropeRegular,
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.gray100,
    marginRight: 8,
  },
  primaryButton: {
    backgroundColor: colors.primaryBlue,
    marginLeft: 8,
  },
  disabledButton: {
    opacity: 0.5,
  },
  cancelButtonText: {
    fontFamily: fontFamily.ManropeBold,
    fontSize: 16,
    color: colors.gray700,
  },
  primaryButtonText: {
    fontFamily: fontFamily.ManropeBold,
    fontSize: 16,
    color: colors.white,
  },
  createNewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  createNewBtnText: {
    fontFamily: fontFamily.ManropeBold,
    fontSize: 16,
    color: colors.primaryBlue,
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
  },
  emptyStateText: {
    fontFamily: fontFamily.ManropeMedium,
    fontSize: 16,
    color: colors.gray500,
  },
  budgetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray100,
    borderRadius: 12,
    marginBottom: 12,
  },
  budgetIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  budgetName: {
    fontFamily: fontFamily.ManropeBold,
    fontSize: 16,
    color: colors.black,
  },
  budgetTarget: {
    fontFamily: fontFamily.ManropeMedium,
    fontSize: 13,
    color: colors.gray500,
    marginTop: 2,
  },
});
