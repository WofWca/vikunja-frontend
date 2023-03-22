<template>
	<ProjectWrapper class="project-table" :project-id="projectId" viewName="table">
		<template #header>
		</template>

		<template #default>
			<div :class="{'is-loading': loading}" class="loader-container">
				<card :padding="false" :has-content="false">
					<div class="has-horizontal-overflow">
						<table class="table has-actions is-hoverable is-fullwidth mb-0">
							<thead>
							<tr>
								<th v-if="activeColumns.index">
									#
								</th>
								<th v-if="activeColumns.done">
									{{ $t('task.attributes.done') }}
								</th>
								<th v-if="activeColumns.title">
									{{ $t('task.attributes.title') }}
								</th>
								<th v-if="activeColumns.priority">
									{{ $t('task.attributes.priority') }}
								</th>
								<th v-if="activeColumns.labels">
									{{ $t('task.attributes.labels') }}
								</th>
								<th v-if="activeColumns.assignees">
									{{ $t('task.attributes.assignees') }}
								</th>
								<th v-if="activeColumns.dueDate">
									{{ $t('task.attributes.dueDate') }}
								</th>
								<th v-if="activeColumns.startDate">
									{{ $t('task.attributes.startDate') }}
								</th>
								<th v-if="activeColumns.endDate">
									{{ $t('task.attributes.endDate') }}
								</th>
								<th v-if="activeColumns.percentDone">
									{{ $t('task.attributes.percentDone') }}
								</th>
								<th v-if="activeColumns.created">
									{{ $t('task.attributes.created') }}
								</th>
								<th v-if="activeColumns.updated">
									{{ $t('task.attributes.updated') }}
								</th>
								<th v-if="activeColumns.createdBy">
									{{ $t('task.attributes.createdBy') }}
								</th>
							</tr>
							</thead>
							<tbody>
							<tr :key="t.id" v-for="t in tasks">
								<td v-if="activeColumns.index">
									<router-link :to="taskDetailRoutes[t.id]">
										<template v-if="t.identifier === ''">
											#{{ t.index }}
										</template>
										<template v-else>
											{{ t.identifier }}
										</template>
									</router-link>
								</td>
								<td v-if="activeColumns.done">
									<Done :is-done="t.done" variant="small"/>
								</td>
								<td v-if="activeColumns.title">
									<router-link :to="taskDetailRoutes[t.id]">{{ t.title }}</router-link>
								</td>
								<td v-if="activeColumns.priority">
									<priority-label :priority="t.priority" :done="t.done" :show-all="true"/>
								</td>
								<td v-if="activeColumns.labels">
									<labels :labels="t.labels"/>
								</td>
								<td v-if="activeColumns.assignees">
									<user
										:avatar-size="27"
										:is-inline="true"
										:key="t.id + 'assignee' + a.id + i"
										:show-username="false"
										:user="a"
										v-for="(a, i) in t.assignees"
									/>
								</td>
								<date-table-cell :date="t.dueDate" v-if="activeColumns.dueDate"/>
								<date-table-cell :date="t.startDate" v-if="activeColumns.startDate"/>
								<date-table-cell :date="t.endDate" v-if="activeColumns.endDate"/>
								<td v-if="activeColumns.percentDone">{{ t.percentDone * 100 }}%</td>
								<date-table-cell :date="t.created" v-if="activeColumns.created"/>
								<date-table-cell :date="t.updated" v-if="activeColumns.updated"/>
								<td v-if="activeColumns.createdBy">
									<user
										:avatar-size="27"
										:show-username="false"
										:user="t.createdBy"/>
								</td>
							</tr>
							</tbody>
						</table>
					</div>

					<Pagination
						:total-pages="totalPages"
						:current-page="currentPage"
					/>
				</card>
			</div>
		</template>
	</ProjectWrapper>
</template>

<script setup lang="ts">
import {toRef, computed, type Ref} from 'vue'

import {useStorage} from '@vueuse/core'

import ProjectWrapper from '@/components/project/ProjectWrapper.vue'
import Done from '@/components/misc/Done.vue'
import User from '@/components/misc/user.vue'
import PriorityLabel from '@/components/tasks/partials/priorityLabel.vue'
import Labels from '@/components/tasks/partials/labels.vue'
import DateTableCell from '@/components/tasks/partials/date-table-cell.vue'
import Fancycheckbox from '@/components/input/fancycheckbox.vue'
import Sort from '@/components/tasks/partials/sort.vue'
import FilterPopup from '@/components/project/partials/filter-popup.vue'
import Pagination from '@/components/misc/pagination.vue'
import Popup from '@/components/misc/popup.vue'

import {useTaskList} from '@/composables/useTaskList'

import type {SortBy} from '@/composables/useTaskList'
import type {ITask} from '@/modelTypes/ITask'

const ACTIVE_COLUMNS_DEFAULT = {
	index: true,
	done: true,
	title: true,
	priority: false,
	labels: true,
	assignees: true,
	dueDate: true,
	startDate: false,
	endDate: false,
	percentDone: false,
	created: false,
	updated: false,
	createdBy: false,
}

const props = defineProps({
	projectId: {
		type: Number,
		required: true,
	},
})

const SORT_BY_DEFAULT: SortBy = {
	index: 'desc',
}

const activeColumns = useStorage('tableViewColumns', {...ACTIVE_COLUMNS_DEFAULT})
const sortBy = useStorage<SortBy>('tableViewSortBy', {...SORT_BY_DEFAULT})

const taskList = useTaskList(toRef(props, 'projectId'))

const {
	loading,
	// params,
	totalPages,
	currentPage,
	// sortByParam,
} = taskList
const tasks: Ref<ITask[]> = taskList.tasks

// Object.assign(params.value, {
// 	filter_by: [],
// 	filter_value: [],
// 	filter_comparator: [],
// })

// TODO: re-enable opening task detail in modal
// const router = useRouter()
const taskDetailRoutes = computed(() => Object.fromEntries(
	tasks.value.map(({id}) => ([
		id,
		{
			name: 'task.detail',
			params: {id},
			// state: { backdropView: router.currentRoute.value.fullPath },
		},
	])),
))
</script>

<style lang="scss" scoped>
.table {
	background: transparent;
	overflow-x: auto;
	overflow-y: hidden;

	th {
		white-space: nowrap;
	}

	.user {
		margin: 0;
	}
}

.columns-filter {
	margin: 0;

	&.is-open {
		margin: 2rem 0 1rem;
	}
}

.link-share-view .card {
	border: none;
	box-shadow: none;
}
</style>