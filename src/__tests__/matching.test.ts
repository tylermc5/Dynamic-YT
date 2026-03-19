import { describe, it, expect } from 'vitest'
import { matchVideos } from '@/lib/matching'

// Helper to build a video fixture
function makeVideo(overrides: Record<string, any> = {}) {
  return {
    id: 'vid-1',
    creatorId: 'cr-1',
    title: 'Test Video',
    monthlyViews: 100_000,
    totalViews: 500_000,
    avgWatchThroughRate: 0.65,
    isEvergreen: true,
    dynamicSlotAvailable: true,
    tags: ['tech', 'review'],
    audienceDemographics: {
      ageGroups: { '18-24': 0.3, '25-34': 0.4, '35-44': 0.2, '45-54': 0.1 },
      gender: { male: 60, female: 40 },
      geo: { US: 0.5, UK: 0.2, CA: 0.1 },
    },
    publishedAt: new Date('2024-06-01'),
    creator: {
      id: 'cr-1',
      channelName: 'TechChannel',
      avatarUrl: null,
      subscriberCount: 500_000,
      vertical: 'tech',
      minCpmFloor: 10,
      blockedBrandCategories: [],
    },
    ...overrides,
  }
}

const baseCampaign = {
  vertical: 'tech',
  targetAudienceAgeMin: 18,
  targetAudienceAgeMax: 34,
  targetAudienceGender: 'all' as const,
  targetGeos: ['US'],
  maxCpm: 25,
  brandCategory: 'SaaS',
}

describe('matchVideos', () => {
  it('returns scored videos sorted by matchScore descending', () => {
    const highEngagement = makeVideo({ id: 'v1', avgWatchThroughRate: 0.9 })
    const lowEngagement = makeVideo({ id: 'v2', avgWatchThroughRate: 0.3, isEvergreen: false })

    const results = matchVideos([lowEngagement, highEngagement], baseCampaign)

    expect(results).toHaveLength(2)
    expect(results[0].video.id).toBe('v1')
    expect(results[0].matchScore).toBeGreaterThan(results[1].matchScore)
  })

  it('filters out videos with wrong vertical', () => {
    const wrongVertical = makeVideo({ creator: { ...makeVideo().creator, vertical: 'fitness' } })
    const results = matchVideos([wrongVertical], baseCampaign)
    expect(results).toHaveLength(0)
  })

  it('filters out videos where creator CPM floor exceeds max', () => {
    const expensive = makeVideo({ creator: { ...makeVideo().creator, minCpmFloor: 50 } })
    const results = matchVideos([expensive], baseCampaign)
    expect(results).toHaveLength(0)
  })

  it('filters out videos with blocked brand category', () => {
    const blocked = makeVideo({
      creator: { ...makeVideo().creator, blockedBrandCategories: ['SaaS'] },
    })
    const results = matchVideos([blocked], baseCampaign)
    expect(results).toHaveLength(0)
  })

  it('filters out videos without dynamic slot available', () => {
    const noSlot = makeVideo({ dynamicSlotAvailable: false })
    const results = matchVideos([noSlot], baseCampaign)
    expect(results).toHaveLength(0)
  })

  it('calculates suggestedCpm as midpoint between floor and max', () => {
    const video = makeVideo() // floor = 10, max = 25
    const results = matchVideos([video], baseCampaign)
    expect(results[0].suggestedCpm).toBe(17.5) // (10 + 25) / 2
  })

  it('returns all score components between 0 and 100', () => {
    const results = matchVideos([makeVideo()], baseCampaign)
    const r = results[0]
    expect(r.audienceOverlap).toBeGreaterThanOrEqual(0)
    expect(r.audienceOverlap).toBeLessThanOrEqual(100)
    expect(r.engagementQuality).toBeGreaterThanOrEqual(0)
    expect(r.engagementQuality).toBeLessThanOrEqual(100)
    expect(r.valueScore).toBeGreaterThanOrEqual(0)
    expect(r.valueScore).toBeLessThanOrEqual(100)
  })

  it('gives evergreen videos higher engagement score', () => {
    const evergreen = makeVideo({ isEvergreen: true })
    const notEvergreen = makeVideo({ isEvergreen: false })
    const [eg] = matchVideos([evergreen], baseCampaign)
    const [neg] = matchVideos([notEvergreen], baseCampaign)
    expect(eg.engagementQuality).toBeGreaterThan(neg.engagementQuality)
  })

  it('returns empty array when no videos match', () => {
    expect(matchVideos([], baseCampaign)).toEqual([])
  })

  it('handles null demographics gracefully', () => {
    const noDemos = makeVideo({ audienceDemographics: null })
    const results = matchVideos([noDemos], baseCampaign)
    expect(results).toHaveLength(1)
    expect(results[0].audienceOverlap).toBe(50) // default fallback
  })
})
