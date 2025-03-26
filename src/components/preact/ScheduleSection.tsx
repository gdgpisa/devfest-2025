import { TALKS, TALKS_TIME_BLOCKS, ROOMS } from '@/lib/sessionize'
import clsx from 'clsx'
import { useState, type Dispatch, type StateUpdater } from 'preact/hooks'

export function MaterialSymbolsBookmarkAddOutlineRounded(props: any) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" {...props}>
            <path
                fill="currentColor"
                d="m12 18l-4.2 1.8q-1 .425-1.9-.162T5 17.975V5q0-.825.588-1.412T7 3h5q.425 0 .713.288T13 4t-.288.713T12 5H7v12.95l5-2.15l5 2.15V12q0-.425.288-.712T18 11t.713.288T19 12v5.975q0 1.075-.9 1.663t-1.9.162zm0-13H7h6zm5 2h-1q-.425 0-.712-.288T15 6t.288-.712T16 5h1V4q0-.425.288-.712T18 3t.713.288T19 4v1h1q.425 0 .713.288T21 6t-.288.713T20 7h-1v1q0 .425-.288.713T18 9t-.712-.288T17 8z"
            ></path>
        </svg>
    )
}

export function MaterialSymbolsBookmarkCheckOutlineRounded(props: any) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" {...props}>
            <path
                fill="currentColor"
                d="m10.95 11.175l-.725-.725q-.3-.275-.7-.275t-.7.3t-.3.7t.3.7l1.4 1.425q.3.3.713.3t.712-.3l3.525-3.55q.3-.3.3-.7t-.3-.7t-.7-.3t-.7.3zM12 18l-4.2 1.8q-1 .425-1.9-.162T5 17.975V5q0-.825.588-1.412T7 3h10q.825 0 1.413.588T19 5v12.975q0 1.075-.9 1.663t-1.9.162zm0-2.2l5 2.15V5H7v12.95zM12 5H7h10z"
            ></path>
        </svg>
    )
}

const startOffset = new Date('2025-04-12').setHours(8, 30)

function minutes(d: Date) {
    return d.getHours() * 60 + d.getMinutes()
}

const EXTRA_EVENTS = [
    {
        title: 'Breakfast',
        startTime: new Date(startOffset).setHours(8, 30),
        duration: 60,
    },
    {
        title: 'Opening Keynote',
        startTime: new Date(startOffset).setHours(9, 30),
        duration: 30,
        room: 'Aula magna',
    },
    {
        title: 'Lunch',
        startTime: new Date(startOffset).setHours(12, 40),
        duration: 80,
    },
    {
        title: 'Coffee Break',
        startTime: new Date(startOffset).setHours(16, 30),
        duration: 30,
    },
    {
        title: 'Closing Keynote',
        startTime: new Date(startOffset).setHours(18, 40),
        duration: 20,
        room: 'Aula magna',
    },
]

const TIME_LABELS = [
    ...TALKS_TIME_BLOCKS.map(([blockStart, talks], i) => ({
        startTime: new Date(blockStart),
        duration: Math.min(
            talks.reduce((acc, talk) => (acc > 0 ? Math.min(acc, talk.duration!) : talk.duration!), 0),
            TALKS_TIME_BLOCKS[i + 1]
                ? minutes(new Date(TALKS_TIME_BLOCKS[i + 1][0])) - minutes(new Date(blockStart))
                : Infinity,
        ),
    })),
    ...EXTRA_EVENTS.map(event => ({
        startTime: new Date(event.startTime),
        duration: event.duration,
    })),
].sort((a, b) => a.startTime.getTime() - b.startTime.getTime())

export function useLocalStorageState<T>(key: string, initialValue: T): [T, Dispatch<StateUpdater<T>>] {
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            const item = localStorage.getItem(key)

            return item ? JSON.parse(item) : initialValue
        } catch (error) {
            console.error(error)
            return initialValue
        }
    })

    const setValue: Dispatch<StateUpdater<T>> = value => {
        try {
            setStoredValue(oldValue => {
                const valueToStore = value instanceof Function ? value(oldValue) : value // Allow value to be a function

                console.log(`Storing value for ${key}:`, valueToStore)

                localStorage.setItem(key, JSON.stringify(valueToStore))
                return valueToStore
            })
        } catch (error) {
            console.error(error)
        }
    }

    return [storedValue, setValue]
}

export const ScheduleSection = ({}) => {
    const [selectedTalks, setSelectedTalks] = useLocalStorageState<string[]>('devfest-2025-user-schedule-v1', [])

    return (
        <section id="schedule" class="wide">
            <h1>Schedule</h1>
            <div
                class="talk-schedule"
                style={{
                    ['--start-offset']: `${minutes(new Date(startOffset))}`,
                }}
            >
                {TIME_LABELS.map(time => (
                    <div
                        class="schedule-cell header"
                        style={{
                            ['--start-time']: `${minutes(time.startTime)}`,
                            ['--duration']: `${time.duration}`,
                        }}
                    >
                        <div class="text">
                            <p>
                                {time.startTime.toLocaleTimeString('en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: false,
                                })}
                            </p>
                        </div>
                    </div>
                ))}
                {TALKS.filter(talk => !!talk.room).map(talk => (
                    <a
                        class={clsx('schedule-cell', 'interactive', {
                            selected: selectedTalks.includes(talk.id),
                        })}
                        style={{
                            ['--start-time']: `${minutes(new Date(talk.startTime!))}`,
                            ['--duration']: `${talk.duration!}`,
                            ['--room']: `${ROOMS.indexOf(talk.room!)}`,
                        }}
                        href={`/talk/${talk.id}`}
                    >
                        <div class="title">{talk.title}</div>

                        <div class="metadata">
                            <div class="chip">{talk.category}</div>
                        </div>

                        <div class="actions">
                            <button
                                class="flat square rounded"
                                onClick={e => {
                                    e.preventDefault()

                                    setSelectedTalks(
                                        selectedTalks.includes(talk.id)
                                            ? selectedTalks.filter(id => id !== talk.id)
                                            : [...selectedTalks, talk.id],
                                    )
                                }}
                            >
                                {selectedTalks.includes(talk.id) ? (
                                    <MaterialSymbolsBookmarkCheckOutlineRounded />
                                ) : (
                                    <MaterialSymbolsBookmarkAddOutlineRounded />
                                )}
                            </button>
                        </div>

                        <div class="speakers">
                            {talk.speakers.map(speaker => (
                                <>
                                    <div class="text">
                                        {speaker.firstName} {speaker.lastName}
                                    </div>
                                    <img
                                        src={speaker.profilePicture}
                                        alt={`${speaker.firstName} ${speaker.lastName}`}
                                    />
                                </>
                            ))}
                        </div>
                    </a>
                ))}

                {EXTRA_EVENTS.map(event => (
                    <div
                        class="schedule-cell wide"
                        style={{
                            ['--start-time']: `${minutes(new Date(event.startTime))}`,
                            ['--duration']: `${event.duration}`,
                        }}
                    >
                        <div class="title">{event.title}</div>
                        {event.room && (
                            <div class="metadata">
                                <div class="chip">{event.room}</div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </section>
    )
}
