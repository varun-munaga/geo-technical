import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  FlatList,
  TextInput,
  StyleSheet,
  SafeAreaView,
} from 'react-native';

interface StrataOption {
  code: string;
  name: string;
  group: 'Fine-Grained (Clay/Silt)' | 'Coarse-Grained (Sand/Gravel)' | 'Rock Bedrock' | 'Fill / Made Ground';
  color: string;
}

const STRATA_CATALOG: StrataOption[] = [
  { code: 'FILL', name: 'Topsoil / Fill material with brickbats & gravel', group: 'Fill / Made Ground', color: '#94a3b8' },
  { code: 'CH', name: 'Fat Clay with High Plasticity (CH)', group: 'Fine-Grained (Clay/Silt)', color: '#f87171' },
  { code: 'CI', name: 'Medium Stiff Silty Clay with Intermediate Plasticity (CI)', group: 'Fine-Grained (Clay/Silt)', color: '#fb923c' },
  { code: 'CL', name: 'Lean Clay with Low Plasticity (CL)', group: 'Fine-Grained (Clay/Silt)', color: '#fca5a5' },
  { code: 'ML', name: 'Inorganic Silt with Low Plasticity (ML)', group: 'Fine-Grained (Clay/Silt)', color: '#86efac' },
  { code: 'MH', name: 'Micaceous Elastic Silt (MH)', group: 'Fine-Grained (Clay/Silt)', color: '#4ade80' },
  { code: 'SW', name: 'Well-Graded Coarse Sand with Quartz (SW)', group: 'Coarse-Grained (Sand/Gravel)', color: '#fde047' },
  { code: 'SP', name: 'Poorly Graded Medium Sand (SP)', group: 'Coarse-Grained (Sand/Gravel)', color: '#fef08a' },
  { code: 'SM', name: 'Dense Silty Coarse Sand with Quartz gravel (SM)', group: 'Coarse-Grained (Sand/Gravel)', color: '#f59e0b' },
  { code: 'SC', name: 'Clayey Sand (SC)', group: 'Coarse-Grained (Sand/Gravel)', color: '#d97706' },
  { code: 'GW', name: 'Well-Graded Gravel / Murrum (GW)', group: 'Coarse-Grained (Sand/Gravel)', color: '#fdba74' },
  { code: 'RO-W5', name: 'Completely Weathered Granite (Grades V-IV) / Murrum', group: 'Rock Bedrock', color: '#cbd5e1' },
  { code: 'RO-W3', name: 'Moderately Weathered to Fresh Granite (Grade III-II)', group: 'Rock Bedrock', color: '#94a3b8' },
  { code: 'RO-FR', name: 'Sound Fresh Hard Granite Bedrock (Grade I)', group: 'Rock Bedrock', color: '#64748b' },
  { code: 'BASALT', name: 'Amygdaloidal / Compact Hard Basalt', group: 'Rock Bedrock', color: '#475569' },
];

interface StrataSelectorModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (strataName: string, code: string) => void;
}

export const StrataSelectorModal: React.FC<StrataSelectorModalProps> = ({
  visible,
  onClose,
  onSelect,
}) => {
  const [search, setSearch] = useState('');

  const filtered = STRATA_CATALOG.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.code.toLowerCase().includes(search.toLowerCase()) ||
      item.group.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <SafeAreaView style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Visual Strata Classification</Text>
              <Text style={styles.subtitle}>Select IS 1498 / USCS Geological Lithology</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.searchInput}
            placeholder="Search soil or rock type (e.g. Clay, Granite, SM)..."
            value={search}
            onChangeText={setSearch}
            placeholderTextColor="#94a3b8"
          />

          <FlatList
            data={filtered}
            keyExtractor={(item) => item.code}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.itemRow}
                onPress={() => {
                  onSelect(item.name, item.code);
                  onClose();
                }}
              >
                <View style={[styles.colorBar, { backgroundColor: item.color }]} />
                <View style={styles.itemTextContainer}>
                  <View style={styles.itemTopRow}>
                    <Text style={styles.codeBadge}>{item.code}</Text>
                    <Text style={styles.groupText}>{item.group}</Text>
                  </View>
                  <Text style={styles.itemName}>{item.name}</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 1,
  },
  closeBtn: {
    padding: 6,
  },
  closeText: {
    fontSize: 18,
    color: '#64748b',
    fontWeight: '700',
  },
  searchInput: {
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 12,
    color: '#0f172a',
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  colorBar: {
    width: 5,
    height: 38,
    borderRadius: 3,
    marginRight: 12,
  },
  itemTextContainer: {
    flex: 1,
  },
  itemTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  codeBadge: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0284c7',
    fontFamily: 'monospace',
  },
  groupText: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '600',
  },
  itemName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 2,
  },
});

