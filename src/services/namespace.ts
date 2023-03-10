import AbstractService from './abstractService'
import NamespaceModel from '../models/namespace'
import type {INamespace} from '@/modelTypes/INamespace'
import {colorFromHex} from '@/helpers/color/colorFromHex'

export default class NamespaceService extends AbstractService<INamespace> {
	constructor() {
		super({
			create: '/namespaces',
			get: '/namespaces/{id}',
			getAll: '/namespaces',
			update: '/namespaces/{id}',
			delete: '/namespaces/{id}',
		})
	}

	_getAll: () => INamespace[] = () => {
		// TODO_OFFLINE
		return [
			{
				id: 1,
				title: 'demo',
				description: 'demo\'s namespace.',
				hex_color: '',
				is_archived: false,
				owner: {
					id: 1,
					name: '',
					username: 'demo',
					email: 'demo@vikunja.io',
					created: '0001-01-01T00:00:00Z',
					updated: '0001-01-01T00:00:00Z',
				},
				created: '2021-05-30T10:45:25+02:00',
				updated: '2021-05-30T10:45:25+02:00',
				lists: [
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
							email: 'demo@vikunja.io',
							created: '2021-05-30T10:45:25+02:00',
							updated: '2023-03-06T06:59:06+01:00',
						},
						is_archived: false,
						background_information: null,
						background_blur_hash: '',
						is_favorite: false,
						position: 65536,
						created: '2021-05-30T10:45:30+02:00',
						updated: '2023-03-06T09:24:43+01:00',
					},
				],
			},
		]
	}

	modelFactory(data) {
		return new NamespaceModel(data)
	}

	beforeUpdate(namespace) {
		namespace.hexColor = colorFromHex(namespace.hexColor)
		return namespace
	}

	beforeCreate(namespace) {
		namespace.hexColor = colorFromHex(namespace.hexColor)
		return namespace
	}
}