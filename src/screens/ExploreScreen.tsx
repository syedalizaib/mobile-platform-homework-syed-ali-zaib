import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import {
  useExploreFilterStore,
  FilterType,
  SortType,
} from '../store/useExploreFilterStore';
import { useColors } from '../theme/ThemeContext';

const FILTER_CHIPS: { label: string; value: FilterType }[] = [
  { label: 'Category', value: 'Category' },
  { label: 'Sort', value: 'Sort' },
];

const SORT_CHIPS: { label: string; value: SortType }[] = [
  { label: 'A–Z', value: 'A-Z' },
  { label: 'Recent', value: 'Recent' },
];

export function ExploreScreen() {
  const { filter, sort, setFilter, setSort } = useExploreFilterStore();
  const colors = useColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Explore</Text>
      <View style={styles.filterBar}>
        <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>
          Filter:
        </Text>
        {FILTER_CHIPS.map((chip) => (
          <TouchableOpacity
            key={chip.value}
            style={[
              styles.chip,
              { backgroundColor: colors.chipBg },
              filter === chip.value && {
                backgroundColor: colors.chipActive,
              },
            ]}
            onPress={() => setFilter(chip.value)}
          >
            <Text
              style={[
                styles.chipText,
                { color: colors.text },
                filter === chip.value && styles.chipTextActive,
              ]}
            >
              {chip.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.filterBar}>
        <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>
          Sort:
        </Text>
        {SORT_CHIPS.map((chip) => (
          <TouchableOpacity
            key={chip.value}
            style={[
              styles.chip,
              { backgroundColor: colors.chipBg },
              sort === chip.value && { backgroundColor: colors.chipActive },
            ]}
            onPress={() => setSort(chip.value)}
          >
            <Text
              style={[
                styles.chipText,
                { color: colors.text },
                sort === chip.value && styles.chipTextActive,
              ]}
            >
              {chip.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={[styles.placeholder, { color: colors.textSecondary }]}>
        Active: {filter} / {sort}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  filterLabel: {
    fontSize: 14,
    marginRight: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  chipText: {
    fontSize: 14,
  },
  chipTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  placeholder: {
    marginTop: 24,
    fontSize: 14,
  },
});
