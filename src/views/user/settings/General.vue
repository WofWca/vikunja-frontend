<template>
	<card :title="$t('user.settings.general.title')" class="general-settings" :loading="loading">
		<template v-if="isWebxdc">
			<div class="field">
				<label class="checkbox">
					<input type="checkbox" v-model="sharingEnabled"/>
					Enable sharing
				</label>
				<!-- TODO_OFFLINE a way to have multiple rooms, some private. -->
				<p>Everyone who knows the room name and the password will have read and write access to the data over network.</p>
				<p>You need to reload the page after changing the sharing settings.</p>
			</div>
			<template v-if="sharingEnabled">
				<div class="field">
					<label class="is-flex is-align-items-center">
						Sharing: room name
						<input
							class="input"
							type="text"
							required
							v-model="sharingRoomName"
						/>
					</label>
				</div>
				<div class="field">
					<label class="is-flex is-align-items-center">
						Sharing: room password
						<input
							class="input"
							type="password"
							v-model="sharingRoomPassword"
						/>
					</label>
				</div>
			</template>
		</template>
		<div class="field">
			<label class="checkbox">
				<input type="checkbox" v-model="playSoundWhenDone"/>
				{{ $t('user.settings.general.playSoundWhenDone') }}
			</label>
		</div>
		<div class="field">
			<label class="is-flex is-align-items-center">
					<span>
						{{ $t('user.settings.general.language') }}
					</span>
				<div class="select ml-2">
					<select v-model="settings.language">
						<option
							v-for="lang in availableLanguageOptions"
							:key="lang.code"
							:value="lang.code"
						>{{ lang.title }}
						</option>
					</select>
				</div>
			</label>
		</div>
		<!-- TODO support week start, others that are possible -->
		<div class="field">
			<label class="is-flex is-align-items-center">
					<span>
						{{ $t('user.settings.quickAddMagic.title') }}
					</span>
				<div class="select ml-2">
					<select v-model="quickAddMagicMode">
						<option v-for="set in PrefixMode" :key="set" :value="set">
							{{ $t(`user.settings.quickAddMagic.${set}`) }}
						</option>
					</select>
				</div>
			</label>
		</div>
		<div class="field">
			<label class="is-flex is-align-items-center">
				<span>
					{{ $t('user.settings.appearance.title') }}
				</span>
				<div class="select ml-2">
					<select v-model="activeColorSchemeSetting">
						<!-- TODO: use the Vikunja logo in color scheme as option buttons -->
						<option v-for="(title, schemeId) in colorSchemeSettings" :key="schemeId" :value="schemeId">
							{{ title }}
						</option>
					</select>
				</div>
			</label>
		</div>

		<x-button
			:loading="loading"
			@click="updateSettings()"
			class="is-fullwidth mt-4"
			v-cy="'saveGeneralSettings'"
		>
			{{ $t('misc.save') }}
		</x-button>
	</card>
</template>

<script lang="ts">
export default {name: 'user-settings-general'}
</script>

<script setup lang="ts">
import {computed, watch, ref} from 'vue'
import {useI18n} from 'vue-i18n'

import {PrefixMode} from '@/modules/parseTaskText'

import ProjectSearch from '@/components/tasks/partials/projectSearch.vue'

import {SUPPORTED_LOCALES} from '@/i18n'
import {playSoundWhenDoneKey, playPopSound} from '@/helpers/playPop'
import {getQuickAddMagicMode, setQuickAddMagicMode} from '@/helpers/quickAddMagicMode'
import {createRandomID} from '@/helpers/randomId'
import {success} from '@/message'
import {AuthenticatedHTTPFactory} from '@/helpers/fetcher'

import {useColorScheme} from '@/composables/useColorScheme'
import {useTitle} from '@/composables/useTitle'

import {useProjectStore} from '@/stores/projects'
import {useAuthStore} from '@/stores/auth'

const {t} = useI18n({useScope: 'global'})
useTitle(() => `${t('user.settings.general.title')} - ${t('user.settings.title')}`)

const DEFAULT_PROJECT_ID = 0

function useColorSchemeSetting() {
	const {t} = useI18n({useScope: 'global'})
	const colorSchemeSettings = computed(() => ({
		light: t('user.settings.appearance.colorScheme.light'),
		auto: t('user.settings.appearance.colorScheme.system'),
		dark: t('user.settings.appearance.colorScheme.dark'),
	}))

	const {store} = useColorScheme()
	watch(store, (schemeId) => {
		success({
			message: t('user.settings.appearance.setSuccess', {
				colorScheme: colorSchemeSettings.value[schemeId],
			}),
		})
	})

	return {
		colorSchemeSettings,
		activeColorSchemeSetting: store,
	}
}

const {colorSchemeSettings, activeColorSchemeSetting} = useColorSchemeSetting()

function useAvailableTimezones() {
	const availableTimezones = ref([])

	const HTTP = AuthenticatedHTTPFactory()
	HTTP.get('user/timezones')
		.then(r => {
			availableTimezones.value = r.data.sort()
		})

	return availableTimezones
}

const availableTimezones = useAvailableTimezones()

function getPlaySoundWhenDoneSetting() {
	return localStorage.getItem(playSoundWhenDoneKey) === 'true' || localStorage.getItem(playSoundWhenDoneKey) === null
}

const playSoundWhenDone = ref(getPlaySoundWhenDoneSetting())
// TODO_OFFLINE refactor: DRY
const isWebxdc = window.webxdc == undefined
const sharingEnabled = ref(localStorage.getItem('sharingEnabled') === 'true')
const sharingRoomName = ref(localStorage.getItem('sharingRoomName') ?? '')
const sharingRoomPassword = ref(localStorage.getItem('sharingRoomPassword') ?? '')
const quickAddMagicMode = ref(getQuickAddMagicMode())

const authStore = useAuthStore()
const settings = ref({...authStore.settings})
const id = ref(createRandomID())
const availableLanguageOptions = ref(
	Object.entries(SUPPORTED_LOCALES)
		.map(l => ({code: l[0], title: l[1]}))
		.sort((a, b) => a.title.localeCompare(b.title)),
)

watch(
	() => authStore.settings,
	() => {
		// Only set setting if we don't have edited values yet to avoid overriding
		if (Object.keys(settings.value).length !== 0) {
			return
		}
		settings.value = {...authStore.settings}
	},
	{immediate: true},
)

const projectStore = useProjectStore()
const defaultProject = computed({
	get: () => projectStore.getProjectById(settings.value.defaultProjectId) || undefined,
	set(l) {
		settings.value.defaultProjectId = l ? l.id : DEFAULT_PROJECT_ID
	},
})
const loading = computed(() => authStore.isLoadingGeneralSettings)

watch(
	playSoundWhenDone,
	(play) => play && playPopSound(),
)

async function updateSettings() {
	localStorage.setItem(playSoundWhenDoneKey, playSoundWhenDone.value ? 'true' : 'false')
	localStorage.setItem('sharingEnabled', sharingEnabled.value ? 'true' : 'false')
	if (sharingRoomName.value.length > 0) {
		localStorage.setItem('sharingRoomName', sharingRoomName.value)
	}
	if (sharingRoomPassword.value.length > 0) {
		localStorage.setItem('sharingRoomPassword', sharingRoomPassword.value)
	}
	setQuickAddMagicMode(quickAddMagicMode.value)

	await authStore.saveUserSettings({
		settings: {...settings.value},
	})
}
</script>
