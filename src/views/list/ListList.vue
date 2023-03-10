<template>
	<ListWrapper class="list-list" :list-id="listId" viewName="list">
		<template #header>
		</template>

		<template #default>
		<div
			:class="{ 'is-loading': loading }"
			class="loader-container is-max-width-desktop list-view"
		>
		<card :padding="false" :has-content="false" class="has-overflow">
			<add-task
				v-if="!list.isArchived && canWrite"
				class="list-view__add-task"
				ref="addTaskRef"
				:default-position="firstNewPosition"
				@taskAdded="updateTaskList"
			/>

			<nothing v-if="ctaVisible && tasks.length === 0 && !loading">
				{{ $t('list.list.empty') }}
				<ButtonLink @click="focusNewTaskInput()">
					{{ $t('list.list.newTaskCta') }}
				</ButtonLink>
			</nothing>


			<draggable
				v-if="tasks && tasks.length > 0"
				v-bind="DRAG_OPTIONS"
				v-model="tasks"
				group="tasks"
				@start="() => drag = true"
				@end="saveTaskPosition"
				handle=".handle"
				:disabled="!canWrite"
				item-key="id"
				tag="ul"
				:component-data="{
					class: {
						tasks: true,
						'dragging-disabled': !canWrite || isAlphabeticalSorting
					},
					type: 'transition-group'
				}"
			>
				<template #item="{element: t}">
					<single-task-in-list
						:show-list-color="false"
						:disabled="!canWrite"
						:can-mark-as-done="canWrite || isSavedFilter(list)"
						:the-task="t"
						@taskUpdated="updateTasks"
					>
						<template v-if="canWrite">
							<span class="icon handle">
								<icon icon="grip-lines"/>
							</span>
						</template>
					</single-task-in-list>
				</template>
			</draggable>

			<Pagination 
				:total-pages="totalPages"
				:current-page="currentPage"
			/>
		</card>
		</div>
		</template>
	</ListWrapper>
</template>

<script lang="ts">
export default { name: 'List' }
</script>

<script setup lang="ts">
import {ref, computed, toRef, nextTick, onMounted, type PropType} from 'vue'
import draggable from 'zhyswan-vuedraggable'
import {useRoute, useRouter} from 'vue-router'

import ListWrapper from '@/components/list/ListWrapper.vue'
import ButtonLink from '@/components/misc/ButtonLink.vue'
import AddTask from '@/components/tasks/add-task.vue'
import SingleTaskInList from '@/components/tasks/partials/singleTaskInList.vue'
import FilterPopup from '@/components/list/partials/filter-popup.vue'
import Nothing from '@/components/misc/nothing.vue'
import Pagination from '@/components/misc/pagination.vue'
import {ALPHABETICAL_SORT} from '@/components/list/partials/filters.vue'

import {useTaskList} from '@/composables/useTaskList'
import {RIGHTS as Rights} from '@/constants/rights'
import {calculateItemPosition} from '@/helpers/calculateItemPosition'
import type {ITask} from '@/modelTypes/ITask'
import {isSavedFilter} from '@/services/savedFilter'

import {useBaseStore} from '@/stores/base'
import {useTaskStore} from '@/stores/tasks'

import type {IList} from '@/modelTypes/IList'

function sortTasks(tasks: ITask[]) {
	if (tasks === null || Array.isArray(tasks) && tasks.length === 0) {
		return
	}
	return tasks.sort((a, b) => {
		if (a.done < b.done)
			return -1
		if (a.done > b.done)
			return 1

		if (a.position < b.position)
			return -1
		if (a.position > b.position)
			return 1
		return 0
	})
}

const props = defineProps({
	listId: {
		type: Number as PropType<IList['id']>,
		required: true,
	},
})

const ctaVisible = ref(false)

const drag = ref(false)
const DRAG_OPTIONS = {
	animation: 100,
	ghostClass: 'task-ghost',
} as const

// TODO_OFFLINE load tasks from somewhere else
const {
	tasks,
	loading,
	totalPages,
	currentPage,
	loadTasks,
	// searchTerm,
	// params,
	// sortByParam,
} = useTaskList(toRef(props, 'listId'))


const isAlphabeticalSorting = computed(() => false)

const firstNewPosition = computed(() => {
	if (tasks.value.length === 0) {
		return 0
	}

	return calculateItemPosition(null, tasks.value[0].position)
})

const taskStore = useTaskStore()
const baseStore = useBaseStore()
const list = computed(() => baseStore.currentList)

const canWrite = computed(() => {
	return list.value.maxRight > Rights.READ && list.value.id > 0
})

onMounted(async () => {
	await nextTick()
	ctaVisible.value = true
})

const route = useRoute()
const router = useRouter()

const addTaskRef = ref<typeof AddTask | null>(null)
function focusNewTaskInput() {
	addTaskRef.value?.focusTaskInput()
}

function updateTaskList(task: ITask) {
	if (isAlphabeticalSorting.value ) {
		// reload tasks with current filter and sorting
		loadTasks()
	}
	else {
		tasks.value = [
			task,
			...tasks.value,
		]
	}

	baseStore.setHasTasks(true)
}

function updateTasks(updatedTask: ITask) {
	for (const t in tasks.value) {
		if (tasks.value[t].id === updatedTask.id) {
			tasks.value[t] = updatedTask
			break
		}
	}
	// FIXME: Use computed
	sortTasks(tasks.value)
}

async function saveTaskPosition(e) {
	drag.value = false

	const task = tasks.value[e.newIndex]
	const taskBefore = tasks.value[e.newIndex - 1] ?? null
	const taskAfter = tasks.value[e.newIndex + 1] ?? null

	const newTask = {
		...task,
		position: calculateItemPosition(taskBefore !== null ? taskBefore.position : null, taskAfter !== null ? taskAfter.position : null),
	}

	const updatedTask = await taskStore.update(newTask)
	tasks.value[e.newIndex] = updatedTask
}
</script>

<style lang="scss" scoped>
.tasks {
	padding: .5rem;
}

.task-ghost {
	border-radius: $radius;
	background: var(--grey-100);
	border: 2px dashed var(--grey-300);
	
	* {
		opacity: 0;
	}
}

.list-view__add-task {
	padding: 1rem 1rem 0;
}

.link-share-view .card {
  border: none;
  box-shadow: none;
}
</style>