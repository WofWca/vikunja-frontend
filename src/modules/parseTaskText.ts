import {parseDate} from '../helpers/time/parseDate'
import {PRIORITIES} from '@/constants/priorities'
import {REPEAT_TYPES, type IRepeatAfter, type IRepeatType} from '@/types/IRepeatAfter'
import {getQuickAddMagicMode} from '@/helpers/quickAddMagicMode'

const VIKUNJA_PREFIXES: Prefixes = {
	label: '*',
	project: '+',
	priority: '!',
	assignee: '@',
}

const TODOIST_PREFIXES: Prefixes = {
	label: '@',
	project: '#',
	priority: '!',
	assignee: '+',
}

export enum PrefixMode {
	Disabled = 'disabled',
	Default = 'vikunja',
	Todoist = 'todoist',
}

export const PREFIXES = {
	[PrefixMode.Disabled]: undefined,
	[PrefixMode.Default]: VIKUNJA_PREFIXES,
	[PrefixMode.Todoist]: TODOIST_PREFIXES,
}

interface repeatParsedResult {
	textWithoutMatched: string,
	repeats: IRepeatAfter | null,
}

export interface ParsedTaskText {
	text: string,
	date: Date | null,
	labels: string[],
	project: string | null,
	priority: number | null,
	assignees: string[],
	repeats: IRepeatAfter | null,
}

interface Prefixes {
	label: string,
	project: string,
	priority: string,
	assignee: string,
}

/**
 * Parses task text for dates, assignees, labels, projects, priorities and returns an object with all found intents.
 *
 * @param text
 */
export const parseTaskText = (text: string, prefixesMode: PrefixMode = PrefixMode.Default): ParsedTaskText => {
	const result: ParsedTaskText = {
		text: text,
		date: null,
		labels: [],
		project: null,
		priority: null,
		assignees: [],
		repeats: null,
	}

	const prefixes = PREFIXES[prefixesMode]
	if (prefixes === undefined) {
		return result
	}

	result.labels = getLabelsFromPrefix(text, prefixes.label) ?? []
	result.text = cleanupItemText(result.text, result.labels, prefixes.label)

	result.project = getProjectFromPrefix(result.text, prefixes.project)
	result.text = result.project !== null ? cleanupItemText(result.text, [result.project], prefixes.project) : result.text

	result.priority = getPriority(result.text, prefixes.priority)
	result.text = result.priority !== null ? cleanupItemText(result.text, [String(result.priority)], prefixes.priority) : result.text

	result.assignees = getItemsFromPrefix(result.text, prefixes.assignee)

	const {textWithoutMatched, repeats} = getRepeats(result.text)
	result.text = textWithoutMatched
	result.repeats = repeats

	const {newText, date} = parseDate(result.text)
	result.text = newText
	result.date = date

	return cleanupResult(result, prefixes)
}

const getItemsFromPrefix = (text: string, prefix: string): string[] => {
	const items: string[] = []

	const itemParts = text.split(' ' + prefix)
	if (text.startsWith(prefix)) {
		const firstItem = text.split(prefix)[1]
		itemParts.unshift(firstItem)
	}

	itemParts.forEach((p, index) => {
		// First part contains the rest
		if (index < 1) {
			return
		}

		p = p.replace(prefix, '')

		let itemText
		if (p.charAt(0) === '\'') {
			itemText = p.split('\'')[1]
		} else if (p.charAt(0) === '"') {
			itemText = p.split('"')[1]
		} else {
			// Only until the next space
			itemText = p.split(' ')[0]
		}
		
		if(itemText !== '')  {
			items.push(itemText)
		}
	})

	return Array.from(new Set(items))
}

export const getProjectFromPrefix = (text: string, projectPrefix: string | null = null): string | null => {
	if (projectPrefix === null) {
		const prefixes = PREFIXES[getQuickAddMagicMode()]
		if (prefixes === undefined) {
			return null
		}
		projectPrefix = prefixes.project
	}
	const projects: string[] = getItemsFromPrefix(text, projectPrefix)
	return projects.length > 0 ? projects[0] : null
}

export const getLabelsFromPrefix = (text: string, projectPrefix: string | null = null): string[] | null => {
	if (projectPrefix === null) {
		const prefixes = PREFIXES[getQuickAddMagicMode()]
		if (prefixes === undefined) {
			return null
		}
		projectPrefix = prefixes.label
	}
	return getItemsFromPrefix(text, projectPrefix)
}

const getPriority = (text: string, prefix: string): number | null => {
	const ps = getItemsFromPrefix(text, prefix)
	if (ps.length === 0) {
		return null
	}

	for (const p of ps) {
		for (const pi of Object.values(PRIORITIES)) {
			if (pi === parseInt(p)) {
				return parseInt(p)
			}
		}
	}

	return null
}

const getRepeats = (text: string): repeatParsedResult => {
	const regex = /((every|each) (([0-9]+|one|two|three|four|five|six|seven|eight|nine|ten) )?(hours?|days?|weeks?|months?|years?))|anually|bianually|semiannually|biennially|daily|hourly|monthly|weekly|yearly/ig
	const results = regex.exec(text)
	if (results === null) {
		return {
			textWithoutMatched: text,
			repeats: null,
		}
	}

	let amount = 1
	switch (results[3] ? results[3].trim() : undefined) {
		case 'one':
			amount = 1
			break
		case 'two':
			amount = 2
			break
		case 'three':
			amount = 3
			break
		case 'four':
			amount = 4
			break
		case 'five':
			amount = 5
			break
		case 'six':
			amount = 6
			break
		case 'seven':
			amount = 7
			break
		case 'eight':
			amount = 8
			break
		case 'nine':
			amount = 9
			break
		case 'ten':
			amount = 10
			break
		default:
			amount = results[3] ? parseInt(results[3]) : 1
	}
	let type: IRepeatType = REPEAT_TYPES.Hours

	switch (results[0]) {
		case 'biennially':
			type = REPEAT_TYPES.Years
			amount = 2
			break
		case 'bianually':
		case 'semiannually':
			type = REPEAT_TYPES.Months
			amount = 6
			break
		case 'yearly':
		case 'anually':
			type = REPEAT_TYPES.Years
			break
		case 'daily':
			type = REPEAT_TYPES.Days
			break
		case 'hourly':
			type = REPEAT_TYPES.Hours
			break
		case 'monthly':
			type = REPEAT_TYPES.Months
			break
		case 'weekly':
			type = REPEAT_TYPES.Weeks
			break
		default:
			switch (results[5]) {
				case 'hour':
				case 'hours':
					type = REPEAT_TYPES.Hours
					break
				case 'day':
				case 'days':
					type = REPEAT_TYPES.Days
					break
				case 'week':
				case 'weeks':
					type = REPEAT_TYPES.Weeks
					break
				case 'month':
				case 'months':
					type = REPEAT_TYPES.Months
					break
				case 'year':
				case 'years':
					type = REPEAT_TYPES.Years
					break
			}
	}

	return {
		textWithoutMatched: text.replace(results[0], ''),
		repeats: {
			amount,
			type,
		},
	}
}

export const cleanupItemText = (text: string, items: string[], prefix: string): string => {
	items.forEach(l => {
		text = text
			.replace(`${prefix}'${l}' `, '')
			.replace(`${prefix}'${l}'`, '')
			.replace(`${prefix}"${l}" `, '')
			.replace(`${prefix}"${l}"`, '')
			.replace(`${prefix}${l} `, '')
			.replace(`${prefix}${l}`, '')
	})
	return text
}

const cleanupResult = (result: ParsedTaskText, prefixes: Prefixes): ParsedTaskText => {
	result.text = cleanupItemText(result.text, result.labels, prefixes.label)
	result.text = result.project !== null ? cleanupItemText(result.text, [result.project], prefixes.project) : result.text
	result.text = result.priority !== null ? cleanupItemText(result.text, [String(result.priority)], prefixes.priority) : result.text
	// Not removing assignees to avoid removing @text where the user does not exist
	result.text = result.text.trim()

	return result
}
