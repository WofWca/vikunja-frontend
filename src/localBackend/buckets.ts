import type { IBucket } from '@/modelTypes/IBucket'
import { ensureCreateSyncedYDoc } from './sync'
import { getAllTasks, getTasksOfBucket } from './tasks'
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

async function getAllBucketsWithoutTasks(): Promise<IBucketWithoutTasks[]> {
	const fromYdoc = (await ensureCreateSyncedYDoc())
		// Yes, a map with an only element. I'm too lazy to make it a Y.Array.
		.getMap('bucketsMap')
		.get('buckets')

	// const fromStorage = localStorage.getItem('buckets')
	if (!fromYdoc) {
		// TODO_OFFLINE dynamic import.
		// Currently we have a constant list. Each project must have at least one bucket
		return getInitialBuckets()
	}
	// TODO_OFFLINE fill the `tasks`.
	return fromYdoc
}

// /**
//  * Mutates `bucket` and returns it.
//  */
// function fillBucketTasks(bucket: IBucketWithoutTasks): IBucket {
//   (bucket as IBucket).tasks = getAllTas
// }

async function getAllBuckets(): Promise<IBucket[]> {
	const bucketsWithoutTasks = await getAllBucketsWithoutTasks()
	const buckets = bucketsWithoutTasks.map(async bucketWithoutTasks => {
		const b = bucketWithoutTasks as IBucket
		b.tasks = (await getTasksOfBucket(b.id))
			// Tasks are always sorted by their `kanbanPosition`.
			// https://kolaente.dev/vikunja/api/src/commit/6d8db0ce1e00e8c200a43b28ac98eb0fb825f4d4/pkg/models/kanban.go#L173-L178
			.sort((a, b) => a.kanbanPosition - b.kanbanPosition)
		return b
	})
	return Promise.all(buckets)
}

export async function getAllBucketsOfProject(projectId: number): Promise<IBucket[]> {
	// TODO_OFFLINE filter by position bruh.
	// TODO_OFFLINE perf: maybe it's not worth getting tasks of each project then in `getAllBuckets`.
	return (await getAllBuckets())
		.filter(b => b.projectId === projectId)
		// Buckets are always sorted.
		// https://kolaente.dev/vikunja/api/src/commit/6d8db0ce1e00e8c200a43b28ac98eb0fb825f4d4/pkg/models/kanban.go#L139-L143
		.sort((a, b) => a.position - b.position)
}

/** https://kolaente.dev/vikunja/api/src/commit/769db0dab2e50bc477dec6c7e18309effc80a1bd/pkg/models/kanban.go#L80-L87 */
export async function getDefaultBucket(projectId: number): Promise<IBucket> {
	return (await getAllBucketsOfProject(projectId))
		.sort((a, b) => a.position - b.position)
		[0]
}

/**
 * https://kolaente.dev/vikunja/api/src/commit/066c26f83e1e066bdc9d80b4642db1df0d6a77eb/pkg/models/kanban.go#L252-L267
 */
export async function createBucket(bucket: IBucket): Promise<IBucket> {
	const allBuckets = await getAllBucketsWithoutTasks()
	const maxPosition = allBuckets.reduce((currMax, b) => {
		return b.position > currMax
			? b.position
			: currMax
	}, -Infinity)
	const newBucketFullData = {
		...bucket,
		id: Math.round(Math.random() * 1000000000000),
		// position: defaultPositionIfZero(bucket.position),
		position: maxPosition * 2,
	}
	const newBucketFullDataToStore = {
		...newBucketFullData,
		// It's not actually necessary FYI, it will just taske extra space in the storage.
		tasks: undefined,
	}
	allBuckets.push(newBucketFullDataToStore);
	(await ensureCreateSyncedYDoc())
		.getMap('bucketsMap')
		.set('buckets', allBuckets)
	// localStorage.setItem('buckets', JSON.stringify(allBuckets))
	return newBucketFullData
}

export async function updateBucket(newBucketData: IBucket) {
	const allBuckets = await getAllBucketsWithoutTasks()
	// TODO_OFFLINE looks like the real backend also filters by prjectId, but
	// since in localBackend all bucket `id`s are unique even between projects,
	// it's not necessary
	const targetBucketInd = allBuckets.findIndex(b => b.id === newBucketData.id)
	if (targetBucketInd < 0) {
		console.warn('Tried to update a bucket, but it does not exist')
		return
	}
	//  TODO_OFFLINE remove tasks.
	newBucketData.tasks = undefined
	allBuckets.splice(targetBucketInd, 1, newBucketData);
	(await ensureCreateSyncedYDoc())
		.getMap('bucketsMap')
		.set('buckets', allBuckets)
	// localStorage.setItem('buckets', JSON.stringify(allBuckets))
	return newBucketData
}

export async function deleteBucket({ id }: { id: number }) {
	const allBuckets = await getAllBucketsWithoutTasks()

	if (allBuckets.length <= 1) {
		// Prevent removing the last bucket.
		// https://kolaente.dev/vikunja/api/src/commit/6aadaaaffc1fff4a94e35e8fa3f6eab397cbc3ce/pkg/models/kanban.go#L325-L335
		return
	}

	const targetBucketInd = allBuckets.findIndex(b => b.id === id)
	if (targetBucketInd < 0) {
		console.warn('Tried to delete a bucket, but it does not exist')
		return
	}
	const projectId = allBuckets[targetBucketInd].projectId
	allBuckets.splice(targetBucketInd, 1);
	// localStorage.setItem('buckets', JSON.stringify(allBuckets))

	const ydoc = await ensureCreateSyncedYDoc()
	ydoc
		.getMap('bucketsMap')
		.set('buckets', allBuckets)

	// Move all the tasks from this bucket to the default one.
	// https://kolaente.dev/vikunja/api/src/commit/6aadaaaffc1fff4a94e35e8fa3f6eab397cbc3ce/pkg/models/kanban.go#L349-L353
	const deletedBuckedId = id
	const defaultBucketId = (await getDefaultBucket(projectId)).id

	// const allTasks = getAllTasks()
	// allTasks.forEach(t => {
	// 	if (t.bucketId === deletedBuckedId) {
	// 		t.bucketId = defaultBucketId
	// 	}
	// })
	// localStorage.setItem('tasks', JSON.stringify(allTasks))
	const tasksYarr = ydoc.getArray('tasks')
	ydoc.transact(() => {
		tasksYarr.forEach((t, i) => {
			if (t.bucketId === deletedBuckedId) {
				// TODO_OFFLINE not sure if it's ok to mutate the array while `forEach` ing it.
				t.bucketId = defaultBucketId
				tasksYarr.delete(i)
				tasksYarr.insert(i, [t])
			}
		})
	})

	// TODO_OFFLINE idk what it's supposed to return
	return true
}
