import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Image, Platform, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import Svg, { Circle, Line, Path } from 'react-native-svg';
import { chicagoDate, defaultPreferences, issueFor, sampleStories, type Preferences } from '@/lib/morning';
import { readPreferences } from '@/lib/preferences';

const ink = '#eef5ff';
const blue = '#61a9ff';
const dim = '#a7bad5';
const nativeDriver = Platform.OS !== 'web';
const sumNodes = [
  { value: 13, x: 27, y: 21 }, { value: 3, x: 72, y: 21 },
  { value: 1, x: 16, y: 52 }, { value: 8, x: 84, y: 52 },
  { value: 2, x: 30, y: 70 }, { value: 5, x: 70, y: 70 },
];
const orderNodes = [
  { value: 4, x: 27, y: 21 }, { value: 1, x: 72, y: 21 },
  { value: 5, x: 16, y: 52 }, { value: 2, x: 84, y: 52 },
  { value: 3, x: 50, y: 70 },
];
const targets = [16, 3, 13];

function Constellation() {
  const points = useMemo(() => {
    let seed = 2491;
    const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
    return Array.from({ length: 68 }, (_, i) => ({ x: random() * 100, y: random() * 100, r: i % 8 === 0 ? 2.2 : 1.2 }));
  }, []);
  return (
    <Svg pointerEvents="none" style={StyleSheet.absoluteFill} viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
      {points.flatMap((point, i) => points.slice(i + 1).map((next, offset) => {
        const distance = Math.hypot(point.x - next.x, point.y - next.y);
        return distance > 4 && distance < 21
          ? <Line key={`l${i}-${offset}`} x1={point.x} y1={point.y} x2={next.x} y2={next.y} stroke="#326fba" strokeOpacity={0.25} strokeWidth={0.1} /> : null;
      }))}
      {points.map((point, i) => <Circle key={`c${i}`} cx={point.x} cy={point.y} r={point.r / 9} fill="#6ab7ff" opacity={i % 8 === 0 ? 0.65 : 0.3} />)}
    </Svg>
  );
}

function Brand({ name }: { name: string }) {
  return (
    <View style={styles.brandRow}>
      <Svg width={92} height={31} viewBox="0 0 92 31" accessibilityLabel="The Morning horizon mark">
        <Path d="M2 24 L24 10 L38 20 L52 8 L70 22 L84 17 L91 24 Z" fill="#123960" stroke="#58b1ff" strokeWidth="1.1" />
        <Path d="M2 24 Q25 20 38 23 Q54 18 70 23 Q82 20 91 24" fill="none" stroke="#84d9ff" strokeWidth="1" />
        <Circle cx="51" cy="8" r="4" fill="#b8edff" opacity="0.9" />
      </Svg>
      <Text style={styles.brandText}>THE MORNING / {name.toUpperCase()}</Text>
    </View>
  );
}

function DailyFallbackArt({ date }: { date: string }) {
  const seed = [...date].reduce((value, character) => Math.imul(value ^ character.charCodeAt(0), 16777619) >>> 0, 2166136261);
  const mode = seed % 4;
  const phase = (seed % 360) * Math.PI / 180;
  const strands = Array.from({ length: 64 }, (_, i) => {
    const t = i / 63;
    const angle = t * Math.PI * (mode === 1 ? 3.6 : 2.4) + phase;
    const radius = 75 + t * (mode === 2 ? 145 : 95);
    const x1 = 300 + Math.cos(angle) * radius;
    const y1 = 225 + Math.sin(angle) * radius * 0.56;
    const x2 = 300 + Math.cos(angle + 1.1 + mode * 0.18) * (radius + 65);
    const y2 = 225 + Math.sin(angle + 1.1) * (radius + 50) * 0.7;
    const bend = Math.sin(t * Math.PI * (mode + 2) + phase) * 95;
    return <Path key={i} d={`M ${x1.toFixed(1)} ${y1.toFixed(1)} C ${(300 + bend).toFixed(1)} ${(25 + i * 2.6).toFixed(1)}, ${(300 - bend).toFixed(1)} ${(425 - i * 2.6).toFixed(1)}, ${x2.toFixed(1)} ${y2.toFixed(1)}`} fill="none" stroke={i % 3 === 0 ? '#b49aff' : i % 3 === 1 ? '#5bb8ff' : '#9be6ff'} strokeOpacity={0.16 + t * 0.4} strokeWidth={0.7} />;
  });
  return <Svg style={styles.artImage} viewBox="0 0 600 450" accessibilityLabel="Today's date generated line artwork"><Circle cx="300" cy="225" r="125" fill="#3179c4" opacity="0.08" />{strands}</Svg>;
}

function Action({ label, onPress, quiet = false, accessibilityLabel }: { label: string; onPress: () => void; quiet?: boolean; accessibilityLabel?: string }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={accessibilityLabel ?? label} onPress={onPress} style={({ pressed }) => [quiet ? styles.quietAction : styles.action, pressed && styles.pressed]}>
      <Text style={quiet ? styles.quietActionText : styles.actionText}>{label}</Text>
      {!quiet && <View style={styles.signal}><View style={styles.signalBarSmall} /><View style={styles.signalBar} /><View style={styles.signalBarTall} /><View style={styles.signalBarSmall} /></View>}
    </Pressable>
  );
}

export default function MorningScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const [mounted, setMounted] = useState(false);
  const compact = mounted && width < 760;
  const date = chicagoDate();
  const issue = issueFor(date);
  const [preferences, setPreferences] = useState<Preferences>(defaultPreferences);
  const [started, setStarted] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [used, setUsed] = useState<number[]>([]);
  const [progress, setProgress] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [reduceMotion, setReduceMotion] = useState(false);
  const reveal = useRef(new Animated.Value(0)).current;
  const artPulse = useRef(new Animated.Value(0)).current;
  const bodyOpacity = useRef(new Animated.Value(0)).current;
  const nodes = issue.puzzle === 'sum' ? sumNodes : orderNodes;

  useFocusEffect(useCallback(() => { readPreferences().then(setPreferences); }, []));
  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    const listener = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => listener.remove();
  }, []);
  useEffect(() => {
    if (!started) return;
    Animated.timing(reveal, { toValue: 1, duration: reduceMotion ? 0 : 650, useNativeDriver: nativeDriver }).start();
  }, [started, reduceMotion, reveal]);
  useEffect(() => {
    if (!unlocked) return;
    Animated.timing(bodyOpacity, { toValue: 1, duration: reduceMotion ? 0 : 950, useNativeDriver: nativeDriver }).start();
    if (reduceMotion) return;
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(artPulse, { toValue: 1, duration: 2700, useNativeDriver: nativeDriver }),
      Animated.timing(artPulse, { toValue: 0, duration: 2700, useNativeDriver: nativeDriver }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [unlocked, reduceMotion, bodyOpacity, artPulse]);

  function openBrief() {
    setFeedback('Signal decoded. Opening your brief…');
    setTimeout(() => setUnlocked(true), reduceMotion ? 0 : 650);
  }

  function chooseNode(index: number) {
    if (used.includes(index) || unlocked) return;
    if (issue.puzzle === 'sequence') {
      const expected = progress + 1;
      if (nodes[index].value === expected) {
        const next = progress + 1;
        setUsed((current) => [...current, index]);
        setProgress(next);
        setFeedback(next === 5 ? 'Sequence complete.' : `${next} of 5 in place. Find ${next + 1}.`);
        if (next === 5) openBrief();
      } else setFeedback(`Not yet. Find ${expected} next.`);
      return;
    }
    if (selected === null) {
      setSelected(index);
      setFeedback(`Selected ${nodes[index].value}. Find a partner to make ${targets[progress]}.`);
      return;
    }
    if (selected === index) { setSelected(null); setFeedback('Selection cleared.'); return; }
    const sum = nodes[selected].value + nodes[index].value;
    if (sum === targets[progress]) {
      const next = progress + 1;
      setUsed((current) => [...current, selected, index]);
      setSelected(null);
      setProgress(next);
      setFeedback(next === 3 ? 'All three locks open.' : `Lock ${next} opened. Now make ${targets[next]}.`);
      if (next === 3) openBrief();
    } else {
      setSelected(null);
      setFeedback(`${sum} does not make ${targets[progress]}. Try another pair.`);
    }
  }

  function reset() {
    setSelected(null); setUsed([]); setProgress(0);
    setFeedback(issue.puzzle === 'sum' ? 'Make 16 with two numbers.' : 'Find 1, then follow the numbers to 5.');
  }

  const artSource = date === '2026-11-05' ? require('../../assets/artworks/prismatic-loop.png') : require('../../assets/artworks/folded-signal.png');
  const solvedText = issue.puzzle === 'sum' ? `${progress} / 3 locks` : `${progress} / 5 numbers`;

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.pageContent}>
      <LinearGradient colors={['#0a2243', '#061020', '#050a16']} style={StyleSheet.absoluteFill} />
      <Constellation />
      <View style={[styles.shell, compact && styles.shellCompact, { minHeight: mounted ? height : 760 }]}>
        <View style={styles.topBar}>
          <Brand name={preferences.name} />
          {!compact && <Text style={styles.edition}>PERSONAL INTELLIGENCE  /  {issue.date}</Text>}
        </View>
        <View style={[styles.navRow, compact && styles.navRowCompact]}>
          <Text style={[styles.greeting, compact && styles.greetingCompact]}>Good Morning {preferences.name}<Text style={{ color: blue }}>!</Text></Text>
          <View style={[styles.navRight, compact && styles.navRightCompact]}>
            <View><Text style={styles.navLabel}>TODAY</Text><Text style={styles.navValue}>{issue.label}</Text></View>
            <View><Text style={styles.navLabel}>YOUR TOPICS</Text><Text style={styles.navValue}>{preferences.topics.length} selected</Text></View>
            <View><Text style={styles.navLabel}>BRIEF</Text><Text style={styles.navValue}>3 sample notes</Text></View>
            <View><Text style={styles.navLabel}>READ</Text><Text style={styles.navValue}>2 min</Text></View>
            <Pressable accessibilityRole="button" onPress={() => router.push('/settings')}><Text style={styles.settingsLink}>PERSONALIZE  ↗</Text></Pressable>
          </View>
        </View>
        <View style={[styles.hero, compact && styles.heroCompact]}>
          <View style={styles.heroCopy}>
            <Text style={styles.eyebrow}>{unlocked ? 'MORNING DECODED' : issue.puzzle === 'sum' ? 'SUM CIPHER' : 'SIGNAL SEQUENCE'}</Text>
            <Text style={[styles.headline, compact && styles.headlineCompact]}>Decode your <Text style={{ color: blue }}>day.</Text></Text>
            <View style={styles.actionSpace} />
            {!started && !unlocked && <Action label="Start the cipher" onPress={() => { setStarted(true); reset(); }} />}
            {started && !unlocked && <View style={styles.gameActions}><Action label="Skip to brief" quiet onPress={openBrief} /><Action label="Reset puzzle" quiet onPress={reset} /></View>}
            {unlocked && <View style={styles.unlockedActions}><Text style={styles.unlockedTag}>✦  YOUR BRIEF IS OPEN</Text><Action label="Personalize" quiet onPress={() => router.push('/settings')} /></View>}
          </View>
          <View style={[styles.visualSide, compact && styles.visualCompact]}>
            {!unlocked ? (started ? (
              <Animated.View style={[styles.puzzleWrap, { opacity: reveal, transform: [{ scale: reveal.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1] }) }] }]} pointerEvents={started ? 'auto' : 'none'} accessibilityElementsHidden={!started}>
                <LinearGradient colors={['#154f81aa', '#09294466', '#09142433']} style={styles.puzzleWell} />
                <Svg pointerEvents="none" style={StyleSheet.absoluteFill} viewBox="0 0 100 100" preserveAspectRatio="none">
                  <Circle cx="50" cy="50" r="40" stroke="#7ac9ff" strokeOpacity={0.72} strokeWidth="0.34" fill="none" />
                  <Circle cx="50" cy="50" r="33" stroke="#6eb7ec" strokeOpacity={0.38} strokeWidth="0.22" strokeDasharray="1 1.8" fill="none" />
                  <Path d="M50 7 L8 78 L92 78 Z" stroke="#8dd1ff" strokeOpacity="0.62" strokeWidth="0.35" fill="none" />
                  <Path d="M19 48 Q50 17 81 48 M19 60 Q50 87 81 60" stroke="#60aaf1" strokeOpacity="0.34" strokeWidth="0.25" fill="none" />
                </Svg>
                {nodes.map((node, index) => <Pressable key={index} accessibilityRole="button" accessibilityLabel={`${node.value}${used.includes(index) ? ', used' : ''}`} accessibilityState={{ selected: selected === index, disabled: used.includes(index) }} onPress={() => chooseNode(index)} style={[styles.node, { left: `${node.x}%`, top: `${node.y}%` }, used.includes(index) && styles.nodeUsed, selected === index && styles.nodeSelected]}><Text style={styles.nodeText}>{node.value}</Text></Pressable>)}
                <View style={styles.puzzleStatus}><Text style={styles.puzzleStatusTitle}>{issue.puzzle === 'sum' ? 'Open three number locks' : 'Follow the signal in order'}</Text><Text style={styles.puzzleCount}>{solvedText}</Text></View>
                <Text style={styles.puzzleInstruction}>{issue.puzzle === 'sum' ? `Tap two unused numbers that add to ${targets[Math.min(progress, 2)]}.` : 'Tap the numbers from 1 to 5.'}</Text>
                <Text accessibilityLiveRegion="polite" style={styles.feedback}>{feedback}</Text>
                <Pressable accessibilityRole="button" onPress={() => setFeedback(issue.puzzle === 'sum' ? progress === 0 ? 'Hint: begin with 13.' : progress === 1 ? 'Hint: 1 has a small partner.' : 'Hint: use the two remaining numbers.' : `Hint: find ${progress + 1}.`)} style={styles.hintButton}><Text style={styles.hintText}>HINT  ↗</Text></Pressable>
              </Animated.View>
            ) : <View style={styles.puzzleWrap} />) : (
              <Animated.View style={[styles.artWrap, { opacity: bodyOpacity, transform: [{ scale: artPulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.035] }) }] }]}>
                {date === '2026-11-04' || date === '2026-11-05'
                  ? <Image source={artSource} resizeMode="contain" style={styles.artImage} accessibilityLabel={`${issue.art}, today's abstract line artwork`} />
                  : <DailyFallbackArt date={date} />}
                <View style={styles.artCaption}><View><Text style={styles.artTitle}>{issue.art}</Text><Text style={styles.artDetail}>{issue.caption}</Text></View><Text style={styles.artDate}>{issue.date}</Text></View>
              </Animated.View>
            )}
          </View>
        </View>
        <View style={styles.heroFooter}><Text style={styles.footerText}>EDITION {issue.date.slice(5).replace('-', '/')}  ◇  PREPARED FOR {preferences.name.toUpperCase()}</Text><Text style={styles.footerText}>{unlocked ? 'SCROLL TO EXPLORE  ↓' : 'A SMALL RITUAL BEFORE THE DAY  ↓'}</Text></View>
      </View>
      {unlocked && <Animated.View style={[styles.brief, { opacity: bodyOpacity }]}>
        <View style={styles.briefIntro}><Text style={styles.eyebrow}>YOUR SIGNAL / {issue.label.toUpperCase()}</Text><Text style={styles.briefTitle}>A clearer start.</Text><Text style={styles.briefDescription}>This is a sample brief. Choose what you care about now; live news and connected accounts come in a later release.</Text></View>
        <View style={styles.topicRail}>{preferences.topics.map((topic) => <View key={topic} style={styles.topic}><Text style={styles.topicText}>{topic.toUpperCase()}</Text></View>)}</View>
        {sampleStories.map((story, index) => <View key={story.category} style={styles.story}><Text style={styles.storyNumber}>0{index + 1}</Text><View style={styles.storyBody}><Text style={styles.storyCategory}>{story.category}</Text><Text style={styles.storyTitle}>{story.title}</Text><Text style={styles.storyDetail}>{story.detail}</Text></View><Text style={styles.storyGlyph}>↗</Text></View>)}
        <Pressable accessibilityRole="button" onPress={() => router.push('/settings')} style={styles.briefEnd}><Text style={styles.briefEndText}>Make tomorrow yours</Text><Text style={styles.briefEndGlyph}>↗</Text></Pressable>
      </Animated.View>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#050c19' }, pageContent: { minHeight: '100%' },
  shell: { width: '100%', maxWidth: 1440, alignSelf: 'center', paddingHorizontal: 32, paddingBottom: 24 },
  shellCompact: { paddingHorizontal: 20 },
  topBar: { minHeight: 55, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#47719b55' },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 12 }, brandText: { color: ink, fontSize: 11, letterSpacing: 1.2, fontWeight: '800' }, edition: { color: dim, fontSize: 10, letterSpacing: 1.4, fontWeight: '700' },
  navRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', paddingTop: 17, gap: 16 }, greeting: { color: ink, fontSize: 24, fontWeight: '800', letterSpacing: -1.1 }, navRight: { flexDirection: 'row', alignItems: 'center', gap: 27 }, navLabel: { color: '#8fa8c8', fontSize: 9, fontWeight: '800', letterSpacing: 1.4 }, navValue: { color: ink, fontSize: 12, fontWeight: '700', marginTop: 4 }, settingsLink: { color: ink, fontSize: 10, letterSpacing: 1.1, fontWeight: '800' },
  navRowCompact: { flexDirection: 'column', gap: 18 }, greetingCompact: { fontSize: 21 }, navRightCompact: { width: '100%', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' },
  hero: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 24, minHeight: 490 }, heroCompact: { flexDirection: 'column', alignItems: 'stretch', justifyContent: 'center', paddingTop: 60, paddingBottom: 36, gap: 30 }, heroCopy: { flex: 1, maxWidth: 650, paddingLeft: 12 }, eyebrow: { color: blue, fontSize: 14, fontStyle: 'italic', fontWeight: '700', letterSpacing: 0.4 }, headline: { color: ink, fontSize: 70, lineHeight: 77, fontWeight: '800', letterSpacing: -4.5, marginTop: 19 }, headlineCompact: { fontSize: 34, lineHeight: 39, letterSpacing: -2 }, actionSpace: { height: 64 },
  action: { width: 194, minHeight: 45, paddingHorizontal: 17, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: blue }, actionText: { color: '#061323', fontSize: 15, fontStyle: 'italic', fontWeight: '800' }, pressed: { opacity: 0.76 }, quietAction: { paddingVertical: 11, paddingHorizontal: 0, marginRight: 20 }, quietActionText: { color: '#c3dcfb', fontSize: 13, fontWeight: '700', textDecorationLine: 'underline' }, gameActions: { flexDirection: 'row', flexWrap: 'wrap' }, unlockedActions: { flexDirection: 'row', alignItems: 'center', gap: 20 }, unlockedTag: { color: blue, fontSize: 11, letterSpacing: 1.1, fontWeight: '800' }, signal: { flexDirection: 'row', alignItems: 'center', gap: 2 }, signalBarSmall: { width: 2, height: 5, backgroundColor: '#062143' }, signalBar: { width: 2, height: 10, backgroundColor: '#062143' }, signalBarTall: { width: 2, height: 15, backgroundColor: '#062143' },
  visualSide: { flex: 1, minWidth: 330, minHeight: 500, alignItems: 'center', justifyContent: 'center' }, visualCompact: { width: '100%', minWidth: 0, minHeight: 370 }, puzzleWrap: { width: '100%', maxWidth: 570, height: 500, position: 'relative' }, puzzleWell: { position: 'absolute', width: '76%', height: '76%', left: '12%', top: '8%', borderRadius: 250, opacity: 0.8 }, node: { position: 'absolute', width: 48, height: 48, borderWidth: 1.5, borderColor: '#91d6ff', borderRadius: 24, backgroundColor: '#0b2d4de8', alignItems: 'center', justifyContent: 'center', marginLeft: -24, marginTop: -24, shadowColor: blue, shadowOpacity: 0.65, shadowRadius: 14 }, nodeSelected: { borderColor: '#ffffff', backgroundColor: '#2671b9', transform: [{ scale: 1.12 }] }, nodeUsed: { opacity: 0.4 }, nodeText: { color: ink, fontSize: 15, fontWeight: '800' }, puzzleStatus: { position: 'absolute', left: 14, right: 14, bottom: 67, borderTopWidth: 1, borderTopColor: '#8ccaff55', paddingTop: 12, flexDirection: 'row', justifyContent: 'space-between' }, puzzleStatusTitle: { color: ink, fontSize: 14, fontStyle: 'italic', fontWeight: '700' }, puzzleCount: { color: blue, fontSize: 11, fontWeight: '800' }, puzzleInstruction: { position: 'absolute', left: 14, bottom: 44, color: dim, fontSize: 11 }, feedback: { position: 'absolute', left: 14, bottom: 20, color: '#9bceff', fontSize: 11 }, hintButton: { position: 'absolute', right: 16, bottom: 23 }, hintText: { color: blue, fontSize: 10, letterSpacing: 1, fontWeight: '800' },
  artWrap: { width: '100%', maxWidth: 610, height: 520, justifyContent: 'center' }, artImage: { width: '100%', height: 450 }, artCaption: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#7bbaff66', paddingTop: 10, marginTop: -10 }, artTitle: { color: ink, fontSize: 17, fontStyle: 'italic', fontWeight: '700' }, artDetail: { color: dim, fontSize: 11, marginTop: 5 }, artDate: { color: blue, fontSize: 10, fontWeight: '700' },
  heroFooter: { borderTopWidth: 1, borderTopColor: '#47719b55', paddingTop: 13, flexDirection: 'row', justifyContent: 'space-between', gap: 16 }, footerText: { color: '#acc0d9', fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  brief: { width: '100%', maxWidth: 1360, alignSelf: 'center', paddingHorizontal: 44, paddingTop: 94, paddingBottom: 90 }, briefIntro: { maxWidth: 650 }, briefTitle: { color: ink, fontSize: 56, fontWeight: '800', letterSpacing: -3, marginTop: 17 }, briefDescription: { color: dim, fontSize: 15, lineHeight: 24, marginTop: 16 }, topicRail: { flexDirection: 'row', gap: 9, flexWrap: 'wrap', marginTop: 52, marginBottom: 24 }, topic: { borderWidth: 1, borderColor: '#4d82b688', paddingHorizontal: 12, paddingVertical: 7 }, topicText: { color: '#b9d9ff', fontSize: 10, fontWeight: '800', letterSpacing: 1 }, story: { borderTopWidth: 1, borderTopColor: '#47719b55', paddingVertical: 28, flexDirection: 'row', gap: 26 }, storyNumber: { color: blue, fontSize: 12, fontWeight: '800' }, storyBody: { flex: 1 }, storyCategory: { color: blue, fontSize: 10, fontWeight: '800', letterSpacing: 1.4 }, storyTitle: { color: ink, fontSize: 27, fontWeight: '800', letterSpacing: -0.8, marginTop: 9 }, storyDetail: { color: dim, fontSize: 13, lineHeight: 21, marginTop: 9 }, storyGlyph: { color: blue, fontSize: 20 }, briefEnd: { borderTopWidth: 1, borderTopColor: '#47719b55', paddingVertical: 28, flexDirection: 'row', justifyContent: 'space-between' }, briefEndText: { color: ink, fontSize: 20, fontStyle: 'italic', fontWeight: '700' }, briefEndGlyph: { color: blue, fontSize: 24 },
});
