// TODO_OFFLINE return types? ITask is not it, because of snake case and Date format.

// TODO_OFFLINE actually `list_id` is not always present on a task.
// https://kolaente.dev/vikunja/frontend/src/commit/0ff0d8c5b89bd6a8b628ddbe6074f61797b6b9c1/src/modelTypes/ITask.ts#L52
// So getTaskOfList doesn't work right?? Should we make it return all tasks
// (since we only support just one list for now?)
// Actually `list_id` is present on a task when it is created:
// https://kolaente.dev/vikunja/frontend/src/commit/6aa02e29b19f9f57620bdf09919df34c363e1f3d/src/services/abstractService.ts#L404
// Here it substitutes `{listId}` in the URL.

let _nextUniqueIntToReturn = 1
/**
 * @returns A unique (in this browsing context) integer
 */
function getUniquieInt() {
	return _nextUniqueIntToReturn++
}

export function getAllTasks(): unknown[] {
	/*
	return [
		{
			id: 1,
			title: 'This is a task',
			description: '',
			done: false,
			done_at: '0001-01-01T00:00:00Z',
			due_date: '0001-01-01T00:00:00Z',
			reminder_dates: null,
			list_id: 1,
			repeat_after: 0,
			repeat_mode: 0,
			priority: 0,
			start_date: '0001-01-01T00:00:00Z',
			end_date: '0001-01-01T00:00:00Z',
			assignees: null,
			labels: [
				{
					id: 1,
					title: 'label',
					description: '',
					hex_color: 'e8e8e8',
					created_by: {
						id: 1,
						name: '',
						username: 'demo',
						created: '2021-05-30T10:45:25+02:00',
						updated: '2023-03-06T06:59:06+01:00',
					},
					created: '2021-05-30T10:45:46+02:00',
					updated: '2021-05-30T10:45:46+02:00',
				},
			],
			hex_color: '',
			percent_done: 0.4,
			identifier: '-1',
			index: 1,
			related_tasks: {},
			attachments: null,
			cover_image_attachment_id: 0,
			is_favorite: false,
			created: '2021-05-30T10:45:46+02:00',
			updated: '2023-03-06T09:24:43+01:00',
			bucket_id: 1,
			position: 65536,
			kanban_position: 65536,
			created_by: {
				id: 1,
				name: '',
				username: 'demo',
				created: '2021-05-30T10:45:25+02:00',
				updated: '2023-03-06T06:59:06+01:00',
			},
		},
		{
			id: 2,
			title: 'And another one',
			description: '',
			done: false,
			done_at: '2023-03-06T07:01:37+01:00',
			due_date: '2023-03-22T20:00:00+01:00',
			reminder_dates: null,
			list_id: 1,
			repeat_after: 604800,
			repeat_mode: 0,
			priority: 0,
			start_date: '0001-01-01T00:00:00Z',
			end_date: '0001-01-01T00:00:00Z',
			assignees: null,
			labels: null,
			hex_color: '',
			percent_done: 0,
			identifier: '-2',
			index: 2,
			related_tasks: {},
			attachments: null,
			cover_image_attachment_id: 0,
			is_favorite: false,
			created: '2021-05-30T10:45:53+02:00',
			updated: '2023-03-06T07:01:37+01:00',
			bucket_id: 1,
			position: 131072,
			kanban_position: 131072,
			created_by: {
				id: 1,
				name: '',
				username: 'demo',
				created: '2021-05-30T10:45:25+02:00',
				updated: '2023-03-06T06:59:06+01:00',
			},
		},
		{
			id: 3,
			title: 'testsetest',
			description: '* [ ] lajsdfjas;ldfasd',
			done: false,
			done_at: '0001-01-01T00:00:00Z',
			due_date: '0001-01-01T00:00:00Z',
			reminder_dates: null,
			list_id: 1,
			repeat_after: 0,
			repeat_mode: 0,
			priority: 0,
			start_date: '0001-01-01T00:00:00Z',
			end_date: '0001-01-01T00:00:00Z',
			assignees: null,
			labels: null,
			hex_color: '',
			percent_done: 0,
			identifier: '-3',
			index: 3,
			related_tasks: {},
			attachments: null,
			cover_image_attachment_id: 0,
			is_favorite: false,
			created: '2023-03-06T09:59:21+01:00',
			updated: '2023-03-06T09:59:33+01:00',
			bucket_id: 1,
			position: 196608,
			kanban_position: 196608,
			created_by: {
				id: 1,
				name: '',
				username: 'demo',
				created: '2021-05-30T10:45:25+02:00',
				updated: '2023-03-06T06:59:06+01:00',
			},
		},
		{
			id: 4,
			title: 'Test',
			description: '',
			done: false,
			done_at: '0001-01-01T00:00:00Z',
			due_date: '0001-01-01T00:00:00Z',
			reminder_dates: null,
			list_id: 1,
			repeat_after: 0,
			repeat_mode: 0,
			priority: 0,
			start_date: '2023-03-07T00:00:00+01:00',
			end_date: '2023-03-24T23:59:00+01:00',
			assignees: null,
			labels: null,
			hex_color: '',
			percent_done: 0,
			identifier: '-4',
			index: 4,
			related_tasks: {},
			attachments: null,
			cover_image_attachment_id: 0,
			is_favorite: false,
			created: '2023-03-06T10:04:28+01:00',
			updated: '2023-03-06T10:08:14+01:00',
			bucket_id: 1,
			position: 262144,
			kanban_position: 262144,
			created_by: {
				id: 1,
				name: '',
				username: 'demo',
				created: '2021-05-30T10:45:25+02:00',
				updated: '2023-03-06T06:59:06+01:00',
			},
		},
		{
			id: 5,
			title: 'test',
			description: '',
			done: false,
			done_at: '0001-01-01T00:00:00Z',
			due_date: '0001-01-01T00:00:00Z',
			reminder_dates: null,
			list_id: 1,
			repeat_after: 0,
			repeat_mode: 0,
			priority: 0,
			start_date: '2023-03-28T00:00:00+02:00',
			end_date: '2023-05-03T23:59:00+02:00',
			assignees: null,
			labels: null,
			hex_color: '',
			percent_done: 0,
			identifier: '-5',
			index: 5,
			related_tasks: {},
			attachments: null,
			cover_image_attachment_id: 0,
			is_favorite: false,
			created: '2023-03-06T10:04:31+01:00',
			updated: '2023-03-06T10:04:50+01:00',
			bucket_id: 1,
			position: 327680,
			kanban_position: 327680,
			created_by: {
				id: 1,
				name: '',
				username: 'demo',
				created: '2021-05-30T10:45:25+02:00',
				updated: '2023-03-06T06:59:06+01:00',
			},
		},
	] as const
	*/
	const fromStorage = localStorage.getItem('tasks')
	if (!fromStorage) {
		return []
	}
	return JSON.parse(fromStorage)
}

// getAllTasksWithFilters(params)

// TODO_OFFLINE we only have one list currently, actually.
export function getTasksOfList(listId: number) {
	return getAllTasks().filter(t => t.list_id === listId)
}

export function getTask(taskId: number) {
	return getAllTasks().find(t => t.id === taskId)
}

export function updateTask(newTaskData: unknown) {
	const allTasks = getAllTasks()
	const targetTaskInd = allTasks.findIndex(t => t.id === newTaskData.id)
	allTasks.splice(targetTaskInd, 1, newTaskData)
	localStorage.setItem('tasks', JSON.stringify(allTasks))
	return newTaskData
}

export function createTask(newTask: unknown) {
	const allTasks = getAllTasks()
	const newTaskFullData = {
		...newTask,
		id: Math.round(Math.random() * 1000000000000),
		// TODO_OFFLINE created_by, indentifier, index, kanban_position, 
	}
	allTasks.push(newTaskFullData)
	localStorage.setItem('tasks', JSON.stringify(allTasks))
	return newTaskFullData
}

export function deleteTask(taskId: number) {
	const allTasks = getAllTasks()
	const targetTaskInd = allTasks.findIndex(t => t.id === taskId)
	allTasks.splice(targetTaskInd, 1)
	localStorage.setItem('tasks', JSON.stringify(allTasks))

	// TODO_OFFLINE idk what it's supposed to return
	return true
}