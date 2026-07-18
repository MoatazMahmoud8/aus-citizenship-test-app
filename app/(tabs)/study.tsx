import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Fonts, Spacing, BorderRadius, Shadows } from '../../constants/theme';
import { studySections } from '../../data/studyMaterials';

export default function StudyScreen() {
  const router = useRouter();
  const featuredStudyIds = ['numbers_dates', 'timeline'];
  const featuredSections = studySections.filter((section) =>
    featuredStudyIds.includes(section.id)
  );
  const coreStudySections = studySections.filter(
    (section) => !featuredStudyIds.includes(section.id)
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Study Guide</Text>
        <Text style={styles.headerSubtitle}>
          Learn everything you need to pass the Australian Citizenship Test.
          Content based on the official "Our Common Bond" booklet.
        </Text>
      </View>

      {/* Values Warning */}
      <View style={styles.warningCard}>
        <Ionicons name="warning" size={24} color={Colors.error} />
        <View style={styles.warningContent}>
          <Text style={styles.warningTitle}>Australian Values — Critical Section</Text>
          <Text style={styles.warningText}>
            You must answer ALL 5 values questions correctly to pass, even if your
            overall score is above 75%. Start here!
          </Text>
        </View>
      </View>

      {/* Tips Card */}
      <View style={styles.tipsCard}>
        <Text style={styles.tipsTitle}>💡 Study Tips</Text>
        <View style={styles.tipRow}>
          <Text style={styles.tipBullet}>1.</Text>
          <Text style={styles.tipText}>
            Start with Australian Values — these are the most critical
          </Text>
        </View>
        <View style={styles.tipRow}>
          <Text style={styles.tipBullet}>2.</Text>
          <Text style={styles.tipText}>
            Read each section carefully, paying attention to key facts
          </Text>
        </View>
        <View style={styles.tipRow}>
          <Text style={styles.tipBullet}>3.</Text>
          <Text style={styles.tipText}>
            Take practice quizzes after studying each section
          </Text>
        </View>
        <View style={styles.tipRow}>
          <Text style={styles.tipBullet}>4.</Text>
          <Text style={styles.tipText}>
            Review your wrong answers and re-study those topics
          </Text>
        </View>
        <View style={styles.tipRow}>
          <Text style={styles.tipBullet}>5.</Text>
          <Text style={styles.tipText}>
            Aim for consistent 90%+ scores before taking the real test
          </Text>
        </View>
      </View>

      {/* Quick Memory Hub */}
      <View style={styles.memoryHub}>
        <View style={styles.memoryHubHeader}>
          <View style={styles.memoryHubIcon}>
            <Ionicons name="flash" size={22} color={Colors.white} />
          </View>
          <View style={styles.memoryHubTitleGroup}>
            <Text style={styles.memoryHubEyebrow}>High-yield review</Text>
            <Text style={styles.memoryHubTitle}>Timeline, Numbers & Dates</Text>
          </View>
        </View>

        <Text style={styles.memoryHubText}>
          Review the years, dates, parliament numbers, voting rules, and history
          milestones learners most often mix up.
        </Text>

        <View style={styles.memoryChips}>
          <View style={styles.memoryChip}>
            <Text style={styles.memoryChipValue}>1788</Text>
            <Text style={styles.memoryChipLabel}>First Fleet</Text>
          </View>
          <View style={styles.memoryChip}>
            <Text style={styles.memoryChipValue}>1901</Text>
            <Text style={styles.memoryChipLabel}>Federation</Text>
          </View>
          <View style={styles.memoryChip}>
            <Text style={styles.memoryChipValue}>76</Text>
            <Text style={styles.memoryChipLabel}>Senators</Text>
          </View>
          <View style={styles.memoryChip}>
            <Text style={styles.memoryChipValue}>18+</Text>
            <Text style={styles.memoryChipLabel}>Voting age</Text>
          </View>
        </View>

        <View style={styles.memoryLinks}>
          {featuredSections.map((section) => (
            <TouchableOpacity
              key={section.id}
              style={styles.memoryLink}
              onPress={() => router.push(`/study/${section.id}`)}
              activeOpacity={0.75}
            >
              <View
                style={[
                  styles.memoryLinkIcon,
                  { backgroundColor: `${section.color}18` },
                ]}
              >
                <Ionicons
                  name={section.icon as any}
                  size={20}
                  color={section.color}
                />
              </View>
              <View style={styles.memoryLinkContent}>
                <Text style={styles.memoryLinkTitle}>{section.title}</Text>
                <Text style={styles.memoryLinkSubtitle}>{section.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={Colors.gray} />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Study Sections Grid */}
      <Text style={styles.studyGridTitle}>Study Cards</Text>
      <View style={styles.gridContainer}>
        {coreStudySections.map((section) => (
          <TouchableOpacity
            key={section.id}
            style={styles.gridCard}
            onPress={() => router.push(`/study/${section.id}`)}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.sectionIcon,
                { backgroundColor: `${section.color}15` },
              ]}
            >
              <Ionicons
                name={section.icon as any}
                size={28}
                color={section.color}
              />
            </View>
            <Text style={styles.gridCardTitle}>{section.title}</Text>
            <Text style={styles.gridCardSubtitle}>{section.subtitle}</Text>
            <View style={styles.gridCardMeta}>
              <Text style={styles.gridCardMetaText}>
                {section.content.length} topics
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.offWhite,
  },
  header: {
    padding: Spacing.lg,
  },
  headerTitle: {
    fontSize: Fonts.sizes.xl,
    fontWeight: 'bold',
    color: Colors.charcoal,
    marginBottom: Spacing.sm,
  },
  headerSubtitle: {
    fontSize: Fonts.sizes.sm,
    color: Colors.darkGray,
    lineHeight: 20,
  },
  warningCard: {
    flexDirection: 'row',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    padding: Spacing.md,
    backgroundColor: '#FFF3F3',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  warningContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  warningTitle: {
    fontSize: Fonts.sizes.sm,
    fontWeight: 'bold',
    color: Colors.error,
    marginBottom: 4,
  },
  warningText: {
    fontSize: Fonts.sizes.xs,
    color: Colors.darkGray,
    lineHeight: 18,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
    justifyContent: 'space-between',
  },
  studyGridTitle: {
    fontSize: Fonts.sizes.lg,
    fontWeight: 'bold',
    color: Colors.charcoal,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  gridCard: {
    width: '48%',
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    ...Shadows.small,
  },
  gridCardTitle: {
    fontSize: Fonts.sizes.sm,
    fontWeight: 'bold',
    color: Colors.charcoal,
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  gridCardSubtitle: {
    fontSize: Fonts.sizes.xs,
    color: Colors.gray,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  gridCardMeta: {
    marginTop: Spacing.sm,
  },
  gridCardMetaText: {
    fontSize: Fonts.sizes.xs,
    color: Colors.blue,
    fontWeight: '600',
  },
  sectionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    padding: Spacing.lg,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    ...Shadows.small,
  },
  sectionIcon: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  sectionTitle: {
    fontSize: Fonts.sizes.md,
    fontWeight: 'bold',
    color: Colors.charcoal,
  },
  sectionSubtitle: {
    fontSize: Fonts.sizes.sm,
    color: Colors.gray,
    marginTop: 2,
  },
  sectionMeta: {
    marginTop: Spacing.xs,
  },
  sectionMetaText: {
    fontSize: Fonts.sizes.xs,
    color: Colors.blue,
    fontWeight: '600',
  },
  tipsCard: {
    margin: Spacing.lg,
    padding: Spacing.lg,
    backgroundColor: Colors.lightBlue,
    borderRadius: BorderRadius.lg,
  },
  tipsTitle: {
    fontSize: Fonts.sizes.lg,
    fontWeight: 'bold',
    color: Colors.charcoal,
    marginBottom: Spacing.md,
  },
  tipRow: {
    flexDirection: 'row',
    marginBottom: Spacing.sm,
  },
  tipBullet: {
    fontSize: Fonts.sizes.sm,
    fontWeight: 'bold',
    color: Colors.blue,
    width: 24,
  },
  tipText: {
    flex: 1,
    fontSize: Fonts.sizes.sm,
    color: Colors.darkGray,
    lineHeight: 20,
  },
  memoryHub: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
    backgroundColor: Colors.darkBlue,
    borderRadius: BorderRadius.lg,
    ...Shadows.medium,
  },
  memoryHubHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  memoryHubIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  memoryHubTitleGroup: {
    flex: 1,
  },
  memoryHubEyebrow: {
    fontSize: Fonts.sizes.xs,
    color: Colors.gold,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  memoryHubTitle: {
    fontSize: Fonts.sizes.lg,
    fontWeight: 'bold',
    color: Colors.white,
    marginTop: 2,
  },
  memoryHubText: {
    fontSize: Fonts.sizes.sm,
    color: 'rgba(255,255,255,0.86)',
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  memoryChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  memoryChip: {
    width: '48%',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
  },
  memoryChipValue: {
    fontSize: Fonts.sizes.lg,
    fontWeight: 'bold',
    color: Colors.gold,
  },
  memoryChipLabel: {
    fontSize: Fonts.sizes.xs,
    color: 'rgba(255,255,255,0.78)',
    marginTop: 2,
  },
  memoryLinks: {
    gap: Spacing.sm,
  },
  memoryLink: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
  },
  memoryLinkIcon: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  memoryLinkContent: {
    flex: 1,
  },
  memoryLinkTitle: {
    fontSize: Fonts.sizes.sm,
    fontWeight: 'bold',
    color: Colors.charcoal,
  },
  memoryLinkSubtitle: {
    fontSize: Fonts.sizes.xs,
    color: Colors.gray,
    marginTop: 2,
  },
});
