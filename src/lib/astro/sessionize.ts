import rawFeedbackLinks from '@/assets/sessionize/sessionize_feedback_links.json'
import rawSessions from '@/assets/sessionize/sessions.json'
import rawSpeakers from '@/assets/sessionize/speakers.json'

export type Speaker = {
    id: string
    firstName: string
    lastName: string
    tagLine: string
    bio: string
    profilePicture: string
    isGDE: boolean
    isWtmAmbassador: boolean
    isGoogler: boolean
}

export type Talk = {
    id: string
    title: string
    description: string

    room: string
    category: string
    level: string
    language: string
    sessionFormat: string

    /** ISO string */
    scheduledStart: string

    /** Duration in minutes */
    scheduledDuration: number

    workshopColor?: string

    feedbackLink?: string

    speakers: Speaker[]
}

const slugify = (str: string) =>
    str
        .normalize('NFD')
        .replace(/[^a-zA-Z0-9]+/g, '-')
        .toLowerCase()
        .replace(/^-+/, '')
        .replace(/-+$/, '')

const excelCleanup = (str: string) => str.replaceAll('_x000D_', '\n')

// Speakers to exclude
const EXCLUDED_SPEAKERS = new Set([
    // These names must match exactly the "<firstName> <lastName>"
    'Francesco Sciuti',
])

// Remove talks with no room assigned
const rawSessionsAssigned = rawSessions
    .filter(session => {
        const isAccepted = session['Room'] !== null
        if (!isAccepted) {
            console.warn(`Talk "${session['Title']}" has been hidden for now`)
        }
        return isAccepted
    })
    .filter(session => {
        // Remove sessions where all speakers are excluded
        const speakerIds = session['Speaker Ids'].split(', ').filter(id => {
            const speaker = rawSpeakers.find(s => s['Speaker Id'] === id)
            if (!speaker) return true
            const fullName = `${speaker['FirstName']} ${speaker['LastName']}`
            return !EXCLUDED_SPEAKERS.has(fullName)
        })
        const hasValidSpeakers = speakerIds.length > 0
        if (!hasValidSpeakers) {
            console.warn(`Talk "${session['Title']}" has been hidden because all its speakers are excluded`)
        }
        return hasValidSpeakers
    })

const rawSpeakersAssigned = rawSpeakers.filter(speaker => {
    const speakerId = speaker['Speaker Id']
    const fullName = `${speaker['FirstName']} ${speaker['LastName']}`

    // Skip excluded speakers
    if (EXCLUDED_SPEAKERS.has(fullName)) {
        console.warn(`Speaker "${fullName}" has been excluded`)
        return false
    }

    const isAccepted = rawSessionsAssigned.some(session => session['Speaker Ids'].split(', ').includes(speakerId))
    if (!isAccepted) {
        console.warn(`Speaker "${fullName}" has been hidden for now`)
    }
    return isAccepted
})

const speakersBySessionizeUUID: Record<string, Speaker> = {}

for (const speaker of rawSpeakersAssigned) {
    const id = speaker['Speaker Id']

    // console.log(`Processing speaker "${speaker['FirstName']} ${speaker['LastName']}"...`)

    speakersBySessionizeUUID[id] = {
        id: slugify(`${speaker['FirstName']} ${speaker['LastName']}`),
        firstName: speaker['FirstName'],
        lastName: speaker['LastName'],
        tagLine: speaker['TagLine'],
        bio: excelCleanup(speaker['Bio'] ?? ''),
        profilePicture: speaker['Profile Picture'],
        isGDE: false,
        isWtmAmbassador: false,
        isGoogler: false,
    }
}

// the GDE status is only available in the sessions, so we need to loop through the sessions to assign it to the speakers
for (const session of rawSessionsAssigned) {
    // console.log(`Processing talk "${session['Title']}"...`)
    if ((session['Are you a Google employee or GDE?'] ?? '').includes('Yes')) {
        const speakerIds = session['Speaker Ids'].split(', ')
        for (const speakerId of speakerIds) {
            if (speakersBySessionizeUUID[speakerId]) {
                speakersBySessionizeUUID[speakerId].isGDE = true
            }
        }
    }
}

// Set WTM Ambassador status for specific speakers
const WTM_AMBASSADOR_NAMES = new Set([
    // These names must match exactly the "<firstName> <lastName>"
    'Chiara Corrado',
    'Michela Bertaina',
    'Juna Salviati',
    'Nicola Corti',
])

const foundWtmAmbassadors = new Set<string>()
for (const speakerId in speakersBySessionizeUUID) {
    const speaker = speakersBySessionizeUUID[speakerId]
    const fullName = `${speaker.firstName} ${speaker.lastName}`
    if (WTM_AMBASSADOR_NAMES.has(fullName)) {
        speaker.isWtmAmbassador = true
        foundWtmAmbassadors.add(fullName)
    }
}

// Set Googler status for specific speakers
const GOOGLER_NAMES = new Set([
    // These names must match exactly the "<firstName> <lastName>"
    'Cristian Burrini',
    'Daniela Petruzalek',
])

const foundGooglers = new Set<string>()
for (const speakerId in speakersBySessionizeUUID) {
    const speaker = speakersBySessionizeUUID[speakerId]
    const fullName = `${speaker.firstName} ${speaker.lastName}`
    if (GOOGLER_NAMES.has(fullName)) {
        speaker.isGoogler = true
        foundGooglers.add(fullName)
    }
}

export const SPEAKERS: Speaker[] = Object.values(speakersBySessionizeUUID)

/**
 * Session format labels, used to display the session format in a more user-friendly way in talk/[id].astro and in ScheduleSection.tsx
 */
export const SESSION_FORMAT_LABELS: Record<string, { label: string; shortLabel?: string }> = {
    'Short (20min)': { label: '20min', shortLabel: '20m' },
    'Medium (30min)': { label: '30min', shortLabel: '30m' },
    'Full (40min)': { label: '40min', shortLabel: '40m' },
    'Workshop (1+ hr)': { label: '1h30m' },
}

const WORKSHOPS: Record<string, { color: string }> = {
    // Old coloring
    // 'Build a photo restoration app using Genkit Go and Nano Banana Pro': { color: 'red' },
    // 'Costruiamo agenti con ADK-js': { color: 'green' },
    // third workshop coming soon => this orange color(srgb 1 0.68 0.25)

    // New coloring
    'Agentic Apps con Google Gemini SDK e TypeScript': { color: 'red' },
    'Build a photo restoration app using Genkit Go and Nano Banana Pro': { color: 'red' },
    'Costruiamo agenti con ADK-js': { color: 'red' },
}

export const TALKS: Talk[] = [
    ...rawSessionsAssigned.map<Talk>(session => {
        const id = slugify(session['Title'])
        const title = session['Title']
        const description = excelCleanup(session['Description'])

        const category = session['Category']
        const level = session['Level']
        const language = session['Language']
        const sessionFormat = session['Session format']

        const room = session['Room']

        const scheduledStart = session['Scheduled At']
        const scheduledDuration = session['Scheduled Duration'] ?? 0

        const speakers = session['Speaker Ids']
            .split(', ')
            .map(speakerId => speakersBySessionizeUUID[speakerId])
            .filter(Boolean)

        return {
            id,
            title,
            description,

            room,
            category,
            level,
            language,

            sessionFormat,
            scheduledStart,
            scheduledDuration,

            speakers,
        }
    }),
].map(talk => {
    const workshopInfo = WORKSHOPS[talk.title]
    // Find feedback link by matching the talk ID (since feedback IDs are trimmed versions of talk IDs)
    const feedbackEntry = rawFeedbackLinks.find(entry =>
        talk.id.replaceAll('-', '').startsWith(entry.session_name.replaceAll('-', '')),
    )
    const feedbackLink = feedbackEntry?.url

    return {
        ...talk,
        ...(feedbackLink && { feedbackLink }),
        ...(workshopInfo && { workshopColor: workshopInfo.color }),
    }
})

//
// Debugging
//

console.log('Talks & Speakers:')
for (const talk of TALKS) {
    console.log(`> ${talk.id}:`)
    console.log(`  "${talk.title}"`)
    console.log(`  [${talk.category}] [${talk.language}] [${talk.room}] [${talk.scheduledStart}]`)
    console.log(`  ${talk.description.trim().replace(/\n+/g, '  ').slice(0, 100)}...`)
    for (const speaker of talk.speakers) {
        console.log(`  - ${speaker.firstName} ${speaker.lastName} @${speaker.id}`)
    }
    console.log('')
}

console.log(`Total talks: ${TALKS.length}`)
console.log(`Total speakers: ${SPEAKERS.length}`)

// Rooms

console.log('Rooms:')
const rooms = [...new Set(TALKS.map(talk => talk.room).filter(room => room !== 'unknown'))]
for (const room of rooms) {
    console.log(`> ${room}`)
}

// console.log('Talk Durations:')
// const durations = new Set(TALKS.map(talk => talk.scheduledDuration))
// for (const duration of durations) {
//     console.log(`> ${duration} minutes`)
// }
console.log('Session Formats:')
const sessionFormats = new Set(TALKS.map(talk => talk.sessionFormat))
for (const sessionFormat of sessionFormats) {
    console.log(`> ${sessionFormat}`)
}

console.log('Errors:')
const errorTalks = TALKS.filter(
    talk =>
        talk.room === null ||
        talk.room === 'unknown' ||
        talk.scheduledDuration === null ||
        talk.scheduledDuration === 0 ||
        !talk.sessionFormat ||
        !SESSION_FORMAT_LABELS[talk.sessionFormat],
)
if (errorTalks.length === 0) {
    console.log('No errors found!')
} else {
    console.log(`Found ${errorTalks.length} talks with errors:`)
}
errorTalks.forEach(talk => {
    console.log(`> ${talk.title} (${talk.id})`)
    if (talk.room === null || talk.room === 'unknown') {
        console.log('  - Missing or unknown room')
    }
    if (talk.scheduledDuration === null || talk.scheduledDuration === 0) {
        console.log('  - Missing or zero duration')
    }
    if (!talk.sessionFormat) {
        console.log('  - Missing session format')
    }
    if (talk.sessionFormat && !SESSION_FORMAT_LABELS[talk.sessionFormat]) {
        console.log(`  - Unknown session format: "${talk.sessionFormat}"`)
    }
})

console.log('-'.repeat(50))
console.log('WTM Ambassadors Errors:')
const wtmAmbassadorErrors = new Set<string>()
for (const name of WTM_AMBASSADOR_NAMES) {
    if (!foundWtmAmbassadors.has(name)) {
        wtmAmbassadorErrors.add(name)
        console.error(`> WTM Ambassador "${name}" not found in speakers`)
    }
}
if (wtmAmbassadorErrors.size === 0) {
    console.log('> No WTM Ambassador errors found!')
} else {
    console.log(`> Found ${wtmAmbassadorErrors.size} WTM Ambassador errors:`)
    wtmAmbassadorErrors.forEach(name => console.log(`  ${name}`))
}

console.log('-'.repeat(50))
console.log('Googlers Errors:')
const googlerErrors = new Set<string>()
for (const name of GOOGLER_NAMES) {
    if (!foundGooglers.has(name)) {
        googlerErrors.add(name)
        console.error(`> Googler "${name}" not found in speakers`)
    }
}
if (googlerErrors.size === 0) {
    console.log('> No Googler errors found!')
} else {
    console.log(`> Found ${googlerErrors.size} Googler errors:`)
    googlerErrors.forEach(name => console.log(`  ${name}`))
}

console.log('-'.repeat(50))
console.log('Feedback Links Errors:')
const talkIds = new Set(TALKS.map(talk => talk.id))
const feedbackIds = new Set(rawFeedbackLinks.map(entry => entry.session_name))

// Talks with feedback links
const talksWithFeedback = TALKS.filter(talk => talk.feedbackLink)
console.log(`> ${talksWithFeedback.length}/${TALKS.length} talks have feedback links`)

// Talks without feedback links (using startsWith matching)
const talksWithoutFeedback = [...talkIds].filter(
    id => !rawFeedbackLinks.some(entry => id.replaceAll('-', '').startsWith(entry.session_name.replaceAll('-', ''))),
)
// Feedback links without corresponding talks
const orphanedFeedbackLinks = [...feedbackIds].filter(
    fid => !TALKS.some(talk => talk.id.replaceAll('-', '').startsWith(fid.replaceAll('-', ''))),
)

if (talksWithoutFeedback.length === 0 && orphanedFeedbackLinks.length === 0) {
    console.log('> No feedback link errors found!')
} else {
    if (talksWithoutFeedback.length > 0) {
        console.warn(`> Found ${talksWithoutFeedback.length} talks without feedback links:`)
        talksWithoutFeedback.forEach(id => {
            const talk = TALKS.find(t => t.id === id)
            console.warn(`  - ${id}: "${talk?.title}"`)
        })
    }
    if (orphanedFeedbackLinks.length > 0) {
        console.warn(`> Found ${orphanedFeedbackLinks.length} feedback links without corresponding talks:`)
        orphanedFeedbackLinks.forEach(id => console.warn(`  - ${id}`))
    }
}

// const speakersById = Object.fromEntries(
//     Object.values(speakersBySessionizeUUID).map<[string, Speaker]>(speaker => [speaker.id, speaker]),
// )

// console.log('Scheduled Talks:')
// for (const [date, talks] of getTalkTimeBlocks(TALKS)) {
//     console.log(`> ${date}`)
//     for (const talk of talks) {
//         console.log(`  - ${talk.title}`)
//     }
// }

// console.log('Speaker Pictures:')
// for (const speaker of SPEAKERS) {
//     console.log(`${speaker.id}: ${speaker.profilePicture}`)
// }
