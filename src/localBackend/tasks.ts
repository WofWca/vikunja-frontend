import type { ITask } from '@/modelTypes/ITask'
import { getDefaultBucket } from './buckets'
import { defaultPositionIfZero } from './utils/calculateDefaultPosition'

// TODO_OFFLINE return types? ITask is not it, because of snake case and Date format.

// TODO_OFFLINE actually `project_id` is not always present on a task.
// https://kolaente.dev/vikunja/frontend/src/commit/0ff0d8c5b89bd6a8b628ddbe6074f61797b6b9c1/src/modelTypes/ITask.ts#L52
// So getTaskOfProject doesn't work right?? Should we make it return all tasks
// (since we only support just one project for now?)
// Actually `project_id` is present on a task when it is created:
// https://kolaente.dev/vikunja/frontend/src/commit/6aa02e29b19f9f57620bdf09919df34c363e1f3d/src/services/abstractService.ts#L404
// Here it substitutes `{projectId}` in the URL.

let _nextUniqueIntToReturn = 1
/**
 * @returns A unique (in this browsing context) integer
 */
function getUniquieInt() {
	return _nextUniqueIntToReturn++
}

/**
 * Yes, we store the data in camelCase.
 */
export function getAllTasks(): ITask[] {
	const fromStorage = localStorage.getItem('tasks')
	if (!fromStorage) {
		return []
	}
	const tasks: ITask[] = JSON.parse(fromStorage)
	// TODO_OFFLINE don't just always sort them by position but look at
	// `parameters.sort_by`.
	return tasks.sort((a, b) => a.position - b.position)
}

// getAllTasksWithFilters(params)

// TODO_OFFLINE we only have one project currently, actually.
export function getTasksOfProject<PID extends number>(projectId: PID): Array<ITask & { projectId: PID }> {
	const tasks: ITask[] = getAllTasks().filter(t => t.projectId === projectId)
	return tasks
}

/**
 * Unsorted
 */
export function getTasksOfBucket<BID extends number>(
	bucketId: BID,
): Array<ITask & { bucketId: BID }> {
	const tasks: ITask[] = getAllTasks().filter(t => t.bucketId === bucketId)
	return tasks
}

/**
 * https://kolaente.dev/vikunja/api/src/commit/066c26f83e1e066bdc9d80b4642db1df0d6a77eb/pkg/models/tasks.go#L913-L990
 */
export function createTask(newTask: ITask): ITask {
	const allTasks = getAllTasks()
	const newTaskFullData: ITask = {
		...newTask,
		id: Math.round(Math.random() * 1000000000000),
		// TODO_OFFLINE created_by, indentifier, index
		position: defaultPositionIfZero(newTask.position),
		kanbanPosition: defaultPositionIfZero(newTask.kanbanPosition),
		// https://kolaente.dev/vikunja/api/src/commit/769db0dab2e50bc477dec6c7e18309effc80a1bd/pkg/models/tasks.go#L939-L940
		bucketId: newTask.bucketId > 0
			? newTask.bucketId
			: getDefaultBucket(newTask.projectId).id,
	}
	allTasks.unshift(newTaskFullData)
	localStorage.setItem('tasks', JSON.stringify(allTasks))
	return newTaskFullData
}

export function getTask(taskId: number) {
	return getAllTasks().find(t => t.id === taskId)
}

export function updateTask(newTaskData: ITask) {
	// TODO_OFFLINE a lot of stuff is not implemented. For example, marking a task "done"
	// when it is moved to the "done" bucket.
	// https://kolaente.dev/vikunja/api/src/commit/6aadaaaffc1fff4a94e35e8fa3f6eab397cbc3ce/pkg/models/tasks.go#L1008
	const allTasks = getAllTasks()
	const targetTaskInd = allTasks.findIndex(t => t.id === newTaskData.id)
	if (targetTaskInd < 0) {
		console.warn('Tried to update a task, but it does not exist')
		return
	}
	allTasks.splice(targetTaskInd, 1, newTaskData)
	localStorage.setItem('tasks', JSON.stringify(allTasks))
	return newTaskData
}

export function deleteTask({ id }: { id: number }) {
	const allTasks = getAllTasks()
	const targetTaskInd = allTasks.findIndex(t => t.id === id)
	if (targetTaskInd < 0) {
		console.warn('Tried to delete a task, but it does not exist')
		return
	}
	allTasks.splice(targetTaskInd, 1)
	localStorage.setItem('tasks', JSON.stringify(allTasks))

	// TODO_OFFLINE idk what it's supposed to return
	return true
}
