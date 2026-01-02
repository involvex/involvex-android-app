import React from 'react';
import { View, Text } from 'react-native';

export const RepositoryCard = ({ repository }) => {
  return (
    <View>
      <Text>{repository.full_name}</Text>
      <Text>{repository.description}</Text>
    </View>
  );
};
