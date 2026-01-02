import React from 'react';
import { View, Text } from 'react-native';

export const PackageCard = ({ package: pkg }) => {
  return (
    <View>
      <Text>{pkg.name}</Text>
      <Text>{pkg.description}</Text>
    </View>
  );
};
