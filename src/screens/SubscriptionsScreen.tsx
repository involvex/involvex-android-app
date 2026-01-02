
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../services/themeService';
import { getSubscriptions } from '../services/firestoreService';
import RepositoryCard from '../components/RepositoryCard';
import PackageCard from '../components/PackageCard';

const SubscriptionsScreen = () => {
  const { theme } = useTheme();
  const [subscriptions, setSubscriptions] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = getSubscriptions((subs) => {
      setSubscriptions(subs);
    });

    return () => unsubscribe();
  }, []);

  const styles = getStyles(theme);

  return (
    <View style={styles.container}>
      <ScrollView>
        {subscriptions.map((item) => (
          item.type === 'repo' 
            ? <RepositoryCard key={item.id} repo={item} />
            : <PackageCard key={item.name} pkg={item} />
        ))}
      </ScrollView>
    </View>
  );
};

const getStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: 10,
  },
});

export default SubscriptionsScreen;
