import { readonly, ref} from 'vue'
import {defineStore, acceptHMRUpdate} from 'pinia'

import {getBlobFromBlurHash} from '@/helpers/getBlobFromBlurHash'

import ProjectModel from '@/models/project'
import ProjectService from '../services/project'
import {checkAndSetApiUrl} from '@/helpers/checkAndSetApiUrl'

import {useMenuActive} from '@/composables/useMenuActive'

import {useAuthStore} from '@/stores/auth'
import type {IProject} from '@/modelTypes/IProject'

export const useBaseStore = defineStore('base', () => {
	const loading = ref(false)
	const ready = ref(false)

	// This is used to highlight the current project in menu for all project related views
	const currentProject = ref<IProject | null>(new ProjectModel({
		id: 0,
		isArchived: false,
	}))
	const background = ref('')
	const blurHash = ref('')

	const hasTasks = ref(false)
	const keyboardShortcutsActive = ref(false)
	const quickActionsActive = ref(false)
	const logoVisible = ref(true)

	function setLoading(newLoading: boolean) {
		loading.value = newLoading
	}

	function setCurrentProject(newCurrentProject: IProject | null) {
		// Server updates don't return the right. Therefore, the right is reset after updating the project which is
		// confusing because all the buttons will disappear in that case. To prevent this, we're keeping the right
		// when updating the project in global state.
		if (
			typeof currentProject.value?.maxRight !== 'undefined' &&
			newCurrentProject !== null &&
			(
				typeof newCurrentProject.maxRight === 'undefined' ||
				newCurrentProject.maxRight === null
			)
		) {
			newCurrentProject.maxRight = currentProject.value.maxRight
		}
		currentProject.value = newCurrentProject
	}

	function setHasTasks(newHasTasks: boolean) {
		hasTasks.value = newHasTasks
	}

	function setKeyboardShortcutsActive(value: boolean) {
		keyboardShortcutsActive.value = value
	}

	function setQuickActionsActive(value: boolean) {
		quickActionsActive.value = value
	}

	function setBackground(newBackground: string) {
		background.value = newBackground
	}

	function setBlurHash(newBlurHash: string) {
		blurHash.value = newBlurHash
	}

	function setLogoVisible(visible: boolean) {
		logoVisible.value = visible
	}
	
	function setReady(value: boolean) {
		ready.value = value
	}

	async function handleSetCurrentProject(
		{project, forceUpdate = false}: {project: IProject | null, forceUpdate?: boolean},
	) {
		if (project === null) {
			setCurrentProject({})
			setBackground('')
			setBlurHash('')
			return
		}

		// The forceUpdate parameter is used only when updating a project background directly because in that case 
		// the current project stays the same, but we want to show the new background right away.
		if (project.id !== currentProject.value?.id || forceUpdate) {
			if (project.backgroundInformation) {
				try {
					const blurHash = await getBlobFromBlurHash(project.backgroundBlurHash)
					if (blurHash) {
						setBlurHash(window.URL.createObjectURL(blurHash))
					}

					const projectService = new ProjectService()
					const background = await projectService.background(project)
					setBackground(background)
				} catch (e) {
					console.error('Error getting background image for project', project.id, e)
				}
			}
		}

		if (
			typeof project.backgroundInformation === 'undefined' ||
			project.backgroundInformation === null
		) {
			setBackground('')
			setBlurHash('')
		}

		setCurrentProject(project)
	}

	const authStore = useAuthStore()
	async function loadApp() {
		await checkAndSetApiUrl(window.API_URL)
		await authStore.checkAuth()
		ready.value = true
	}

	return {
		loading: readonly(loading),
		ready: readonly(ready),
		currentProject: readonly(currentProject),
		background: readonly(background),
		blurHash: readonly(blurHash),
		hasTasks: readonly(hasTasks),
		keyboardShortcutsActive: readonly(keyboardShortcutsActive),
		quickActionsActive: readonly(quickActionsActive),
		logoVisible: readonly(logoVisible),

		setLoading,
		setReady,
		setCurrentProject,
		setHasTasks,
		setKeyboardShortcutsActive,
		setQuickActionsActive,
		setBackground,
		setBlurHash,
		setLogoVisible,

		handleSetCurrentProject,
		loadApp,

		...useMenuActive(),
	}
})

// support hot reloading
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useBaseStore, import.meta.hot))
}