import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Alert,
  Switch,
} from 'react-native';
import { FieldEngineerProfile, MobileProject, MobileBorehole, MobileQueuedLog } from '../types';
import { GpsStatusBadge } from '../components/GpsStatusBadge';
import { PhotoCaptureSlot } from '../components/PhotoCaptureSlot';
import { StrataSelectorModal } from '../components/StrataSelectorModal';
import { offlineStorage } from '../lib/offlineStorage';
import { syncManager } from '../lib/syncManager';

interface BoreholeLogScreenProps {
  user: FieldEngineerProfile;
  project: MobileProject;
  borehole: MobileBorehole;
  onBack: () => void;
  onEntrySaved: () => void;
}

export const BoreholeLogScreen: React.FC<BoreholeLogScreenProps> = ({
  user,
  project,
  borehole,
  onBack,
  onEntrySaved,
}) => {
  // Form State
  const [depthFrom, setDepthFrom] = useState(borehole.depth_drilled_m ? borehole.depth_drilled_m.toString() : '18.5');
  const [depthTo, setDepthTo] = useState('21.0');
  const [sampleNo, setSampleNo] = useState(`SPT-0${Math.floor(Math.random() * 5 + 4)}`);
  const [strataText, setStrataText] = useState('Dense Silty Coarse Sand with Quartz gravel (SM)');
  const [strataCode, setStrataCode] = useState('SM');
  const [isStrataModalVisible, setIsStrataModalVisible] = useState(false);

  // Test type: SPT vs Core Coring
  const [isCoreDrilling, setIsCoreDrilling] = useState(false);
  const [spt15, setSpt15] = useState('12');
  const [spt30, setSpt30] = useState('18');
  const [spt45, setSpt45] = useState('22');
  const [coreRec, setCoreRec] = useState('75');
  const [rqd, setRqd] = useState('50');

  // Water table
  const [waterEncountered, setWaterEncountered] = useState(true);
  const [waterDepth, setWaterDepth] = useState('3.8');

  // Remarks
  const [notes, setNotes] = useState('Sub-angular quartz grains with moderate mica flakes.');

  // GPS Telemetry
  const [gpsData, setGpsData] = useState({
    latitude: 17.443512,
    longitude: 78.377201,
    accuracy: 2.8,
  });

  // Photos
  const [sitePhotoUri, setSitePhotoUri] = useState<string | undefined>();
  const [sampleCardUri, setSampleCardUri] = useState<string | undefined>();
  const [fieldSheetUri, setFieldSheetUri] = useState<string | undefined>();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const calculatedN =
    !isCoreDrilling && spt30 && spt45
      ? (parseInt(spt30, 10) || 0) + (parseInt(spt45, 10) || 0)
      : null;

  const handleSubmit = async () => {
    const fromNum = parseFloat(depthFrom);
    const toNum = parseFloat(depthTo);

    if (isNaN(fromNum) || isNaN(toNum) || toNum <= fromNum) {
      Alert.alert('Validation Error', 'Please enter valid Depth From and Depth To values (Depth To must be greater than Depth From).');
      return;
    }

    if (!strataText.trim()) {
      Alert.alert('Validation Error', 'Please select or enter the visual soil/rock strata classification.');
      return;
    }

    setIsSubmitting(true);

    const queuedRecord: MobileQueuedLog = {
      localId: `local-log-${Date.now()}`,
      projectId: project.id,
      projectName: project.project_name,
      projectCode: project.project_code,
      boreholeId: borehole.id,
      boreholeNo: borehole.borehole_no,
      engineerId: user.id,
      engineerName: user.full_name,
      depthFrom: fromNum,
      depthTo: toNum,
      sampleNo: sampleNo.trim() || 'SS-01',
      strataClassification: strataText.trim(),
      sptBlows15cm: !isCoreDrilling && spt15 ? parseInt(spt15, 10) : null,
      sptBlows30cm: !isCoreDrilling && spt30 ? parseInt(spt30, 10) : null,
      sptBlows45cm: !isCoreDrilling && spt45 ? parseInt(spt45, 10) : null,
      sptNValue: calculatedN,
      coreRecoveryPct: isCoreDrilling && coreRec ? parseFloat(coreRec) : null,
      rqdPct: isCoreDrilling && rqd ? parseFloat(rqd) : null,
      waterTableEncountered: waterEncountered,
      waterTableDepth: waterEncountered && waterDepth ? parseFloat(waterDepth) : null,
      notes: notes.trim(),
      gpsLat: gpsData.latitude,
      gpsLong: gpsData.longitude,
      gpsAccuracy: gpsData.accuracy,
      timestamp: new Date().toISOString(),
      photos: {
        sitePhotoUri,
        sampleCardUri,
        fieldSheetUri,
      },
      syncStatus: 'pending',
    };

    try {
      // 1. Always queue locally first (offline-first resilience)
      await offlineStorage.queueLog(queuedRecord);

      // 2. Check network & attempt sync immediately if online
      const isOnline = await syncManager.checkNetworkStatus();
      if (isOnline) {
        syncManager.syncAllQueued();
      }

      Alert.alert(
        'Entry Logged Successfully',
        isOnline
          ? 'Record saved locally and sync uplink dispatched to office console.'
          : 'Saved in offline storage queue. It will automatically upload once cellular signal resumes.',
        [{ text: 'OK', onPress: onEntrySaved }]
      );
    } catch (err: any) {
      Alert.alert('Save Error', err.message || 'Could not write to local storage.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backBtnText}>◀ Back</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{borehole.borehole_no} Site Log Entry</Text>
          <Text style={styles.headerSubtitle}>{project.project_code} &bull; {user.full_name}</Text>
        </View>
        <View style={{ width: 45 }} />
      </View>

      <ScrollView style={styles.formScroll} contentContainerStyle={styles.formContent}>
        {/* GPS Telemetry Bar */}
        <GpsStatusBadge onLocationCaptured={setGpsData} />

        {/* Depth Intervals */}
        <View style={styles.formSection}>
          <Text style={styles.sectionHeading}>1. Subsurface Depth Interval (Meters)</Text>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.inputLabel}>Depth From (m) *</Text>
              <TextInput
                style={styles.textInput}
                keyboardType="numeric"
                value={depthFrom}
                onChangeText={setDepthFrom}
                placeholder="0.00"
              />
            </View>
            <View style={styles.col}>
              <Text style={styles.inputLabel}>Depth To (m) *</Text>
              <TextInput
                style={styles.textInput}
                keyboardType="numeric"
                value={depthTo}
                onChangeText={setDepthTo}
                placeholder="1.50"
              />
            </View>
            <View style={styles.col}>
              <Text style={styles.inputLabel}>Sample ID</Text>
              <TextInput
                style={styles.textInput}
                value={sampleNo}
                onChangeText={setSampleNo}
                placeholder="SS-01"
              />
            </View>
          </View>
        </View>

        {/* Visual Soil & Rock Classification */}
        <View style={styles.formSection}>
          <Text style={styles.sectionHeading}>2. Visual Strata Lithology</Text>
          <TouchableOpacity
            style={styles.strataPickerBtn}
            onPress={() => setIsStrataModalVisible(true)}
          >
            <View style={styles.strataInfo}>
              <Text style={styles.strataCodeBadge}>{strataCode || 'SELECT'}</Text>
              <Text style={styles.strataText} numberOfLines={2}>
                {strataText}
              </Text>
            </View>
            <Text style={styles.strataArrow}>▼ Change</Text>
          </TouchableOpacity>
        </View>

        {/* In-Situ Tests: SPT vs Rock Coring */}
        <View style={styles.formSection}>
          <View style={styles.sectionHeadingRow}>
            <Text style={styles.sectionHeading}>3. In-Situ Penetration & Recovery</Text>
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Rock Core?</Text>
              <Switch
                value={isCoreDrilling}
                onValueChange={setIsCoreDrilling}
                trackColor={{ false: '#cbd5e1', true: '#0284c7' }}
              />
            </View>
          </View>

          {!isCoreDrilling ? (
            <View>
              <Text style={styles.subLabel}>SPT Blow Counts (Standard Penetration Test):</Text>
              <View style={styles.row}>
                <View style={styles.col}>
                  <Text style={styles.inputLabel}>0 - 15cm</Text>
                  <TextInput
                    style={styles.textInput}
                    keyboardType="number-pad"
                    value={spt15}
                    onChangeText={setSpt15}
                  />
                </View>
                <View style={styles.col}>
                  <Text style={styles.inputLabel}>15 - 30cm</Text>
                  <TextInput
                    style={styles.textInput}
                    keyboardType="number-pad"
                    value={spt30}
                    onChangeText={setSpt30}
                  />
                </View>
                <View style={styles.col}>
                  <Text style={styles.inputLabel}>30 - 45cm</Text>
                  <TextInput
                    style={styles.textInput}
                    keyboardType="number-pad"
                    value={spt45}
                    onChangeText={setSpt45}
                  />
                </View>
                <View style={styles.colN}>
                  <Text style={styles.inputLabelN}>SPT N</Text>
                  <View style={styles.nValueBox}>
                    <Text style={styles.nValueText}>{calculatedN ?? '-'}</Text>
                  </View>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.row}>
              <View style={styles.col}>
                <Text style={styles.inputLabel}>Core Recovery (%)</Text>
                <TextInput
                  style={styles.textInput}
                  keyboardType="numeric"
                  value={coreRec}
                  onChangeText={setCoreRec}
                  placeholder="85"
                />
              </View>
              <View style={styles.col}>
                <Text style={styles.inputLabel}>RQD (%)</Text>
                <TextInput
                  style={styles.textInput}
                  keyboardType="numeric"
                  value={rqd}
                  onChangeText={setRqd}
                  placeholder="60"
                />
              </View>
            </View>
          )}
        </View>

        {/* Groundwater Table */}
        <View style={styles.formSection}>
          <View style={styles.sectionHeadingRow}>
            <Text style={styles.sectionHeading}>4. Groundwater Table</Text>
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Water Encountered?</Text>
              <Switch
                value={waterEncountered}
                onValueChange={setWaterEncountered}
                trackColor={{ false: '#cbd5e1', true: '#0284c7' }}
              />
            </View>
          </View>

          {waterEncountered && (
            <View style={{ marginTop: 8 }}>
              <Text style={styles.inputLabel}>Water Table Depth (m below ground level):</Text>
              <TextInput
                style={styles.textInput}
                keyboardType="numeric"
                value={waterDepth}
                onChangeText={setWaterDepth}
                placeholder="e.g. 3.80"
              />
            </View>
          )}
        </View>

        {/* Field Remarks */}
        <View style={styles.formSection}>
          <Text style={styles.sectionHeading}>5. Geological Observations & Remarks</Text>
          <TextInput
            style={styles.textArea}
            multiline
            numberOfLines={3}
            value={notes}
            onChangeText={setNotes}
            placeholder="Drilling resistance, color changes, odor, casing notes..."
          />
        </View>

        {/* Dedicated Photo Capture Slots */}
        <View style={styles.formSection}>
          <Text style={styles.sectionHeading}>6. Dedicated Field Photo Capture</Text>
          <Text style={styles.sectionSubtext}>
            Images are compressed client-side to minimize field cellular usage before queuing.
          </Text>

          {/* Slot 1: Site Rig Photo */}
          <PhotoCaptureSlot
            label="A) Site Environment / Drilling Rig Photo"
            description="Overall rig station, setup alignment, safety setup & collar casing."
            slotType="site_photo"
            imageUri={sitePhotoUri}
            onImageCaptured={(uri) => setSitePhotoUri(uri)}
            onImageRemoved={() => setSitePhotoUri(undefined)}
          />

          {/* Slot 2: Sample Tag Card */}
          <PhotoCaptureSlot
            label="B) Specimen Sample Tag Card"
            description="Close-up photograph of specimen label card detailing run ID and depth."
            slotType="sample_card"
            imageUri={sampleCardUri}
            onImageCaptured={(uri) => setSampleCardUri(uri)}
            onImageRemoved={() => setSampleCardUri(undefined)}
          />

          {/* Slot 3: Physical Field Log Sheet */}
          <PhotoCaptureSlot
            label="C) Physical Field Log Sheet / Ledger"
            description="Handwritten ledger sheet for automated Vision OCR extraction and Excel creation."
            slotType="field_sheet"
            imageUri={fieldSheetUri}
            onImageCaptured={(uri) => setFieldSheetUri(uri)}
            onImageRemoved={() => setFieldSheetUri(undefined)}
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? 'Compressing & Queueing...' : '💾 Save & Queue Geotechnical Entry'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Strata Modal */}
      <StrataSelectorModal
        visible={isStrataModalVisible}
        onClose={() => setIsStrataModalVisible(false)}
        onSelect={(name, code) => {
          setStrataText(name);
          setStrataCode(code);
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#0f172a',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  backBtnText: {
    color: '#38bdf8',
    fontSize: 13,
    fontWeight: '700',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
  headerSubtitle: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 1,
  },
  formScroll: {
    flex: 1,
  },
  formContent: {
    padding: 16,
    paddingBottom: 50,
  },
  formSection: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginVertical: 6,
  },
  sectionHeadingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 4,
  },
  sectionSubtext: {
    fontSize: 11,
    color: '#64748b',
    marginBottom: 8,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  switchLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155',
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  col: {
    flex: 1,
  },
  colN: {
    width: 60,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  inputLabelN: {
    fontSize: 10,
    fontWeight: '800',
    color: '#b45309',
    textTransform: 'uppercase',
    marginBottom: 3,
    textAlign: 'center',
  },
  textInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    fontSize: 13,
    fontWeight: '600',
    color: '#0f172a',
  },
  nValueBox: {
    backgroundColor: '#fef3c7',
    borderWidth: 1,
    borderColor: '#fde68a',
    borderRadius: 8,
    paddingVertical: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nValueText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#78350f',
    fontFamily: 'monospace',
  },
  subLabel: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
    marginTop: 4,
  },
  strataPickerBtn: {
    backgroundColor: '#f0f9ff',
    borderWidth: 1.5,
    borderColor: '#bae6fd',
    borderRadius: 10,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  strataInfo: {
    flex: 1,
    paddingRight: 8,
  },
  strataCodeBadge: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0284c7',
    fontFamily: 'monospace',
  },
  strataText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 2,
  },
  strataArrow: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0284c7',
  },
  textArea: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    padding: 10,
    fontSize: 12,
    color: '#0f172a',
    minHeight: 65,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#0284c7',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
});

