import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
} from 'react-native';
import { FieldEngineerProfile } from '../types';

interface LoginScreenProps {
  onLoginSuccess: (profile: FieldEngineerProfile) => void;
}

const FIELD_ENGINEERS: FieldEngineerProfile[] = [
  {
    id: 'c0000000-0000-0000-0000-000000000003',
    email: 'engineer.rahul@geotechops.com',
    full_name: 'Rahul Verma',
    role: 'field_engineer',
  },
  {
    id: 'c0000000-0000-0000-0000-000000000004',
    email: 'engineer.priya@geotechops.com',
    full_name: 'Priya Patel',
    role: 'field_engineer',
  },
];

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [selectedUser, setSelectedUser] = useState<FieldEngineerProfile>(FIELD_ENGINEERS[0]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <View style={styles.logoBadge}>
          <Text style={styles.logoText}>TERRA LOG</Text>
        </View>

        <Text style={styles.title}>Mobile Field Terminal</Text>
        <Text style={styles.subtitle}>
          Offline-First Geotechnical Data & Multi-Photo Logging System
        </Text>

        <View style={styles.selectorBox}>
          <Text style={styles.selectorLabel}>SELECT AUTHENTICATED FIELD ENGINEER:</Text>
          {FIELD_ENGINEERS.map((eng) => (
            <TouchableOpacity
              key={eng.id}
              style={[
                styles.engineerOption,
                selectedUser.id === eng.id && styles.engineerOptionSelected,
              ]}
              onPress={() => setSelectedUser(eng)}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{eng.full_name[0]}</Text>
              </View>
              <View style={styles.engineerInfo}>
                <Text style={styles.engineerName}>{eng.full_name}</Text>
                <Text style={styles.engineerEmail}>{eng.email}</Text>
                <Text style={styles.roleBadge}>Role: Field Engineer</Text>
              </View>
              {selectedUser.id === eng.id && (
                <View style={styles.checkPill}>
                  <Text style={styles.checkText}>✓ Active</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.loginBtn}
          onPress={() => onLoginSuccess(selectedUser)}
        >
          <Text style={styles.loginBtnText}>Enter Field Console ➔</Text>
        </TouchableOpacity>

        <View style={styles.footerNote}>
          <Text style={styles.footerText}>
            🔒 Row-Level Security Enabled: You will only access projects and boreholes explicitly assigned by your Office Geotechnical Manager.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  logoBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#0284c7',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 6,
    marginBottom: 12,
  },
  logoText: {
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 12,
    letterSpacing: 1.5,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
    marginBottom: 20,
  },
  selectorBox: {
    marginBottom: 20,
  },
  selectorLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94a3b8',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  engineerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    marginBottom: 10,
    backgroundColor: '#f8fafc',
  },
  engineerOptionSelected: {
    borderColor: '#0284c7',
    backgroundColor: '#f0f9ff',
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  engineerInfo: {
    flex: 1,
  },
  engineerName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  engineerEmail: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 1,
  },
  roleBadge: {
    fontSize: 10,
    color: '#0284c7',
    fontWeight: '700',
    marginTop: 2,
  },
  checkPill: {
    backgroundColor: '#0284c7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  checkText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
  },
  loginBtn: {
    backgroundColor: '#0f172a',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  loginBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  footerNote: {
    marginTop: 16,
    padding: 10,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
  },
  footerText: {
    fontSize: 10,
    color: '#64748b',
    lineHeight: 14,
  },
});

