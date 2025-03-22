import rawSpeakerData, { type Speaker } from '@/assets/speakers/data.json'

const slugify = (str: string) =>
    str
        .replace(/[^a-zA-Z0-9]+/g, '-')
        .toLowerCase()
        .replace(/^-+/, '')
        .replace(/-+$/, '')

const excelCleanup = (str: string) => str.replaceAll('_x000D_', '\n')

export const TALKS_DATA = Object.entries(
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
    .map(([_label, speakers]) => {
        // extract the first valid title from the speakers (in a collab, only one has the title)
        const title = speakers.filter(speaker => speaker['Title'] !== 'unknown')[0]['Title']

        const category = speakers.filter(speaker => speaker['Category'] !== 'unknown')[0]['Category']

        const language = speakers.filter(speaker => speaker['Language'] !== 'unknown')[0]['Language']

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

for (const talk of TALKS_DATA) {
    console.log(`> ${talk.title} (${talk.id})`)
    for (const speaker of talk.speakers) {
        console.log(`  - ${speaker['FirstName']} ${speaker['LastName']} @${speaker.id}`)
    }
}
