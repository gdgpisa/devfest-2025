import rawSessions, { type RawSession } from '@/assets/speakers/sessions.json'
import rawSpeakers, { type RawSpeaker } from '@/assets/speakers/speakers.json'

export type Speaker = {
    id: string
    firstName: string
    lastName: string
    tagLine: string
    bio: string
    profilePicture: string
    isGDE: boolean
}

export type Talk = {
    id: string
    title: string
    description: string

    room: string
    category: string
    language: string

    startTime: Date
    duration: number // in minutes

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

const speakerMap: Record<string, Speaker> = {}

for (const speaker of rawSpeakers) {
    const id = speaker['Speaker Id']

    console.log(`Processing speaker "${speaker['FirstName']} ${speaker['LastName']}"...`)

    speakerMap[id] = {
        id: slugify(`${speaker['FirstName']} ${speaker['LastName']}`),
        firstName: speaker['FirstName'],
        lastName: speaker['LastName'],
        tagLine: speaker['TagLine'],
        bio: excelCleanup(speaker['Bio'] ?? ''),
        profilePicture: speaker['Profile Picture'],
        isGDE: false,
    }
}

for (const session of rawSessions) {
    console.log(`Processing talk "${session['Title']}"...`)
    if ((session['Are you a Google employee or GDE?'] ?? '').includes('Yes')) {
        const speakerIds = session['Speaker Ids'].split(', ')
        for (const speakerId of speakerIds) {
            if (speakerMap[speakerId]) {
                speakerMap[speakerId].isGDE = true
            }
        }
    }
}

export const SPEAKERS: Speaker[] = Object.values(speakerMap)

export const TALKS: Talk[] = rawSessions.map(session => {
    const id = slugify(session['Title'])
    const speakers = session['Speaker Ids'].split(', ').map(speakerId => speakerMap[speakerId])
    const description = excelCleanup(session['Description'])
    const title = session['Title']
    const category = session['Category']
    const language = session['Language']

    const room = session['Room']
    const startTime = new Date(session['Scheduled At'])
    const duration = session['Scheduled Duration'] ?? 0

    return {
        id,
        title,
        description,

        room,
        category,
        language,

        startTime,
        duration,

        speakers,
    }
})

for (const talk of TALKS) {
    console.log(`> ${talk.title} (${talk.id})`)
    console.log(`  [${talk.category}] [${talk.language}] [${talk.room}]`)
    for (const speaker of talk.speakers) {
        console.log(`  - ${speaker.firstName} ${speaker.lastName} @${speaker.id}`)
    }
    console.log('')
}
