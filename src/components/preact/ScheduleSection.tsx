// import { TALKS, TALKS_TIME_BLOCKS, ROOMS } from '@/lib/sessionize'
import type { Talk } from '@/lib/sessionize'
import clsx from 'clsx'
import { useMemo, useState, type Dispatch, type StateUpdater } from 'preact/hooks'
import {
    MaterialSymbolsBookmarkAddOutlineRounded,
    MaterialSymbolsBookmarkCheckOutlineRounded,
    MaterialSymbolsFilterAltOutline,
} from './icons'

export function getTalkTimeBlocks(talks: Talk[]) {
    return Object.entries(
        talks.reduce<Record<string, Talk[]>>((acc, talk) => {
            if (!talk.startTime || !talk.duration) {
                return acc
            }

            if (!acc[talk.startTime]) {
                acc[talk.startTime] = []
            }
            acc[talk.startTime].push(talk)
            return acc
        }, {}),
    ).sort(([a], [b]) => a.localeCompare(b))
}

function minutes(d: Date) {
    return d.getHours() * 60 + d.getMinutes()
}

const ROOMS = ['Sala Fibonacci', 'Sala Gentili', 'Sala Pacinotti', 'Sala Ricci']

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

type ScheduleSectionProps = {
    talks: Talk[]
}

export const ScheduleSection = ({ talks }: ScheduleSectionProps) => {
    const categories = useMemo(() => [...new Set(talks.map(talk => talk.category))], [talks])

    const levels = useMemo(() => [...new Set(talks.map(talk => talk.level))], [talks])

    const talkTimeBlocks = useMemo(() => getTalkTimeBlocks(talks), [talks])

    const startOffset = new Date('2025-04-12').setHours(8, 30)

    const EXTRA_EVENTS = [
        {
            title: 'Breakfast',
            startTime: new Date(new Date(startOffset).setHours(8, 30)),
            duration: 60,
        },
        {
            title: 'Opening Keynote',
            startTime: new Date(new Date(startOffset).setHours(9, 30)),
            duration: 30,
            room: 'Aula magna',
        },
        {
            title: 'Lunch',
            startTime: new Date(new Date(startOffset).setHours(12, 40)),
            duration: 80,
        },
        {
            title: 'Coffee Break',
            startTime: new Date(new Date(startOffset).setHours(16, 30)),
            duration: 30,
        },
        {
            title: 'Closing Keynote',
            startTime: new Date(new Date(startOffset).setHours(18, 40)),
            duration: 20,
            room: 'Aula magna',
        },
    ]

    const TIME_LABELS = [
        ...talkTimeBlocks.map(([blockStart, talks], i) => ({
            startTime: new Date(blockStart),
            duration: Math.min(
                talks.reduce((acc, talk) => (acc > 0 ? Math.min(acc, talk.duration!) : talk.duration!), 0),
                talkTimeBlocks[i + 1]
                    ? minutes(new Date(talkTimeBlocks[i + 1][0])) - minutes(new Date(blockStart))
                    : Infinity,
            ),
        })),
        ...EXTRA_EVENTS.map(event => ({
            startTime: new Date(event.startTime),
            duration: event.duration,
        })),
    ].sort((a, b) => a.startTime.getTime() - b.startTime.getTime())

    const [selectedTalks, setSelectedTalks] = useLocalStorageState<string[]>('devfest-2025-user-schedule-v1', [])
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
    const [selectedLevel, setSelectedLevel] = useState<string | null>(null)

    const filterCount = (selectedCategory ? 1 : 0) + (selectedLevel ? 1 : 0)

    return (
        <section id="schedule" class="wide">
            <h1>Schedule</h1>

            <div class="schedule-filters" tabIndex={0}>
                <div class="title">
                    <MaterialSymbolsFilterAltOutline width={'1em'} height={'1em'} />
                    Filters<span class="mobile-only">{filterCount > 0 && ` (${filterCount})`}</span>
                    {/* {filterCount > 0 ? `${filterCount} Filter${filterCount > 1 ? 's' : ''} Active` : 'Filters'} */}
                </div>
                <div class="subtitle">Categories</div>
                <div class="filter-buttons">
                    {categories.map(category => (
                        <button
                            class={clsx('chip', {
                                selected: selectedCategory === category,
                                hidden: selectedCategory && selectedCategory !== category,
                            })}
                            onClick={() => {
                                setSelectedCategory(selectedCategory === category ? null : category)
                            }}
                        >
                            {category}
                        </button>
                    ))}
                </div>
                <div class="subtitle">Levels</div>
                <div class="filter-buttons">
                    {levels.map(level => (
                        <button
                            class={clsx('chip', {
                                selected: selectedLevel === level,
                                hidden: selectedLevel && selectedLevel !== level,
                            })}
                            onClick={() => {
                                setSelectedLevel(selectedLevel === level ? null : level)
                            }}
                        >
                            {level}
                        </button>
                    ))}
                </div>
            </div>

            <div
                class="talk-schedule"
                style={{
                    ['--start-offset']: `${minutes(new Date(startOffset))}`,
                }}
            >
                {TIME_LABELS.map(time => (
                    <div
                        class="schedule-cell header-row desktop-only"
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

                {ROOMS.map(room => (
                    <div
                        class="schedule-cell header-column desktop-only"
                        style={{
                            ['--room']: `${ROOMS.indexOf(room)}`,
                        }}
                    >
                        <div class="text">{room}</div>
                    </div>
                ))}

                {[
                    ...talks
                        .filter(talk => !!talk.room)
                        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                        .map(talk => ({
                            startTime: new Date(talk.startTime),
                            element: (
                                <a
                                    class={clsx('schedule-cell', 'interactive', {
                                        selected: selectedTalks.includes(talk.id),
                                        hidden:
                                            (selectedCategory && talk.category !== selectedCategory) ||
                                            (selectedLevel && talk.level !== selectedLevel),
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
                                        <div class="chip mobile-only">
                                            {new Date(talk.startTime).toLocaleTimeString('en-US', {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                hour12: false,
                                            })}
                                        </div>
                                        <div class="chip mobile-only">{talk.room}</div>
                                        <div class="chip">{talk.category}</div>
                                        <div class="chip">{talk.level}</div>
                                        <div class="chip">{talk.duration}m</div>
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
                            ),
                        })),
                    ...EXTRA_EVENTS.map(event => ({
                        startTime: event.startTime,
                        element: (
                            <div
                                class="schedule-cell wide"
                                style={{
                                    ['--start-time']: `${minutes(new Date(event.startTime))}`,
                                    ['--duration']: `${event.duration}`,
                                }}
                            >
                                <div class="title">{event.title}</div>
                                <div class="metadata">
                                    <div class="chip mobile-only">
                                        {event.startTime.toLocaleTimeString('en-US', {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            hour12: false,
                                        })}
                                    </div>
                                    {event.room && <div class="chip">{event.room}</div>}
                                </div>
                            </div>
                        ),
                    })),
                ]
                    .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
                    .map(({ element }) => element)}
            </div>
        </section>
    )
}
