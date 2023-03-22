<template>
	<ready>
		<template v-if="authUser">
			<TheNavigation/>
			<content-auth/>
		</template>
		<content-link-share v-else-if="authLinkShare"/>
		<no-auth-wrapper v-else>
			<router-view/>
		</no-auth-wrapper>
		
		<keyboard-shortcuts v-if="keyboardShortcutsActive"/>
		
		<Teleport to="body">
			<UpdateNotification/>
			<Notification/>
		</Teleport>
	</ready>
</template>

<script lang="ts" setup>
import {computed, watch} from 'vue'
import {useRoute, useRouter} from 'vue-router'
import {useI18n} from 'vue-i18n'
import isTouchDevice from 'is-touch-device'

import Notification from '@/components/misc/notification.vue'
import UpdateNotification from '@/components/home/UpdateNotification.vue'
import KeyboardShortcuts from '@/components/misc/keyboard-shortcuts/index.vue'

import TheNavigation from '@/components/home/TheNavigation.vue'
import ContentAuth from '@/components/home/contentAuth.vue'
import ContentLinkShare from '@/components/home/contentLinkShare.vue'
import NoAuthWrapper from '@/components/misc/no-auth-wrapper.vue'
import Ready from '@/components/misc/ready.vue'

import {setLanguage} from '@/i18n'
import {success} from '@/message'

import {useAuthStore} from '@/stores/auth'
import {useBaseStore} from '@/stores/base'

import {useColorScheme} from '@/composables/useColorScheme'
import {useBodyClass} from '@/composables/useBodyClass'

const baseStore = useBaseStore()
const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

useBodyClass('is-touch', isTouchDevice())
const keyboardShortcutsActive = computed(() => baseStore.keyboardShortcutsActive)

const authUser = computed(() => authStore.authUser)
const authLinkShare = computed(() => authStore.authLinkShare)

const {t} = useI18n({useScope: 'global'})

setLanguage()
useColorScheme()
</script>

<style lang="scss">
@import '@/styles/global.scss';
</style>
