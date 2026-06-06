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
import { getQuestionCountByCategory } from '../../data/questionBank';

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

      {/* ===== SMART RESUME CARD ===== */}
      {progress.totalQuizzesTaken > 0 ? (
        <View style={styles.resumeCardSection}>
          <TouchableOpacity 
            style={styles.resumeCard}
            onPress={() => router.push('/quiz?mode=full')}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#0052CC', '#003BA3']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.resumeCardGradient}
            >
              <View style={styles.resumeCardTop}>
                <Text style={styles.resumeCardGreeting}>Welcome Back! 👋</Text>
                <Text style={styles.resumeCardTagline}>Ready to pass the test?</Text>
              </View>

              <View style={styles.resumeCardProgress}>
                <View style={styles.progressBarContainer}>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressBarFill, 
                        { width: `${Math.round(progress.bestScore)}%` }
                      ]} 
                    />
                  </View>
                  <Text style={styles.progressText}>
                    Your best: {Math.round(progress.bestScore)}% • {progress.totalQuizzesTaken} tests taken
                  </Text>
                </View>
              </View>

              <View style={styles.resumeCardCTA}>
                <Text style={styles.resumeCardCTAText}>Start Full Practice Test</Text>
                <Ionicons name="arrow-forward" size={20} color={Colors.white} />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.resumeCardSection}>
          <TouchableOpacity 
            style={styles.resumeCard}
            onPress={() => router.push('/quiz?mode=full')}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#0052CC', '#003BA3']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.resumeCardGradient}
            >
              <View style={styles.resumeCardTop}>
                <Text style={styles.resumeCardGreeting}>Let's Get Started! 🚀</Text>
                <Text style={styles.resumeCardTagline}>Take the full citizenship test</Text>
              </View>

              <View style={styles.resumeCardProgress}>
                <Text style={styles.resumeCardNewUserText}>
                  20 questions • 45 minutes • See how ready you are
                </Text>
              </View>

              <View style={styles.resumeCardCTA}>
                <Text style={styles.resumeCardCTAText}>Start First Test</Text>
                <Ionicons name="arrow-forward" size={20} color={Colors.white} />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      {/* ===== QUICK ACTIONS ===== */}
      <View style={styles.quickActionsSection}>
        <Text style={styles.quickActionsTitle}>More Options</Text>
        
        {/* Full Practice Test - Primary CTA */}
        <TouchableOpacity
          style={styles.actionCardLarge}
          onPress={() => router.push('/quiz?mode=full')}
          activeOpacity={0.85}
        >
          <View style={styles.actionCardLargeContent}>
            <View style={styles.actionCardLargeIcon}>
              <Ionicons name="document-text" size={48} color="#0052CC" />
            </View>
            <View style={styles.actionCardLargeText}>
              <Text style={styles.actionCardLargeTitle}>Full Practice Test</Text>
              <Text style={styles.actionCardLargeSubtitle}>20 questions • 45 minutes</Text>
              <Text style={styles.actionCardLargeDesc}>Complete exam experience</Text>
            </View>
            <Ionicons name="arrow-forward" size={24} color="#0052CC" style={styles.actionCardLargeArrow} />
          </View>
        </TouchableOpacity>

        {/* Quick Actions Grid */}
        <View style={styles.actionCardGrid}>
          {/* Quick Exam */}
          <TouchableOpacity
            style={[styles.actionCardSmall, { borderTopColor: '#FF6B35' }]}
            onPress={() => router.push({
              pathname: '/quiz',
              params: { examId: '-1' }
            })}
            activeOpacity={0.85}
          >
            <Text style={styles.actionCardSmallIcon}>⚡</Text>
            <Text style={styles.actionCardSmallTitle}>Quick Exam</Text>
            <Text style={styles.actionCardSmallSubtitle}>15 questions</Text>
          </TouchableOpacity>

          {/* Study by Topic */}
          <TouchableOpacity
            style={[styles.actionCardSmall, { borderTopColor: '#00843D' }]}
            onPress={() => router.push('/study')}
            activeOpacity={0.85}
          >
            <Ionicons name="library" size={36} color="#00843D" />
            <Text style={styles.actionCardSmallTitle}>Study Topics</Text>
            <Text style={styles.actionCardSmallSubtitle}>Learn material</Text>
          </TouchableOpacity>
        </View>
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

  // ===== SMART RESUME CARD =====
  resumeCardSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  resumeCard: {
    borderRadius: 16,
    overflow: 'hidden',
    ...Shadows.large,
  },
  resumeCardGradient: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  resumeCardTop: {
    marginBottom: 16,
  },
  resumeCardGreeting: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.white,
    marginBottom: 4,
  },
  resumeCardTagline: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '500',
  },
  resumeCardProgress: {
    marginBottom: 18,
  },
  progressBarContainer: {
    gap: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  resumeCardNewUserText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 20,
    fontWeight: '500',
  },
  resumeCardCTA: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  resumeCardCTAText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },

  // ===== QUICK ACTIONS =====
  quickActionsSection: {
    paddingHorizontal: Spacing.lg,
    marginTop: -10,
    marginBottom: Spacing.lg,
  },
  quickActionsTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.charcoal,
    marginBottom: 16,
  },
  
  // Large primary action card
  actionCardLarge: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: Colors.white,
    ...Shadows.medium,
  },
  actionCardLargeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 20,
  },
  actionCardLargeIcon: {
    width: 68,
    height: 68,
    borderRadius: 16,
    backgroundColor: '#E3EFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  actionCardLargeText: {
    flex: 1,
  },
  actionCardLargeTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.charcoal,
    marginBottom: 4,
  },
  actionCardLargeSubtitle: {
    fontSize: 13,
    color: Colors.gray,
    fontWeight: '600',
    marginBottom: 2,
  },
  actionCardLargeDesc: {
    fontSize: 12,
    color: Colors.darkGray,
    fontStyle: 'italic',
  },
  actionCardLargeArrow: {
    marginLeft: 8,
  },

  // Small action cards grid
  actionCardGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  actionCardSmall: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 14,
    borderTopWidth: 4,
    paddingVertical: 18,
    paddingHorizontal: 14,
    alignItems: 'center',
    ...Shadows.small,
  },
  actionCardSmallIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  actionCardSmallTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.charcoal,
    textAlign: 'center',
    marginBottom: 4,
  },
  actionCardSmallSubtitle: {
    fontSize: 11,
    color: Colors.gray,
    textAlign: 'center',
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
});
