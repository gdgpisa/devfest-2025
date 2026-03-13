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

const speakersBySessionizeUUID: Record<string, Speaker> = {}

for (const speaker of rawSpeakers) {
    const id = speaker['Speaker Id']

    console.log(`Processing speaker "${speaker['FirstName']} ${speaker['LastName']}"...`)

    speakersBySessionizeUUID[id] = {
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
            if (speakersBySessionizeUUID[speakerId]) {
                speakersBySessionizeUUID[speakerId].isGDE = true
            }
        }
    }
}

const speakersById = Object.fromEntries(
    Object.values(speakersBySessionizeUUID).map<[string, Speaker]>(speaker => [speaker.id, speaker]),
)

export const SPEAKERS: Speaker[] = Object.values(speakersBySessionizeUUID)

export const TALKS: Talk[] = Object.values(
    Object.fromEntries(
        [
            ...rawSessions.map<Talk>(session => {
                const id = slugify(session['Title'])
                const title = session['Title']
                const description = excelCleanup(session['Description'])

                const category = session['Category']
                const level = session['Level']
                const language = session['Language']

                const room = session['Room']
                const startTime = session['Scheduled At']
                const duration = session['Scheduled Duration'] ?? 0

                const speakers = session['Speaker Ids']
                    .split(', ')
                    .map(speakerId => speakersBySessionizeUUID[speakerId])

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
            }),
            // {
            //     id: 'example-talk-1',
            //     title: 'Example Talk 1',
            //     description: 'This is an example talk description.',
            //     room: 'Aula magna',
            //     category: 'Other',
            //     level: 'example-level',
            //     duration: 25,
            //     language: 'English',
            //     startTime: '2025-04-12T10:00:00Z',

            //     speakers: ['michele-sponsale'].map(id => speakersById[id]),
            // },
        ].map(talk => [talk.id, talk]),
    ),
)

//
// Debugging
//

console.log('Talks & Speakers:')
for (const talk of TALKS) {
    console.log(`> ${talk.id}:`)
    console.log(`  "${talk.title}"`)
    console.log(`  [${talk.category}] [${talk.language}] [${talk.room}] [${talk.startTime}]`)
    console.log(`  ${talk.description.trim().replace(/\n+/g, '  ').slice(0, 100)}...`)
    for (const speaker of talk.speakers) {
        console.log(`  - ${speaker.firstName} ${speaker.lastName} @${speaker.id}`)
    }
    console.log('')
}

// Rooms

// console.log('Rooms:')
// const rooms = [...new Set(TALKS.map(talk => talk.room).filter(room => room !== 'unknown'))]
// for (const room of rooms) {
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
