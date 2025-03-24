import rawSpeakerData, { type Speaker } from '@/assets/speakers/data.json'

const slugify = (str: string) =>
    str
        .replace(/[^a-zA-Z0-9]+/g, '-')
        .toLowerCase()
        .replace(/^-+/, '')
        .replace(/-+$/, '')

const excelCleanup = (str: string) => str.replaceAll('_x000D_', '\n')

type Talk = {
    id: string
    title: string
    category: string
    language: string
    description: string
    startTime: string | null
    duration: number | null
    room: string | null
    speakers: ({
        id: string
        bio: string
    } & Speaker)[]
}

export const TALKS_DATA: Talk[] = Object.entries(
    rawSpeakerData
        .filter(speaker => speaker['FirstName'] !== 'unknown')
        .reduce<Record<string, Speaker[]>>((acc, speaker) => {
            // group by company website as talk with multiple speakers are generally from the same company
            const key = speaker['Company Website'] || 'Unknown'
            if (!acc[key]) {
                acc[key] = []
            }

            acc[key].push(speaker)
            return acc
        }, {}),
)
    .flatMap(([companyWebsite, speakers]) =>
        // explode speakers with unknown company that were wrongly grouped together in the previous step
        companyWebsite === 'unknown'
            ? (speakers.map(speaker => [speaker['Title'], [speaker]]) as [string, Speaker[]][])
            : [[companyWebsite, speakers] as [string, Speaker[]]],
    )
    // at this point we have a list of pairs of [label, speakers] for each talk
    .map(([label, speakers]) => {
        console.log(`Talk: ${label}`)

        // extract the first valid title from the speakers (in a collab, only one has the title)
        const title = speakers.filter(speaker => speaker['Title'] !== 'unknown')[0]['Title']

        const category = speakers.filter(speaker => speaker['Category'] !== 'unknown')[0]['Category']

        const language = speakers.filter(speaker => speaker['Language'] !== 'unknown')[0]['Language']

        const startTime = speakers.find(speaker => speaker['Scheduled At'] !== 'unknown')?.['Scheduled At'] ?? null

        const duration = speakers.find(speaker => speaker['Scheduled Duration'] !== 0)?.['Scheduled Duration'] ?? null

        const room = speakers.find(speaker => speaker['Room'] !== 'unknown')?.['Room'] ?? null

        // extract the first valid description and clean it up

        const talkId = slugify(title)

        return {
            id: talkId,

            title,
            category,
            language,
            description: excelCleanup(
                speakers.filter(speaker => speaker['Description'] !== 'unknown')[0]['Description'],
            ),

            startTime,
            duration,
            room,

            speakers: speakers.map(speaker => ({
                ...speaker,

                // patch the correct title for collab speakers
                Title: title,

                id: slugify(`${speaker['FirstName']} ${speaker['LastName']}`),
                bio: excelCleanup(speaker['Bio']),
            })),
        }
    })
    .sort((a, b) => a.title.localeCompare(b.title))

// Time Blocks:
export const TALKS_TIME_BLOCKS = Object.entries(
    TALKS_DATA.reduce<Record<string, Talk[]>>((acc, talk) => {
        if (!talk.startTime || !talk.duration) {
            return acc
        }

        if (!acc[talk.startTime]) {
            acc[talk.startTime] = []
        }

        acc[talk.startTime].push(talk)

        return acc
    }, {}),
).sort(([startA], [startB]) => startA.localeCompare(startB))

// Rooms:
export const ROOMS = [...new Set<string>(TALKS_DATA.flatMap(talk => (talk.room ? [talk.room] : [])))]

// Debugging Stats
{
    console.log(`Rooms (${ROOMS.length}):`)
    for (const room of ROOMS) {
        console.log(`- ${room}`)
    }

    // Talks:
    console.log(`Talks (${TALKS_DATA.length}):`)
    for (const talk of TALKS_DATA) {
        console.log(`- ${talk.title} (${talk.id})`)
        for (const speaker of talk.speakers) {
            console.log(`  - ${speaker['FirstName']} ${speaker['LastName']} @${speaker.id}`)
        }
    }

    console.log(`Time Blocks (${TALKS_TIME_BLOCKS.length}):`)
    for (const [_label, talks] of TALKS_TIME_BLOCKS) {
        console.log(`- ${new Date(talks[0].startTime!).toLocaleTimeString()}`)
        for (const talk of talks) {
            console.log(
                `  - ${new Date(talk.startTime!).toLocaleTimeString()}, ${talk.duration}min (${ROOMS.indexOf(talk.room!)}) - ${talk.title}`,
            )
        }
    }

    // Categories:
    const categories = new Set<string>(TALKS_DATA.flatMap(talk => (talk.category ? [talk.category] : [])))
    console.log(`Categories (${categories.size}):`)
    for (const category of categories) {
        console.log(`- ${category}`)
    }
}
