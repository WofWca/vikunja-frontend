import { createRouter, createWebHistory } from 'vue-router'
import type { RouteLocation } from 'vue-router'
import {saveLastVisited} from '@/helpers/saveLastVisited'

import {saveProjectView, getProjectView} from '@/helpers/projectView'
import {parseDateOrString} from '@/helpers/time/parseDateOrString'
import {getNextWeekDate} from '@/helpers/time/getNextWeekDate'
import {setTitle} from '@/helpers/setTitle'

import {useProjectStore} from '@/stores/projects'
import {useAuthStore} from '@/stores/auth'
import {useBaseStore} from '@/stores/base'

import HomeComponent from '@/views/Home.vue'
import NotFoundComponent from '@/views/404.vue'
const About = () => import('@/views/About.vue')
// User Handling
const DataExportDownload = () => import('@/views/user/DataExportDownload.vue')
// Tasks
import UpcomingTasksComponent from '@/views/tasks/ShowTasks.vue'
import LinkShareAuthComponent from '@/views/sharing/LinkSharingAuth.vue'
const ListNamespaces = () => import('@/views/namespaces/ListNamespaces.vue')
const TaskDetailView = () => import('@/views/tasks/TaskDetailView.vue')

// Team Handling
const ListTeamsComponent = () => import('@/views/teams/ListTeams.vue')
// Label Handling
const ListLabelsComponent = () => import('@/views/labels/ListLabels.vue')
const NewLabelComponent = () => import('@/views/labels/NewLabel.vue')
// Migration
const MigrationComponent = () => import('@/views/migrate/Migration.vue')
const MigrationHandlerComponent = () => import('@/views/migrate/MigrationHandler.vue')
// Project Views
const ProjectList = () => import('@/views/project/ProjectList.vue')
const ProjectGantt = () => import('@/views/project/ProjectGantt.vue')
const ProjectTable = () => import('@/views/project/ProjectTable.vue')
const ProjectKanban = () => import('@/views/project/ProjectKanban.vue')
const ProjectInfo = () => import('@/views/project/ProjectInfo.vue')

// Project Settings

// Namespace Settings
const NamespaceSettingEdit = () => import('@/views/namespaces/settings/edit.vue')
const NamespaceSettingShare = () => import('@/views/namespaces/settings/share.vue')
const NamespaceSettingArchive = () => import('@/views/namespaces/settings/archive.vue')
const NamespaceSettingDelete = () => import('@/views/namespaces/settings/delete.vue')

// Saved Filters

const UserSettingsComponent = () => import('@/views/user/Settings.vue')
const UserSettingsAvatarComponent = () => import('@/views/user/settings/Avatar.vue')
const UserSettingsCaldavComponent = () => import('@/views/user/settings/Caldav.vue')
const UserSettingsDataExportComponent = () => import('@/views/user/settings/DataExport.vue')
const UserSettingsGeneralComponent = () => import('@/views/user/settings/General.vue')

// Project Handling
const NewProjectComponent = () => import('@/views/project/NewProject.vue')

// Namespace Handling
const NewNamespaceComponent = () => import('@/views/namespaces/NewNamespace.vue')

const EditTeamComponent = () => import('@/views/teams/EditTeam.vue')
const NewTeamComponent = () =>  import('@/views/teams/NewTeam.vue')

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	scrollBehavior(to, from, savedPosition) {
		// If the user is using their forward/backward keys to navigate, we want to restore the scroll view
		if (savedPosition) {
			return savedPosition
		}

		// Scroll to anchor should still work
		if (to.hash) {
			return {el: to.hash}
		}

		// Otherwise just scroll to the top
		return {left: 0, top: 0}
	},
	// TODO_OFFLINE remove the references of the removed routes.
	routes: [
		{
			path: '/',
			name: 'home',
			component: HomeComponent,
		},
		{
			path: '/:pathMatch(.*)*',
			name: 'not-found',
			component: NotFoundComponent,
		},
		// if you omit the last `*`, the `/` character in params will be encoded when resolving or pushing
		{
			path: '/:pathMatch(.*)',
			name: 'bad-not-found',
			component: NotFoundComponent,
		},
		{
			path: '/user/settings',
			name: 'user.settings',
			component: UserSettingsComponent,
			redirect: {name: 'user.settings.general'},
			children: [
				{
					path: '/user/settings/avatar',
					name: 'user.settings.avatar',
					component: UserSettingsAvatarComponent,
				},
				{
					path: '/user/settings/caldav',
					name: 'user.settings.caldav',
					component: UserSettingsCaldavComponent,
				},
				{
					path: '/user/settings/data-export',
					name: 'user.settings.data-export',
					component: UserSettingsDataExportComponent,
				},
				{
					path: '/user/settings/general',
					name: 'user.settings.general',
					component: UserSettingsGeneralComponent,
				},
			],
		},
		{
			path: '/user/export/download',
			name: 'user.export.download',
			component: DataExportDownload,
		},
		{
			path: '/share/:share/auth',
			name: 'link-share.auth',
			component: LinkShareAuthComponent,
		},
		{
			path: '/namespaces',
			name: 'namespaces.index',
			component: ListNamespaces,
		},
		{
			path: '/namespaces/new',
			name: 'namespace.create',
			component: NewNamespaceComponent,
			meta: {
				showAsModal: true,
			},
		},
		{
			path: '/namespaces/:id/settings/edit',
			name: 'namespace.settings.edit',
			component: NamespaceSettingEdit,
			meta: {
				showAsModal: true,
			},
			props: route => ({ namespaceId: Number(route.params.id as string) }),
		},
		{
			path: '/namespaces/:namespaceId/settings/share',
			name: 'namespace.settings.share',
			component: NamespaceSettingShare,
			meta: {
				showAsModal: true,
			},
		},
		{
			path: '/namespaces/:id/settings/archive',
			name: 'namespace.settings.archive',
			component: NamespaceSettingArchive,
			meta: {
				showAsModal: true,
			},
			props: route => ({ namespaceId: parseInt(route.params.id as string) }),
		},
		{
			path: '/namespaces/:id/settings/delete',
			name: 'namespace.settings.delete',
			component: NamespaceSettingDelete,
			meta: {
				showAsModal: true,
			},
			props: route => ({ namespaceId: Number(route.params.id as string) }),
		},
		{
			path: '/tasks/:id',
			name: 'task.detail',
			component: TaskDetailView,
			props: route => ({ taskId: Number(route.params.id as string) }),
		},
		{
			path: '/tasks/by/upcoming',
			name: 'tasks.range',
			component: UpcomingTasksComponent,
			props: route => ({
				dateFrom: parseDateOrString(route.query.from as string, new Date()),
				dateTo: parseDateOrString(route.query.to as string, getNextWeekDate()),
				showNulls: route.query.showNulls === 'true',
				showOverdue: route.query.showOverdue === 'true',
			}),
		},
		{
			// Redirect old list routes to the respective project routes
			// see: https://router.vuejs.org/guide/essentials/dynamic-matching.html#catch-all-404-not-found-route
			path: '/lists:pathMatch(.*)*',
			name: 'lists',
			redirect(to) {
				return {
					path: to.path.replace('/lists', '/projects'),
					query: to.query,
					hash: to.hash,
				}
			},
		},
		{
			path: '/projects/new/:namespaceId/',
			name: 'project.create',
			component: NewProjectComponent,
			meta: {
				showAsModal: true,
			},
		},
		{
			path: '/projects/:projectId/info',
			name: 'project.info',
			component: ProjectInfo,
			meta: {
				showAsModal: true,
			},
			props: route => ({ projectId: Number(route.params.projectId as string) }),
		},
		{
			path: '/projects/:projectId',
			name: 'project.index',
			redirect(to) {
				// Redirect the user to list view by default
				const savedProjectView = getProjectView(Number(to.params.projectId as string))

				if (savedProjectView) {
					console.log('Replaced list view with', savedProjectView)
				}

				return {
					name: savedProjectView || 'project.list',
					params: {projectId: to.params.projectId},
				}
			},
		},
		{
			path: '/projects/:projectId/list',
			name: 'project.list',
			component: ProjectList,
			beforeEnter: (to) => saveProjectView(to.params.projectId, to.name),
			props: route => ({ projectId: Number(route.params.projectId as string) }),
		},
		{
			path: '/projects/:projectId/gantt',
			name: 'project.gantt',
			component: ProjectGantt,
			beforeEnter: (to) => saveProjectView(to.params.projectId, to.name),
			// FIXME: test if `useRoute` would be the same. If it would use it instead.
			props: route => ({route}),
		},
		{
			path: '/projects/:projectId/table',
			name: 'project.table',
			component: ProjectTable,
			beforeEnter: (to) => saveProjectView(to.params.projectId, to.name),
			props: route => ({ projectId: Number(route.params.projectId as string) }),
		},
		{
			path: '/projects/:projectId/kanban',
			name: 'project.kanban',
			component: ProjectKanban,
			beforeEnter: (to) => {
				saveProjectView(to.params.projectId, to.name)
				// Properly set the page title when a task popup is closed
				const projectStore = useProjectStore()
				const projectFromStore = projectStore.getProjectById(Number(to.params.projectId))
				if(projectFromStore) {
					setTitle(projectFromStore.title)
				}
			},
			props: route => ({ projectId: Number(route.params.projectId as string) }),
		},
		{
			path: '/teams',
			name: 'teams.index',
			component: ListTeamsComponent,
		},
		{
			path: '/teams/new',
			name: 'teams.create',
			component: NewTeamComponent,
			meta: {
				showAsModal: true,
			},
		},
		{
			path: '/teams/:id/edit',
			name: 'teams.edit',
			component: EditTeamComponent,
		},
		{
			path: '/labels',
			name: 'labels.index',
			component: ListLabelsComponent,
		},
		{
			path: '/labels/new',
			name: 'labels.create',
			component: NewLabelComponent,
			meta: {
				showAsModal: true,
			},
		},
		{
			path: '/migrate',
			name: 'migrate.start',
			component: MigrationComponent,
		},
		{
			path: '/migrate/:service',
			name: 'migrate.service',
			component: MigrationHandlerComponent,
			props: route => ({
				service: route.params.service as string,
				code: route.query.code as string,
			}),
		},
		{
			path: '/about',
			name: 'about',
			component: About,
		},
	],
})

// TODO_OFFLINE Remove this function?
export async function getAuthForRoute(route: RouteLocation) {
	const authStore = useAuthStore()
	if (authStore.authUser || authStore.authLinkShare) {
		return
	}
	
	const baseStore = useBaseStore()
	// When trying this before the current user was fully loaded we might get a flash of the login screen 
	// in the user shell. To make shure this does not happen we check if everything is ready before trying.
	if (!baseStore.ready) {
		return
	}

	// Check if the user is already logged in and redirect them to the home page if not
	if (
		![
			'user.login',
			'user.password-reset.request',
			'user.password-reset.reset',
			'user.register',
			'link-share.auth',
			'openid.auth',
		].includes(route.name as string) &&
		localStorage.getItem('passwordResetToken') === null &&
		localStorage.getItem('emailConfirmToken') === null &&
		!(route.name === 'home' && (typeof route.query.userPasswordReset !== 'undefined' || typeof route.query.userEmailConfirm !== 'undefined'))
	) {
		saveLastVisited(route.name as string, route.params, route.query)
		return {name: 'user.login'}
	}
	
	if(localStorage.getItem('passwordResetToken') !== null && route.name !== 'user.password-reset.reset') {
		return {name: 'user.password-reset.reset'}
	}
	
	if(localStorage.getItem('emailConfirmToken') !== null && route.name !== 'user.login') {
		return {name: 'user.login'}
	}
}

router.beforeEach(async (to) => {
	return getAuthForRoute(to)
})

export default router