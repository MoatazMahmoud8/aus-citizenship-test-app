import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Animated,
  FlatList,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AZ400_DOMAINS, getAllTopics, MindMapDomain, MindMapNode } from '../../data/az400Topics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Types ───────────────────────────────────────────────────────────────────

type ViewMode = 'overview' | 'domain' | 'search';

interface SelectedTopic {
  id: string;
  label: string;
  emoji?: string;
  color: string;
  description?: string;
  keyPoints?: string[];
  domain?: string;
  weight?: string;
}

// ─── Collapsible Node ────────────────────────────────────────────────────────

interface NodeCardProps {
  node: MindMapNode;
  depth: number;
  onPress: (topic: SelectedTopic) => void;
}

const NodeCard: React.FC<NodeCardProps> = ({ node, depth, onPress }) => {
  const [expanded, setExpanded] = useState(depth === 0);
  const rotation = useRef(new Animated.Value(expanded ? 1 : 0)).current;

  const toggle = () => {
    const toValue = expanded ? 0 : 1;
    Animated.spring(rotation, { toValue, useNativeDriver: true, tension: 80, friction: 10 }).start();
    setExpanded(!expanded);
  };

  const spin = rotation.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '90deg'] });
  const hasChildren = node.children && node.children.length > 0;

  const indent = depth * 16;
  const nodeSize = Math.max(14 - depth, 10);
  const titleSize = Math.max(15 - depth, 12);

  return (
    <View style={{ marginLeft: indent }}>
      <TouchableOpacity
        style={[
          styles.nodeCard,
          {
            borderLeftColor: node.color,
            borderLeftWidth: depth === 0 ? 4 : 3,
            backgroundColor: depth === 0 ? '#fff' : depth === 1 ? '#f8f9ff' : '#f0f4ff',
            marginVertical: depth === 0 ? 4 : 3,
          },
        ]}
        onPress={() => {
          onPress({
            id: node.id,
            label: node.label,
            emoji: node.emoji,
            color: node.color,
            description: node.description,
            keyPoints: node.keyPoints,
          });
          if (hasChildren) toggle();
        }}
        activeOpacity={0.75}
      >
        <View style={styles.nodeHeader}>
          {node.emoji ? (
            <Text style={{ fontSize: nodeSize + 2, marginRight: 8 }}>{node.emoji}</Text>
          ) : (
            <View
              style={[
                styles.nodeDot,
                { backgroundColor: node.color, width: nodeSize - 2, height: nodeSize - 2, borderRadius: (nodeSize - 2) / 2 },
              ]}
            />
          )}
          <Text style={[styles.nodeTitle, { fontSize: titleSize, color: '#1a1a2e', flex: 1 }]} numberOfLines={2}>
            {node.label}
          </Text>
          {hasChildren && (
            <Animated.View style={{ transform: [{ rotate: spin }] }}>
              <Ionicons name="chevron-forward" size={16} color={node.color} />
            </Animated.View>
          )}
          <TouchableOpacity
            style={[styles.infoBtn, { borderColor: node.color }]}
            onPress={() =>
              onPress({
                id: node.id,
                label: node.label,
                emoji: node.emoji,
                color: node.color,
                description: node.description,
                keyPoints: node.keyPoints,
              })
            }
          >
            <Ionicons name="information-circle-outline" size={16} color={node.color} />
          </TouchableOpacity>
        </View>
        {node.description && depth <= 1 && (
          <Text style={styles.nodeDesc} numberOfLines={2}>
            {node.description}
          </Text>
        )}
      </TouchableOpacity>

      {hasChildren && expanded && (
        <View>
          {node.children!.map((child) => (
            <NodeCard key={child.id} node={child} depth={depth + 1} onPress={onPress} />
          ))}
        </View>
      )}
    </View>
  );
};

// ─── Domain Card (Overview) ───────────────────────────────────────────────────

interface DomainCardProps {
  domain: MindMapDomain;
  onExpand: (domain: MindMapDomain) => void;
  onTopicPress: (topic: SelectedTopic) => void;
}

const DomainCard: React.FC<DomainCardProps> = ({ domain, onExpand, onTopicPress }) => {
  const [expanded, setExpanded] = useState(false);

  const countTopics = (nodes: MindMapNode[]): number =>
    nodes.reduce((acc, n) => acc + 1 + (n.children ? countTopics(n.children) : 0), 0);

  const topicCount = countTopics(domain.children);

  return (
    <View style={[styles.domainCard, { borderTopColor: domain.color }]}>
      <TouchableOpacity
        onPress={() => {
          setExpanded(!expanded);
          onExpand(domain);
        }}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[domain.color + '22', domain.color + '08']}
          style={styles.domainHeader}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={{ fontSize: 32, marginRight: 12 }}>{domain.emoji}</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.domainTitle, { color: domain.color }]}>{domain.label}</Text>
            <View style={styles.domainMeta}>
              <View style={[styles.weightBadge, { backgroundColor: domain.color }]}>
                <Text style={styles.weightText}>{domain.weight}</Text>
              </View>
              <Text style={styles.topicCount}>{topicCount} topics</Text>
            </View>
          </View>
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={domain.color}
          />
        </LinearGradient>
      </TouchableOpacity>

      <View style={styles.domainDescRow}>
        <Text style={styles.domainDesc} numberOfLines={expanded ? undefined : 2}>
          {domain.description}
        </Text>
      </View>

      {expanded && (
        <View style={{ paddingHorizontal: 12, paddingBottom: 12 }}>
          {domain.children.map((node) => (
            <NodeCard key={node.id} node={node} depth={0} onPress={onTopicPress} />
          ))}
        </View>
      )}

      <TouchableOpacity
        style={[styles.exploreBtn, { borderColor: domain.color }]}
        onPress={() => onExpand(domain)}
      >
        <Ionicons name="map-outline" size={16} color={domain.color} />
        <Text style={[styles.exploreBtnText, { color: domain.color }]}>Full Mindmap</Text>
      </TouchableOpacity>
    </View>
  );
};

// ─── Detail Modal ─────────────────────────────────────────────────────────────

interface DetailModalProps {
  topic: SelectedTopic | null;
  visible: boolean;
  onClose: () => void;
}

const DetailModal: React.FC<DetailModalProps> = ({ topic, visible, onClose }) => {
  if (!topic) return null;
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalSheet}>
          {/* Handle */}
          <View style={styles.modalHandle} />

          {/* Header */}
          <LinearGradient
            colors={[topic.color + '33', topic.color + '11']}
            style={styles.modalHeaderGrad}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {topic.emoji && <Text style={{ fontSize: 36, marginBottom: 8 }}>{topic.emoji}</Text>}
            <Text style={[styles.modalTitle, { color: topic.color }]}>{topic.label}</Text>
            {topic.weight && (
              <View style={[styles.weightBadge, { backgroundColor: topic.color, marginTop: 8 }]}>
                <Text style={styles.weightText}>Exam Weight: {topic.weight}</Text>
              </View>
            )}
          </LinearGradient>

          <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.modalBody} showsVerticalScrollIndicator={false}>
            {topic.description && (
              <View style={styles.descBox}>
                <Text style={styles.descLabel}>📌 Overview</Text>
                <Text style={styles.descText}>{topic.description}</Text>
              </View>
            )}

            {topic.keyPoints && topic.keyPoints.length > 0 && (
              <View style={styles.keyPointsBox}>
                <Text style={styles.descLabel}>🎯 Key Points to Know</Text>
                {topic.keyPoints.map((point, idx) => (
                  <View key={idx} style={styles.keyPointRow}>
                    <View style={[styles.keyPointDot, { backgroundColor: topic.color }]} />
                    <Text style={styles.keyPointText}>{point}</Text>
                  </View>
                ))}
              </View>
            )}

            {topic.domain && (
              <View style={[styles.domainTag, { borderColor: topic.color }]}>
                <Ionicons name="folder-outline" size={14} color={topic.color} />
                <Text style={[styles.domainTagText, { color: topic.color }]}>{topic.domain}</Text>
              </View>
            )}
          </ScrollView>

          <TouchableOpacity style={[styles.closeBtn, { backgroundColor: topic.color }]} onPress={onClose}>
            <Text style={styles.closeBtnText}>Got it ✓</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// ─── Search Results ────────────────────────────────────────────────────────────

interface SearchResultItem {
  id: string;
  label: string;
  domain: string;
  domainColor: string;
  description?: string;
  keyPoints?: string[];
}

interface SearchViewProps {
  query: string;
  onTopicPress: (topic: SelectedTopic) => void;
}

const SearchView: React.FC<SearchViewProps> = ({ query, onTopicPress }) => {
  const allTopics = getAllTopics();
  const q = query.toLowerCase().trim();
  const results = q.length < 2
    ? []
    : allTopics.filter(
        (t) =>
          t.label.toLowerCase().includes(q) ||
          (t.description && t.description.toLowerCase().includes(q)) ||
          (t.keyPoints && t.keyPoints.some((kp) => kp.toLowerCase().includes(q)))
      );

  if (q.length < 2) {
    return (
      <View style={styles.searchHint}>
        <Text style={{ fontSize: 40 }}>🔍</Text>
        <Text style={styles.searchHintText}>Type at least 2 characters to search topics</Text>
        <Text style={styles.searchHintSub}>Try: "Terraform", "YAML", "Key Vault", "KQL"</Text>
      </View>
    );
  }

  if (results.length === 0) {
    return (
      <View style={styles.searchHint}>
        <Text style={{ fontSize: 40 }}>😕</Text>
        <Text style={styles.searchHintText}>No results for "{query}"</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={results}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ padding: 16 }}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={[styles.searchResultCard, { borderLeftColor: item.domainColor }]}
          onPress={() =>
            onTopicPress({
              id: item.id,
              label: item.label,
              color: item.domainColor,
              description: item.description,
              keyPoints: item.keyPoints,
              domain: item.domain,
            })
          }
          activeOpacity={0.75}
        >
          <Text style={[styles.searchResultLabel, { color: '#1a1a2e' }]}>{item.label}</Text>
          <View style={[styles.searchDomainBadge, { backgroundColor: item.domainColor + '22', borderColor: item.domainColor }]}>
            <Text style={[styles.searchDomainText, { color: item.domainColor }]}>{item.domain}</Text>
          </View>
          {item.description && (
            <Text style={styles.searchResultDesc} numberOfLines={2}>
              {item.description}
            </Text>
          )}
        </TouchableOpacity>
      )}
    />
  );
};

// ─── Main Screen ───────────────────────────────────────────────────────────────

export default function AZ400MindmapScreen() {
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [activeDomain, setActiveDomain] = useState<MindMapDomain | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<SelectedTopic | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);

  const handleTopicPress = useCallback((topic: SelectedTopic) => {
    setSelectedTopic(topic);
    setDetailVisible(true);
  }, []);

  const handleExpandDomain = useCallback((domain: MindMapDomain) => {
    setActiveDomain(domain);
    setViewMode('domain');
  }, []);

  const handleDomainTopicPress = useCallback(
    (topic: SelectedTopic) => {
      setSelectedTopic({ ...topic, domain: activeDomain?.label });
      setDetailVisible(true);
    },
    [activeDomain]
  );

  const renderHeader = () => (
    <LinearGradient
      colors={['#1a1a3e', '#2d2d6e', '#1a1a3e']}
      style={styles.headerGrad}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.headerContent}>
        <View>
          <Text style={styles.headerTitle}>☁️ AZ-400 Mindmap</Text>
          <Text style={styles.headerSub}>Designing & Implementing Microsoft DevOps</Text>
        </View>
        <View style={styles.examBadge}>
          <Text style={styles.examBadgeText}>5 Domains</Text>
          <Text style={styles.examBadgeScore}>700+ to pass</Text>
        </View>
      </View>

      {/* Tab bar */}
      <View style={styles.viewTabs}>
        {[
          { id: 'overview', label: 'Overview', icon: 'grid-outline' },
          { id: 'search', label: 'Search', icon: 'search-outline' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.viewTab, viewMode === tab.id && styles.viewTabActive]}
            onPress={() => setViewMode(tab.id as ViewMode)}
          >
            <Ionicons
              name={tab.icon as any}
              size={16}
              color={viewMode === tab.id ? '#1a1a3e' : '#aac'}
            />
            <Text style={[styles.viewTabText, viewMode === tab.id && styles.viewTabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </LinearGradient>
  );

  // ── Domain Detail View ──
  if (viewMode === 'domain' && activeDomain) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f5ff' }} edges={['bottom']}>
        {renderHeader()}
        <View style={styles.domainDetailHeader}>
          <TouchableOpacity onPress={() => setViewMode('overview')} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={20} color={activeDomain.color} />
            <Text style={[styles.backBtnText, { color: activeDomain.color }]}>All Domains</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          {/* Domain Banner */}
          <LinearGradient
            colors={[activeDomain.color, activeDomain.color + 'AA']}
            style={styles.domainBanner}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={{ fontSize: 48 }}>{activeDomain.emoji}</Text>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.domainBannerTitle}>{activeDomain.label}</Text>
              <Text style={styles.domainBannerWeight}>Exam Weight: {activeDomain.weight}</Text>
            </View>
          </LinearGradient>

          <View style={styles.domainDescCard}>
            <Text style={styles.domainDescCardText}>{activeDomain.description}</Text>
          </View>

          <Text style={styles.sectionLabel}>📍 Topics</Text>
          {activeDomain.children.map((node) => (
            <NodeCard key={node.id} node={node} depth={0} onPress={handleDomainTopicPress} />
          ))}
        </ScrollView>

        <DetailModal
          topic={selectedTopic}
          visible={detailVisible}
          onClose={() => setDetailVisible(false)}
        />
      </SafeAreaView>
    );
  }

  // ── Overview / Search ──
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f5ff' }} edges={['bottom']}>
      {renderHeader()}

      {viewMode === 'search' ? (
        <View style={{ flex: 1 }}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="#666" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search topics, tools, concepts..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="#999" />
              </TouchableOpacity>
            )}
          </View>
          <SearchView query={searchQuery} onTopicPress={handleTopicPress} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          {/* Quick Stats */}
          <View style={styles.statsRow}>
            {[
              { label: 'Domains', value: '5', emoji: '🗂️' },
              { label: 'Topics', value: '50+', emoji: '📌' },
              { label: 'Key Points', value: '200+', emoji: '🎯' },
              { label: 'Score', value: '700', emoji: '🏆' },
            ].map((stat) => (
              <View key={stat.label} style={styles.statCard}>
                <Text style={{ fontSize: 20 }}>{stat.emoji}</Text>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>

          {/* Exam breakdown bar */}
          <View style={styles.breakdownCard}>
            <Text style={styles.breakdownTitle}>📊 Exam Weight Breakdown</Text>
            <View style={styles.breakdownBar}>
              {AZ400_DOMAINS.map((d) => (
                <View
                  key={d.id}
                  style={[
                    styles.breakdownSegment,
                    {
                      flex: d.id === 'domain3' ? 4 : 1.2,
                      backgroundColor: d.color,
                    },
                  ]}
                />
              ))}
            </View>
            <View style={styles.breakdownLegend}>
              {AZ400_DOMAINS.map((d) => (
                <View key={d.id} style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: d.color }]} />
                  <Text style={styles.legendText} numberOfLines={1}>
                    {d.emoji} {d.weight}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Domain Cards */}
          <Text style={styles.sectionLabel}>🗂️ Domains</Text>
          {AZ400_DOMAINS.map((domain) => (
            <DomainCard
              key={domain.id}
              domain={domain}
              onExpand={handleExpandDomain}
              onTopicPress={(topic) =>
                handleTopicPress({ ...topic, domain: domain.label, weight: domain.weight })
              }
            />
          ))}
        </ScrollView>
      )}

      <DetailModal
        topic={selectedTopic}
        visible={detailVisible}
        onClose={() => setDetailVisible(false)}
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Header
  headerGrad: {
    paddingTop: Platform.OS === 'ios' ? 12 : 16,
    paddingHorizontal: 20,
    paddingBottom: 0,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  headerSub: {
    fontSize: 11,
    color: '#aac',
    marginTop: 2,
  },
  examBadge: {
    backgroundColor: '#FFD700',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: 'center',
  },
  examBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1a1a3e',
  },
  examBadgeScore: {
    fontSize: 10,
    color: '#1a1a3e',
    fontWeight: '600',
  },
  viewTabs: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 4,
    marginBottom: 0,
  },
  viewTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 10,
    gap: 4,
  },
  viewTabActive: {
    backgroundColor: '#FFD700',
  },
  viewTabText: {
    fontSize: 13,
    color: '#aac',
    fontWeight: '600',
  },
  viewTabTextActive: {
    color: '#1a1a3e',
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    marginTop: 4,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1a1a3e',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 10,
    color: '#888',
    fontWeight: '600',
  },

  // Breakdown
  breakdownCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  breakdownTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a1a3e',
    marginBottom: 12,
  },
  breakdownBar: {
    flexDirection: 'row',
    height: 14,
    borderRadius: 7,
    overflow: 'hidden',
    gap: 2,
    marginBottom: 10,
  },
  breakdownSegment: {
    height: 14,
    borderRadius: 4,
  },
  breakdownLegend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    color: '#555',
    fontWeight: '600',
    maxWidth: 80,
  },

  // Section label
  sectionLabel: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1a1a3e',
    marginBottom: 12,
    marginTop: 4,
  },

  // Domain Card
  domainCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    borderTopWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
    overflow: 'hidden',
  },
  domainHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  domainTitle: {
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 20,
  },
  domainMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  weightBadge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  weightText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '700',
  },
  topicCount: {
    fontSize: 12,
    color: '#888',
    fontWeight: '600',
  },
  domainDescRow: {
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  domainDesc: {
    fontSize: 13,
    color: '#555',
    lineHeight: 18,
  },
  exploreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    margin: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  exploreBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },

  // Node Card
  nodeCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginVertical: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  nodeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nodeDot: {
    marginRight: 8,
  },
  nodeTitle: {
    fontWeight: '700',
    lineHeight: 18,
  },
  nodeDesc: {
    fontSize: 12,
    color: '#777',
    marginTop: 4,
    lineHeight: 16,
    paddingLeft: 2,
  },
  infoBtn: {
    marginLeft: 8,
    padding: 2,
    borderRadius: 10,
    borderWidth: 1,
  },

  // Domain detail view
  domainDetailHeader: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  backBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },
  domainBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
  },
  domainBannerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
    lineHeight: 24,
  },
  domainBannerWeight: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 4,
    fontWeight: '600',
  },
  domainDescCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  domainDescCardText: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    overflow: 'hidden',
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#ddd',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 4,
  },
  modalHeaderGrad: {
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 26,
  },
  modalBody: {
    padding: 20,
    paddingBottom: 10,
  },
  descBox: {
    backgroundColor: '#f8f9ff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  descLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1a1a3e',
    marginBottom: 8,
  },
  descText: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
  },
  keyPointsBox: {
    backgroundColor: '#f8fff8',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  keyPointRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 8,
  },
  keyPointDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
    flexShrink: 0,
  },
  keyPointText: {
    fontSize: 13,
    color: '#333',
    lineHeight: 19,
    flex: 1,
  },
  domainTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  domainTagText: {
    fontSize: 12,
    fontWeight: '700',
  },
  closeBtn: {
    margin: 20,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  closeBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },

  // Search
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1a1a3e',
  },
  searchHint: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  searchHintText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a3e',
    textAlign: 'center',
    marginTop: 12,
  },
  searchHintSub: {
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
    marginTop: 6,
  },
  searchResultCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  searchResultLabel: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  searchDomainBadge: {
    alignSelf: 'flex-start',
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginBottom: 6,
  },
  searchDomainText: {
    fontSize: 11,
    fontWeight: '700',
  },
  searchResultDesc: {
    fontSize: 12,
    color: '#666',
    lineHeight: 17,
  },
});
