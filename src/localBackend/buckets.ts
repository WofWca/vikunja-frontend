import type { IBucket } from '@/modelTypes/IBucket'
import { getTasksOfBucket } from './tasks'
import { defaultPositionIfZero } from './utils/calculateDefaultPosition'

// TODO_OFFLINE there is a lot of duplication between `localBackend` parts.

type IBucketWithoutTasks = Omit<IBucket, 'tasks'>

// Be carefult not to convert it to `const initialBuckets =` since we need to return a new
// array each time to avoid getting it mutated.
// The actual backend actually only creates one bucket by default.
function getInitialBuckets(): IBucketWithoutTasks[] {
	return [
		{
			id: 1,
			title: 'Backlog',
			projectId: 1,
			limit: 0,
			isDoneBucket: false,
			position: 65536,
			createdBy: {
				id: 1,
				name: '',
				username: 'demo',
				created: '2021-05-30T10:45:25+02:00',
				updated: '2023-03-16T11:55:59+01:00',
			},
		},
		{
			id: 2,
			title: 'In progress',
			projectId: 1,
			limit: 0,
			isDoneBucket: false,
			position: 131072,
			createdBy: {
				id: 1,
				name: '',
				username: 'demo',
				created: '2021-05-30T10:45:25+02:00',
				updated: '2023-03-16T11:55:59+01:00',
			},
		},
		{
			id: 3,
			title: 'Done',
			projectId: 1,
			limit: 0,
			isDoneBucket: true,
			position: 262144,
			createdBy: {
				id: 1,
				name: '',
				username: 'demo',
				created: '2021-05-30T10:45:25+02:00',
				updated: '2023-03-16T11:55:59+01:00',
			},
		},
	]
}

function getAllBucketsWithoutTasks(): IBucketWithoutTasks[] {
	const fromStorage = localStorage.getItem('buckets')
	if (!fromStorage) {
		// TODO_OFFLINE dynamic import.
		// Currently we have a constant list. Each project must have at least one bucket
		return getInitialBuckets()
	}
	// TODO_OFFLINE fill the `tasks`.
	return JSON.parse(fromStorage)
}

// /**
//  * Mutates `bucket` and returns it.
//  */
// function fillBucketTasks(bucket: IBucketWithoutTasks): IBucket {
//   (bucket as IBucket).tasks = getAllTas
// }

function getAllBuckets(): IBucket[] {
	const bucketsWithoutTasks = getAllBucketsWithoutTasks()
	const buckets = bucketsWithoutTasks.map(bucketWithoutTasks => {
		const b = bucketWithoutTasks as IBucket
		b.tasks = getTasksOfBucket(b.id)
			// Tasks are always sorted by their `kanbanPosition`.
			// https://kolaente.dev/vikunja/api/src/commit/6d8db0ce1e00e8c200a43b28ac98eb0fb825f4d4/pkg/models/kanban.go#L173-L178
			.sort((a, b) => a.kanbanPosition - b.kanbanPosition)
		return b
	})
	return buckets
}

export function getAllBucketsOfProject(projectId: number): IBucket[] {
	// TODO_OFFLINE filter by position bruh.
	// TODO_OFFLINE perf: maybe it's not worth getting tasks of each project then in `getAllBuckets`.
	return getAllBuckets()
		.filter(b => b.projectId === projectId)
		// Buckets are always sorted.
		// https://kolaente.dev/vikunja/api/src/commit/6d8db0ce1e00e8c200a43b28ac98eb0fb825f4d4/pkg/models/kanban.go#L139-L143
		.sort((a, b) => a.position - b.position)
}

/** https://kolaente.dev/vikunja/api/src/commit/769db0dab2e50bc477dec6c7e18309effc80a1bd/pkg/models/kanban.go#L80-L87 */
export function getDefaultBucket(projectId: number): IBucket {
	return getAllBucketsOfProject(projectId).sort((a, b) => a.position - b.position)[0]
}

/**
 * https://kolaente.dev/vikunja/api/src/commit/066c26f83e1e066bdc9d80b4642db1df0d6a77eb/pkg/models/kanban.go#L252-L267
 */
export function createBucket(bucket: IBucket): IBucket {
	const allBuckets = getAllBucketsWithoutTasks()
	const newBucketFullData = {
		...bucket,
		id: Math.round(Math.random() * 1000000000000),
		position: defaultPositionIfZero(bucket.position),
	}
	const newBucketFullDataToStore = {
		...newBucketFullData,
		// It's not actually necessary FYI, it will just taske extra space in the storage.
		tasks: undefined,
	}
	allBuckets.push(newBucketFullDataToStore)
	localStorage.setItem('buckets', JSON.stringify(allBuckets))
	return newBucketFullData
}

export function updateBucket(newBucketData: IBucket) {
	const allBuckets = getAllBuckets()
	// TODO_OFFLINE looks like the real backend also filters by prjectId, but
	// since in localBackend all bucket `id`s are unique even between projects,
	// it's not necessary
	const targetBucketInd = allBuckets.findIndex(t => t.id === newBucketData.id)
	//  TODO_OFFLINE remove tasks.
	allBuckets.splice(targetBucketInd, 1, newBucketData)
	localStorage.setItem('buckets', JSON.stringify(allBuckets))
	return newBucketData
}
