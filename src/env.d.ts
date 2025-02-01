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
