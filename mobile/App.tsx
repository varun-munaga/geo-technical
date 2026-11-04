import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { FieldEngineerProfile, MobileProject, MobileBorehole } from './src/types';
import { LoginScreen } from './src/screens/LoginScreen';
import { ProjectSelectorScreen } from './src/screens/ProjectSelectorScreen';
import { BoreholeLogScreen } from './src/screens/BoreholeLogScreen';
import { SyncQueueScreen } from './src/screens/SyncQueueScreen';

export default function App() {
  const [user, setUser] = useState<FieldEngineerProfile | null>({
    id: 'c0000000-0000-0000-0000-000000000003',
    email: 'engineer.rahul@geotechops.com',
    full_name: 'Rahul Verma',
    role: 'field_engineer',
  });

  const [activeScreen, setActiveScreen] = useState<'projects' | 'log' | 'queue'>('projects');
  const [activeProject, setActiveProject] = useState<MobileProject | null>(null);
  const [activeBorehole, setActiveBorehole] = useState<MobileBorehole | null>(null);

  if (!user) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <LoginScreen onLoginSuccess={(profile) => setUser(profile)} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      {activeScreen === 'projects' && (
        <ProjectSelectorScreen
          user={user}
          onSelectBorehole={(project, borehole) => {
            setActiveProject(project);
            setActiveBorehole(borehole);
            setActiveScreen('log');
          }}
          onOpenQueue={() => setActiveScreen('queue')}
          onLogout={() => setUser(null)}
        />
      )}

      {activeScreen === 'log' && activeProject && activeBorehole && (
        <BoreholeLogScreen
          user={user}
          project={activeProject}
          borehole={activeBorehole}
          onBack={() => setActiveScreen('projects')}
          onEntrySaved={() => setActiveScreen('projects')}
        />
      )}

      {activeScreen === 'queue' && (
        <SyncQueueScreen onBack={() => setActiveScreen('projects')} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
});

