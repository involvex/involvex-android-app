import React, { useState } from 'react';
import { View, TextInput, Button, FlatList } from 'react-native';
import { searchPackages } from '../services/npmService';
import { searchRepositories } from '../services/githubService';
import { PackageCard } from '../components/PackageCard';
import { RepositoryCard } from '../components/RepositoryCard';

const SearchScreen = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [type, setType] = useState('packages');

  const handleSearch = async () => {
    if (type === 'packages') {
      const packageResults = await searchPackages(query);
      setResults(packageResults);
    } else {
      const repoResults = await searchRepositories(query);
      setResults(repoResults);
    }
  };

  return (
    <View>
      <TextInput value={query} onChangeText={setQuery} />
      <Button title="Search" onPress={handleSearch} />
      <FlatList
        data={results}
        keyExtractor={(item) => (type === 'packages' ? item.package.name : item.id)}
        renderItem={({ item }) =>
          type === 'packages' ? (
            <PackageCard package={item.package} />
          ) : (
            <RepositoryCard repository={item} />
          )
        }
      />
    </View>
  );
};

export default SearchScreen;
