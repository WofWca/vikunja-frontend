import AbstractService from './abstractService'
import BucketModel from '../models/bucket'
import TaskService from '@/services/task'
import type { IBucket } from '@/modelTypes/IBucket'
import { createBucket, deleteBucket, getAllBucketsOfProject, updateBucket } from '@/localBackend/buckets'

export default class BucketService extends AbstractService<IBucket> {
	constructor() {
		super({
			getAll: '/projects/{projectId}/buckets',
			create: '/projects/{projectId}/buckets',
			update: '/projects/{projectId}/buckets/{id}',
			delete: '/projects/{projectId}/buckets/{id}',
		})
	}

	_getAll = ({ projectId }: { projectId: number }) => getAllBucketsOfProject(projectId)
	_create = (bucket: IBucket) => createBucket(bucket)
	_update = (bucket: IBucket) => updateBucket(bucket)
	_delete = (bucket: IBucket) => deleteBucket(bucket)

	modelFactory(data: Partial<IBucket>) {
		return new BucketModel(data)
	}

	beforeUpdate(model) {
		const taskService = new TaskService()
		model.tasks = model.tasks?.map(t => taskService.processModel(t))
		return model
	}
}