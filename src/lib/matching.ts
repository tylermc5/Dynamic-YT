import { Decimal } from '@/generated/prisma/runtime/library'

interface VideoForMatching {
  id: string
  creatorId: string
  title: string
  monthlyViews: number
  totalViews: number
  avgWatchThroughRate: Decimal | number
  isEvergreen: boolean
  dynamicSlotAvailable: boolean
  tags: string[]
  audienceDemographics: any
  publishedAt: Date
  creator: {
    id: string
    channelName: string
    avatarUrl: string | null
    subscriberCount: number
    vertical: string
    minCpmFloor: Decimal | number
    blockedBrandCategories: string[]
  }
}

interface CampaignTargeting {
  vertical: string
  targetAudienceAgeMin: number | null
  targetAudienceAgeMax: number | null
  targetAudienceGender: string
  targetGeos: string[]
  maxCpm: number
  brandCategory: string
}

interface ScoredVideo {
  video: VideoForMatching
  matchScore: number
  audienceOverlap: number
  engagementQuality: number
  valueScore: number
  suggestedCpm: number
}

function calculateAudienceOverlap(
  demographics: any,
  targeting: CampaignTargeting
): number {
  if (!demographics) return 50

  let score = 0
  let factors = 0

  // Age overlap
  if (targeting.targetAudienceAgeMin || targeting.targetAudienceAgeMax) {
    const ageGroups = demographics.ageGroups || {}
    const targetMin = targeting.targetAudienceAgeMin || 0
    const targetMax = targeting.targetAudienceAgeMax || 100
    let overlap = 0

    const ageRanges: Record<string, [number, number]> = {
      '13-17': [13, 17],
      '18-24': [18, 24],
      '25-34': [25, 34],
      '35-44': [35, 44],
      '45-54': [45, 54],
      '55-64': [55, 64],
      '65+': [65, 100],
    }

    for (const [range, [min, max]] of Object.entries(ageRanges)) {
      if (min <= targetMax && max >= targetMin) {
        overlap += (ageGroups[range] || 0)
      }
    }
    score += overlap * 100
    factors++
  }

  // Gender overlap
  if (targeting.targetAudienceGender !== 'all') {
    const genderData = demographics.gender || {}
    const targetPct = genderData[targeting.targetAudienceGender] || 50
    score += targetPct
    factors++
  }

  // Geo overlap
  if (targeting.targetGeos.length > 0) {
    const geoData = demographics.geo || {}
    let geoOverlap = 0
    for (const geo of targeting.targetGeos) {
      geoOverlap += (geoData[geo] || 0)
    }
    score += Math.min(geoOverlap * 100, 100)
    factors++
  }

  if (factors === 0) return 70
  return Math.min(score / factors, 100)
}

function calculateEngagementQuality(video: VideoForMatching): number {
  const watchRate = Number(video.avgWatchThroughRate)
  let score = watchRate * 100

  if (video.isEvergreen) {
    score += 15
  }

  // Penalize declining views
  const ageMonths = Math.max(
    1,
    (Date.now() - new Date(video.publishedAt).getTime()) / (30 * 24 * 60 * 60 * 1000)
  )
  const expectedMonthlyViews = video.totalViews / ageMonths
  if (video.monthlyViews < expectedMonthlyViews * 0.5) {
    score -= 20
  }

  return Math.max(0, Math.min(100, score))
}

function calculateValueScore(
  video: VideoForMatching,
  maxCpm: number
): number {
  const creatorFloor = Number(video.creator.minCpmFloor)

  if (creatorFloor > maxCpm) return 0

  const cpmGap = maxCpm - creatorFloor
  const gapScore = Math.min((cpmGap / maxCpm) * 100, 50)

  const viewsPerDollar = video.monthlyViews / (creatorFloor * (video.monthlyViews / 1000))
  const efficiencyScore = Math.min(viewsPerDollar * 10, 50)

  return Math.min(gapScore + efficiencyScore, 100)
}

export function matchVideos(
  videos: VideoForMatching[],
  targeting: CampaignTargeting
): ScoredVideo[] {
  const filtered = videos.filter((video) => {
    if (video.creator.vertical !== targeting.vertical) return false
    if (Number(video.creator.minCpmFloor) > targeting.maxCpm) return false
    if (video.creator.blockedBrandCategories.includes(targeting.brandCategory)) return false
    if (!video.dynamicSlotAvailable) return false
    return true
  })

  const scored = filtered.map((video) => {
    const audienceOverlap = calculateAudienceOverlap(video.audienceDemographics, targeting)
    const engagementQuality = calculateEngagementQuality(video)
    const valueScore = calculateValueScore(video, targeting.maxCpm)

    const matchScore =
      audienceOverlap * 0.4 +
      engagementQuality * 0.3 +
      valueScore * 0.3

    const creatorFloor = Number(video.creator.minCpmFloor)
    const suggestedCpm = Math.round((creatorFloor + targeting.maxCpm) / 2 * 100) / 100

    return {
      video,
      matchScore: Math.round(matchScore * 100) / 100,
      audienceOverlap: Math.round(audienceOverlap * 100) / 100,
      engagementQuality: Math.round(engagementQuality * 100) / 100,
      valueScore: Math.round(valueScore * 100) / 100,
      suggestedCpm,
    }
  })

  return scored.sort((a, b) => b.matchScore - a.matchScore)
}
