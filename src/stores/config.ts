import {computed, reactive, toRefs} from 'vue'
import {defineStore, acceptHMRUpdate} from 'pinia'
import {parseURL} from 'ufo'

import {HTTPFactory} from '@/helpers/fetcher'
import {objectToCamelCase} from '@/helpers/case'

import type {IProvider} from '@/types/IProvider'
import type {MIGRATORS} from '@/views/migrate/migrators'

export interface ConfigState {
	version: string,
	frontendUrl: string,
	motd: string,
	linkSharingEnabled: boolean,
	maxFileSize: string,
	registrationEnabled: boolean,
	availableMigrators: Array<keyof typeof MIGRATORS>,
	taskAttachmentsEnabled: boolean,
	totpEnabled: boolean,
	enabledBackgroundProviders: Array<'unsplash' | 'upload'>,
	legal: {
		imprintUrl: string,
		privacyPolicyUrl: string,
	},
	caldavEnabled: boolean,
	userDeletionEnabled: boolean,
	taskCommentsEnabled: boolean,
	auth: {
		local: {
			enabled: boolean,
		},
		openidConnect: {
			enabled: boolean,
			redirectUrl: string,
			providers: IProvider[],
		},
	},
}

export const useConfigStore = defineStore('config', () => {
	const state = reactive({
		// These are the api defaults.
		version: '',
		frontendUrl: '',
		motd: '',
		linkSharingEnabled: true,
		maxFileSize: '20MB',
		registrationEnabled: true,
		availableMigrators: [],
		taskAttachmentsEnabled: true,
		totpEnabled: true,
		enabledBackgroundProviders: [],
		legal: {
			imprintUrl: '',
			privacyPolicyUrl: '',
		},
		caldavEnabled: false,
		userDeletionEnabled: true,
		taskCommentsEnabled: true,
		auth: {
			local: {
				enabled: true,
			},
			openidConnect: {
				enabled: false,
				redirectUrl: '',
				providers: [],
			},
		},
	})

	const migratorsEnabled = computed(() => state.availableMigrators?.length > 0)
	const apiBase = computed(() => {
		const {host, protocol} = parseURL(window.API_URL)
		return protocol + '//' + host
	})

	function setConfig(config: ConfigState) {
		Object.assign(state, config)
	}
	async function update(): Promise<boolean> {
		// TODO_OFFLINE it's just a stub currently
		setConfig({
			version: 'None whatsoever',
			frontendUrl: 'https://try.vikunja.io/',
			motd: '',
			linkSharingEnabled: true,
			maxFileSize: '20MB',
			registrationEnabled: true,
			availableMigrators: [
				'vikunja-file',
				// These require the internet.
				// 'ticktick',
				// 'todoist',
			],
			taskAttachmentsEnabled: true,
			enabledBackgroundProviders: [
				'upload',
				// 'unsplash',
			],
			totpEnabled: false,
			legal: {
				imprintUrl: '',
				privacyPolicyUrl: '',
			},
			caldavEnabled: true,
			auth: {
				local: {
					enabled: true,
				},
				openidConnect: {
					enabled: false,
					redirectUrl: 'https://try.vikunja.io/auth/openid/',
					providers: null,
				},
			},
			emailRemindersEnabled: false,
			userDeletionEnabled: false,
			taskCommentsEnabled: true,
		})
		const success = true
		return success
	}

	return {
		...toRefs(state),

		migratorsEnabled,
		apiBase,
		setConfig,
		update,
	}

})

// support hot reloading
if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useConfigStore, import.meta.hot))
}