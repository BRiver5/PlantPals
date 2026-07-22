import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Screen } from '@/components/Screen';
import { NavHeader } from '@/components/NavHeader';
import { Field } from '@/components/Field';
import { PrimaryButton } from '@/components/PrimaryButton';
import { LoadingView } from '@/components/ui';
import { colors, radius, shadow, spacing, typography } from '@/theme';
import { usePlants } from '@/state/PlantsContext';
import { api, ApiError } from '@/lib/api';
import { pickFromCamera, pickFromLibrary } from '@/lib/photo';
import type { PlantSpecies } from '@/types/models';
import type { RootStackParamList } from '@/navigation/types';
import { SpeciesPickerModal } from './SpeciesPickerModal';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Rt = RouteProp<RootStackParamList, 'AddEditPlant'>;

const INTERVAL_CHIPS = [3, 5, 7, 10, 14, 21];

export function AddEditPlantScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Rt>();
  const editingId = route.params?.plantId;
  const isEdit = editingId !== undefined;
  const { createPlant, updatePlant } = usePlants();

  const [initialLoading, setInitialLoading] = useState(isEdit);
  const [name, setName] = useState('');
  const [species, setSpecies] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [interval, setInterval] = useState('7');
  const [amount, setAmount] = useState('');
  const [location, setLocation] = useState('');
  const [careNotes, setCareNotes] = useState('');

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [speciesModal, setSpeciesModal] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    let active = true;
    api
      .getPlant(editingId)
      .then((p) => {
        if (!active) return;
        setName(p.name);
        setSpecies(p.species);
        setPhotoUrl(p.photo_url);
        setInterval(String(p.interval_days));
        setAmount(p.water_amount_ml ? String(p.water_amount_ml) : '');
        setLocation(p.location ?? '');
        setCareNotes(p.care_notes ?? '');
      })
      .catch((e) => Alert.alert('Could not load plant', e instanceof Error ? e.message : ''))
      .finally(() => active && setInitialLoading(false));
    return () => {
      active = false;
    };
  }, [editingId, isEdit]);

  const applySpecies = (s: PlantSpecies) => {
    setSpecies(s.common_name);
    if (!name.trim()) setName(s.common_name);
    setInterval(String(s.default_interval_days));
    setAmount(String(s.default_water_amount_ml));
    if (!careNotes.trim()) setCareNotes(s.care_tip);
    setSpeciesModal(false);
  };

  const choosePhoto = () => {
    const run = async (picker: () => Promise<string | null>) => {
      const uri = await picker();
      if (!uri) return;
      setUploading(true);
      try {
        const url = await api.uploadPhoto(uri);
        setPhotoUrl(url);
      } catch (e) {
        Alert.alert('Upload failed', e instanceof Error ? e.message : 'Please try again.');
      } finally {
        setUploading(false);
      }
    };
    Alert.alert('Add a photo', undefined, [
      { text: 'Take photo', onPress: () => run(pickFromCamera) },
      { text: 'Choose from library', onPress: () => run(pickFromLibrary) },
      ...(photoUrl ? [{ text: 'Remove photo', style: 'destructive' as const, onPress: () => setPhotoUrl(null) }] : []),
      { text: 'Cancel', style: 'cancel' as const },
    ]);
  };

  const validate = (): string | null => {
    if (!name.trim()) return 'Please give your plant a name.';
    const iv = Number(interval);
    if (!Number.isInteger(iv) || iv < 1 || iv > 365) return 'Watering interval must be between 1 and 365 days.';
    if (amount.trim()) {
      const a = Number(amount);
      if (!Number.isInteger(a) || a < 1) return 'Water amount must be a whole number of millilitres.';
    }
    return null;
  };

  const onSave = async () => {
    const err = validate();
    if (err) {
      Alert.alert('Check your plant', err);
      return;
    }
    setSaving(true);
    const payload = {
      name: name.trim(),
      species: species?.trim() || null,
      photo_url: photoUrl,
      interval_days: Number(interval),
      water_amount_ml: amount.trim() ? Number(amount) : null,
      location: location.trim() || null,
      care_notes: careNotes.trim() || null,
    };
    try {
      if (isEdit) {
        await updatePlant(editingId, payload);
      } else {
        await createPlant(payload);
      }
      navigation.goBack();
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : 'Could not save your plant. Please try again.';
      Alert.alert('Save failed', msg);
    } finally {
      setSaving(false);
    }
  };

  if (initialLoading) {
    return (
      <Screen padded>
        <NavHeader title="Edit plant" />
        <LoadingView />
      </Screen>
    );
  }

  return (
    <Screen padded edges={['top', 'bottom']}>
      <NavHeader title={isEdit ? 'Edit plant' : 'Add plant'} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={8}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Pressable style={styles.photo} onPress={choosePhoto} accessibilityLabel="Add plant photo">
            {photoUrl ? (
              <Image source={{ uri: photoUrl }} style={styles.photoImage} contentFit="cover" transition={200} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Ionicons name="camera-outline" size={30} color={colors.green} />
                <Text style={styles.photoText}>Add a photo</Text>
              </View>
            )}
            {uploading && (
              <View style={styles.photoOverlay}>
                <ActivityIndicator color={colors.textOnAccent} />
              </View>
            )}
            {photoUrl && !uploading && (
              <View style={styles.photoEdit}>
                <Ionicons name="pencil" size={16} color={colors.textOnAccent} />
              </View>
            )}
          </Pressable>

          <Pressable style={styles.speciesButton} onPress={() => setSpeciesModal(true)}>
            <Ionicons name="search" size={18} color={colors.green} />
            <Text style={styles.speciesText}>
              {species ? species : 'Pick from 45+ common plants'}
            </Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textFaint} />
          </Pressable>

          <Field label="Name" value={name} onChangeText={setName} placeholder="e.g. Living room monstera" maxLength={120} />

          <View style={styles.fieldLabelRow}>
            <Text style={styles.fieldLabel}>Water every</Text>
          </View>
          <View style={styles.chipsRow}>
            {INTERVAL_CHIPS.map((d) => {
              const active = Number(interval) === d;
              return (
                <Pressable
                  key={d}
                  onPress={() => setInterval(String(d))}
                  style={[styles.chip, active && styles.chipActive]}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{d}d</Text>
                </Pressable>
              );
            })}
          </View>
          <Field
            label="Days between watering"
            value={interval}
            onChangeText={(t) => setInterval(t.replace(/[^0-9]/g, ''))}
            keyboardType="number-pad"
            suffix="days"
            maxLength={3}
          />

          <Field
            label="Water amount"
            value={amount}
            onChangeText={(t) => setAmount(t.replace(/[^0-9]/g, ''))}
            keyboardType="number-pad"
            suffix="ml"
            maxLength={6}
            optional
          />

          <Field label="Location" value={location} onChangeText={setLocation} placeholder="e.g. Kitchen windowsill" maxLength={120} optional />

          <Field
            label="Care notes"
            value={careNotes}
            onChangeText={setCareNotes}
            placeholder="Light, soil, or anything you want to remember"
            multiline
            maxLength={2000}
            optional
          />

          <PrimaryButton
            label={isEdit ? 'Save changes' : 'Add plant'}
            icon={isEdit ? 'checkmark' : 'add'}
            onPress={onSave}
            loading={saving}
            disabled={uploading}
            style={styles.save}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      <SpeciesPickerModal visible={speciesModal} onClose={() => setSpeciesModal(false)} onSelect={applySpecies} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingBottom: spacing.xxl },
  photo: {
    alignSelf: 'center',
    width: 140,
    height: 140,
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginBottom: spacing.lg,
    ...shadow.soft,
  },
  photoImage: { width: '100%', height: '100%' },
  photoPlaceholder: {
    flex: 1,
    backgroundColor: colors.greenSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoText: { ...typography.small, color: colors.green, marginTop: spacing.sm, fontWeight: '600' },
  photoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoEdit: {
    position: 'absolute',
    right: spacing.sm,
    bottom: spacing.sm,
    width: 30,
    height: 30,
    borderRadius: radius.pill,
    backgroundColor: colors.water,
    alignItems: 'center',
    justifyContent: 'center',
  },
  speciesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.greenSoft,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    height: 52,
    marginBottom: spacing.lg,
  },
  speciesText: { flex: 1, marginLeft: spacing.sm, ...typography.body, color: colors.text, fontWeight: '600' },
  fieldLabelRow: { marginBottom: spacing.sm },
  fieldLabel: { ...typography.label, color: colors.text },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.waterSoft, borderColor: colors.water },
  chipText: { ...typography.label, color: colors.textMuted },
  chipTextActive: { color: colors.waterDark },
  save: { marginTop: spacing.md },
});
