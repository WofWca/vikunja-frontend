import AbstractService from './abstractService'
import ProjectModel from '@/models/project'
import type {IProject} from '@/modelTypes/IProject'
import TaskService from './task'
import {colorFromHex} from '@/helpers/color/colorFromHex'

function getAllProjects() {
	return [
		{
			id: 1,
			title: 'Project',
			description: '',
			identifier: '',
			hexColor: '',
			namespaceId: 1,
			owner: {
				id: 1,
				name: '',
				username: 'demo',
				created: '2021-05-30T10:45:25+02:00',
				updated: '2023-03-06T12:49:35+01:00',
			},
			isArchived: false,
			backgroundInformation: null,
			backgroundBlurHash: '',
			isFavorite: false,
			position: 65536,
			created: '2021-05-30T10:45:30+02:00',
			updated: '2023-03-06T13:38:43+01:00',
		},
	]
}

export default class ProjectService extends AbstractService<IProject> {
	constructor() {
		super({
			// create: '/namespaces/{namespaceId}/projects',
			get: '/projects/{id}',
			getAll: '/projects',
			// update: '/projects/{id}',
			// delete: '/projects/{id}',
		})
	}

	_getAll: () => IProject[] = () => {
		return getAllProjects()
	}
	_get = (model: IProject, params: Record<string, string>) => {
		// TODO_OFFLINE throw if `id` is not the only query parameter, for easier debugging during this
		// prototyping.
		return getAllProjects().find(p => p.id === model.id)
	}

	modelFactory(data) {
		return new ProjectModel(data)
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

	beforeCreate(project) {
		project.hexColor = colorFromHex(project.hexColor)
		return project
	}

	async background(project: Pick<IProject, 'id' | 'backgroundInformation'>) {
		if (project.backgroundInformation === null) {
			return ''
		}

		const response = await this.http({
			url: `/projects/${project.id}/background`,
			method: 'GET',
			responseType: 'blob',
		})
		return window.URL.createObjectURL(new Blob([response.data]))
	}

	async removeBackground(project: Pick<IProject, 'id'>) {
		const cancel = this.setLoading()

		try {
			const response = await this.http.delete(`/projects/${project.id}/background`, project)
			return response.data
		} finally {
			cancel()
		}
	}
}