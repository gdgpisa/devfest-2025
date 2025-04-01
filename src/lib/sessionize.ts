import rawSessions from '@/assets/speakers/sessions.json'
import rawSpeakers from '@/assets/speakers/speakers.json'

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
    level: string
    language: string

    startTime: string
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
    const title = session['Title']
    const description = excelCleanup(session['Description'])

    const category = session['Category']
    const level = session['Level']
    const language = session['Language']

    const room = session['Room']
    const startTime = session['Scheduled At']
    const duration = session['Scheduled Duration'] ?? 0

    const speakers = session['Speaker Ids'].split(', ').map(speakerId => speakerMap[speakerId])

    return {
        id,
        title,
        description,

        room,
        category,
        level,
        language,

        startTime,
        duration,

        speakers,
    }
})

// export const ROOMS = [...new Set(TALKS.map(talk => talk.room).filter(room => room !== 'unknown'))]
// export const ROOMS = ['Aula magna', 'IWD', 'seconda aula talk', 'terza aula talks']

// Debug

console.log('Speakers:')
for (const talk of TALKS) {
    console.log(`> ${talk.title} (${talk.id})`)
    console.log(`  [${talk.category}] [${talk.language}] [${talk.room}] [${talk.startTime}]`)
    for (const speaker of talk.speakers) {
        console.log(`  - ${speaker.firstName} ${speaker.lastName} @${speaker.id}`)
    }
    console.log('')
}

// Rooms
// console.log('Rooms:')
// for (const room of ROOMS) {
//     console.log(`> ${room}`)
// }

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
