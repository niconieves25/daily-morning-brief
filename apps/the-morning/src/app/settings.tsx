import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { defaultPreferences, topicOptions, type Preferences } from '@/lib/morning';
import { readPreferences, savePreferences } from '@/lib/preferences';

export default function SettingsScreen() {
  const router = useRouter();
  const [preferences, setPreferences] = useState<Preferences>(defaultPreferences);
  const [saved, setSaved] = useState(false);
  useEffect(() => { readPreferences().then(setPreferences); }, []);

  function toggleTopic(topic: string) {
    setSaved(false);
    setPreferences((current) => ({ ...current, topics: current.topics.includes(topic) ? current.topics.filter((item) => item !== topic) : [...current.topics, topic] }));
  }
  async function save() {
    await savePreferences({ name: preferences.name.trim() || 'Friend', topics: preferences.topics });
    setSaved(true);
    router.back();
  }

  return <ScrollView style={styles.page} contentContainerStyle={styles.content}>
    <LinearGradient colors={['#0c284b', '#060f20', '#050a16']} style={StyleSheet.absoluteFill} />
    <View style={styles.top}><Pressable accessibilityRole="button" onPress={() => router.back()}><Text style={styles.back}>←  BACK TO THE BRIEF</Text></Pressable><Text style={styles.brand}>THE MORNING / YOU</Text></View>
    <View style={styles.main}><Text style={styles.kicker}>YOUR SIGNAL</Text><Text style={styles.title}>Make it yours.</Text><Text style={styles.description}>Start with the things you want to see every morning. Your choices are saved on this device for now.</Text>
      <Text style={styles.label}>WHAT SHOULD WE CALL YOU?</Text>
      <TextInput accessibilityLabel="Your name" value={preferences.name} onChangeText={(name) => { setSaved(false); setPreferences({ ...preferences, name }); }} placeholder="Your name" placeholderTextColor="#7891af" style={styles.input} maxLength={40} autoCapitalize="words" />
      <Text style={styles.label}>WHAT DO YOU WANT TO FOLLOW?</Text>
      <View style={styles.topics}>{topicOptions.map((topic) => <Pressable key={topic} accessibilityRole="checkbox" accessibilityState={{ checked: preferences.topics.includes(topic) }} onPress={() => toggleTopic(topic)} style={[styles.topic, preferences.topics.includes(topic) && styles.topicSelected]}><Text style={[styles.topicText, preferences.topics.includes(topic) && styles.topicTextSelected]}>{topic}</Text><Text style={[styles.topicMark, preferences.topics.includes(topic) && styles.topicTextSelected]}>{preferences.topics.includes(topic) ? '✦' : '+'}</Text></Pressable>)}</View>
      <Pressable accessibilityRole="button" onPress={save} style={styles.save}><Text style={styles.saveText}>Save my morning</Text><Text style={styles.saveText}>↗</Text></Pressable>
      {saved && <Text style={styles.saved}>Saved.</Text>}
      <View style={styles.next}><Text style={styles.nextTitle}>Connections, coming next</Text><Text style={styles.nextText}>Calendar, email, and live news need a secure account service. They are not connected in this prototype.</Text><View style={styles.source}><Text style={styles.sourceText}>CALENDAR</Text><Text style={styles.sourceState}>COMING SOON</Text></View><View style={styles.source}><Text style={styles.sourceText}>EMAIL</Text><Text style={styles.sourceState}>COMING SOON</Text></View><View style={styles.source}><Text style={styles.sourceText}>LIVE NEWS</Text><Text style={styles.sourceState}>COMING SOON</Text></View></View>
    </View>
  </ScrollView>;
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#050c19' }, content: { minHeight: '100%', paddingHorizontal: 30, paddingBottom: 80 }, top: { width: '100%', maxWidth: 1100, alignSelf: 'center', borderBottomWidth: 1, borderBottomColor: '#5079a366', minHeight: 60, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, back: { color: '#a9d3ff', fontSize: 11, fontWeight: '800', letterSpacing: 1 }, brand: { color: '#d9e9fb', fontSize: 11, fontWeight: '800', letterSpacing: 1 }, main: { width: '100%', maxWidth: 740, alignSelf: 'center', paddingTop: 76 }, kicker: { color: '#61a9ff', fontSize: 12, letterSpacing: 1.5, fontWeight: '800' }, title: { color: '#f1f6ff', fontSize: 57, fontWeight: '800', letterSpacing: -3, marginTop: 12 }, description: { color: '#a7bad5', fontSize: 15, lineHeight: 24, maxWidth: 490, marginTop: 17, marginBottom: 54 }, label: { color: '#8fbae9', fontSize: 11, fontWeight: '800', letterSpacing: 1.5, marginBottom: 13, marginTop: 25 }, input: { minHeight: 52, borderBottomWidth: 1, borderBottomColor: '#75b6f6', color: '#f1f6ff', fontSize: 22, fontWeight: '700', paddingHorizontal: 0 }, topics: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 }, topic: { borderWidth: 1, borderColor: '#517da977', paddingHorizontal: 15, paddingVertical: 11, flexDirection: 'row', gap: 18, alignItems: 'center' }, topicSelected: { backgroundColor: '#1d5f99', borderColor: '#86c9ff' }, topicText: { color: '#b2c7e0', fontSize: 13, fontWeight: '700' }, topicTextSelected: { color: '#fff' }, topicMark: { color: '#729ec9', fontSize: 14 }, save: { marginTop: 45, backgroundColor: '#61a9ff', minHeight: 52, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', maxWidth: 240 }, saveText: { color: '#071627', fontSize: 15, fontWeight: '800' }, saved: { color: '#a9d3ff', marginTop: 10 }, next: { marginTop: 93, borderTopWidth: 1, borderTopColor: '#517da977', paddingTop: 23 }, nextTitle: { color: '#e6f1ff', fontSize: 22, fontWeight: '800' }, nextText: { color: '#a7bad5', fontSize: 13, lineHeight: 21, maxWidth: 450, marginTop: 10, marginBottom: 26 }, source: { borderTopWidth: 1, borderTopColor: '#517da955', paddingVertical: 15, flexDirection: 'row', justifyContent: 'space-between' }, sourceText: { color: '#dceaff', fontSize: 11, letterSpacing: 1.2, fontWeight: '800' }, sourceState: { color: '#81a9d6', fontSize: 10, letterSpacing: 1, fontWeight: '700' },
});
