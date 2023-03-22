import AbstractService from './abstractService'
import LabelModel from '@/models/label'
import type {ILabel} from '@/modelTypes/ILabel'
import {colorFromHex} from '@/helpers/color/colorFromHex'

function getAllLabels() {
	return [
		{
			id: 1,
			title: 'label',
			description: '',
			hexColor: 'e8e8e8',
			createdBy: {
				id: 1,
				name: '',
				username: 'demo',
				created: '2021-05-30T10:45:25+02:00',
				updated: '2023-03-06T14:10:00+01:00',
			},
			created: '2021-05-30T10:45:46+02:00',
			updated: '2021-05-30T10:45:46+02:00',
		},
		{
			id: 2,
			title: 'abc',
			description: '',
			hexColor: 'e8e8e8',
			createdBy: {
				id: 1,
				name: '',
				username: 'demo',
				created: '2021-05-30T10:45:25+02:00',
				updated: '2023-03-06T14:10:00+01:00',
			},
			created: '2023-03-06T10:37:31+01:00',
			updated: '2023-03-06T10:37:31+01:00',
		},
		{
			id: 5,
			title: 'aa',
			description: '',
			hexColor: 'e8e8e8',
			createdBy: {
				id: 1,
				name: '',
				username: 'demo',
				created: '2021-05-30T10:45:25+02:00',
				updated: '2023-03-06T14:10:00+01:00',
			},
			created: '2023-03-06T14:11:53+01:00',
			updated: '2023-03-06T14:11:53+01:00',
		},
	]
}

export default class LabelService extends AbstractService<ILabel> {
	constructor() {
		super({
			// create: '/labels',
			getAll: '/labels',
			// get: '/labels/{id}',
			// update: '/labels/{id}',
			// delete: '/labels/{id}',
		})
	}

	_getAll = () => {
		return getAllLabels()
	}

	processModel(label) {
		label.created = new Date(label.created).toISOString()
		label.updated = new Date(label.updated).toISOString()
		label.hexColor = colorFromHex(label.hexColor)
		return label
	}

	modelFactory(data) {
		return new LabelModel(data)
	}

	beforeUpdate(label) {
		return this.processModel(label)
	}

	beforeCreate(label) {
		return this.processModel(label)
	}
}