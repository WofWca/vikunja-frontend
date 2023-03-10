import AbstractService from './abstractService'
import ListModel from '@/models/list'
import type {IList} from '@/modelTypes/IList'
import TaskService from './task'
import {colorFromHex} from '@/helpers/color/colorFromHex'

function getAllLists() {
	return [
		{
			id: 1,
			title: 'Test list',
			description: '',
			identifier: '',
			hex_color: '',
			namespace_id: 1,
			owner: {
				id: 1,
				name: '',
				username: 'demo',
				created: '2021-05-30T10:45:25+02:00',
				updated: '2023-03-06T12:49:35+01:00',
			},
			is_archived: false,
			background_information: null,
			background_blur_hash: '',
			is_favorite: false,
			position: 65536,
			created: '2021-05-30T10:45:30+02:00',
			updated: '2023-03-06T13:38:43+01:00',
		},
	]
}

export default class ListService extends AbstractService<IList> {
	constructor() {
		super({
			// create: '/namespaces/{namespaceId}/lists',
			get: '/lists/{id}',
			getAll: '/lists',
			// update: '/lists/{id}',
			// delete: '/lists/{id}',
		})
	}

	_getAll: () => IList[] = () => {
		return getAllLists()
	}
	_get = (model: IList, params: Record<string, string>) => {
		// TODO_OFFLINE throw if `id` is not the only query parameter, for easier debugging during this
		// prototyping.
		return getAllLists().find(l => l.id === model.id)
	}

	modelFactory(data) {
		return new ListModel(data)
	}

	beforeUpdate(model) {
		if(typeof model.tasks !== 'undefined') {
			const taskService = new TaskService()
			model.tasks = model.tasks.map(task => {
				return taskService.beforeUpdate(task)
			})
		}
		
		if(typeof model.hexColor !== 'undefined') {
			model.hexColor = colorFromHex(model.hexColor)
		}
		
		return model
	}

	beforeCreate(list) {
		list.hexColor = colorFromHex(list.hexColor)
		return list
	}

	async background(list: Pick<IList, 'id' | 'backgroundInformation'>) {
		if (list.backgroundInformation === null) {
			return ''
		}

		const response = await this.http({
			url: `/lists/${list.id}/background`,
			method: 'GET',
			responseType: 'blob',
		})
		return window.URL.createObjectURL(new Blob([response.data]))
	}

	async removeBackground(list: Pick<IList, 'id'>) {
		const cancel = this.setLoading()

		try {
			const response = await this.http.delete(`/lists/${list.id}/background`, list)
			return response.data
		} finally {
			cancel()
		}
	}
}