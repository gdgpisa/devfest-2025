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

declare module '@/assets/speakers/data.json' {
    /*
    {
        "Session Id": 826068,
        "Title": "AI’s Hidden Cost: The Environmental Impact of Machine Learning",
        "Description": "The rise of Generative AI has led us to use tools that are slowly changing how we work._x000D_\n_x000D_\nTraining the AI models demands significant resources, including vast amounts of water and energy. In this talk, we’ll uncover the hidden costs of AI on the environment and discuss solutions that have emerged in recent years. _x000D_\n_x000D_\nJoin me in exploring how to make AI more sustainable and discovering how we can reduce its environmental impact while continuing to advance the field.",
        "Owner": "Luca Corbucci",
        "Owner Email": "corbuccilu@gmail.com",
        "Category": "AI",
        "Session format": "Full (40min)",
        "Session duration (workshops)": "unknown",
        "Level": "Introductory",
        "Language": "English, Italian",
        "Are you a Google employee or GDE?": "No",
        "Country": "Italy",
        "Owner Informed": "2025-02-26T09:49:50.643000",
        "Owner Confirmed": "2025-02-26T10:08:09.363000",
        "Room": "Aula magna",
        "Scheduled At": "2025-04-12T17:50:00",
        "Scheduled Duration": 50.0,
        "Live Link": "unknown",
        "Recording Link": "unknown",
        "Speaker Id": "bc0733bf-ef2a-47ad-aff9-20ce0371d96d",
        "FirstName": "Luca",
        "LastName": "Corbucci",
        "Email": "corbuccilu@gmail.com",
        "TagLine": "Ph.D. candidate in Computer Science, podcaster and community manager ",
        "Bio": "I am a PhD student in Computer Science at the University of Pisa. _x000D_\nMy research focuses on responsible and trustworthy AI. _x000D_\nIn my free time, I am a podcaster and a community manager.",
        "LinkedIn": "https://www.linkedin.com/in/lucacorbucci",
        "Company Website": "unknown",
        "X (Twitter)": "unknown",
        "Blog": "https://lucacorbucci.me",
        "Instagram": "unknown",
        "Facebook": "unknown",
        "Profile Picture": "https://sessionize.com/image/7284-400o400o1-sufvmJZi6ac6kZoaKGkPYJ.jpg"
    }
    
    */

    export type Speaker = {
        'Session Id': number
        'Title': string
        'Description': string
        'Owner': string
        'Owner Email': string
        'Category': string
        'Session format': string
        'Session duration (workshops)': string
        'Level': string
        'Language': string
        'Are you a Google employee or GDE?': string
        'Country': string
        'Owner Informed': string
        'Owner Confirmed': string
        'Room': string
        'Scheduled At': string
        'Scheduled Duration': number
        'Live Link': string
        'Recording Link': string
        'Speaker Id': string
        'FirstName': string
        'LastName': string
        'Email': string
        'TagLine': string
        'Bio': string
        'LinkedIn': string
        'Company Website': string
        'X (Twitter)': string
        'Blog': string
        'Instagram': string
        'Facebook': string
        'Profile Picture': string
    }
    const value: Speaker[]
    export default value
}
