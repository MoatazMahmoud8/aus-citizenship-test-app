import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Fonts, Spacing, BorderRadius, Shadows } from '../../constants/theme';
import { QUIZ_CONFIG } from '../../constants/types';
import { getProgress } from '../../utils/storage';
import { getTotalQuestionCount, getQuestionCountByCategory } from '../../data/questionBank';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const FLAG_HEIGHT = 200;
const FLAG_WIDTH = SCREEN_WIDTH;

// ===== AUSTRALIAN FLAG COMPONENT =====
const AustralianFlag = React.memo(() => {
  const cantonW = FLAG_WIDTH * 0.5;
  const cantonH = FLAG_HEIGHT * 0.5;
  const stripeW = cantonW * 0.15;

  return (
    <View style={flagStyles.flag}>
      {/* Blue background */}
      <View style={[flagStyles.bg, { backgroundColor: '#00008B' }]} />

      {/* ── Union Jack canton ── */}
      <View style={[flagStyles.canton, { width: cantonW, height: cantonH }]}>
        {/* Blue base */}
        <View style={[StyleSheet.absoluteFill, { backgroundColor: '#00247D' }]} />
        {/* White diagonal cross (saltire) */}
        <View style={[flagStyles.diag, { backgroundColor: '#FFF', transform: [{ rotate: '26.57deg' }], width: cantonW * 1.5, height: stripeW * 0.8, top: cantonH / 2 - stripeW * 0.4, left: -cantonW * 0.25 }]} />
        <View style={[flagStyles.diag, { backgroundColor: '#FFF', transform: [{ rotate: '-26.57deg' }], width: cantonW * 1.5, height: stripeW * 0.8, top: cantonH / 2 - stripeW * 0.4, left: -cantonW * 0.25 }]} />
        {/* Red diagonal cross */}
        <View style={[flagStyles.diag, { backgroundColor: '#CF142B', transform: [{ rotate: '26.57deg' }], width: cantonW * 1.5, height: stripeW * 0.4, top: cantonH / 2 - stripeW * 0.2, left: -cantonW * 0.25 }]} />
        <View style={[flagStyles.diag, { backgroundColor: '#CF142B', transform: [{ rotate: '-26.57deg' }], width: cantonW * 1.5, height: stripeW * 0.4, top: cantonH / 2 - stripeW * 0.2, left: -cantonW * 0.25 }]} />
        {/* White cross */}
        <View style={[flagStyles.crossH, { backgroundColor: '#FFF', height: stripeW * 1.2, top: cantonH / 2 - stripeW * 0.6 }]} />
        <View style={[flagStyles.crossV, { backgroundColor: '#FFF', width: stripeW * 1.2, left: cantonW / 2 - stripeW * 0.6 }]} />
        {/* Red cross */}
        <View style={[flagStyles.crossH, { backgroundColor: '#CF142B', height: stripeW * 0.7, top: cantonH / 2 - stripeW * 0.35 }]} />
        <View style={[flagStyles.crossV, { backgroundColor: '#CF142B', width: stripeW * 0.7, left: cantonW / 2 - stripeW * 0.35 }]} />
      </View>

      {/* ── Commonwealth Star (7-pointed, below canton) ── */}
      <View style={[flagStyles.starWrap, { top: cantonH + (FLAG_HEIGHT - cantonH) / 2 - 14, left: cantonW / 2 - 14 }]}>
        <Text style={flagStyles.bigStar}>✦</Text>
      </View>

      {/* ── Southern Cross (right half) ── */}
      {/* Alpha Crucis (bottom) */}
      <View style={[flagStyles.scStar, { top: FLAG_HEIGHT * 0.78, left: FLAG_WIDTH * 0.72 }]}>
        <Text style={flagStyles.scStarTxt}>✦</Text>
      </View>
      {/* Beta Crucis (left) */}
      <View style={[flagStyles.scStar, { top: FLAG_HEIGHT * 0.48, left: FLAG_WIDTH * 0.6 }]}>
        <Text style={flagStyles.scStarTxt}>✦</Text>
      </View>
      {/* Gamma Crucis (top) */}
      <View style={[flagStyles.scStar, { top: FLAG_HEIGHT * 0.18, left: FLAG_WIDTH * 0.72 }]}>
        <Text style={flagStyles.scStarTxt}>✦</Text>
      </View>
      {/* Delta Crucis (right) */}
      <View style={[flagStyles.scStar, { top: FLAG_HEIGHT * 0.42, left: FLAG_WIDTH * 0.84 }]}>
        <Text style={flagStyles.scStarTxt}>✦</Text>
      </View>
      {/* Epsilon Crucis (small, centre-right) */}
      <View style={[flagStyles.scStarSm, { top: FLAG_HEIGHT * 0.56, left: FLAG_WIDTH * 0.76 }]}>
        <Text style={flagStyles.scStarSmTxt}>✦</Text>
      </View>
    </View>
  );
});

const flagStyles = StyleSheet.create({
  flag: {
    width: FLAG_WIDTH,
    height: FLAG_HEIGHT,
    position: 'relative',
    overflow: 'hidden',
  },
  bg: {
    ...StyleSheet.absoluteFillObject,
  },
  canton: {
    position: 'absolute',
    top: 0,
    left: 0,
    overflow: 'hidden',
  },
  diag: {
    position: 'absolute',
  },
  crossH: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  crossV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
  },
  starWrap: {
    position: 'absolute',
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bigStar: {
    fontSize: 28,
    color: '#FFF',
    textShadowColor: 'rgba(255,255,255,0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  scStar: {
    position: 'absolute',
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scStarTxt: {
    fontSize: 18,
    color: '#FFF',
    textShadowColor: 'rgba(255,255,255,0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  scStarSm: {
    position: 'absolute',
    width: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scStarSmTxt: {
    fontSize: 12,
    color: '#FFF',
    textShadowColor: 'rgba(255,255,255,0.4)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 3,
  },
});

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [progress, setProgress] = useState({
    totalQuizzesTaken: 0,
    averageScore: 0,
    bestScore: 0,
    currentStreak: 0,
  });

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = useCallback(async () => {
    const p = await getProgress();
    setProgress({
      totalQuizzesTaken: p.totalQuizzesTaken,
      averageScore: p.averageScore,
      bestScore: p.bestScore,
      currentStreak: p.currentStreak,
    });
  }, []);

  const totalQuestions = useMemo(() => getTotalQuestionCount(), []);
  const categoryCounts = useMemo(() => getQuestionCountByCategory(), []);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* ===== HERO WITH AUSTRALIAN FLAG ===== */}
      <View style={[styles.heroWrap, { paddingTop: insets.top }]}>
        {/* Dark blue background behind everything */}
        <LinearGradient
          colors={['#000C2D', '#001245', '#00008B']}
          style={StyleSheet.absoluteFill}
        />

        {/* The actual Australian Flag */}
        <View style={styles.flagContainer}>
          <AustralianFlag />
          {/* Soft fade at bottom of flag */}
          <LinearGradient
            colors={['transparent', 'rgba(0,12,45,0.7)', '#000C2D']}
            style={styles.flagFade}
          />
        </View>

        {/* Content overlay below/over the flag */}
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>ACE</Text>
          <Text style={styles.heroTitleGold}>AU Citizenship Exam</Text>

          {/* Gold divider */}
          <View style={styles.goldDivider}>
            <View style={styles.goldLine} />
            <Text style={styles.goldStar}>★</Text>
            <View style={styles.goldLine} />
          </View>

          <Text style={styles.heroSubtitle}>
            Based on "Our Common Bond"{"\n"}the official resource booklet
          </Text>

          {/* Aussie icons */}
          <View style={styles.iconRow}>
            {['🦘', '🏛️', '🌏', '🐨', '🦅'].map((e, i) => (
              <View key={i} style={styles.iconCircle}>
                <Text style={styles.iconEmoji}>{e}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* ===== START PRACTICE TEST BUTTON ===== */}
      <TouchableOpacity
        style={styles.startButton}
        onPress={() => router.push('/quiz')}
        activeOpacity={0.85}
      >
        <LinearGradient
          colors={['#00843D', '#006B31', '#005A2A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.startButtonGradient}
        >
          <View style={styles.startButtonIcon}>
            <Ionicons name="play" size={22} color={Colors.white} />
          </View>
          <View style={styles.startButtonText}>
            <Text style={styles.startButtonTitle}>Start Practice Test</Text>
            <Text style={styles.startButtonSubtitle}>
              {QUIZ_CONFIG.TOTAL_QUESTIONS} questions · {QUIZ_CONFIG.PASS_MARK_PERCENT}% to pass
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color="rgba(255,255,255,0.7)" />
        </LinearGradient>
      </TouchableOpacity>

      {/* ===== ENHANCED WELCOME BANNER ===== */}
      <View style={styles.welcomeCard}>
        <LinearGradient
          colors={['#1A472A', '#00843D', '#005A2A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.welcomeBannerGradient}
        >
          <View style={styles.welcomeHeader}>
            <Text style={styles.welcomeEmoji}>🎯</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.welcomeTitle}>Welcome, Future Citizen!</Text>
              <Text style={styles.welcomeDesc}>
                Prepare for your Australian Citizenship Test with {totalQuestions} real exam-style questions.
              </Text>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* ===== TEST FORMAT INFO ===== */}
      <View style={styles.infoCard}>
        <View style={styles.infoHeader}>
          <View style={styles.infoIconCircle}>
            <Ionicons name="document-text" size={20} color={Colors.blue} />
          </View>
          <Text style={styles.infoTitle}>Official Test Format</Text>
        </View>

        <View style={styles.infoGrid}>
          <View style={styles.infoGridItem}>
            <LinearGradient colors={['#002B7F', '#0048CC']} style={styles.infoGridBadge}>
              <Text style={styles.infoGridNumber}>20</Text>
            </LinearGradient>
            <Text style={styles.infoGridLabel}>Questions</Text>
          </View>
          <View style={styles.infoGridItem}>
            <LinearGradient colors={['#00843D', '#00A84D']} style={styles.infoGridBadge}>
              <Text style={styles.infoGridNumber}>75%</Text>
            </LinearGradient>
            <Text style={styles.infoGridLabel}>Pass mark</Text>
          </View>
          <View style={styles.infoGridItem}>
            <LinearGradient colors={['#DC3545', '#E85565']} style={styles.infoGridBadge}>
              <Text style={styles.infoGridNumber}>5/5</Text>
            </LinearGradient>
            <Text style={styles.infoGridLabel}>Values{'\n'}required</Text>
          </View>
          <View style={styles.infoGridItem}>
            <LinearGradient colors={['#495057', '#6C757D']} style={styles.infoGridBadge}>
              <Text style={styles.infoGridNumber}>45m</Text>
            </LinearGradient>
            <Text style={styles.infoGridLabel}>Time limit</Text>
          </View>
        </View>
      </View>

      {/* ===== QUICK STATS ===== */}
      {progress.totalQuizzesTaken > 0 && (
        <View style={styles.statsCard}>
          <View style={styles.infoHeader}>
            <View style={[styles.infoIconCircle, { backgroundColor: Colors.lightGold }]}>
              <Ionicons name="trending-up" size={20} color="#B8860B" />
            </View>
            <Text style={styles.infoTitle}>Your Progress</Text>
          </View>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{progress.totalQuizzesTaken}</Text>
              <Text style={styles.statLabel}>Tests{'\n'}Taken</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{Math.round(progress.averageScore)}%</Text>
              <Text style={styles.statLabel}>Average{'\n'}Score</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: Colors.green }]}>{Math.round(progress.bestScore)}%</Text>
              <Text style={styles.statLabel}>Best{'\n'}Score</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{progress.currentStreak}🔥</Text>
              <Text style={styles.statLabel}>Day{'\n'}Streak</Text>
            </View>
          </View>
        </View>
      )}

      {/* ===== STUDY CATEGORIES ===== */}
      <View style={styles.sectionHeader}>
        <View style={[styles.infoIconCircle, { backgroundColor: Colors.lightGreen }]}>
          <Ionicons name="library" size={18} color={Colors.green} />
        </View>
        <Text style={styles.sectionTitle}>Study Categories</Text>
      </View>

      <View style={styles.categoryGrid}>
        {[
          {
            icon: 'heart' as const,
            color: Colors.valuesColor,
            bgColor: '#FDECEA',
            title: 'Australian Values',
            count: categoryCounts.australian_values,
            route: '/study/values' as const,
            badge: '⚠️ Must get ALL correct',
            emoji: '❤️',
          },
          {
            icon: 'globe' as const,
            color: Colors.australiaColor,
            bgColor: Colors.lightBlue,
            title: 'Australia & Its People',
            count: categoryCounts.australia_and_its_people,
            route: '/study/australia_people' as const,
            emoji: '🌏',
          },
          {
            icon: 'shield-checkmark' as const,
            color: Colors.democraticColor,
            bgColor: Colors.lightGreen,
            title: 'Democratic Beliefs',
            count: categoryCounts.democratic_beliefs,
            route: '/study/democratic' as const,
            emoji: '🛡️',
          },
          {
            icon: 'business' as const,
            color: Colors.governmentColor,
            bgColor: Colors.lightGold,
            title: 'Government & Law',
            count: categoryCounts.government_and_law,
            route: '/study/government' as const,
            emoji: '🏛️',
          },
        ].map((cat, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.categoryCard}
            onPress={() => router.push(cat.route)}
            activeOpacity={0.7}
          >
            <View style={[styles.categoryIconBg, { backgroundColor: cat.bgColor }]}>
              <Text style={{ fontSize: 24 }}>{cat.emoji}</Text>
            </View>
            <View style={styles.categoryContent}>
              <Text style={styles.categoryTitle}>{cat.title}</Text>
              <Text style={styles.categoryCount}>{cat.count} questions</Text>
              {cat.badge && (
                <View style={[styles.categoryBadge, { backgroundColor: '#FDECEA' }]}>
                  <Text style={[styles.categoryBadgeText, { color: Colors.valuesColor }]}>{cat.badge}</Text>
                </View>
              )}
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.gray} />
          </TouchableOpacity>
        ))}
      </View>

      {/* ===== QUESTION BANK INFO ===== */}
      <View style={styles.bankInfo}>
        <LinearGradient
          colors={['#002B7F', '#0048CC']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.bankInfoGradient}
        >
          <Text style={styles.bankInfoEmoji}>📚</Text>
          <View>
            <Text style={styles.bankInfoNumber}>{totalQuestions}</Text>
            <Text style={styles.bankInfoLabel}>Real exam-style practice questions</Text>
          </View>
        </LinearGradient>
      </View>

      {/* ===== LAST MINUTE STUDY - MOST REPEATED QUESTIONS ===== */}
      <View style={styles.sectionHeader}>
        <View style={[styles.infoIconCircle, { backgroundColor: '#FFE8CC' }]}>
          <Ionicons name="flash" size={18} color="#E85D2A" />
        </View>
        <Text style={styles.sectionTitle}>Last Minute Study</Text>
      </View>

      <View style={styles.lastMinuteCard}>
        <View style={styles.lastMinuteHeader}>
          <Text style={styles.lastMinuteEmoji}>⚡</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.lastMinuteTitle}>Most Repeated Exam Questions</Text>
            <Text style={styles.lastMinuteDesc}>
              Review the questions that appear most frequently in the Australian Citizenship Test.
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.lastMinuteButton}
          onPress={() => router.push('/practice')}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={['#E85D2A', '#C94A1F']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.lastMinuteButtonGradient}
          >
            <Text style={styles.lastMinuteButtonFireEmoji}>🔥</Text>
            <Text style={styles.lastMinuteButtonText}>Start Review</Text>
            <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.7)" />
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* ===== LAST UPDATED ===== */}
      <View style={styles.lastUpdated}>
        <View style={styles.lastUpdatedInner}>
          <Ionicons name="checkmark-circle" size={18} color="#00843D" />
          <Text style={styles.lastUpdatedText}>Questions last updated: <Text style={styles.lastUpdatedDate}>June 2026</Text></Text>
        </View>
      </View>

      {/* ===== DISCLAIMER ===== */}
      <View style={styles.disclaimer}>
        <View style={styles.disclaimerHeader}>
          <Ionicons name="information-circle" size={18} color="#8B6914" />
          <Text style={styles.disclaimerTitle}>⚠️ Unofficial Study Aid — Not a Government App</Text>
        </View>
        <Text style={styles.disclaimerText}>
          This app is an independent study tool and is NOT affiliated with,
          endorsed by, or connected to the Australian Government or the
          Department of Home Affairs. Content is based on the publicly available
          "Australian Citizenship: Our Common Bond" booklet.
        </Text>
        <TouchableOpacity
          style={styles.disclaimerLink}
          onPress={() => Linking.openURL('https://immi.homeaffairs.gov.au/citizenship/test-and-interview/our-common-bond')}
        >
          <Ionicons name="globe-outline" size={14} color="#00843D" />
          <Text style={styles.disclaimerLinkText}>Official source: immi.homeaffairs.gov.au</Text>
          <Ionicons name="open-outline" size={13} color="#00843D" />
        </TouchableOpacity>
      </View>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F2F5',
  },

  // ===== HERO =====
  heroWrap: {
    position: 'relative',
    overflow: 'hidden',
  },
  flagContainer: {
    position: 'relative',
  },
  flagFade: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: FLAG_HEIGHT * 0.5,
  },
  heroContent: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 30,
    marginTop: -20,
  },
  heroTitle: {
    fontSize: 30,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  heroTitleGold: {
    fontSize: 30,
    fontWeight: '900',
    color: '#FFD700',
    textAlign: 'center',
    letterSpacing: 0.5,
    marginBottom: 10,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  goldDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '55%',
    marginBottom: 10,
  },
  goldLine: {
    flex: 1,
    height: 1.5,
    backgroundColor: 'rgba(255,215,0,0.5)',
  },
  goldStar: {
    fontSize: 14,
    color: '#FFD700',
    marginHorizontal: 8,
  },
  heroSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 14,
  },
  iconRow: {
    flexDirection: 'row',
    gap: 10,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconEmoji: {
    fontSize: 18,
  },

  // ===== START BUTTON =====
  startButton: {
    marginHorizontal: Spacing.lg,
    marginTop: -18,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#00843D',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 10,
  },
  startButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  startButtonIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  startButtonText: {
    flex: 1,
    marginLeft: 14,
  },
  startButtonTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
  },
  startButtonSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },

  // ===== WELCOME CARD =====
  welcomeCard: {
    marginHorizontal: Spacing.lg,
    marginTop: 20,
    borderRadius: 16,
    overflow: 'hidden',
    ...Shadows.medium,
  },
  welcomeBannerGradient: {
    padding: 20,
    borderRadius: 16,
  },
  welcomeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  welcomeEmoji: {
    fontSize: 40,
  },
  welcomeTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.white,
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  welcomeDesc: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 18,
    fontWeight: '500',
  },

  // ===== INFO CARD =====
  infoCard: {
    margin: Spacing.lg,
    padding: 20,
    backgroundColor: Colors.white,
    borderRadius: 16,
    ...Shadows.medium,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    gap: 10,
  },
  infoIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.lightBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.charcoal,
  },
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoGridItem: {
    alignItems: 'center',
    flex: 1,
  },
  infoGridBadge: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  infoGridNumber: {
    color: Colors.white,
    fontWeight: '800',
    fontSize: 16,
  },
  infoGridLabel: {
    fontSize: 11,
    color: Colors.darkGray,
    textAlign: 'center',
    lineHeight: 14,
  },

  // ===== STATS =====
  statsCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    padding: 20,
    backgroundColor: Colors.white,
    borderRadius: 16,
    ...Shadows.medium,
  },
  statsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 36,
    backgroundColor: Colors.lightGray,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.blue,
  },
  statLabel: {
    fontSize: 11,
    color: Colors.gray,
    marginTop: 4,
    textAlign: 'center',
    lineHeight: 14,
  },

  // ===== SECTIONS =====
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.lg,
    marginBottom: 14,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.charcoal,
  },

  // ===== CATEGORIES =====
  categoryGrid: {
    paddingHorizontal: Spacing.lg,
  },
  categoryCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    ...Shadows.small,
  },
  categoryIconBg: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryContent: {
    flex: 1,
    marginLeft: 14,
  },
  categoryTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.charcoal,
  },
  categoryCount: {
    fontSize: 12,
    color: Colors.gray,
    marginTop: 2,
  },
  categoryBadge: {
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },

  // ===== BANK INFO =====
  bankInfo: {
    marginHorizontal: Spacing.lg,
    marginTop: 6,
    marginBottom: Spacing.lg,
    borderRadius: 14,
    overflow: 'hidden',
  },
  bankInfoGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    gap: 14,
  },
  bankInfoEmoji: {
    fontSize: 32,
  },
  bankInfoNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.white,
  },
  bankInfoLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 1,
  },

  // ===== LAST UPDATED =====
  lastUpdated: {
    marginHorizontal: Spacing.lg,
    marginBottom: 16,
  },
  lastUpdatedInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#E8F5EC',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#B8DFCA',
  },
  lastUpdatedText: {
    fontSize: 13,
    color: '#2D6B45',
  },
  lastUpdatedDate: {
    fontWeight: '700',
    color: '#00843D',
  },

  // ===== DISCLAIMER =====
  disclaimer: {
    marginHorizontal: Spacing.lg,
    padding: 16,
    backgroundColor: '#FFF8E0',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F0DFA0',
  },
  disclaimerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  disclaimerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8B6914',
  },
  disclaimerText: {
    fontSize: 12,
    color: '#6B5A10',
    lineHeight: 18,
  },
  disclaimerLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0DFA0',
  },
  disclaimerLinkText: {
    fontSize: 12,
    color: '#00843D',
    fontWeight: '600',
    flex: 1,
  },

  // ===== LAST MINUTE STUDY =====
  lastMinuteCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    padding: 18,
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#E85D2A',
    ...Shadows.medium,
  },
  lastMinuteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 14,
  },
  lastMinuteEmoji: {
    fontSize: 32,
  },
  lastMinuteTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.charcoal,
    marginBottom: 2,
  },
  lastMinuteDesc: {
    fontSize: 12,
    color: Colors.gray,
    lineHeight: 17,
  },
  lastMinuteButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  lastMinuteButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 8,
  },
  lastMinuteButtonFireEmoji: {
    fontSize: 18,
  },
  lastMinuteButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.white,
  },
});
