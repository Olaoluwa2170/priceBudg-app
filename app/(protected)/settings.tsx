import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useUser } from '@clerk/clerk-expo';
import { Settings as SettingsIcon, Menu } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../styles/colors';
import { styles } from 'styles/app/(protected)/settings';

export default function SettingsScreen() {
  const { user } = useUser();
  const navigation = useNavigation();

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
        <SettingsIcon size={32} color={colors.black} />
        <Text style={styles.title}>Settings</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Name</Text>
          <Text style={styles.infoValue}>
            {user?.firstName && user?.lastName
              ? `${user.firstName} ${user.lastName}`
              : user?.emailAddresses[0]?.emailAddress || 'N/A'}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Email</Text>
          <Text style={styles.infoValue}>{user?.emailAddresses[0]?.emailAddress || 'N/A'}</Text>
        </View>
      </View>
    </ScrollView>
  );
}
