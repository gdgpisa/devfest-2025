declare module '@/sponsors.yaml' {
    export interface Sponsors {
        main?: Sponsor[]
        diamond?: Sponsor[]
        platinum?: Sponsor[]
        gold?: Sponsor[]
        silver?: Sponsor[]
    }

    export interface Sponsor {
        name: string
        logo: string
        url: string
    }

    const value: Sponsors
    export default value
}

declare module '@/assets/gdg-italia/data.yaml' {
    export interface Entry {
        name: string
        logo: string
        url: string
    }

    const value: Entry[]

    export default value
}

declare module '@/assets/media-partners/data.yaml' {
    export interface Entry {
        name: string
        logo: string
        url: string
    }

    const value: Entry[]

    export default value
}

declare module '@/assets/speakers/sessions.json' {
    export type RawSession = {
        'Session Id': number
        'Title': string
        'Description': string
        'Owner': string
        'Owner Email': string
        'Speakers': string
        'Category': string
        'Session format': string
        'Session duration (workshops)': string | null
        'Level': string
        'Language': string
        'Are you a Google employee or GDE?': string
        'Country': string
        'Owner Informed': string
        'Owner Confirmed': string
        'Room': string
        'Scheduled At': string
        'Scheduled Duration': number
        'Live Link': string | null
        'Recording Link': string | null
        'Speaker Ids': string
    }

    const value: RawSession[]
    export default value
}

declare module '@/assets/speakers/speakers.json' {
    export type RawSpeaker = {
        'Speaker Id': string
        'FirstName': string
        'LastName': string
        'Email': string
        'TagLine': string
        'Bio': string
        'LinkedIn': string
        'Company Website': string
        'Instagram': string
        'X (Twitter)': string | null
        'Blog': string | null
        'Facebook': string | null
        'Profile Picture': string
    }

    const value: RawSpeaker[]
    export default value
}
